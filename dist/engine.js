import { QUESTIONS, LEVELS, SUBJECTS, getCourses } from './questions.js?v=stem-v1';

export const DIE_SIDES = 4;

export function randomInt(max) {
  if (!Number.isInteger(max) || max < 1 || max > 0x100000000) throw new RangeError('Invalid random range');
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do { globalThis.crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % max;
}
export function shuffle(values, random = randomInt) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const NOTES_PREFIX = 'notes:';
const MAX_NOTES_CARDS = 40;
const MAX_PAGES = 10000;

function boundedText(value, max, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`Invalid ${label}`);
  return value.trim();
}

// Keep only the bounded fields the game needs. Text stays text: the renderer is
// responsible for escaping it when inserting it into HTML.
function normalizeNotesDeck(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid notes deck');
  const id = boundedText(value.id, 128, 'notes deck ID');
  const title = boundedText(value.title, 200, 'notes deck title');
  if (!Array.isArray(value.cards) || value.cards.length < 1 || value.cards.length > MAX_NOTES_CARDS) throw new Error('Notes decks require 1–40 cards');
  const pageCount = value.pageCount;
  if (pageCount !== undefined && (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGES)) throw new Error('Invalid notes page count');
  const prompts = new Set();
  const cards = Array.from(value.cards, (card, index) => {
    if (!card || typeof card !== 'object' || !['choice', 'recall'].includes(card.kind)) throw new Error('Invalid notes card kind');
    const prompt = boundedText(card.prompt, 1500, 'notes prompt');
    const promptKey = prompt.toLowerCase().replace(/\s+/g, ' ');
    if (prompts.has(promptKey)) throw new Error('Duplicate notes prompt');
    prompts.add(promptKey);
    const answer = boundedText(card.answer, 1000, 'notes answer');
    const explanation = boundedText(card.explanation, 2000, 'notes explanation');
    let distractors = [];
    if (card.kind === 'choice') {
      if (!Array.isArray(card.distractors) || card.distractors.length !== 3) throw new Error('Choice cards require three distractors');
      distractors = card.distractors.map(text => boundedText(text, 1000, 'notes distractor'));
      if (new Set([answer, ...distractors].map(text => text.toLowerCase().replace(/\s+/g, ' '))).size !== 4) throw new Error('Notes choices must be distinct');
    } else if (card.distractors !== undefined && (!Array.isArray(card.distractors) || card.distractors.length !== 0)) {
      throw new Error('Recall cards cannot have distractors');
    }
    const page = card.source?.page;
    if (!Number.isInteger(page) || page < 1 || page > (pageCount ?? MAX_PAGES)) throw new Error('Invalid notes source page');
    const quote = boundedText(card.source?.quote, 2000, 'notes source quote');
    return { id: `${NOTES_PREFIX}${id}:${index + 1}`, prompt, answer, distractors, kind: card.kind, explanation, source: { page, quote } };
  });
  return { id, title, cards, ...(pageCount === undefined ? {} : { pageCount }) };
}

const BUILT_IN_DECKS = new Map();
for (const level of LEVELS) for (const subject of SUBJECTS) {
  for (const course of ['all', ...getCourses(level.id, subject.id).map(c => c.id)]) {
    const key = `${level.id}-${subject.id}-${course}`;
    BUILT_IN_DECKS.set(key, QUESTIONS.filter(q => q.level === level.id && q.subject === subject.id && (course === 'all' || q.course === course)).map(q => q.id));
  }
}

function validQueue(deck, ids) {
  return deck && Array.isArray(deck.remaining) && deck.remaining.length <= ids.length &&
    new Set(deck.remaining).size === deck.remaining.length && Array.from(deck.remaining).every(id => ids.includes(id));
}

function copyQueue(deck, ids) {
  return { remaining: [...deck.remaining], last: ids.includes(deck.last) ? deck.last : null };
}

function copyCurrent(current) {
  return current ? { ...current, distractors: [...current.distractors], options: [...current.options], ...(current.source ? { source: { ...current.source } } : {}) } : null;
}

export class Game {
  constructor(random = randomInt) {
    this.random = random;
    this.level = 'elementary';
    this.subject = 'math';
    this.course = 'all';
    this.source = 'built-in';
    this.notesDeck = null;
    this.freeRoll = false;
    this.current = null;
    this.phase = 'empty';
    this.response = null;
    this.decks = {};
    this.correct = 0;
    this.drawn = 0;
    this.rolls = 0;
    this.lastRoll = null;
    this.history = [];
  }
  get cards() { return this.source === 'notes' ? this.notesDeck?.cards ?? [] : QUESTIONS.filter(q => q.level === this.level && q.subject === this.subject && (this.course === 'all' || q.course === this.course)); }
  get deckKey() { return this.source === 'notes' ? `${NOTES_PREFIX}${this.notesDeck.id}` : `${this.level}-${this.subject}-${this.course}`; }
  get courses() { return getCourses(this.level, this.subject); }
  get canRoll() { return this.freeRoll || this.phase === 'correct'; }
  clearCurrent() {
    this.current = null;
    this.phase = 'empty';
    this.response = null;
  }
  setSource(source) {
    if (!['built-in', 'notes'].includes(source)) throw new Error('Unknown question source');
    if (source === 'notes' && !this.notesDeck) throw new Error('Install a notes deck first');
    if (source === this.source) return;
    this.source = source;
    this.clearCurrent();
  }
  installNotesDeck(value) {
    const deck = normalizeNotesDeck(value);
    this.clearNotesDeck();
    this.notesDeck = deck;
    this.source = 'notes';
    this.clearCurrent();
    return deck;
  }
  clearNotesDeck() {
    this.notesDeck = null;
    for (const key of Object.keys(this.decks)) if (key.startsWith(NOTES_PREFIX)) delete this.decks[key];
    if (this.source === 'notes') {
      this.source = 'built-in';
      this.clearCurrent();
    }
  }
  setDeck(level, subject, course = 'all') {
    if (!LEVELS.some(l => l.id === level) || !SUBJECTS.some(s => s.id === subject)) throw new Error('Unknown deck');
    if (course !== 'all' && !getCourses(level, subject).some(c => c.id === course)) throw new Error('Unknown course');
    if (level === this.level && subject === this.subject && course === this.course) return;
    this.level = level;
    this.subject = subject;
    this.course = course;
    this.clearCurrent();
  }
  draw() {
    const cards = this.cards;
    if (cards.length === 0) throw new Error('No cards available');
    const ids = cards.map(q => q.id);
    const key = this.deckKey;
    let deck = this.decks[key];
    if (!validQueue(deck, ids) || deck.remaining.length === 0) {
      const shuffled = shuffle(ids, this.random);
      if (shuffled.length > 1 && shuffled[0] === deck?.last) [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
      deck = this.decks[key] = { remaining: shuffled, last: ids.includes(deck?.last) ? deck.last : null };
    }
    const id = deck.remaining.shift();
    deck.last = id;
    const question = cards.find(q => q.id === id);
    this.current = { ...question, options: question.kind === 'recall' ? [] : shuffle([question.answer, ...question.distractors], this.random) };
    this.phase = 'question';
    this.response = null;
    this.drawn++;
    return this.current;
  }
  answer(value) {
    if (this.phase !== 'question' || this.current?.kind === 'recall' || !this.current?.options.includes(value)) return false;
    this.response = value;
    const correct = value === this.current.answer;
    this.phase = correct ? 'correct' : 'incorrect';
    if (correct) this.correct++;
    return correct;
  }
  reveal() {
    if (this.phase === 'question') this.phase = this.current?.kind === 'recall' ? 'review' : 'revealed';
  }
  gradeRecall(correct) {
    if (this.phase !== 'review' || this.current?.kind !== 'recall' || typeof correct !== 'boolean') return false;
    this.response = correct;
    this.phase = correct ? 'correct' : 'incorrect';
    if (correct) this.correct++;
    return correct;
  }
  roll() {
    if (!this.canRoll) return null;
    const value = this.random(DIE_SIDES) + 1;
    if (this.phase === 'correct') this.phase = 'rolled';
    this.lastRoll = value;
    this.rolls++;
    this.history = [value, ...this.history].slice(0, 5);
    return value;
  }
  snapshot({ includeNotes = false } = {}) {
    const persistNotes = includeNotes === true && this.notesDeck !== null;
    const notesDeck = persistNotes ? normalizeNotesDeck(this.notesDeck) : null;
    const source = persistNotes ? this.source : 'built-in';
    const redactCurrent = this.source === 'notes' && !persistNotes;
    const decks = {};
    for (const [key, ids] of BUILT_IN_DECKS) {
      if (validQueue(this.decks[key], ids)) decks[key] = copyQueue(this.decks[key], ids);
    }
    if (notesDeck) {
      const key = `${NOTES_PREFIX}${notesDeck.id}`;
      const ids = notesDeck.cards.map(q => q.id);
      if (validQueue(this.decks[key], ids)) decks[key] = copyQueue(this.decks[key], ids);
    }
    return {
      version: 3, level: this.level, subject: this.subject, course: this.course,
      source, notesDeck, freeRoll: this.freeRoll,
      current: redactCurrent ? null : copyCurrent(this.current),
      phase: redactCurrent ? 'empty' : this.phase, response: redactCurrent ? null : this.response,
      decks, correct: this.correct, drawn: this.drawn, rolls: this.rolls,
      lastRoll: this.lastRoll, history: [...this.history],
    };
  }
  static restore(saved, random = randomInt) {
    const game = new Game(random);
    if (!saved || ![1, 2, 3].includes(saved.version)) return game;
    try {
      const subject = saved.subject === 'english' ? 'computer-science' : saved.subject;
      const course = saved.subject === subject && saved.version >= 2 && getCourses(saved.level, subject).some(c => c.id === saved.course) ? saved.course : 'all';
      game.setDeck(saved.level, subject, course);
      game.freeRoll = saved.freeRoll === true;
      for (const name of ['drawn', 'correct', 'rolls']) {
        if (!Number.isSafeInteger(saved[name]) || saved[name] < 0) throw new Error('Invalid counts');
        game[name] = saved[name];
      }
      game.history = Array.isArray(saved.history) ? saved.history.filter(n => Number.isInteger(n) && n >= 1 && n <= DIE_SIDES).slice(0, 5) : [];
      game.lastRoll = game.history[0] ?? null;
      if (saved.version >= 2) for (const [key, ids] of BUILT_IN_DECKS) {
        if (validQueue(saved.decks?.[key], ids)) game.decks[key] = copyQueue(saved.decks[key], ids);
      }
      if (saved.version === 3 && saved.notesDeck) {
        try { game.notesDeck = normalizeNotesDeck(saved.notesDeck); } catch { /* Keep usable STEM progress when saved notes are invalid. */ }
        if (game.notesDeck) {
          const key = `${NOTES_PREFIX}${game.notesDeck.id}`;
          const ids = game.notesDeck.cards.map(q => q.id);
          if (validQueue(saved.decks?.[key], ids)) game.decks[key] = copyQueue(saved.decks[key], ids);
        }
      }
      if (saved.version === 3 && saved.source === 'notes' && game.notesDeck) game.source = 'notes';
      const question = (saved.version === 3 && saved.source === 'notes' && !game.notesDeck) ? null : game.cards.find(q => q.id === saved.current?.id);
      const recall = question?.kind === 'recall';
      const phases = recall ? ['question', 'review', 'correct', 'incorrect', 'rolled'] : ['question', 'correct', 'incorrect', 'revealed', 'rolled'];
      if (question && phases.includes(saved.phase)) {
        const options = saved.current.options;
        const valid = [question.answer, ...question.distractors];
        if (Array.isArray(options) && (recall ? options.length === 0 : options.length === 4 && new Set(options).size === 4 && options.every(o => valid.includes(o)))) {
          const response = recall ? (typeof saved.response === 'boolean' ? saved.response : null) : (valid.includes(saved.response) ? saved.response : null);
          const complete = ['correct', 'incorrect', 'rolled'].includes(saved.phase);
          const responseIsCorrect = recall ? response === true : response === question.answer;
          const responseIsIncorrect = recall ? response === false : response !== null && response !== question.answer;
          if ((complete && (saved.phase === 'incorrect' ? !responseIsIncorrect : !responseIsCorrect)) || (!complete && response !== null)) return game;
          game.current = { ...question, options: [...options] };
          game.phase = saved.phase;
          game.response = response;
        }
      }
      if (saved.version === 1 && game.current) {
        game.decks[game.deckKey] = {
          remaining: shuffle(game.cards.filter(q => q.id !== game.current.id).map(q => q.id), random),
          last: game.current.id,
        };
      }
      return game;
    } catch { return new Game(random); }
  }
}
