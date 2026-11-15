import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game, DIE_SIDES } from '../dist/engine.js';
import { QUESTIONS } from '../dist/questions.js';

const deterministic = max => max - 1;
const copy = value => JSON.parse(JSON.stringify(value));
const recall = (n = 1) => ({
  prompt: `Explain notes concept ${n}.`, answer: `Notes answer ${n}.`, distractors: [],
  kind: 'recall', explanation: `Notes explanation ${n}.`, source: { page: n, quote: `Private source quotation ${n}.` },
});
const choice = (n = 1) => ({
  ...recall(n), kind: 'choice', distractors: [`Wrong ${n}a`, `Wrong ${n}b`, `Wrong ${n}c`],
});
const notes = (cards = [choice(1), recall(2)]) => ({ id: 'private-deck', title: 'Private PDF title', cards, pageCount: 40 });
const saveNotes = game => copy(game.snapshot({ includeNotes: true }));

test('notes are optional and cannot be selected before a valid deck is installed', () => {
  const game = new Game(deterministic);
  assert.equal(game.source, 'built-in');
  assert.equal(game.notesDeck, null);
  assert.equal(QUESTIONS.length, 318);
  assert.equal(DIE_SIDES, 4);
  assert.throws(() => game.setSource('notes'), /deck/i);
  assert.throws(() => game.setSource('other'), /source/i);
  assert.equal(game.source, 'built-in');
  assert.ok(game.draw());
});

test('installation normalizes a bounded deck and assigns stable IDs without retaining extra input', () => {
  const input = notes();
  input.title = '  Private PDF title  ';
  input.rawPdf = 'not game data';
  input.cards[0].id = 'untrusted-id';
  input.cards[0].html = 'not game data';
  input.cards[0].prompt = `  ${input.cards[0].prompt}  `;
  const game = new Game(deterministic);
  const deck = game.installNotesDeck(input);
  assert.equal(game.source, 'notes');
  assert.equal(deck.title, 'Private PDF title');
  assert.equal(deck.rawPdf, undefined);
  assert.equal(deck.cards[0].html, undefined);
  assert.equal(deck.cards[0].prompt, 'Explain notes concept 1.');
  assert.deepEqual(deck.cards.map(card => card.id), ['notes:private-deck:1', 'notes:private-deck:2']);
  assert.equal(game.deckKey, 'notes:private-deck');
  assert.equal(game.cards, deck.cards);
  input.cards[0].answer = 'changed input';
  input.cards[0].source.quote = 'changed input';
  assert.equal(deck.cards[0].answer, 'Notes answer 1.');
  assert.equal(deck.cards[0].source.quote, 'Private source quotation 1.');
  game.installNotesDeck(notes());
  assert.deepEqual(game.notesDeck.cards.map(card => card.id), deck.cards.map(card => card.id));
});

test('invalid installation is atomic and rejects empty, excessive, duplicate, and unbounded data', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes());
  game.draw();
  const before = saveNotes(game);
  const invalid = [
    null, {}, notes([]), notes(Array(1)), notes(Array.from({ length: 41 }, (_, i) => recall(i + 1))),
    { ...notes(), id: '' }, { ...notes(), id: 'x'.repeat(129) },
    { ...notes(), title: 'x'.repeat(201) }, { ...notes(), pageCount: 0 },
    { ...notes(), pageCount: 10001 }, { ...notes(), pageCount: '40' },
    notes([recall(1), { ...recall(1), prompt: '  EXPLAIN notes concept 1.  ' }]),
    notes([{ ...recall(), kind: 'unknown' }]),
    notes([{ ...recall(), prompt: 'x'.repeat(1501) }]),
    notes([{ ...recall(), answer: 'x'.repeat(1001) }]),
    notes([{ ...recall(), explanation: 'x'.repeat(2001) }]),
    notes([{ ...recall(), source: { page: 0, quote: 'quote' } }]),
    notes([{ ...recall(), source: { page: 41, quote: 'quote' } }]),
    notes([{ ...recall(), source: { page: 1, quote: 'x'.repeat(2001) } }]),
    notes([{ ...recall(), source: { page: 1, quote: '' } }]),
    notes([{ ...recall(), source: null }]),
    notes([{ ...choice(), distractors: ['only one'] }]),
    notes([{ ...choice(), distractors: ['Notes answer 1.', 'b', 'c'] }]),
    notes([{ ...choice(), distractors: ['b', 'B', 'c'] }]),
    notes([{ ...recall(), distractors: ['not allowed'] }]),
  ];
  for (const value of invalid) {
    assert.throws(() => game.installNotesDeck(value));
    assert.deepEqual(saveNotes(game), before);
  }
  game.installNotesDeck(notes(Array.from({ length: 40 }, (_, i) => recall(i + 1))));
  assert.equal(game.cards.length, 40);
});

test('notes preserve text as data, and pageCount and recall distractors are optional', () => {
  const card = recall();
  delete card.distractors;
  card.answer = '<img src=x onerror=alert(1)>';
  const deck = { ...notes([card]), title: '<b>Title</b>' };
  delete deck.pageCount;
  const game = new Game(deterministic);
  game.installNotesDeck(deck);
  assert.equal(game.notesDeck.title, '<b>Title</b>');
  assert.equal(game.draw().answer, '<img src=x onerror=alert(1)>');
  assert.deepEqual(game.current.options, []);
  assert.deepEqual(game.current.distractors, []);
});

test('notes draw from their own cards, exhaust before repeating, and handle a single card', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes([choice(1), recall(2), choice(3)]));
  const drawn = Array.from({ length: 3 }, () => game.draw());
  assert.equal(new Set(drawn.map(card => card.id)).size, 3);
  assert.deepEqual(drawn[1].options, []);
  assert.equal(drawn[0].options.length, 4);
  assert.notEqual(game.draw().id, drawn.at(-1).id);
  game.installNotesDeck(notes([recall()]));
  for (let i = 0; i < 4; i++) assert.equal(game.draw().id, 'notes:private-deck:1');
  assert.equal(game.drawn, 8);
});

test('source switches cancel earned rolls and preserve STEM selections and separate queues', () => {
  const game = new Game(deterministic);
  game.setDeck('college', 'math', 'linear-algebra');
  const first = game.draw();
  game.answer(first.answer);
  const stemKey = game.deckKey;
  const stemQueue = copy(game.decks[stemKey]);
  game.installNotesDeck(notes());
  assert.equal(game.current, null);
  assert.equal(game.phase, 'empty');
  assert.equal(game.response, null);
  assert.equal(game.roll(), null);
  const note = game.draw();
  game.answer(note.answer);
  const notesKey = game.deckKey;
  const notesQueue = copy(game.decks[notesKey]);
  game.setSource('built-in');
  assert.equal(game.current, null);
  assert.equal(game.roll(), null);
  assert.equal(game.level, 'college');
  assert.equal(game.subject, 'math');
  assert.equal(game.course, 'linear-algebra');
  assert.deepEqual(game.decks[stemKey], stemQueue);
  assert.notEqual(game.draw().id, first.id);
  game.setSource('notes');
  assert.deepEqual(game.decks[notesKey], notesQueue);
  assert.notEqual(game.draw().id, note.id);
  assert.equal(game.correct, 2);
});

test('reinstall and clearing notes reset only notes queues and preserve progress', () => {
  const game = new Game(deterministic);
  game.setDeck('high', 'math', 'geometry');
  game.draw();
  const stemKey = game.deckKey;
  const stemQueue = copy(game.decks[stemKey]);
  game.installNotesDeck(notes());
  const card = game.draw();
  game.answer(card.answer);
  game.roll();
  game.installNotesDeck({ ...notes(), id: 'replacement' });
  assert.equal(Object.keys(game.decks).some(key => key.startsWith('notes:')), false);
  assert.deepEqual(game.decks[stemKey], stemQueue);
  game.draw();
  const progress = { drawn: game.drawn, correct: game.correct, rolls: game.rolls, history: [...game.history] };
  game.clearNotesDeck();
  assert.equal(game.notesDeck, null);
  assert.equal(game.source, 'built-in');
  assert.equal(game.phase, 'empty');
  assert.equal(game.current, null);
  assert.equal(game.response, null);
  assert.equal(Object.keys(game.decks).some(key => key.startsWith('notes:')), false);
  assert.deepEqual(game.decks[stemKey], stemQueue);
  assert.deepEqual({ drawn: game.drawn, correct: game.correct, rolls: game.rolls, history: game.history }, progress);
  assert.equal(game.course, 'geometry');
  const builtin = game.draw();
  game.answer(builtin.answer);
  game.clearNotesDeck();
  assert.equal(game.current.id, builtin.id);
  assert.equal(game.canRoll, true);
});

test('clearCurrent resets card permission without changing source, queues, or statistics', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes([choice()]));
  game.answer(game.draw().answer);
  const queue = copy(game.decks);
  game.clearCurrent();
  assert.equal(game.current, null);
  assert.equal(game.phase, 'empty');
  assert.equal(game.response, null);
  assert.equal(game.canRoll, false);
  assert.equal(game.source, 'notes');
  assert.equal(game.correct, 1);
  assert.equal(game.drawn, 1);
  assert.deepEqual(game.decks, queue);
});

test('recall requires revealing and permits exactly one boolean grade and earned D4 roll', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes([recall()]));
  const card = game.draw();
  assert.deepEqual(card.options, []);
  assert.equal(game.answer(card.answer), false);
  assert.equal(game.gradeRecall(true), false);
  assert.equal(game.phase, 'question');
  assert.equal(game.roll(), null);
  game.reveal();
  assert.equal(game.phase, 'review');
  assert.equal(game.roll(), null);
  assert.equal(game.answer(card.answer), false);
  for (const value of [1, 'true', null, undefined]) assert.equal(game.gradeRecall(value), false);
  assert.equal(game.phase, 'review');
  assert.equal(game.gradeRecall(true), true);
  assert.equal(game.correct, 1);
  assert.equal(game.response, true);
  assert.equal(game.gradeRecall(true), false);
  assert.equal(game.gradeRecall(false), false);
  assert.equal(game.phase, 'correct');
  assert.equal(game.roll(), 4);
  assert.equal(game.roll(), null);
  game.reveal();
  assert.equal(game.gradeRecall(true), false);
  assert.equal(game.correct, 1);
  assert.equal(game.phase, 'rolled');
});

test('incorrect recall and choice reveal do not unlock grading or rolls', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes([recall()]));
  game.draw();
  game.reveal();
  assert.equal(game.gradeRecall(false), false);
  assert.equal(game.phase, 'incorrect');
  assert.equal(game.response, false);
  assert.equal(game.gradeRecall(true), false);
  assert.equal(game.correct, 0);
  assert.equal(game.roll(), null);
  game.installNotesDeck(notes([choice()]));
  game.draw();
  assert.equal(game.gradeRecall(true), false);
  game.reveal();
  assert.equal(game.phase, 'revealed');
  assert.equal(game.gradeRecall(true), false);
  assert.equal(game.roll(), null);
});

test('drawing or switching after recall grading cancels its earned roll, free roll remains explicit', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes([recall()]));
  game.draw(); game.reveal(); game.gradeRecall(true);
  game.draw();
  assert.equal(game.roll(), null);
  game.reveal(); game.gradeRecall(true);
  game.setSource('built-in');
  assert.equal(game.roll(), null);
  game.freeRoll = true;
  game.setSource('notes');
  assert.equal(game.roll(), 4);
  game.draw(); game.reveal(); game.gradeRecall(true);
  assert.equal(game.roll(), 4);
  game.freeRoll = false;
  assert.equal(game.roll(), null);
});

test('default v3 snapshots strip all notes data and queues while notes are active or inactive', () => {
  const game = new Game(deterministic);
  game.setDeck('high', 'math', 'geometry');
  game.draw();
  const stemQueue = copy(game.decks[game.deckKey]);
  game.installNotesDeck(notes());
  game.answer(game.draw().answer);
  game.decks['notes:old-private-deck'] = { remaining: ['private-card-id'], last: null };
  for (const source of ['notes', 'built-in']) {
    game.setSource(source);
    const saved = game.snapshot();
    const serialized = JSON.stringify(saved);
    assert.equal(saved.version, 3);
    assert.equal(saved.source, 'built-in');
    assert.equal(saved.notesDeck, null);
    for (const privateText of ['private-deck', 'Private PDF title', 'Notes answer', 'Private source quotation', 'notes:', 'private-card-id']) assert.equal(serialized.includes(privateText), false, privateText);
    assert.deepEqual(saved.decks['high-math-geometry'], stemQueue);
    if (source === 'notes') {
      assert.equal(saved.current, null);
      assert.equal(saved.response, null);
      assert.equal(saved.phase, 'empty');
    }
    const restored = Game.restore(copy(saved), deterministic);
    assert.equal(restored.source, 'built-in');
    assert.equal(restored.notesDeck, null);
    assert.equal(restored.course, 'geometry');
    assert.equal(restored.roll(), null);
    assert.equal(restored.correct, 1);
    assert.equal(restored.drawn, 2);
    assert.ok(restored.draw());
  }
});

test('default snapshots retain a built-in current card while omitting an installed notes deck', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes());
  game.draw();
  game.setSource('built-in');
  const card = game.draw();
  game.answer(card.answer);
  const saved = game.snapshot();
  assert.equal(saved.current.id, card.id);
  assert.equal(saved.phase, 'correct');
  assert.equal(saved.notesDeck, null);
  assert.equal(Object.keys(saved.decks).some(key => key.startsWith('notes:')), false);
  assert.equal(Game.restore(saved, deterministic).roll(), 4);
});

test('opt-in snapshots restore all recall phases and cannot grade or spend twice', () => {
  for (const target of ['question', 'review', 'correct', 'incorrect', 'rolled']) {
    const game = new Game(deterministic);
    game.installNotesDeck(notes([recall()]));
    const card = game.draw();
    if (target !== 'question') game.reveal();
    if (['correct', 'rolled'].includes(target)) game.gradeRecall(true);
    if (target === 'incorrect') game.gradeRecall(false);
    if (target === 'rolled') game.roll();
    const restored = Game.restore(saveNotes(game), deterministic);
    assert.equal(restored.source, 'notes');
    assert.deepEqual(restored.notesDeck, game.notesDeck);
    assert.equal(restored.current.id, card.id);
    assert.equal(restored.phase, target);
    assert.deepEqual(restored.current.options, []);
    assert.equal(restored.response, game.response);
    assert.equal(restored.correct, game.correct);
    assert.deepEqual(restored.decks, game.decks);
    if (target === 'review') {
      assert.equal(restored.gradeRecall(true), true);
      assert.equal(restored.gradeRecall(true), false);
      assert.equal(restored.correct, 1);
    } else {
      assert.equal(restored.gradeRecall(true), false);
    }
    if (target === 'correct' || target === 'review') assert.equal(restored.roll(), 4);
    assert.equal(restored.roll(), null);
    assert.equal(restored.draw().id, card.id);
  }
});

test('opt-in snapshots preserve choice options, notes queues, and inactive notes for later selection', () => {
  const game = new Game(deterministic);
  game.setDeck('college', 'science', 'all');
  game.draw();
  game.installNotesDeck(notes());
  const card = game.draw();
  game.answer(card.answer);
  game.roll();
  const restored = Game.restore(saveNotes(game), deterministic);
  assert.deepEqual(restored.current.options, card.options);
  assert.equal(restored.phase, 'rolled');
  assert.equal(restored.roll(), null);
  assert.notEqual(restored.draw().id, card.id);
  game.setSource('built-in');
  const builtIn = game.draw();
  const inactive = Game.restore(saveNotes(game), deterministic);
  assert.equal(inactive.source, 'built-in');
  assert.equal(inactive.current.id, builtIn.id);
  assert.ok(inactive.notesDeck);
  inactive.setSource('notes');
  assert.notEqual(inactive.draw().id, card.id);
});

test('snapshots and restore do not share mutable deck, queue, or current-card arrays', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes());
  game.draw();
  const saved = game.snapshot({ includeNotes: true });
  const restored = Game.restore(saved, deterministic);
  saved.notesDeck.cards[0].source.quote = 'changed';
  saved.notesDeck.cards[0].distractors[0] = 'changed';
  saved.current.options[0] = 'changed';
  saved.decks[game.deckKey].remaining.length = 0;
  assert.equal(game.current.options.includes('changed'), false);
  assert.equal(restored.current.options.includes('changed'), false);
  assert.equal(game.notesDeck.cards[0].source.quote, 'Private source quotation 1.');
  assert.equal(restored.notesDeck.cards[0].source.quote, 'Private source quotation 1.');
  assert.equal(game.decks[game.deckKey].remaining.length, 1);
  assert.equal(restored.decks[game.deckKey].remaining.length, 1);
});

test('invalid saved notes are dropped while STEM selections, totals, and queues survive', () => {
  const game = new Game(deterministic);
  game.setDeck('college', 'math', 'linear-algebra');
  const stem = game.draw();
  game.answer(stem.answer);
  game.roll();
  const stemKey = game.deckKey;
  game.installNotesDeck(notes());
  game.draw();
  const valid = saveNotes(game);
  for (const malformed of [null, {}, { ...notes(), cards: [] }, { ...notes(), cards: [recall(), recall()] }]) {
    const restored = Game.restore({ ...valid, notesDeck: malformed }, deterministic);
    assert.equal(restored.notesDeck, null);
    assert.equal(restored.source, 'built-in');
    assert.equal(restored.current, null);
    assert.equal(restored.phase, 'empty');
    assert.equal(restored.course, 'linear-algebra');
    assert.equal(restored.correct, 1);
    assert.equal(restored.drawn, 2);
    assert.equal(restored.rolls, 1);
    assert.deepEqual(restored.decks[stemKey], valid.decks[stemKey]);
    assert.equal(restored.roll(), null);
    assert.notEqual(restored.draw().id, stem.id);
  }
});

test('restore rejects invalid recall phases, options, and grade responses without granting a roll', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes([recall()]));
  game.draw(); game.reveal();
  const base = saveNotes(game);
  for (const extra of [
    { phase: 'revealed' }, { phase: 'correct', response: null }, { phase: 'correct', response: false },
    { phase: 'rolled', response: false }, { phase: 'incorrect', response: true },
    { phase: 'review', response: true }, { phase: 'question', response: false },
    { current: { ...base.current, options: [base.current.answer] } },
  ]) {
    const restored = Game.restore({ ...base, ...extra }, deterministic);
    assert.equal(restored.current, null);
    assert.equal(restored.phase, 'empty');
    assert.equal(restored.gradeRecall(true), false);
    assert.equal(restored.roll(), null);
    assert.ok(restored.draw());
  }
  game.installNotesDeck(notes([choice()]));
  game.draw();
  assert.equal(Game.restore({ ...saveNotes(game), phase: 'review' }, deterministic).current, null);
});

test('malformed notes queues cannot produce an empty or unknown card draw', () => {
  const game = new Game(deterministic);
  game.installNotesDeck(notes());
  game.draw();
  const base = saveNotes(game);
  const ids = game.cards.map(card => card.id);
  for (const remaining of [[], ['unknown'], [ids[0], ids[0]], Array(100).fill(ids[0]), 'wrong', null]) {
    const saved = copy(base);
    saved.decks[game.deckKey] = { remaining, last: 'unknown' };
    const restored = Game.restore(saved, deterministic);
    const drawn = restored.draw();
    assert.ok(ids.includes(drawn.id));
    assert.ok(drawn.answer);
  }
  game.decks[game.deckKey] = { remaining: Array(1), last: null };
  assert.ok(ids.includes(game.draw().id));
});

test('v3 retains focused STEM courses and English migration; v1/v2 ignore notes fields', () => {
  const game = new Game(deterministic);
  game.setDeck('high', 'math', 'geometry');
  game.draw();
  const base = game.snapshot();
  assert.equal(Game.restore(base, deterministic).course, 'geometry');
  for (const version of [1, 2, 3]) {
    const saved = { ...base, version, level: 'college', subject: 'english', course: 'rhetoric',
      current: { id: 'college-english-1' }, phase: 'correct', response: 'retired',
      correct: 5, drawn: 10, rolls: 4, history: [3, 6, 1], source: 'notes', notesDeck: null };
    const migrated = Game.restore(saved, deterministic);
    assert.equal(migrated.subject, 'computer-science');
    assert.equal(migrated.course, 'all');
    assert.equal(migrated.current, null);
    assert.equal(migrated.correct, 5);
    assert.equal(migrated.drawn, 10);
    assert.equal(migrated.rolls, 4);
    assert.deepEqual(migrated.history, [3, 1]);
    assert.equal(migrated.roll(), null);
    if (version >= 2) assert.deepEqual(migrated.decks['high-math-geometry'], base.decks['high-math-geometry']);
    assert.ok(migrated.draw());
    if (version < 3) {
      const old = Game.restore({ ...base, version, source: 'notes', notesDeck: notes() }, deterministic);
      assert.equal(old.source, 'built-in');
      assert.equal(old.notesDeck, null);
    }
  }
});
