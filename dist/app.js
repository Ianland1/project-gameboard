import { Game } from './engine.js?v=charcoal';
import { LEVELS, SUBJECTS, QUESTIONS } from './questions.js?v=charcoal';

const $ = selector => document.querySelector(selector);
const storageKey = 'pyra-companion-v1';
let storageAvailable = true;
let game;
try { game = Game.restore(JSON.parse(localStorage.getItem(storageKey))); }
catch { game = new Game(); }
let selected = null;
let rolling = false;
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
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(game.snapshot())); }
  catch { storageAvailable = false; }
  $('#storage-note').textContent = storageAvailable ? 'Progress saved on this device · No account needed' : 'Playing in memory · Keep this tab open to keep your session';
}

$('#levels').innerHTML = LEVELS.map(level => `<label class="choice level-choice"><input type="radio" name="level" value="${level.id}" aria-label="${level.label}, ${level.detail}"><span>${level.label}</span></label>`).join('');
$('#subjects').innerHTML = SUBJECTS.map(subject => `<label class="choice subject-choice" style="--choice-color:${subject.color}"><input type="radio" name="subject" value="${subject.id}"><span>${icon(subject.icon)}<strong>${subject.label}</strong><small>${subject.detail}</small></span></label>`).join('');
$('#question-total').textContent = `${QUESTIONS.length} question cards`;

function renderCard() {
  const subject = SUBJECTS.find(s => s.id === game.subject);
  const level = LEVELS.find(l => l.id === game.level);
  $('#card-container').style.setProperty('--subject', subject.color);
  const q = game.current;
  if (!q) {
    $('#card-container').innerHTML = `<article class="challenge empty-card"><div class="empty-symbol">${icon('dice')}</div><h3>Ready for a challenge?</h3><p>Your ${esc(level.short.toLowerCase())} ${esc(subject.label.toLowerCase())} deck is ready. Draw a card and see what you know.</p><button class="button button-primary" data-action="draw" ${rolling ? 'disabled' : ''}>Draw a card${icon('arrow')}</button><span class="card-small-note">NO TIMER. TAKE A MOMENT TO THINK.</span></article>`;
    return;
  }
  const answered = game.phase !== 'question';
  const isCorrect = ['correct', 'rolled'].includes(game.phase);
  const deck = game.decks[`${game.level}-${game.subject}`];
  const number = game.cards.length - (deck?.remaining.length ?? 0);
  const feedback = !answered ? '' : `<div class="card-feedback ${isCorrect ? 'feedback-correct' : game.phase === 'incorrect' ? 'feedback-incorrect' : ''}" tabindex="-1" id="card-feedback"><strong>${isCorrect ? (game.freeRoll ? 'Correct. Nicely done!' : game.phase === 'rolled' ? 'Correct. Your move is on the board.' : 'Correct. You earned a roll!') : game.phase === 'incorrect' ? 'Not quite. Here’s the idea.' : 'Answer revealed. Keep learning.'}</strong>${esc(q.explanation)}${!isCorrect && !game.freeRoll ? '<div class="question-stage-note">Draw a new card for another chance to earn a roll.</div>' : ''}</div>`;
  const options = q.options.map((option, i) => {
    let classes = '';
    if (!answered && selected === option) classes = ' selected';
    if (answered && option === q.answer) classes = ' answer-correct';
    if (game.phase === 'incorrect' && option === game.response) classes = ' answer-incorrect';
    const letter = answered && option === q.answer ? icon('check') : String.fromCharCode(65 + i);
    return `<button class="answer-option${classes}" data-option="${i}" aria-pressed="${(!answered && selected === option) || (answered && game.response === option)}" ${answered || rolling ? 'disabled' : ''}><span class="answer-letter">${letter}</span><span>${esc(option)}</span>${answered && option === q.answer ? '<span class="sr-only"> (correct answer)</span>' : ''}</button>`;
  }).join('');
  let actions;
  if (!answered) actions = `<button class="button button-quiet" data-action="reveal" ${rolling ? 'disabled' : ''}>Reveal answer</button><button class="button button-primary" data-action="check" ${selected === null || rolling ? 'disabled' : ''}>Check answer${icon('arrow')}</button>`;
  else if (game.phase === 'correct' && !game.freeRoll) actions = `<span class="transition-note">Knowledge → momentum</span><button class="button button-primary" data-action="roll" ${rolling ? 'disabled' : ''}>Roll your die${icon('dice')}</button>`;
  else actions = `<span class="transition-note">${game.phase === 'rolled' ? 'Pass the device or keep playing.' : 'A new card. A fresh challenge.'}</span><button class="button button-primary" data-action="draw" ${rolling ? 'disabled' : ''}>Next card${icon('arrow')}</button>`;
  $('#card-container').innerHTML = `<article class="challenge"><div class="challenge-top"><span class="card-tag">${icon(subject.icon)}${esc(level.short)} / ${esc(subject.label)}</span>${game.phase === 'question' ? `<button class="skip-button" data-action="draw" ${rolling ? 'disabled' : ''}>Skip${icon('arrow')}</button>` : `<span class="card-code">${String(number).padStart(2,'0')} / 06</span>`}</div><div class="question-body"><h3 id="question-title" tabindex="-1">${esc(q.prompt)}</h3><div class="answer-options" role="group" aria-label="Answer choices">${options}</div></div>${feedback}<div class="challenge-actions">${actions}</div></article>`;
}

function renderDice() {
  $('#roll-button').disabled = rolling || !game.canRoll;
  $('#roll-button span').textContent = rolling ? 'Rolling…' : game.canRoll ? 'Roll the die' : 'Roll locked';
  $('#roll-button use').setAttribute('href', game.canRoll || rolling ? '#i-dice' : '#i-lock');
  $('#free-roll').checked = game.freeRoll;
  $('#free-roll').disabled = rolling;
  let status;
  if (rolling) status = '<h3>Here we go…</h3><p>Finding your next move.</p>';
  else if (game.phase === 'correct' && !game.freeRoll) status = `<h3 class="status-pulse">Your roll is ready</h3><p>One good answer. One next move.</p>`;
  else if (game.lastRoll !== null) status = `<h3 class="result">You rolled ${game.lastRoll}</h3><p>Move ${game.lastRoll} ${game.lastRoll === 1 ? 'space' : 'spaces'} on your board.</p>`;
  else if (game.freeRoll) status = '<h3>Ready when you are</h3><p>Your table, your rules.</p>';
  else status = `<span class="status-icon">${icon('lock')}</span><h3>Earn your next move</h3><p>A correct answer unlocks the die.</p>`;
  $('#roll-status').innerHTML = status;
  $('#roll-hint').textContent = game.freeRoll ? 'Free roll is on. No answer needed.' : game.phase === 'correct' ? 'Roll once, then move your real game piece.' : game.phase === 'rolled' ? 'Roll used. Draw another card to unlock the die.' : 'Answer a card correctly, or turn on Free roll below.';
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
  $('#level-fieldset').disabled = rolling;
  $('#subject-fieldset').disabled = rolling;
  $('#reset-button').disabled = rolling;
  $('#stat-drawn').textContent = game.drawn;
  $('#stat-correct').textContent = game.correct;
  $('#stat-rolls').textContent = game.rolls;
  renderCard();
  renderDice();
  save();
}

function draw() {
  if (rolling) return;
  game.draw();
  selected = null;
  render();
  $('#question-title')?.focus({preventScroll:true});
  announce('New card. ' + game.current.prompt);
}
async function roll() {
  if (rolling) return;
  const result = game.roll();
  if (result === null) return;
  rolling = true;
  save(); // Consume the earned roll before animating, including across a refresh.
  render();
  const die = $('#die');
  die.classList.add('is-rolling');
  if (!reduceMotion.matches) await new Promise(resolve => setTimeout(resolve, 720));
  die.classList.remove('is-rolling');
  rolling = false;
  render();
  announce(`You rolled ${result}. Move ${result} ${result === 1 ? 'space' : 'spaces'} on your physical board.`);
  if (matchMedia('(max-width: 600px)').matches) $('#dice-title').scrollIntoView({behavior:reduceMotion.matches ? 'instant' : 'smooth',block:'start'});
}

$('#card-container').addEventListener('click', event => {
  const choice = event.target.closest('[data-option]');
  if (choice && game.phase === 'question' && !rolling) {
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
  if (!action || rolling) return;
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
});
for (const name of ['level','subject']) {
  $(`#${name === 'level' ? 'levels' : 'subjects'}`).addEventListener('change', event => {
    if (rolling || !event.target.matches('input')) return;
    game.setDeck(name === 'level' ? event.target.value : game.level, name === 'subject' ? event.target.value : game.subject);
    selected = null;
    render();
    announce('Deck changed. Draw a card when you’re ready.');
  });
}
$('#roll-button').addEventListener('click', roll);
$('#free-roll').addEventListener('change', event => {
  if (rolling) return;
  game.freeRoll = event.target.checked;
  render();
  announce(game.freeRoll ? 'Free roll on. You can roll anytime.' : 'Free roll off. A correct answer earns one roll.');
});
$('#help-button').addEventListener('click', () => $('#help-dialog').showModal());
$('#reset-button').addEventListener('click', () => $('#reset-dialog').showModal());
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
$('#confirm-reset').addEventListener('click', () => {
  const { level, subject, freeRoll } = game;
  game = new Game();
  game.setDeck(level, subject);
  game.freeRoll = freeRoll;
  selected = null;
  $('#reset-dialog').close();
  render();
  $('[data-action="draw"]')?.focus({preventScroll:true});
  announce('New session started. Draw your first card.');
});
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}));
render();
