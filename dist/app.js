import { Game } from './engine.js?v=pdf-notes-v1';
import { LEVELS, SUBJECTS, QUESTIONS } from './questions.js?v=stem-v1';
import { PlayerTracker } from './players.js?v=players-v1';
import { createPlayerController } from './players-ui.js?v=players-v1';

const $ = selector => document.querySelector(selector);
const storageKey = 'pyra-companion-v1';
const playersStorageKey = 'stem-practice-players-v1';
let storageAvailable = true;
let playerStorageAvailable = true;
let game;
try { game = Game.restore(JSON.parse(localStorage.getItem(storageKey))); }
catch { game = new Game(); }
let players;
try { players = PlayerTracker.restore(JSON.parse(localStorage.getItem(playersStorageKey))); }
catch { players = new PlayerTracker(); }
let playerController = null;
let selected = null;
let rolling = false;
let mode = game.source === 'notes' ? 'notes' : 'built-in';
let persistNotes = !!game.notesDeck;
let notesBusy = false;
let notesController = null;
let notesControllerPromise = null;
const isBusy = () => rolling || notesBusy;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const announcer = document.createElement('div');
announcer.className = 'sr-only';
announcer.setAttribute('role', 'status');
announcer.setAttribute('aria-live', 'polite');
announcer.setAttribute('aria-atomic', 'true');
document.body.append(announcer);
function announce(message) { announcer.textContent = message; }
function savePlayers() {
  try { localStorage.setItem(playersStorageKey, JSON.stringify(players.snapshot())); playerStorageAvailable = true; }
  catch { playerStorageAvailable = false; }
  $('#players-storage').textContent = playerStorageAvailable ? 'Counters saved on this device.' : 'Counters stay in this tab. Browser storage is unavailable.';
  return playerStorageAvailable;
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(game.snapshot({includeNotes:persistNotes}))); storageAvailable = true; }
  catch { storageAvailable = false; }
  $('#storage-note').textContent = storageAvailable ? (game.notesDeck && !persistNotes ? 'Session totals saved · PDF deck stays in this tab' : 'Progress saved on this device · No account needed') : 'Playing in memory · Keep this tab open to keep your session';
  savePlayers();
  return storageAvailable;
}

async function ensureNotesController() {
  if (!notesControllerPromise) {
    notesControllerPromise = import('./notes-ui.js?v=study-notes-v1').then(({createNotesController}) => {
      notesController = createNotesController({
        getDeck:() => game.notesDeck,
        getPersist:() => persistNotes,
        isRolling:() => rolling,
        onPersist:value => {
          const previouslySaved = persistNotes;
          persistNotes = value;
          let removed = true;
          if (!value && previouslySaved) {
            try { localStorage.removeItem(storageKey); } catch { removed = false; }
          }
          const written = save();
          return value ? written : removed || written;
        },
        onBusy:value => { notesBusy = value; render(); },
        onInstall:deck => {
          if (isBusy()) throw new Error('Finish the current action before changing decks.');
          game.installNotesDeck(deck);
          mode = 'notes';
          selected = null;
          render();
          $('[data-action="draw"]')?.focus({preventScroll:false});
          announce('Study deck ready. Draw a card from your notes.');
        },
        onRemove:() => {
          game.clearNotesDeck();
          mode = 'notes';
          selected = null;
          render();
          announce('Study deck removed.');
          return storageAvailable;
        },
        announce,
      });
      return notesController;
    }).catch(error => { notesControllerPromise = null; throw error; });
  }
  return notesControllerPromise;
}

async function setMode(next) {
  if (isBusy() || !['built-in','notes'].includes(next)) return;
  if (mode !== next) {
    mode = next;
    selected = null;
    if (next === 'built-in') game.setSource('built-in');
    else if (game.notesDeck) game.setSource('notes');
    else game.clearCurrent();
  }
  render();
  if (next === 'notes') {
    try { await ensureNotesController(); }
    catch { $('#notes-status').textContent = 'The study tools could not load. Check your connection, then choose this tab again.'; }
  }
}

$('#levels').innerHTML = LEVELS.map(level => `<label class="choice level-choice"><input type="radio" name="level" value="${level.id}" aria-label="${level.label}, ${level.detail}"><span>${level.label}</span></label>`).join('');
$('#subjects').innerHTML = SUBJECTS.map(subject => `<label class="choice subject-choice" style="--choice-color:${subject.color}"><input type="radio" name="subject" value="${subject.id}"><span>${icon(subject.icon)}<strong>${subject.label}</strong><small>${subject.detail}</small></span></label>`).join('');
$('#question-total').textContent = `${QUESTIONS.length} question cards`;
playerController = createPlayerController({getTracker:() => players, onChange:savePlayers, isBusy:() => rolling, announce});

function renderCard() {
  const custom = mode === 'notes';
  const busy = isBusy();
  const subject = SUBJECTS.find(s => s.id === game.subject);
  const level = LEVELS.find(l => l.id === game.level);
  $('#card-container').style.setProperty('--subject', custom ? '#79aef2' : subject.color);
  if (custom && !game.notesDeck) {
    $('#card-container').innerHTML = `<article class="challenge empty-card notes-empty"><div class="empty-symbol">${icon('notes')}</div><h3>Your notes. Your next challenge.</h3><p>Generate and review a study deck above, then draw cards here.</p><span class="card-small-note">YOUR PDF STAYS ON YOUR DEVICE.</span></article>`;
    return;
  }
  const q = game.current;
  if (!q) {
    const name = custom ? game.notesDeck.title : game.course === 'all' ? `${level.short.toLowerCase()} ${subject.label.toLowerCase()}` : game.courses.find(c => c.id === game.course).label;
    $('#card-container').innerHTML = `<article class="challenge empty-card"><div class="empty-symbol">${icon(custom ? 'notes' : 'dice')}</div><h3>Ready for a challenge?</h3><p>Your ${esc(name)} deck is ready. Draw a card and see what you know.</p><button class="button button-primary" data-action="draw" ${busy ? 'disabled' : ''}>Draw a card${icon('arrow')}</button><span class="card-small-note">${custom ? 'THINK FIRST. REVEAL WHEN YOU’RE READY.' : 'NO TIMER. TAKE A MOMENT TO THINK.'}</span></article>`;
    return;
  }
  const recall = q.kind === 'recall';
  const answered = game.phase !== 'question';
  const correct = ['correct','rolled'].includes(game.phase);
  const deck = game.decks[game.deckKey];
  const number = game.cards.length - (deck?.remaining.length ?? 0);
  const courseLabel = custom ? game.notesDeck.title : game.courses.find(c => c.id === q.course).label;
  const tag = custom ? 'STUDY NOTES' : `${level.short} / ${subject.label}`;
  let feedback = '';
  if (answered) {
    const title = game.phase === 'review' ? 'Check your answer.' : correct ? (game.freeRoll ? 'Correct. Nicely done!' : game.phase === 'rolled' ? 'Correct. Your move is on the board.' : 'Correct. You earned a roll!') : game.phase === 'incorrect' ? 'Keep practicing. Here’s the answer.' : 'Answer revealed. Keep learning.';
    const source = custom ? `<details class="source-note"><summary>Check your notes · page ${q.source.page}</summary><p>${esc(q.source.quote)}</p></details>` : '';
    feedback = `<div class="card-feedback ${correct ? 'feedback-correct' : game.phase === 'incorrect' ? 'feedback-incorrect' : ''}" tabindex="-1" id="card-feedback"><strong>${title}</strong>${recall ? `<p class="notes-answer">${esc(q.answer)}</p>` : ''}${esc(q.explanation)}${game.phase === 'review' ? '<div class="question-stage-note">Mark whether you recalled the answer. A correct self-check earns one roll.</div>' : !correct && !game.freeRoll ? '<div class="question-stage-note">Draw another card for a new chance to earn a roll.</div>' : ''}${source}</div>`;
  }
  const options = recall ? `<div class="recall-prompt">${game.phase === 'question' ? 'Say or write your answer, then reveal it to check your recall.' : 'Compare your answer with the notes, then mark how you did.'}</div>` : `<div class="answer-options" role="group" aria-label="Answer choices">${q.options.map((option,i) => {
    let classes = '';
    if (!answered && selected === option) classes = ' selected';
    if (answered && option === q.answer) classes = ' answer-correct';
    if (game.phase === 'incorrect' && option === game.response) classes = ' answer-incorrect';
    const letter = answered && option === q.answer ? icon('check') : String.fromCharCode(65+i);
    return `<button class="answer-option${classes}" data-option="${i}" aria-pressed="${(!answered && selected === option) || (answered && game.response === option)}" ${answered || busy ? 'disabled' : ''}><span class="answer-letter">${letter}</span><span>${esc(option)}</span>${answered && option === q.answer ? '<span class="sr-only"> (correct answer)</span>' : ''}</button>`;
  }).join('')}</div>`;
  let actions;
  if (game.phase === 'review') actions = `<button class="button button-secondary" data-action="recall-incorrect" ${busy ? 'disabled' : ''}>Need more practice</button><button class="button button-primary" data-action="recall-correct" ${busy ? 'disabled' : ''}>I got it${icon('check')}</button>`;
  else if (!answered && recall) actions = `<span class="transition-note">Self-check card</span><button class="button button-primary" data-action="reveal" ${busy ? 'disabled' : ''}>Reveal answer${icon('arrow')}</button>`;
  else if (!answered) actions = `<button class="button button-quiet" data-action="reveal" ${busy ? 'disabled' : ''}>Reveal answer</button><button class="button button-primary" data-action="check" ${selected === null || busy ? 'disabled' : ''}>Check answer${icon('arrow')}</button>`;
  else if (game.phase === 'correct' && !game.freeRoll) actions = `<span class="transition-note">Knowledge → momentum</span><button class="button button-primary" data-action="roll" ${busy ? 'disabled' : ''}>Roll your die${icon('dice')}</button>`;
  else actions = `<span class="transition-note">${game.phase === 'rolled' ? 'Pass the device or keep playing.' : 'A new card. A fresh challenge.'}</span><button class="button button-primary" data-action="draw" ${busy ? 'disabled' : ''}>Next card${icon('arrow')}</button>`;
  $('#card-container').innerHTML = `<article class="challenge"><div class="challenge-top"><span class="card-tag">${icon(custom ? 'notes' : subject.icon)}<span>${esc(tag)}<span class="card-course">${esc(courseLabel)}</span>${custom ? `<span class="notes-page-tag">Page ${q.source.page} · ${recall ? 'Self-check' : 'Multiple choice'}</span>` : ''}</span></span>${game.phase === 'question' ? `<button class="skip-button" data-action="draw" ${busy ? 'disabled' : ''}>Skip${icon('arrow')}</button>` : `<span class="card-code">${String(number).padStart(2,'0')} / ${String(game.cards.length).padStart(2,'0')}</span>`}</div><div class="question-body"><h3 id="question-title" tabindex="-1">${esc(q.prompt)}</h3>${options}</div>${feedback}<div class="challenge-actions">${actions}</div></article>`;
}

function renderDice() {
  $('#roll-button').disabled = isBusy() || !game.canRoll;
  $('#roll-button span').textContent = rolling ? 'Rolling…' : game.canRoll ? 'Roll the die' : 'Roll locked';
  $('#roll-button use').setAttribute('href', game.canRoll || rolling ? '#i-dice' : '#i-lock');
  $('#free-roll').checked = game.freeRoll;
  $('#free-roll').disabled = isBusy();
  let status;
  if (rolling) status = '<h3>Here we go…</h3><p>Finding your next move.</p>';
  else if (game.phase === 'correct' && !game.freeRoll) status = `<h3 class="status-pulse">Your roll is ready</h3><p>One good answer. One next move.</p>`;
  else if (game.lastRoll !== null) status = `<h3 class="result">You rolled ${game.lastRoll}</h3><p>Move ${game.lastRoll} ${game.lastRoll === 1 ? 'space' : 'spaces'} on your board.</p>`;
  else if (game.freeRoll) status = '<h3>Ready when you are</h3><p>Your table, your rules.</p>';
  else status = `<span class="status-icon">${icon('lock')}</span><h3>Earn your next move</h3><p>A correct answer unlocks the die.</p>`;
  $('#roll-status').innerHTML = status;
  $('#roll-hint').textContent = game.freeRoll ? 'Free roll is on. No answer needed.' : game.phase === 'correct' ? 'Roll once, then move your real game piece.' : game.phase === 'rolled' ? 'Roll used. Draw another card to unlock the die.' : 'Answer a card correctly, or turn on Free roll below.';
  if (mode === 'notes' && !game.notesDeck && !game.freeRoll) $('#roll-hint').textContent = 'Generate a study deck, then answer a card to earn a roll.';
  $('#roll-history').innerHTML = game.history.length ? game.history.map(n => `<span class="history-die">${n}</span>`).join('') : '<span class="history-empty">Your next move awaits</span>';
  if (!rolling) {
    const value = game.lastRoll ?? 1;
    $('#die-value').textContent = value;
    $('#die-side-value').textContent = value % 4 + 1;
  }
}

function render() {
  for (const input of document.querySelectorAll('input[name="level"]')) input.checked = input.value === game.level;
  for (const input of document.querySelectorAll('input[name="subject"]')) input.checked = input.value === game.subject;
  const busy = isBusy();
  $('#level-fieldset').disabled = busy;
  $('#subject-fieldset').disabled = busy;
  $('#course-fieldset').disabled = busy;
  $('#notes-fields').disabled = rolling;
  $('#courses-panel').hidden = mode !== 'built-in';
  $('#notes-panel').hidden = mode !== 'notes';
  for (const [id,active] of [['source-courses',mode === 'built-in'],['source-notes',mode === 'notes']]) {
    const tab = document.getElementById(id);
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex = active ? 0 : -1;
    tab.disabled = busy;
  }
  $('#course-select').innerHTML = `<option value="all" ${game.course === 'all' ? 'selected' : ''}>All courses — mixed deck</option>` + game.courses.map(c => `<option value="${c.id}" ${game.course === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
  const builtInCount = QUESTIONS.filter(q => q.level === game.level && q.subject === game.subject && (game.course === 'all' || q.course === game.course)).length;
  $('#course-hint').textContent = game.course === 'all' ? `${game.courses.length} courses · ${builtInCount} cards` : `${builtInCount} question cards`;
  const deckSize = mode === 'notes' ? game.notesDeck?.cards.length ?? 0 : game.cards.length;
  $('#deck-size').textContent = deckSize ? `${String(deckSize).padStart(2,'0')} CARDS / DECK` : 'ADD YOUR NOTES';
  $('#reset-button').disabled = busy;
  $('#stat-drawn').textContent = game.drawn;
  $('#stat-correct').textContent = game.correct;
  $('#stat-rolls').textContent = game.rolls;
  renderCard();
  renderDice();
  save();
  notesController?.sync();
  playerController?.sync();
}

function draw() {
  if (isBusy() || (mode === 'notes' && !game.notesDeck)) return;
  game.draw();
  selected = null;
  render();
  $('#question-title')?.focus({preventScroll:true});
  announce('New card. ' + game.current.prompt);
}
async function roll() {
  if (isBusy()) return;
  const result = game.roll();
  if (result === null) return;
  const rollPlayer = players.activePlayer;
  const rollId = `roll-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${game.rolls}-${Math.random().toString(36).slice(2)}`}`;
  players.recordRoll(rollId, result);
  $('#players-message').textContent = `${rollPlayer.name} rolled ${result}. Apply it to their counter when you move the piece.`;
  rolling = true;
  save(); // Consume the earned roll before animating, including across a refresh.
  render();
  const die = $('#die');
  die.classList.add('is-rolling');
  if (!reduceMotion.matches) await new Promise(resolve => setTimeout(resolve, 720));
  die.classList.remove('is-rolling');
  rolling = false;
  render();
  announce(`${rollPlayer.name} rolled ${result}. Move ${result} ${result === 1 ? 'space' : 'spaces'} on your board, then apply the roll to their counter.`);
  if (matchMedia('(max-width: 600px)').matches) $('#dice-title').scrollIntoView({behavior:reduceMotion.matches ? 'instant' : 'smooth',block:'start'});
}

$('#card-container').addEventListener('click', event => {
  const choice = event.target.closest('[data-option]');
  if (choice && game.phase === 'question' && !isBusy()) {
    selected = game.current.options[Number(choice.dataset.option)];
    for (const button of document.querySelectorAll('[data-option]')) {
      const active = button === choice;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    }
    $('[data-action="check"]').disabled = false;
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action || isBusy()) return;
  if (action === 'draw') draw();
  if (action === 'roll') roll();
  if (action === 'check' && selected !== null) {
    const correct = game.answer(selected);
    render();
    $('#card-feedback')?.focus({preventScroll:true});
    announce((correct ? 'Correct! ' : 'Not quite. ') + game.current.explanation + (correct && !game.freeRoll ? ' Your roll is unlocked.' : ''));
  }
  if (action === 'reveal') {
    game.reveal();
    render();
    $('#card-feedback')?.focus({preventScroll:true});
    announce('Answer revealed: ' + game.current.answer + '. ' + game.current.explanation);
  }
  if (action === 'recall-correct' || action === 'recall-incorrect') {
    if (game.phase !== 'review') return;
    const correct = game.gradeRecall(action === 'recall-correct');
    render();
    $('#card-feedback')?.focus({preventScroll:true});
    announce(correct ? 'Correct self-check. Your roll is ready.' : 'Keep practicing. Draw another card when you’re ready.');
  }
});
for (const name of ['level','subject']) {
  $(`#${name === 'level' ? 'levels' : 'subjects'}`).addEventListener('change', event => {
    if (isBusy() || !event.target.matches('input')) return;
    game.setDeck(name === 'level' ? event.target.value : game.level, name === 'subject' ? event.target.value : game.subject);
    selected = null;
    render();
    announce('Deck changed. Draw a card when you’re ready.');
  });
}
$('#course-select').addEventListener('change', event => {
  if (isBusy()) return;
  game.setDeck(game.level, game.subject, event.target.value);
  selected = null;
  render();
  announce('Course changed. Draw a card when you’re ready.');
});
$('#roll-button').addEventListener('click', roll);
$('#free-roll').addEventListener('change', event => {
  if (isBusy()) return;
  game.freeRoll = event.target.checked;
  render();
  announce(game.freeRoll ? 'Free roll on. You can roll anytime.' : 'Free roll off. A correct answer earns one roll.');
});
$('#help-button').addEventListener('click', () => $('#help-dialog').showModal());
$('#reset-button').addEventListener('click', () => $('#reset-dialog').showModal());
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
$('#confirm-reset').addEventListener('click', () => {
  if (isBusy()) return;
  const { level, subject, course, freeRoll, notesDeck, source } = game;
  game = new Game();
  game.setDeck(level, subject, course);
  if (notesDeck) {
    game.installNotesDeck(notesDeck);
    if (source === 'built-in') game.setSource('built-in');
  }
  game.freeRoll = freeRoll;
  players.resetPositions();
  $('#players-message').textContent = 'Positions reset to 0. Select a player before rolling.';
  selected = null;
  $('#reset-dialog').close();
  render();
  $('[data-action="draw"]')?.focus({preventScroll:true});
  announce('New session started. Player counters reset to 0. Draw your first card.');
});
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}));
render();
$('#source-courses').addEventListener('click', () => setMode('built-in'));
$('#source-notes').addEventListener('click', () => setMode('notes'));
for (const tab of document.querySelectorAll('.source-tabs [role="tab"]')) tab.addEventListener('keydown', event => {
  if (isBusy() || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 'built-in' : event.key === 'End' ? 'notes' : mode === 'notes' ? 'built-in' : 'notes';
  setMode(next);
  document.getElementById(next === 'notes' ? 'source-notes' : 'source-courses').focus();
});
if (mode === 'notes') ensureNotesController().catch(() => { $('#notes-status').textContent = 'Study tools could not load. Choose this tab again to retry.'; });
