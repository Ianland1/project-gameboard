const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createNotesController({ getDeck, getPersist, onInstall, onRemove, onPersist, onBusy, isRolling, announce, readPdf: readPdfOverride, generate: generateOverride }) {
  let selectedFile = null;
  let parsedCache = null;
  let draft = null;
  let included = new Set();
  let activeJob = null;
  let jobCounter = 0;
  let lastDeckId;

  function status(message, error = false) {
    $('#notes-status').textContent = message;
    $('#notes-status').classList.toggle('is-error', error);
  }
  function progress(value) { $('#notes-progress').value = value; }
  function hasInput() { return !!selectedFile || !!$('#notes-text').value.trim(); }
  function sync() {
    const busy = !!activeJob;
    $('#notes-generate').disabled = busy || !hasInput();
    $('#notes-cancel').hidden = !busy;
    $('#notes-file').disabled = busy;
    $('#notes-text').disabled = busy;
    $('#notes-count').disabled = busy;
    $('#notes-progress-wrap').hidden = !busy;
    $('#notes-persist').checked = getPersist();
    const deck = getDeck();
    $('#notes-active').hidden = !deck;
    $('.notes-intro').hidden = !!deck;
    $('#notes-tools-summary').hidden = !deck;
    if ((deck?.id ?? null) !== lastDeckId) {
      $('#notes-tools').open = !deck;
      lastDeckId = deck?.id ?? null;
    }
    if (deck) {
      const recall = deck.cards.filter(q => q.kind === 'recall').length;
      $('#notes-active-name').textContent = deck.title;
      $('#notes-active-detail').textContent = `${deck.cards.length} cards · ${recall} self-check · ${deck.cards.length - recall} multiple choice`;
    }
    updateUse();
  }
  function updateUse() {
    $('#notes-use').disabled = !draft || included.size === 0 || !!activeJob || isRolling();
    $('#notes-use').textContent = included.size ? `Use ${included.size} selected ${included.size === 1 ? 'card' : 'cards'}` : 'Choose at least one card';
  }
  function clearDraft() {
    draft = null;
    included.clear();
    $('#notes-draft').hidden = true;
    $('#notes-preview').innerHTML = '';
    updateUse();
  }
  function chooseFile(file) {
    if (activeJob || isRolling()) return;
    clearDraft();
    if (!file) {
      selectedFile = null;
      parsedCache = null;
      $('#notes-file-info').textContent = '';
      sync();
      return;
    }
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      status('Choose a PDF file. You can also paste notes below.', true);
      selectedFile = null;
      parsedCache = null;
      $('#notes-file').value = '';
      $('#notes-file-info').textContent = '';
      sync();
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      status('This PDF is larger than 25 MB. Try a smaller section of your notes.', true);
      selectedFile = null;
      parsedCache = null;
      $('#notes-file').value = '';
      $('#notes-file-info').textContent = '';
      sync();
      return;
    }
    selectedFile = file;
    parsedCache = null;
    $('#notes-text').value = '';
    $('#notes-file-info').textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    status('PDF selected. Generate a deck, then review the cards.');
    sync();
  }

  async function generateInWorker(pages, limit, job) {
    if (generateOverride) return generateOverride(pages, {limit});
    if (typeof Worker === 'undefined') {
      const {generateQuestions} = await import('./notes-generator.js?v=pdf-notes-v1');
      await new Promise(resolve => setTimeout(resolve, 0));
      if (job.controller.signal.aborted) throw new DOMException('Cancelled','AbortError');
      return generateQuestions(pages, {limit});
    }
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./notes-worker.js?v=pdf-notes-v1', import.meta.url), {type:'module'});
      job.worker = worker;
      let timeout;
      const finish = callback => value => {
        clearTimeout(timeout);
        job.controller.signal.removeEventListener('abort', aborted);
        worker.terminate();
        job.worker = null;
        callback(value);
      };
      const aborted = () => finish(reject)(new DOMException('Cancelled', 'AbortError'));
      timeout = setTimeout(() => finish(reject)(new Error('Try generating from a shorter section of notes.')), 15000);
      job.controller.signal.addEventListener('abort', aborted, {once:true});
      worker.onmessage = event => {
        if (event.data?.jobId !== job.id) return;
        if (event.data.type === 'result') finish(resolve)(event.data.result);
        if (event.data.type === 'error') finish(reject)(new Error(event.data.message || 'Could not generate cards from these notes.'));
      };
      worker.onerror = () => finish(reject)(new Error('The question tools could not load. Check your connection and try again.'));
      try { worker.postMessage({jobId:job.id, pages, limit}); } catch (error) { finish(reject)(error); }
    });
  }

  async function generate() {
    if (activeJob || isRolling() || !hasInput()) return;
    const job = {id:++jobCounter, controller:new AbortController(), worker:null};
    activeJob = job;
    draft = null;
    included.clear();
    $('#notes-draft').hidden = true;
    progress(3);
    status('Preparing your study deck…');
    onBusy(true);
    sync();
    try {
      let parsed;
      let title;
      const pasted = $('#notes-text').value.trim();
      if (pasted) {
        parsed = {pages:[{page:1,text:pasted.slice(0,400000)}],pageCount:1,truncated:pasted.length > 400000};
        title = 'Pasted notes';
      } else {
        const file = selectedFile;
        title = file.name.replace(/\.pdf$/i, '').slice(0, 180) || 'PDF notes';
        if (parsedCache?.file === file) parsed = parsedCache.result;
        else {
          const readPdf = readPdfOverride || (await import('./pdf-reader.js?v=pdf-notes-v1')).readPdf;
          parsed = await readPdf(file, {
            signal:job.controller.signal,
            onProgress: info => {
              if (activeJob !== job) return;
              if (info.phase === 'extracting') {
                progress(8 + 62 * info.page / Math.max(1, info.total));
                status(`Reading notes · page ${info.page} of ${info.total}`);
              } else status('Loading the PDF reading tools…');
            },
          });
          if (activeJob === job) parsedCache = {file,result:parsed};
        }
      }
      if (activeJob !== job || job.controller.signal.aborted) return;
      if (!parsed.pages?.some(p => p.text?.trim())) {
        $('#notes-paste-details').open = true;
        throw new Error('This PDF has no readable text. For scanned or handwritten notes, paste the extracted text below or choose a text-based PDF.');
      }
      status('Building question cards from your notes…');
      progress(78);
      const limit = Number($('#notes-count').value) || 20;
      const result = await generateInWorker(parsed.pages, limit, job);
      if (activeJob !== job || job.controller.signal.aborted) return;
      if (!Array.isArray(result?.cards) || result.cards.length === 0) {
        $('#notes-paste-details').open = true;
        throw new Error('No clear question cards were found. Try notes with complete facts or definitions, or paste a cleaner section below.');
      }
      const cards = result.cards.slice(0, 40);
      draft = {id:`study-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${job.id}`}`,title,cards,pageCount:Math.min(parsed.pageCount || parsed.pages.length, 120)};
      included = new Set(cards.map((_,i) => i));
      renderDraft();
      const extra = parsed.truncated || result.stats?.truncated ? ' Only the supported portion of this document was read; review the page references.' : '';
      const fewer = cards.length < limit ? ` Found ${cards.length} usable cards from the readable notes.` : '';
      status(`${cards.length} cards ready to review.${fewer}${extra}`);
      progress(100);
      announce(`${cards.length} study cards ready. Review them before using the deck.`);
    } catch (error) {
      if (activeJob !== job) return;
      if (error?.name === 'AbortError') status('Generation cancelled. You can choose another PDF.');
      else status(error?.message || 'Could not read these notes. Try a text-based PDF or paste notes instead.', true);
    } finally {
      if (activeJob === job) {
        activeJob = null;
        onBusy(false);
        sync();
      }
    }
  }
  function renderDraft() {
    $('#notes-draft').hidden = !draft;
    if (!draft) return;
    $('#notes-draft-title').textContent = `${draft.cards.length} cards from ${draft.title}`;
    $('#notes-review-summary').textContent = `Review all ${draft.cards.length} cards and answers`;
    $('#notes-preview').innerHTML = draft.cards.map((q,i) => `<li class="notes-preview-card"><label><input type="checkbox" data-draft-index="${i}" checked><span>${esc(q.prompt)}</span></label><p class="preview-answer"><strong>Answer:</strong> ${esc(q.answer)}</p><p class="preview-source">${q.kind === 'recall' ? 'Self-check' : 'Multiple choice'} · Page ${Number(q.source?.page) || 1}</p><details><summary>View source excerpt</summary><blockquote>${esc(q.source?.quote)}</blockquote></details></li>`).join('');
    updateUse();
  }
  function cancel() {
    const job = activeJob;
    if (!job) return;
    job.controller.abort();
    job.worker?.terminate();
    activeJob = null;
    onBusy(false);
    status('Generation cancelled. You can choose another PDF.');
    sync();
  }

  $('#notes-file').addEventListener('change', event => chooseFile(event.target.files?.[0]));
  $('#notes-text').addEventListener('input', () => {
    if (!activeJob) {
      clearDraft();
      status($('#notes-text').value.trim() ? 'Pasted text will be used to generate this deck.' : '');
      sync();
    }
  });
  $('#notes-count').addEventListener('change', () => {
    if (!activeJob) { clearDraft(); status('Deck size changed. Generate a new set when you’re ready.'); sync(); }
  });
  $('#notes-generate').addEventListener('click', generate);
  $('#notes-cancel').addEventListener('click', cancel);
  $('#notes-preview').addEventListener('change', event => {
    if (!event.target.matches('input[data-draft-index]')) return;
    const index = Number(event.target.dataset.draftIndex);
    if (!draft || !Number.isInteger(index) || index < 0 || index >= draft.cards.length) return;
    if (event.target.checked) included.add(index); else included.delete(index);
    updateUse();
  });
  $('#notes-use').addEventListener('click', () => {
    if (!draft || !included.size || activeJob || isRolling()) return;
    try {
      onInstall({...draft,cards:draft.cards.filter((_,i) => included.has(i))});
      draft = null;
      included.clear();
      $('#notes-draft').hidden = true;
      $('#notes-preview').innerHTML = '';
      status('Your study deck is ready. Draw a card below.');
      sync();
    } catch (error) { status(error?.message || 'Could not use this deck. Try generating again.', true); }
  });
  $('#notes-persist').addEventListener('change', event => {
    const value = event.target.checked;
    const success = onPersist(value);
    if (success === false) status(value ? 'This browser could not save the deck. Keep this tab open to continue.' : 'Browser storage could not be cleared. To remove an earlier saved copy, clear this site’s stored data in your browser.', true);
    else if (getDeck()) status(value ? 'Study deck saved on this device.' : 'Study deck is now kept only in this tab.');
    sync();
  });
  $('#notes-clear').addEventListener('click', () => {
    if (isRolling()) return;
    cancel();
    draft = null;
    included.clear();
    selectedFile = null;
    parsedCache = null;
    $('#notes-file').value = '';
    $('#notes-text').value = '';
    $('#notes-file-info').textContent = '';
    $('#notes-preview').innerHTML = '';
    $('#notes-draft').hidden = true;
    const cleared = onPersist(false);
    const savedWithoutNotes = onRemove();
    if (cleared === false && savedWithoutNotes !== true) status('Deck removed from this tab, but browser storage could not be cleared. Clear this site’s stored data to remove an earlier saved copy.', true);
    else status('Study deck removed.');
    sync();
  });
  const drop = $('#notes-drop');
  drop.addEventListener('dragover', event => { event.preventDefault(); if (!activeJob) drop.classList.add('is-dragging'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-dragging'));
  drop.addEventListener('drop', event => {
    event.preventDefault();
    drop.classList.remove('is-dragging');
    chooseFile(event.dataTransfer?.files?.[0]);
  });
  sync();
  return {sync,cancel,dispose:cancel};
}
