/**
 * Private, text-only PDF import. This module and PDF.js are loaded only when a
 * caller imports them. File bytes stay in memory and are never uploaded.
 */
export const PDF_LIMITS = Object.freeze({
  bytes: 25 * 1024 * 1024,
  pages: 120,
  characters: 400_000,
});

export class PdfReadError extends Error {
  constructor(code, message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'PdfReadError';
    this.code = code;
  }
}

let pdfjsPromise;
const vendorUrl = (path) => new URL(`./vendor/pdfjs/${path}`, import.meta.url).href;

function loadPdfJs() {
  // A failed asset load can be retried after connectivity is restored.
  pdfjsPromise ??= import('./vendor/pdfjs/pdf.min.mjs').then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = vendorUrl('pdf.worker.min.mjs');
    return pdfjs;
  }).catch((cause) => {
    pdfjsPromise = undefined;
    throw new PdfReadError('PDF_READER_UNAVAILABLE',
      'The PDF reader could not load. Refresh this page and try again, or paste the text.', cause);
  });
  return pdfjsPromise;
}

function abortError() {
  return new DOMException('PDF import cancelled.', 'AbortError');
}

function cleanTitle(value) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
    : '';
}

function itemGeometry(item) {
  const t = item.transform;
  if (!Array.isArray(t) || t.length < 6 || !t.every(Number.isFinite)) return null;
  const vertical = item.dir === 'ttb';
  const a = vertical ? t[2] : t[0];
  const b = vertical ? t[3] : t[1];
  const scale = Math.hypot(a, b);
  if (!scale) return null;
  return {
    x: t[4], y: t[5], ux: a / scale, uy: b / scale,
    height: Math.abs(item.height) || Math.hypot(t[2], t[3]) || scale,
    width: Math.abs(vertical ? item.height : item.width) || 0,
    dir: item.dir,
  };
}

// Keep PDF.js reading order (including columns and RTL). Geometry only supplies
// missing separators; sorting all spans would scramble many real documents.
function textCollector(limit) {
  const parts = [];
  let length = 0;
  let lastCharacter = '';
  let previous = null;
  let lastSpan = null;
  let limited = false;
  const append = (value) => {
    if (!value) return;
    const available = limit - length;
    if (value.length > available) {
      value = value.slice(0, available);
      // Avoid cutting an emoji or other supplementary character in half.
      if (/[\ud800-\udbff]$/.test(value)) value = value.slice(0, -1);
      limited = true;
    }
    if (value) {
      parts.push(value);
      length += value.length;
      lastCharacter = value.at(-1);
    }
    if (length >= limit) limited = true;
  };
  const newline = () => {
    if (length && lastCharacter !== '\n') append('\n');
    previous = null;
  };
  return {
    add(item) {
      if (typeof item.str !== 'string' || limited) return;
      const value = item.str.replace(/\u0000/g, '').replace(/\r\n?/g, '\n');
      const current = itemGeometry(item);
      // Some PDFs simulate bold by drawing the same text several times with
      // sub-point offsets. Remove only consecutive, matching visual spans;
      // repeated words or facts at different positions remain intact.
      if (value.trim() && current && lastSpan?.value === value &&
          typeof item.fontName === 'string' && lastSpan.fontName === item.fontName) {
        const prior = lastSpan.geometry;
        const tolerance = Math.min(0.6, current.height * 0.05);
        if (Math.abs(current.x - prior.x) <= tolerance && Math.abs(current.y - prior.y) <= tolerance &&
            Math.abs(current.height - prior.height) <= 0.01 && Math.abs(current.width - prior.width) <= 0.05 &&
            Math.abs(current.ux - prior.ux) <= 0.001 && Math.abs(current.uy - prior.uy) <= 0.001 &&
            current.dir === prior.dir) {
          if (item.hasEOL) newline();
          return;
        }
      }
      if (value && previous && current && lastCharacter !== '\n') {
        const dx = current.x - previous.x;
        const dy = current.y - previous.y;
        const baselineShift = Math.abs(dx * previous.uy - dy * previous.ux);
        const directionChange = Math.abs(current.ux * previous.ux + current.uy * previous.uy) < 0.9;
        if (directionChange || baselineShift > Math.max(2, Math.min(previous.height, current.height) * 0.65)) {
          newline();
        } else if (previous.dir === current.dir && !/\s/.test(lastCharacter) && !/^\s/.test(value)) {
          const advance = dx * previous.ux + dy * previous.uy;
          const gap = current.dir === 'rtl' ? -advance - current.width : advance - previous.width;
          if (gap > Math.max(0.7, Math.min(previous.height, current.height) * 0.12)) append(' ');
        }
      }
      append(value);
      if (value) {
        previous = current;
        lastSpan = current ? { value, fontName: item.fontName, geometry: current } : null;
      }
      if (item.hasEOL) newline();
    },
    get limited() { return limited; },
    text() { return parts.join('').replace(/[\t ]+\n/g, '\n').trim(); },
  };
}

function readableError(error) {
  if (error?.name === 'AbortError' || error instanceof PdfReadError) return error;
  if (error?.name === 'PasswordException') {
    return new PdfReadError('PDF_PASSWORD_REQUIRED',
      'This PDF is password-protected. Save an unlocked copy and import it, or paste the text.', error);
  }
  if (error?.name === 'InvalidPDFException' || error?.name === 'FormatError') {
    return new PdfReadError('PDF_INVALID',
      'This file could not be read as a PDF. Try another copy, or paste the text.', error);
  }
  return new PdfReadError('PDF_EXTRACTION_FAILED',
    'Text could not be extracted from this PDF. Try another copy, or paste the text.', error);
}

/**
 * @param {File|Blob} file A local file; only its bytes are passed to PDF.js.
 * @param {{signal?: AbortSignal, onProgress?: (p: {phase: 'loading'|'extracting', page: number, total: number}) => void}} options
 * @returns {Promise<{pages: {page: number, text: string}[], pageCount: number, title: string, fingerprint: string, truncated: boolean}>}
 * Empty/scanned pages are omitted; original, one-based page numbers are kept.
 * More than 120 pages or 400,000 text characters produces a truncated result.
 */
export async function readPdf(file, { signal, onProgress } = {}) {
  if (signal?.aborted) throw abortError();
  if (!file || typeof file.arrayBuffer !== 'function' || !Number.isFinite(file.size)) {
    throw new PdfReadError('PDF_FILE_REQUIRED', 'Choose a PDF file to import.');
  }
  if (file.size === 0) throw new PdfReadError('PDF_EMPTY', 'This PDF is empty. Choose another file, or paste the text.');
  if (file.size > PDF_LIMITS.bytes) {
    throw new PdfReadError('PDF_TOO_LARGE', 'This PDF is larger than 25 MiB. Choose a smaller PDF, or paste the text.');
  }

  let loadingTask;
  let document;
  let worker;
  let cleanupPromise;
  let stopped;
  let rejectStopped;
  const stoppedPromise = new Promise((_, reject) => { rejectStopped = reject; });
  // Cancellation can occur between awaited operations.
  stoppedPromise.catch(() => {});
  const release = (force = false) => {
    if (!cleanupPromise) {
      try {
        const cleanup = typeof document?.destroy === 'function'
          ? document.destroy()
          : loadingTask?.destroy();
        cleanupPromise = Promise.resolve(cleanup).catch(() => {}).finally(() => worker?.destroy());
      } catch {
        worker?.destroy();
        cleanupPromise = Promise.resolve();
      }
    }
    // Terminate a busy parser promptly, even while its graceful destroy waits
    // for a worker response. The loading task's destroy has already been called.
    if (force) worker?.destroy();
    return cleanupPromise;
  };
  const stop = (error) => {
    if (stopped) return;
    stopped = error;
    rejectStopped(error);
    release(true);
  };
  const onAbort = () => stop(abortError());
  signal?.addEventListener('abort', onAbort, { once: true });
  const checkStopped = () => {
    if (signal?.aborted && !stopped) stop(abortError());
    if (stopped) throw stopped;
  };
  const waitFor = (promise) => Promise.race([promise, stoppedPromise]);
  const progress = (phase, page, total) => {
    if (stopped || typeof onProgress !== 'function') return;
    // Progress is observational; a caller's UI callback must not strand a PDF.
    try { onProgress({ phase, page, total }); } catch { /* caller UI error */ }
  };

  try {
    checkStopped();
    progress('loading', 0, 0);
    checkStopped();
    const bytes = new Uint8Array(await waitFor(file.arrayBuffer()));
    checkStopped();
    if (!bytes.length) throw new PdfReadError('PDF_EMPTY', 'This PDF is empty. Choose another file, or paste the text.');
    if (bytes.length > PDF_LIMITS.bytes) {
      throw new PdfReadError('PDF_TOO_LARGE', 'This PDF is larger than 25 MiB. Choose a smaller PDF, or paste the text.');
    }
    // PDF headers may be preceded by a small amount of non-PDF data.
    const header = new TextDecoder('latin1').decode(bytes.subarray(0, 1024));
    if (!header.includes('%PDF-')) {
      throw new PdfReadError('PDF_INVALID', 'This file does not appear to be a PDF. Choose a PDF file, or paste the text.');
    }
    if (!globalThis.crypto?.subtle) {
      throw new PdfReadError('PDF_BROWSER_UNSUPPORTED', 'PDF import needs a current browser on HTTPS. You can also paste the text.');
    }
    // Hash before handing bytes to the worker: PDF.js transfers their buffer.
    const digest = await waitFor(globalThis.crypto.subtle.digest('SHA-256', bytes));
    const fingerprint = `sha256:${Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')}`;
    checkStopped();
    const pdfjs = await waitFor(loadPdfJs());
    checkStopped();
    worker = new pdfjs.PDFWorker({ verbosity: pdfjs.VerbosityLevel.ERRORS });
    loadingTask = pdfjs.getDocument({
      data: bytes,
      worker,
      cMapUrl: vendorUrl('cmaps/'),
      cMapPacked: true,
      standardFontDataUrl: vendorUrl('standard_fonts/'),
      useWorkerFetch: typeof window !== 'undefined',
      isEvalSupported: false,
      enableXfa: false,
      disableFontFace: true,
      useSystemFonts: false,
      useWasm: false,
      disableWorkerRendering: true,
      isOffscreenCanvasSupported: false,
      isImageDecoderSupported: false,
      maxImageSize: 0,
      verbosity: pdfjs.VerbosityLevel.ERRORS,
    });
    // Do not leave PDF.js waiting indefinitely for a password UI.
    loadingTask.onPassword = () => stop(new PdfReadError('PDF_PASSWORD_REQUIRED',
      'This PDF is password-protected. Save an unlocked copy and import it, or paste the text.'));
    document = await waitFor(loadingTask.promise);
    checkStopped();
    const pageCount = document.numPages;
    if (!Number.isInteger(pageCount) || pageCount < 1) {
      throw new PdfReadError('PDF_EMPTY', 'This PDF has no pages. Choose another file, or paste the text.');
    }
    let title = cleanTitle(typeof file.name === 'string' ? file.name.replace(/\.pdf$/i, '') : '') || 'Imported PDF';
    try {
      const metadata = await waitFor(document.getMetadata());
      title = cleanTitle(metadata?.info?.Title) || title;
    } catch {
      checkStopped(); // Malformed optional metadata does not discard readable text.
    }
    const total = Math.min(pageCount, PDF_LIMITS.pages);
    const pages = [];
    let characters = 0;
    let truncated = pageCount > total;
    progress('extracting', 0, total);
    for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
      checkStopped();
      const page = await waitFor(document.getPage(pageNumber));
      let reader;
      let streamFinished = false;
      try {
        const collector = textCollector(PDF_LIMITS.characters - characters);
        // Stream rather than retaining a whole page's unbounded TextContent.
        reader = page.streamTextContent({ includeMarkedContent: false }).getReader();
        while (!collector.limited) {
          const chunk = await waitFor(reader.read());
          checkStopped();
          if (chunk.done) {
            streamFinished = true;
            break;
          }
          for (const item of chunk.value.items) {
            collector.add(item);
            if (collector.limited) break;
          }
        }
        const text = collector.text();
        if (text) {
          pages.push({ page: pageNumber, text });
          characters += text.length;
        }
        truncated ||= collector.limited;
        progress('extracting', pageNumber, total);
        if (collector.limited) break;
      } finally {
        // Also cancels the text stream when a page hits the character ceiling.
        if (reader && !streamFinished) {
          // PDF.js requires an Error reason, including for a normal text cap.
          await waitFor(reader.cancel(stopped || new Error('PDF text extraction limit reached.'))).catch(() => {});
        }
        page.cleanup();
      }
    }
    checkStopped();
    return { pages, pageCount, title, fingerprint, truncated };
  } catch (error) {
    throw readableError(stopped || error);
  } finally {
    signal?.removeEventListener('abort', onAbort);
    // Normal completion releases the document before resolving. Cancellation
    // already terminates the worker and must not wait on its pending response.
    const cleanup = release(Boolean(stopped));
    if (!stopped) await cleanup;
  }
}
