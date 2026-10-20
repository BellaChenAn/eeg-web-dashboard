# EEG Web Dashboard

A live web dashboard for NeuroSky / ThinkGear EEG headsets (MindLink, MindWave Mobile, BrainLink, and other TGAM-based headsets). It shows:

- **Attention**, **Meditation** and **signal noise** (`poorSignalLevel`) as live numbers and a 120-second trend chart
- The **raw EEG waveform** (512 Hz)
- **Band power** for the 8 EEG bands (delta → highGamma)
- The **latest value of every field** and a **raw packet log**
- **CSV export** (one row per second: attention, meditation, noise, 8 bands)

You don't need to install anything except Python 3, and you don't need ThinkGear Connector.

---

## Requirements

- **macOS** (Apple Silicon or Intel). Linux works if your headset shows up as a serial port. Windows: see [Windows](#windows).
- **Python 3.8+**: check with `python3 --version`. You don't need any extra packages.
- A NeuroSky/ThinkGear headset, **paired in System Settings → Bluetooth**

## Quick start

1. **Get the code**
   ```bash
   git clone https://github.com/BellaChenAn/eeg-web-dashboard.git
   cd eeg-web-dashboard
   ```
   (Or click **Code → Download ZIP** on GitHub and unzip it.)

2. **Pair the headset** (first time only)
   Turn the headset on → **System Settings → Bluetooth** → click **Connect** next to your headset (e.g. "Mind Link"). If it asks for a PIN, use `0000`.

3. **Start the bridge**
   ```bash
   python3 bridge.py
   ```
   The first time you run it, macOS may ask to allow **Terminal** to use Bluetooth. Click **Allow**.

   When it works you'll see:
   ```
   [bridge] Open http://localhost:8000 in your browser   (Ctrl+C to quit)
   [rfcomm] Found Mind Link [..]
   [rfcomm] Connected, streaming data
   [bridge] Receiving headset data
   ```

4. **Open http://localhost:8000** in your browser.

5. Put the headset on: the forehead sensor touches the skin and the ear clip is on your earlobe. When the contact is good, **Noise** drops to **0** and the status turns green. Attention and Meditation values start after about 10–20 seconds.

Press **Ctrl+C** in the terminal to stop.

### Try it without a headset

```bash
python3 bridge.py --demo
```
This streams simulated data, so you can explore the page or build on it before you have a headset.

---

## How it works

```
Headset ──Bluetooth──▶ bridge.py ──Server-Sent Events──▶ index.html (browser)
```

A web page can't read Bluetooth or serial ports directly, so `bridge.py` reads the headset, decodes the [ThinkGear packet protocol](http://developer.neurosky.com/docs/doku.php?id=thinkgear_communications_protocol), and streams the data to the page. It picks a data source in this order:

| Source | When it's used |
|---|---|
| **Serial port** `/dev/cu.Mind*` | macOS created a serial port for the headset |
| **Bluetooth RFCOMM** (`rfcomm_reader`) | No serial port exists (common on recent macOS). A small Swift helper connects to the headset directly |
| **ThinkGear Connector** (`--tgc`) | Only if you ask for it |

> **Why not ThinkGear Connector?** NeuroSky's ThinkGear Connector only looks for devices named "MindWave". It doesn't find headsets with other names (such as "Mind Link"), and on recent macOS it often can't open the port anyway. This bridge replaces it.

### Files

| File | What it is |
|---|---|
| `bridge.py` | The bridge server: reads the headset and serves the page (standard library only) |
| `index.html` | The dashboard (plain HTML + JavaScript, no frameworks) |
| `rfcomm_reader.swift` | Source of the Bluetooth helper |
| `rfcomm_reader` | Prebuilt helper (universal: Apple Silicon + Intel). If you delete it, `bridge.py` rebuilds it with `swiftc` (needs Xcode Command Line Tools: `xcode-select --install`) |

## Options

```bash
python3 bridge.py                            # auto-detect (recommended)
python3 bridge.py --demo                     # simulated data
python3 bridge.py --device "Mind Link"       # choose the Bluetooth device by name or MAC address
python3 bridge.py --serial /dev/cu.MindLink  # read a specific serial port
python3 bridge.py --tgc                      # use ThinkGear Connector on 127.0.0.1:13854
python3 bridge.py --port 8080                # serve the page on another port
```

## Data you get

These fields arrive as JSON in the browser (the same names ThinkGear Connector uses):

| Field | Range | Rate | Meaning |
|---|---|---|---|
| `rawEeg` | about −2048 … 2047 | 512 Hz | Raw EEG signal |
| `poorSignalLevel` | 0 … 200 | 1 Hz | Noise: **0 = good contact**, 200 = sensor not touching skin |
| `eSense.attention` | 0 … 100 | 1 Hz | NeuroSky attention index |
| `eSense.meditation` | 0 … 100 | 1 Hz | NeuroSky meditation/relaxation index |
| `eegPower.*` | unitless, relative | 1 Hz | delta, theta, lowAlpha, highAlpha, lowBeta, highBeta, lowGamma, highGamma |
| `blinkStrength` | 1 … 255 | on blink | Eye-blink strength (only some headsets send it) |

Note: when `poorSignalLevel` is above 0, Attention and Meditation are unreliable. When it is 200, ignore them completely.

### Using the data in your own project

Open `http://localhost:8000/events` from any language that can read Server-Sent Events. In the browser:

```js
const es = new EventSource("http://localhost:8000/events");
es.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === "packet" && msg.data.eSense) {
    console.log("attention", msg.data.eSense.attention);
  }
  if (msg.type === "raw") {
    // msg.samples: array of raw EEG values (~25 per message)
  }
};
```

Message types: `packet` (everything except raw EEG), `raw` (batched raw samples, every 50 ms), and `bridge` (connection status).

---

## Troubleshooting

| You see | Do this |
|---|---|
| `No paired Bluetooth device matching "mind"` | Pair the headset in System Settings → Bluetooth first. If its name doesn't contain "mind", use `--device "<name>"` |
| `Could not open RFCOMM channel` | Turn the headset off and on, then run the bridge again. Make sure no other app (ThinkGear Connector, another bridge) is connected to it |
| No `[rfcomm]` lines appear and there's no Bluetooth prompt | Allow your terminal app in **System Settings → Privacy & Security → Bluetooth**, then restart the terminal |
| Page says **Bridge not connected** | `bridge.py` isn't running, or you opened the wrong port |
| **Noise stays at 200** | The sensor isn't touching your skin. Push your hair aside, press the forehead sensor flat against your skin, and clip the ear clip to your earlobe |
| Noise is 0 but Attention/Meditation stay at 0 | Wait 10–20 s; the algorithm needs some clean data first |
| `Address already in use` | Another bridge is already running. Stop it, or use `--port 8080` |
| Data stops after a while | The headset may have switched itself off. Turn it on again; the bridge reconnects by itself |

## Windows

The RFCOMM helper only works on macOS. On Windows, pair a MindWave headset, install NeuroSky's ThinkGear Connector, and run `python bridge.py --tgc`. This setup hasn't been tested on Windows.

## Credits

ThinkGear protocol and data definitions © NeuroSky. This project doesn't include any NeuroSky SDK code.
