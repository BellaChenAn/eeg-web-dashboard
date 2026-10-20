// Connects to a paired ThinkGear headset (e.g. "Mind Link") over Bluetooth RFCOMM
// and writes the raw byte stream to stdout. Used by bridge.py when macOS does not
// create a /dev/cu.* serial port for the headset.
//
// Build: swiftc -O rfcomm_reader.swift -o rfcomm_reader
// Run:   ./rfcomm_reader [name-substring or MAC address]   (default: "mind")
import Foundation
import IOBluetooth

setvbuf(stdout, nil, _IONBF, 0)

func log(_ s: String) {
    FileHandle.standardError.write(("[rfcomm] " + s + "\n").data(using: .utf8)!)
}

let query = (CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "mind").lowercased()

guard let paired = IOBluetoothDevice.pairedDevices() as? [IOBluetoothDevice],
      let device = paired.first(where: {
          ($0.name ?? "").lowercased().contains(query) || ($0.addressString ?? "").lowercased() == query
      }) else {
    log("No paired Bluetooth device matching \"\(query)\". Pair the headset first.")
    exit(2)
}
log("Found \(device.name ?? "?") [\(device.addressString ?? "?")]")

class Delegate: NSObject, IOBluetoothRFCOMMChannelDelegate {
    func rfcommChannelData(_ channel: IOBluetoothRFCOMMChannel!, data dataPointer: UnsafeMutableRawPointer!, length dataLength: Int) {
        FileHandle.standardOutput.write(Data(bytes: dataPointer, count: dataLength))
    }
    func rfcommChannelClosed(_ channel: IOBluetoothRFCOMMChannel!) {
        log("Channel closed")
        exit(3)
    }
}

// Find the Serial Port Profile channel via SDP; fall back to channel 1.
var channelID: BluetoothRFCOMMChannelID = 1
if device.performSDPQuery(nil) == kIOReturnSuccess,
   let services = device.services as? [IOBluetoothSDPServiceRecord] {
    let spp = IOBluetoothSDPUUID(uuid16: 0x1101)
    for record in services where record.matchesUUIDArray([spp as Any]) {
        var id: BluetoothRFCOMMChannelID = 0
        if record.getRFCOMMChannelID(&id) == kIOReturnSuccess {
            channelID = id
            break
        }
    }
}
log("Opening RFCOMM channel \(channelID)…")

let delegate = Delegate()
var channel: IOBluetoothRFCOMMChannel? = nil
let status = device.openRFCOMMChannelSync(&channel, withChannelID: channelID, delegate: delegate)
guard status == kIOReturnSuccess else {
    log(String(format: "Could not open RFCOMM channel (error 0x%08x). Is the headset switched on?", status))
    exit(4)
}
log("Connected, streaming data")
RunLoop.main.run()
