import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game, randomInt, shuffle } from '../dist/engine.js';
import { LEVELS, SUBJECTS, QUESTIONS } from '../dist/questions.js';

const deterministic = max => max - 1;

test('every level/subject deck has six valid, original question cards', () => {
  assert.equal(QUESTIONS.length, 96);
  assert.equal(new Set(QUESTIONS.map(q => q.id)).size, 96);
  assert.equal(new Set(QUESTIONS.map(q => q.prompt)).size, 96);
  for (const level of LEVELS) for (const subject of SUBJECTS) {
    const cards = QUESTIONS.filter(q => q.level === level.id && q.subject === subject.id);
    assert.equal(cards.length, 6, `${level.id}/${subject.id}`);
    for (const card of cards) {
      assert.equal(new Set([card.answer, ...card.distractors]).size, 4, card.id);
      assert.ok(card.prompt && card.answer && card.explanation, card.id);
    }
  }
});

test('each of the 16 decks exhausts before repeating and avoids an immediate cycle repeat', () => {
  for (const level of LEVELS) for (const subject of SUBJECTS) {
    const game = new Game(deterministic);
    game.setDeck(level.id, subject.id);
    const cards = Array.from({length:6}, () => game.draw().id);
    assert.equal(new Set(cards).size, 6);
    assert.notEqual(game.draw().id, cards[5]);
  }
});

test('a correct answer unlocks exactly one roll', () => {
  const game = new Game(deterministic);
  assert.equal(game.roll(), null);
  const card = game.draw();
  assert.equal(game.roll(), null);
  assert.equal(game.answer(card.answer), true);
  assert.equal(game.canRoll, true);
  assert.equal(game.roll(), 6);
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
  assert.equal(game.roll(), 6);
  assert.equal(game.roll(), 6);
  const card = game.draw();
  game.answer(card.answer);
  assert.equal(game.roll(), 6);
  game.freeRoll = false;
  assert.equal(game.roll(), null);
  assert.equal(game.rolls, 3);
});

test('all six die outcomes are mapped to values from 1 through 6', () => {
  for (let n=0;n<6;n++) {
    const game = new Game(max => Math.min(n,max-1));
    game.freeRoll = true;
    assert.equal(game.roll(), n+1);
  }
  for (let i=0;i<500;i++) {
    const value = randomInt(6);
    assert.ok(value >= 0 && value < 6 && Number.isInteger(value));
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

test('malformed saved state recovers to a playable default', () => {
  for(const value of [null,{},[],{version:2},{version:1,level:'invalid',subject:'math'}]) {
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

test('shuffle preserves the input and produces a permutation', () => {
  const input=[1,2,3,4];
  assert.deepEqual(shuffle(input,()=>0).sort(),input);
  assert.deepEqual(input,[1,2,3,4]);
  assert.throws(()=>randomInt(0),RangeError);
});
