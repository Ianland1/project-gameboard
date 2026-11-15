import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game, randomInt, shuffle } from '../dist/engine.js';
import { LEVELS, SUBJECTS, QUESTIONS, COURSES, getCourses } from '../dist/questions.js';

const deterministic = max => max - 1;

test('every level and subject has multiple courses with six valid cards each', () => {
  assert.equal(COURSES.length, 54);
  assert.equal(QUESTIONS.length, 324);
  assert.equal(new Set(QUESTIONS.map(q => q.id)).size, QUESTIONS.length);
  for (const level of LEVELS) for (const subject of SUBJECTS) {
    const cards = QUESTIONS.filter(q => q.level === level.id && q.subject === subject.id);
    const courses = getCourses(level.id, subject.id);
    assert.ok(courses.length >= 3, `${level.id}/${subject.id}`);
    assert.equal(cards.length, courses.length * 6);
    for (const course of courses) {
      const focused = cards.filter(q => q.course === course.id);
      assert.equal(focused.length, 6, `${level.id}/${subject.id}/${course.id}`);
      assert.equal(new Set(focused.map(q => q.prompt.toLowerCase())).size, 6);
    }
    for (let i = 1; i <= 6; i++) assert.ok(cards.some(q => q.id === `${level.id}-${subject.id}-${i}`), 'Legacy card IDs survive');
    for (const card of cards) {
      assert.equal(new Set([card.answer, ...card.distractors]).size, 4, card.id);
      assert.ok(card.prompt && card.answer && card.explanation, card.id);
    }
  }
});

test('mixed and focused decks exhaust before repeating and avoid an immediate cycle repeat', () => {
  for (const level of LEVELS) for (const subject of SUBJECTS) {
    for (const course of ['all', ...getCourses(level.id, subject.id).map(c => c.id)]) {
    const game = new Game(deterministic);
    game.setDeck(level.id, subject.id, course);
    const cards = Array.from({length:game.cards.length}, () => game.draw().id);
    assert.equal(new Set(cards).size, game.cards.length);
    assert.notEqual(game.draw().id, cards.at(-1));
    }
  }
});

test('a correct answer unlocks exactly one roll', () => {
  const game = new Game(deterministic);
  assert.equal(game.roll(), null);
  const card = game.draw();
  assert.equal(game.roll(), null);
  assert.equal(game.answer(card.answer), true);
  assert.equal(game.canRoll, true);
  assert.equal(game.roll(), 4);
  assert.equal(game.roll(), null);
  assert.equal(game.correct, 1);
  assert.equal(game.rolls, 1);
  assert.equal(game.phase, 'rolled');
});

test('wrong answers, repeated answers, and revealing do not unlock rolls', () => {
  const game = new Game(deterministic);
  const card = game.draw();
  assert.equal(game.answer(card.distractors[0]), false);
  assert.equal(game.answer(card.answer), false);
  assert.equal(game.roll(), null);
  assert.equal(game.correct, 0);
  const second = game.draw();
  game.reveal();
  assert.equal(game.answer(second.answer), false);
  assert.equal(game.roll(), null);
});

test('only valid answer choices can be submitted', () => {
  const game = new Game(deterministic);
  game.draw();
  assert.equal(game.answer('not a choice'), false);
  assert.equal(game.phase, 'question');
});

test('changing deck cancels an earned roll and keeps separate draw histories', () => {
  const game = new Game(deterministic);
  const first = game.draw();
  game.answer(first.answer);
  game.setDeck('college', 'engineering');
  assert.equal(game.current, null);
  assert.equal(game.canRoll, false);
  const engineering = game.draw();
  assert.equal(engineering.level, 'college');
  assert.equal(engineering.subject, 'engineering');
  game.setDeck('elementary', 'math');
  assert.notEqual(game.draw().id, first.id);
});

test('drawing a new card cannot carry over an earned roll', () => {
  const game = new Game(deterministic);
  const first = game.draw();
  game.answer(first.answer);
  game.draw();
  assert.equal(game.roll(), null);
});

test('free-roll mode works without a card and does not duplicate an earned roll', () => {
  const game = new Game(deterministic);
  game.freeRoll = true;
  assert.equal(game.roll(), 4);
  assert.equal(game.roll(), 4);
  const card = game.draw();
  game.answer(card.answer);
  assert.equal(game.roll(), 4);
  game.freeRoll = false;
  assert.equal(game.roll(), null);
  assert.equal(game.rolls, 3);
});

test('all four die outcomes are mapped to values from 1 through 4', () => {
  for (let n=0;n<4;n++) {
    const game = new Game(max => Math.min(n,max-1));
    game.freeRoll = true;
    assert.equal(game.roll(), n+1);
  }
  for (let i=0;i<500;i++) {
    const value = randomInt(4);
    assert.ok(value >= 0 && value < 4 && Number.isInteger(value));
    const game = new Game();
    game.freeRoll = true;
    assert.ok([1, 2, 3, 4].includes(game.roll()));
  }
});

test('save and restore preserve card, option order, progress, and a consumed roll', () => {
  const game = new Game(deterministic);
  game.setDeck('high','science');
  const q = game.draw();
  game.answer(q.answer);
  game.roll();
  const restored = Game.restore(JSON.parse(JSON.stringify(game.snapshot())), deterministic);
  assert.equal(restored.current.id,q.id);
  assert.deepEqual(restored.current.options,q.options);
  assert.equal(restored.phase,'rolled');
  assert.equal(restored.correct,1);
  assert.equal(restored.roll(),null);
  assert.notEqual(restored.draw().id,q.id);
});

test('unanswered, correct, incorrect, and revealed cards survive refresh', () => {
  for (const target of ['question','correct','incorrect','revealed']) {
    const game = new Game(deterministic);
    const q = game.draw();
    if(target==='correct') game.answer(q.answer);
    if(target==='incorrect') game.answer(q.distractors[0]);
    if(target==='revealed') game.reveal();
    const restored = Game.restore(JSON.parse(JSON.stringify(game.snapshot())), deterministic);
    assert.equal(restored.phase,target);
    assert.equal(restored.canRoll,target==='correct');
  }
});

test('roll history keeps only the five most recent values', () => {
  const game = new Game(deterministic);
  game.freeRoll=true;
  for(let i=0;i<8;i++) game.roll();
  assert.equal(game.history.length,5);
  assert.equal(game.rolls,8);
});

test('saved sessions discard old 5 and 6 rolls without losing progress or unlocking an extra roll', () => {
  const game = new Game(deterministic);
  const q = game.draw();
  game.answer(q.answer);
  game.roll();
  const saved = game.snapshot();
  saved.history = [6, 4, 5, 2, 1];
  saved.lastRoll = 6;
  const restored = Game.restore(saved, deterministic);
  assert.deepEqual(restored.history, [4, 2, 1]);
  assert.equal(restored.lastRoll, 4);
  assert.equal(restored.correct, 1);
  assert.equal(restored.drawn, 1);
  assert.equal(restored.rolls, 1);
  assert.equal(restored.roll(), null);
  saved.history = [6, 5];
  assert.equal(Game.restore(saved).lastRoll, null);
});

test('malformed saved state recovers to a playable default', () => {
  for(const value of [null,{},[],{version:3},{version:1,level:'invalid',subject:'math'}]) {
    const game = Game.restore(value, deterministic);
    assert.equal(game.level,'elementary');
    assert.ok(game.draw());
  }
  const game = new Game(deterministic);
  game.draw();
  const state = game.snapshot();
  state.current.options=['bad','options','not','answers'];
  assert.equal(Game.restore(state).current,null);
});

test('course filters provide geometry and calculus only at appropriate levels', () => {
  const game = new Game(deterministic);
  game.setDeck('high', 'math', 'geometry');
  assert.equal(game.cards.length, 6);
  for (let i=0;i<6;i++) assert.equal(game.draw().course, 'geometry');
  game.setDeck('high', 'math', 'calculus');
  assert.equal(game.current, null);
  assert.equal(game.draw().course, 'calculus');
  assert.throws(() => game.setDeck('elementary', 'math', 'calculus'), /Unknown course/);
  assert.throws(() => game.setDeck('college', 'english', 'calculus'), /Unknown course/);
});

test('switching courses cancels an earned roll and keeps each deck separate', () => {
  const game = new Game(deterministic);
  game.setDeck('high','math','geometry');
  const first = game.draw();
  game.answer(first.answer);
  game.setDeck('high','math','calculus');
  assert.equal(game.canRoll,false);
  const calculus = game.draw();
  assert.equal(calculus.course,'calculus');
  game.setDeck('high','math','geometry');
  assert.notEqual(game.draw().id,first.id);
  game.setDeck('high','science');
  assert.equal(game.course,'all');
});

test('course selection and spent rolls survive saved sessions', () => {
  const game = new Game(deterministic);
  game.setDeck('college','math','linear-algebra');
  const q = game.draw();
  game.answer(q.answer);
  game.roll();
  const restored = Game.restore(JSON.parse(JSON.stringify(game.snapshot())),deterministic);
  assert.equal(restored.course,'linear-algebra');
  assert.equal(restored.current.id,q.id);
  assert.equal(restored.roll(),null);
  assert.notEqual(restored.draw().id,q.id);
});

test('existing version-1 sessions retain their current card, totals, and earned roll', () => {
  const game = new Game(deterministic);
  const q = QUESTIONS.find(q => q.id === 'high-math-1');
  const saved = {...game.snapshot(), version:1, level:'high', subject:'math', course:undefined,
    current:{...q, options:[q.answer,...q.distractors]}, phase:'correct', response:q.answer,
    correct:3, drawn:7, rolls:2, history:[4,2], decks:{'high-math':{remaining:['high-math-2'],last:q.id}}};
  const restored = Game.restore(saved,deterministic);
  assert.equal(restored.course,'all');
  assert.equal(restored.current.id,q.id);
  assert.equal(restored.correct,3);
  assert.equal(restored.drawn,7);
  assert.equal(restored.rolls,2);
  assert.equal(restored.roll(),4);
  assert.equal(restored.roll(),null);
  assert.notEqual(restored.draw().id,q.id);
});

test('shuffle preserves the input and produces a permutation', () => {
  const input=[1,2,3,4];
  assert.deepEqual(shuffle(input,()=>0).sort(),input);
  assert.deepEqual(input,[1,2,3,4]);
  assert.throws(()=>randomInt(0),RangeError);
});
