import { QUESTIONS, LEVELS, SUBJECTS } from './questions.js?v=gray-blue';

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

export class Game {
  constructor(random = randomInt) {
    this.random = random;
    this.level = 'elementary';
    this.subject = 'math';
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
  get cards() { return QUESTIONS.filter(q => q.level === this.level && q.subject === this.subject); }
  get canRoll() { return this.freeRoll || this.phase === 'correct'; }
  setDeck(level, subject) {
    if (!LEVELS.some(l => l.id === level) || !SUBJECTS.some(s => s.id === subject)) throw new Error('Unknown deck');
    if (level === this.level && subject === this.subject) return;
    this.level = level;
    this.subject = subject;
    this.current = null;
    this.phase = 'empty';
    this.response = null;
  }
  draw() {
    const key = `${this.level}-${this.subject}`;
    let deck = this.decks[key];
    if (!deck || deck.remaining.length === 0) {
      const ids = shuffle(this.cards.map(q => q.id), this.random);
      if (ids.length > 1 && ids[0] === deck?.last) [ids[0], ids[1]] = [ids[1], ids[0]];
      deck = this.decks[key] = { remaining: ids, last: deck?.last ?? null };
    }
    const id = deck.remaining.shift();
    deck.last = id;
    const question = QUESTIONS.find(q => q.id === id);
    this.current = { ...question, options: shuffle([question.answer, ...question.distractors], this.random) };
    this.phase = 'question';
    this.response = null;
    this.drawn++;
    return this.current;
  }
  answer(value) {
    if (this.phase !== 'question' || !this.current.options.includes(value)) return false;
    this.response = value;
    const correct = value === this.current.answer;
    this.phase = correct ? 'correct' : 'incorrect';
    if (correct) this.correct++;
    return correct;
  }
  reveal() {
    if (this.phase === 'question') this.phase = 'revealed';
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
  snapshot() {
    const { random, ...state } = this;
    return { version: 1, ...state };
  }
  static restore(saved, random = randomInt) {
    const game = new Game(random);
    if (!saved || saved.version !== 1) return game;
    try {
      game.setDeck(saved.level, saved.subject);
      game.freeRoll = saved.freeRoll === true;
      for (const name of ['drawn', 'correct', 'rolls']) {
        if (!Number.isSafeInteger(saved[name]) || saved[name] < 0) throw new Error('Invalid counts');
        game[name] = saved[name];
      }
      game.history = Array.isArray(saved.history) ? saved.history.filter(n => Number.isInteger(n) && n >= 1 && n <= DIE_SIDES).slice(0, 5) : [];
      game.lastRoll = game.history[0] ?? null;
      for (const level of LEVELS) for (const subject of SUBJECTS) {
        const key = `${level.id}-${subject.id}`;
        const deck = saved.decks?.[key];
        const valid = QUESTIONS.filter(q => q.level === level.id && q.subject === subject.id).map(q => q.id);
        if (deck && Array.isArray(deck.remaining) && new Set(deck.remaining).size === deck.remaining.length && deck.remaining.every(id => valid.includes(id))) {
          game.decks[key] = { remaining: deck.remaining, last: valid.includes(deck.last) ? deck.last : null };
        }
      }
      const question = QUESTIONS.find(q => q.id === saved.current?.id && q.level === game.level && q.subject === game.subject);
      const phases = ['question', 'correct', 'incorrect', 'revealed', 'rolled'];
      if (question && phases.includes(saved.phase)) {
        const options = saved.current.options;
        const valid = [question.answer, ...question.distractors];
        if (Array.isArray(options) && options.length === 4 && new Set(options).size === 4 && options.every(o => valid.includes(o))) {
          const response = valid.includes(saved.response) ? saved.response : null;
          if (['correct', 'rolled'].includes(saved.phase) && response !== question.answer) throw new Error('Invalid completed card');
          game.current = { ...question, options };
          game.phase = saved.phase;
          game.response = response;
        }
      }
      return game;
    } catch { return new Game(random); }
  }
}
