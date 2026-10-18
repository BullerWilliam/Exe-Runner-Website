# Exe-Runner-Website

Copy the **entire project**, including the `runtime/` directory, to the folder you serve. Place a **32-bit x86 Windows** executable named `app.exe` beside `index.html`. The layout must be:

```text
index.html
app.exe
runtime/
  boxedwine.html
  boxedwine.js
  boxedwine.wasm
  boxedwine.zip
  boxedwine-shell.js
  app-loader.js
  boxedwine.css
```

Then run from that folder:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/` and click **Start app.exe**. The page loads the executable into BoxedWine, whose browser build combines WebAssembly, an x86 CPU emulator, and Wine. The browser needs enough memory to hold the Wine filesystem, executable, and emulator. Opening `index.html` with a `file://` URL will not work because the browser blocks the required fetches.

The included BoxedWine 26R1 single-threaded browser runtime supports 32-bit x86 Windows applications. It does **not** support x64-only executables. Some 32-bit applications need DLLs or features absent from the bundled, reduced Wine 6 filesystem. The actual `app.exe` is not included in this repository, so its behavior cannot be verified here.

The files under `runtime/` are from the [BoxedWine 26R1 Web release](https://github.com/danoon2/Boxedwine/releases/tag/26R1.0), with a small loader change to package the sibling executable in the browser. BoxedWine is licensed under GPLv2; see `runtime/LICENSE.txt` and [upstream source](https://github.com/danoon2/Boxedwine). The release archive used here has SHA-256 `ebc634e921f7c65980a7094f3efad84873cede8011eb7dd204446ff1de982945`.
