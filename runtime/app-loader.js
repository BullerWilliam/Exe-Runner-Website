// Package the sibling executable as the ZIP archive BoxedWine mounts as C:\\files.
// ZIP "store" needs no compression library and preserves the executable bytes.
function zipSingleFile(name, bytes) {
    if (bytes.length < 64 || bytes[0] !== 0x4d || bytes[1] !== 0x5a) {
        throw new Error("app.exe er ikke en Windows EXE-fil (MZ-header mangler)");
    }
    const peOffset = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0x3c, true);
    if (peOffset + 6 > bytes.length || bytes[peOffset] !== 0x50 || bytes[peOffset + 1] !== 0x45 ||
            bytes[peOffset + 2] !== 0 || bytes[peOffset + 3] !== 0) {
        throw new Error("app.exe har ikke en gyldig PE-header");
    }
    const machine = bytes[peOffset + 4] | bytes[peOffset + 5] << 8;
    if (machine !== 0x14c) {
        throw new Error(machine === 0x8664 ? "Denne BoxedWine-udgave understøtter ikke x64-EXE-filer" :
            "app.exe er ikke en understøttet 32-bit x86-EXE-fil");
    }
    const filename = new TextEncoder().encode(name);
    const total = 30 + filename.length + bytes.length + 46 + filename.length + 22;
    if (total > 0xffffffff) throw new Error("app.exe er for stor til ZIP-formatet");
    const output = new Uint8Array(total);
    const view = new DataView(output.buffer);
    let crc = 0xffffffff;
    for (const byte of bytes) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, bytes.length, true);
    view.setUint32(22, bytes.length, true);
    view.setUint16(26, filename.length, true);
    output.set(filename, 30);
    output.set(bytes, 30 + filename.length);
    const central = 30 + filename.length + bytes.length;
    view.setUint32(central, 0x02014b50, true);
    view.setUint16(central + 4, 20, true);
    view.setUint16(central + 6, 20, true);
    view.setUint32(central + 16, crc, true);
    view.setUint32(central + 20, bytes.length, true);
    view.setUint32(central + 24, bytes.length, true);
    view.setUint16(central + 28, filename.length, true);
    output.set(filename, central + 46);
    const end = central + 46 + filename.length;
    view.setUint32(end, 0x06054b50, true);
    view.setUint16(end + 8, 1, true);
    view.setUint16(end + 10, 1, true);
    view.setUint32(end + 12, 46 + filename.length, true);
    view.setUint32(end + 16, central, true);
    return output;
}
