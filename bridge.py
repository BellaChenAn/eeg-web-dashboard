#!/usr/bin/env python3
"""
Bridge from a NeuroSky/ThinkGear headset to the browser (Python standard library only)

Browsers can't open serial ports or raw TCP sockets, so this script:
  1. Reads the headset, either directly from its Bluetooth serial port
     (e.g. /dev/cu.MindLink, auto-detected) or via ThinkGear Connector (127.0.0.1:13854)
  2. Pushes the data to the web page via Server-Sent Events (http://localhost:8000)

Usage:
  python3 bridge.py                          # auto: /dev/cu.Mind* port, else Bluetooth RFCOMM helper
  python3 bridge.py --serial /dev/cu.MindLink
  python3 bridge.py --tgc                    # force ThinkGear Connector
  python3 bridge.py --demo                   # simulated data, no headset needed
"""
import argparse
import glob
import json
import math
import os
import queue
import random
import re
import select
import socket
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
RAW_FLUSH_INTERVAL = 0.05  # raw EEG is 512 Hz; send it in batches every 50 ms

clients = set()
clients_lock = threading.Lock()
raw_buffer = []
raw_lock = threading.Lock()
bridge_status = {"type": "bridge", "status": "connecting"}


def broadcast(msg):
    global bridge_status
    if msg["type"] == "bridge":
        bridge_status = msg  # remember latest status for pages that connect later
    data = json.dumps(msg, separators=(",", ":"))
    with clients_lock:
        for q in list(clients):
            try:
                q.put_nowait(data)
            except queue.Full:
                pass  # drop messages for slow clients instead of blocking


def push_packet(obj):
    """Buffer raw EEG samples for batching; forward all other packets immediately."""
    if "rawEeg" in obj and len(obj) == 1:
        with raw_lock:
            raw_buffer.append(obj["rawEeg"])
    else:
        broadcast({"type": "packet", "t": time.time(), "data": obj})


def raw_flusher():
    while True:
        time.sleep(RAW_FLUSH_INTERVAL)
        with raw_lock:
            if not raw_buffer:
                continue
            samples = raw_buffer[:]
            raw_buffer.clear()
        broadcast({"type": "raw", "samples": samples})


BANDS = ["delta", "theta", "lowAlpha", "highAlpha", "lowBeta", "highBeta", "lowGamma", "highGamma"]


def find_serial_port():
    for path in sorted(glob.glob("/dev/cu.*")):
        if re.search(r"mind|brain|thinkgear", path, re.I):
            return path
    return None


def parse_payload(payload):
    """Decode one ThinkGear payload into TGC-style JSON fields."""
    out, esense = {}, {}
    i = 0
    while i < len(payload):
        while i < len(payload) and payload[i] == 0x55:  # EXCODE bytes
            i += 1
        if i >= len(payload):
            break
        code = payload[i]
        i += 1
        if code >= 0x80:
            vlen = payload[i]
            value = payload[i + 1:i + 1 + vlen]
            i += 1 + vlen
        else:
            value = payload[i:i + 1]
            i += 1
        if code == 0x02:
            out["poorSignalLevel"] = value[0]
        elif code == 0x04:
            esense["attention"] = value[0]
        elif code == 0x05:
            esense["meditation"] = value[0]
        elif code == 0x16:
            out["blinkStrength"] = value[0]
        elif code == 0x80 and len(value) == 2:
            out["rawEeg"] = int.from_bytes(value, "big", signed=True)
        elif code == 0x83 and len(value) == 24:
            out["eegPower"] = {b: int.from_bytes(value[k * 3:k * 3 + 3], "big") for k, b in enumerate(BANDS)}
    if esense:
        out["eSense"] = esense
    return out


def feed(buf, chunk):
    """Append bytes to buf and push every complete, valid ThinkGear packet."""
    buf += chunk
    while True:
        start = buf.find(b"\xaa\xaa")
        if start < 0:
            del buf[:-1]
            return
        del buf[:start]
        if len(buf) < 3:
            return
        plen = buf[2]
        if plen >= 170:  # invalid length, resync
            del buf[:1]
            continue
        if len(buf) < 4 + plen:
            return
        payload = bytes(buf[3:3 + plen])
        checksum = buf[3 + plen]
        del buf[:4 + plen]
        if (~sum(payload)) & 0xFF != checksum:
            continue
        fields = parse_payload(payload)
        raw = fields.pop("rawEeg", None)
        if raw is not None:
            push_packet({"rawEeg": raw})
        if fields:
            push_packet(fields)


def rfcomm_reader(device):
    """Fallback when macOS creates no /dev/cu.* port: read via the bundled IOBluetooth helper."""
    helper = HERE / "rfcomm_reader"
    if not helper.exists():
        print("[bridge] Building Bluetooth helper (one time)…")
        subprocess.run(["swiftc", "-O", str(HERE / "rfcomm_reader.swift"), "-o", str(helper)], check=True)
    source = f"Bluetooth RFCOMM ({device})"
    while True:
        broadcast({"type": "bridge", "status": "connecting", "source": source})
        proc = subprocess.Popen([str(helper), device], stdout=subprocess.PIPE)
        buf = bytearray()
        receiving = False
        try:
            fd = proc.stdout.fileno()
            while True:
                ready, _, _ = select.select([fd], [], [], 3)
                if not ready:
                    if proc.poll() is not None:
                        break
                    if receiving:
                        print("[bridge] No data from headset; is it switched on?")
                        broadcast({"type": "bridge", "status": "waiting", "source": source})
                        receiving = False
                    continue
                chunk = os.read(fd, 4096)
                if not chunk:
                    break
                if not receiving:
                    print("[bridge] Receiving headset data")
                    broadcast({"type": "bridge", "status": "connected", "source": source})
                    receiving = True
                feed(buf, chunk)
        finally:
            proc.kill()
            proc.wait()
        print("[bridge] Bluetooth connection lost (retrying in 3 s; is the headset on and paired?)")
        broadcast({"type": "bridge", "status": "disconnected", "source": source})
        time.sleep(3)


def serial_reader(explicit_path=None):
    """Read ThinkGear packets (57600 baud) straight from the Bluetooth serial port."""
    import termios  # macOS/Linux only; imported here so --tgc / --demo also work on Windows
    while True:
        fd = None
        path = explicit_path or find_serial_port()
        if not path or not os.path.exists(path):
            print("[bridge] Headset serial port not found (/dev/cu.Mind*); waiting. "
                  "If the headset is connected, remove it in Bluetooth settings and pair it again.")
            broadcast({"type": "bridge", "status": "disconnected", "source": "no headset serial port (/dev/cu.Mind*)"})
            time.sleep(3)
            continue
        try:
            broadcast({"type": "bridge", "status": "connecting", "source": path})
            fd = os.open(path, os.O_RDONLY | os.O_NOCTTY | os.O_NONBLOCK)
            attrs = termios.tcgetattr(fd)
            attrs[0] = attrs[1] = attrs[3] = 0
            attrs[2] = termios.CS8 | termios.CREAD | termios.CLOCAL
            attrs[4] = attrs[5] = termios.B57600
            termios.tcsetattr(fd, termios.TCSANOW, attrs)
            print(f"[bridge] Opened serial port {path}")
            buf = bytearray()
            receiving = None
            while True:
                ready, _, _ = select.select([fd], [], [], 3)
                if not ready:
                    if receiving is not False:
                        print("[bridge] No data from headset; is it switched on?")
                        broadcast({"type": "bridge", "status": "waiting", "source": path})
                    receiving = False
                    continue
                try:
                    chunk = os.read(fd, 4096)
                except BlockingIOError:
                    continue
                if not chunk:
                    raise ConnectionError("serial port closed")
                if not receiving:
                    print("[bridge] Receiving headset data")
                    broadcast({"type": "bridge", "status": "connected", "source": path})
                    receiving = True
                feed(buf, chunk)
        except Exception as e:
            print(f"[bridge] Serial port error: {e} (retrying in 3 s; quit ThinkGear Connector if it holds the port)")
            broadcast({"type": "bridge", "status": "disconnected", "error": str(e), "source": path})
            time.sleep(3)
        finally:
            if fd is not None:
                os.close(fd)


def tgc_reader(host, port):
    while True:
        try:
            broadcast({"type": "bridge", "status": "connecting", "source": "ThinkGear Connector"})
            with socket.create_connection((host, port), timeout=5) as s:
                s.settimeout(5)
                s.sendall(json.dumps({"enableRawOutput": True, "format": "Json"}).encode())
                print(f"[bridge] Connected to ThinkGear Connector {host}:{port}")
                buf = b""
                receiving = None
                while True:
                    try:
                        chunk = s.recv(4096)
                    except socket.timeout:
                        # keep the socket open: reconnecting would restart TGC's headset search
                        if receiving is not False:
                            print("[bridge] TGC sends no data yet; it hasn't found the headset")
                            broadcast({"type": "bridge", "status": "waiting", "source": "ThinkGear Connector"})
                        receiving = False
                        continue
                    if not receiving:
                        broadcast({"type": "bridge", "status": "connected", "source": "ThinkGear Connector"})
                        receiving = True
                    if not chunk:
                        raise ConnectionError("TGC closed the connection")
                    buf += chunk
                    *lines, buf = buf.split(b"\r")
                    for line in lines:
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            push_packet(json.loads(line))
                        except json.JSONDecodeError:
                            pass
        except Exception as e:
            print(f"[bridge] Cannot connect to TGC: {e} (retrying in 3 s; make sure ThinkGear Connector is running)")
            broadcast({"type": "bridge", "status": "disconnected", "error": str(e)})
            time.sleep(3)


def demo_generator():
    """Simulate MindWave Mobile data in the TGC format."""
    broadcast({"type": "bridge", "status": "connected", "source": "demo data"})
    print("[bridge] Demo mode: generating simulated data")
    t0 = time.time()
    n = 0
    att, med = 50.0, 50.0
    next_sec = t0 + 1
    while True:
        now = time.time()
        target = int((now - t0) * 512)
        while n < target:
            t = n / 512
            v = 120 * math.sin(2 * math.pi * 10 * t) + 60 * math.sin(2 * math.pi * 4 * t) + random.gauss(0, 30)
            push_packet({"rawEeg": int(v)})
            n += 1
        if now >= next_sec:
            next_sec += 1
            att = min(100, max(1, att + random.gauss(0, 8)))
            med = min(100, max(1, med + random.gauss(0, 8)))
            poor = random.choice([0] * 12 + [26, 51, 200])
            push_packet({
                "eSense": {"attention": int(att), "meditation": int(med)},
                "eegPower": {k: int(random.lognormvariate(m, 0.6)) for k, m in [
                    ("delta", 12), ("theta", 11), ("lowAlpha", 10), ("highAlpha", 9.5),
                    ("lowBeta", 9), ("highBeta", 9), ("lowGamma", 8), ("highGamma", 7.5)]},
                "poorSignalLevel": poor,
            })
            if random.random() < 0.15:
                push_packet({"blinkStrength": random.randint(30, 120)})
        time.sleep(0.01)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_GET(self):
        if self.path == "/events":
            return self.stream()
        if self.path in ("/", "/index.html"):
            body = (HERE / "index.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_error(404)

    def stream(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        q = queue.Queue(maxsize=2000)
        q.put_nowait(json.dumps(bridge_status))
        with clients_lock:
            clients.add(q)
        try:
            while True:
                try:
                    data = q.get(timeout=15)
                    self.wfile.write(f"data: {data}\n\n".encode())
                except queue.Empty:
                    self.wfile.write(b": ping\n\n")
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            with clients_lock:
                clients.discard(q)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--demo", action="store_true", help="use simulated data (no headset needed)")
    ap.add_argument("--serial", metavar="PORT", help="read this serial port directly, e.g. /dev/cu.MindLink")
    ap.add_argument("--device", default="mind", help="Bluetooth name or MAC for the RFCOMM fallback (default: mind)")
    ap.add_argument("--tgc", action="store_true", help="use ThinkGear Connector instead of the serial port")
    ap.add_argument("--tgc-host", default="127.0.0.1")
    ap.add_argument("--tgc-port", type=int, default=13854)
    ap.add_argument("--port", type=int, default=8000, help="web page port")
    args = ap.parse_args()

    threading.Thread(target=raw_flusher, daemon=True).start()
    if args.demo:
        threading.Thread(target=demo_generator, daemon=True).start()
    elif args.serial or (not args.tgc and find_serial_port()):
        threading.Thread(target=serial_reader, args=(args.serial,), daemon=True).start()
    elif not args.tgc:
        threading.Thread(target=rfcomm_reader, args=(args.device,), daemon=True).start()
    else:
        threading.Thread(target=tgc_reader, args=(args.tgc_host, args.tgc_port), daemon=True).start()

    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"[bridge] Open http://localhost:{args.port} in your browser   (Ctrl+C to quit)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[bridge] Stopped")


if __name__ == "__main__":
    main()
