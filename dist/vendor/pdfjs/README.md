# PDF.js 6.5.438

Vendored from the official Mozilla `pdfjs-dist@6.5.438` npm package (the
registry's latest stable version when checked on 2026-11-15), build `0a4153349`.

- Source: https://www.npmjs.com/package/pdfjs-dist/v/6.5.438
- Upstream: https://github.com/mozilla/pdf.js
- npm integrity: `sha512-vg8Pw1x+AFKy4AMDvhuWl5cOYV8d698UoEANoFFhc79hqXDnZQqnOXoxw3HG907WHOg1JYOvLhP756boddFxpA==`
- `npm audit` reported no known vulnerabilities at vendoring time.

The minified browser ES modules come from `legacy/build/pdf.min.mjs` and
`legacy/build/pdf.worker.min.mjs`. This is the current parser with Mozilla's
compatibility polyfills, so users do not need recently introduced JavaScript
APIs such as `Map.getOrInsertComputed` or `Uint8Array.toHex`.

The upstream `cmaps/` and `standard_fonts/` directories are included intact,
with their license notices. The main Apache-2.0 license is in `LICENSE`.
No CDN or remote document service is used. All runtime resources resolve
relative to `pdf-reader.js`, including on GitHub Pages repository subpaths.

Runtime asset footprint (excluding this README): 188 files, 3,841,327 bytes
(3.66 MiB) uncompressed: browser module 537,769 bytes, worker 1,327,591 bytes,
CMaps 1,167,747 bytes, standard fonts 798,046 bytes, main license 10,174 bytes.
PDF.js loads only when a PDF is imported; CMaps/fonts load only when needed.

`pdf-reader.js` uses only PDF loading, metadata and streamed text extraction.
It disables eval support, XFA, font-face installation, system font lookup,
WebAssembly and worker rendering. Renderer, sandbox, image codec/WASM, viewer
and source-map assets are intentionally omitted because text import does not
use them. PDF scripts and annotations are never executed or rendered.

To update, install an exact version of `pdfjs-dist` in a temporary build
directory, copy the same module/worker pair plus these asset directories and
licenses, update this provenance record, and repeat extraction/cancellation
checks before publishing. Keep the module and worker versions identical.
