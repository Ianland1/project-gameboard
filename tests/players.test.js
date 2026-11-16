import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlayerTracker, MAX_PLAYERS, MAX_RECENT_ROLLS } from '../dist/players.js';

const roundTrip = tracker => PlayerTracker.restore(JSON.parse(JSON.stringify(tracker.snapshot())));

test('a new tracker starts two distinct players at zero and stops at four players', () => {
  const tracker = new PlayerTracker();
  assert.deepEqual(tracker.players, [
    { id: 'player-1', name: 'Player 1', position: 0 },
    { id: 'player-2', name: 'Player 2', position: 0 },
  ]);
  assert.deepEqual(tracker.activePlayer, tracker.players[0]);
  tracker.addPlayer('  Ada  ');
  tracker.addPlayer();
  assert.equal(tracker.players.length, MAX_PLAYERS);
  assert.equal(new Set(tracker.players.map(player => player.id)).size, MAX_PLAYERS);
  assert.equal(tracker.players[2].name, 'Ada');
  assert.equal(tracker.canAdd, false);
  assert.equal(tracker.addPlayer('Fifth'), null);
  assert.equal(tracker.players.length, 4);
});

test('names stay trimmed plain text and changing a name cannot change positions', () => {
  const tracker = new PlayerTracker();
  tracker.setPosition('player-1', 23);
  assert.equal(tracker.renamePlayer('player-1', ' <b>Ada</b> ').name, '<b>Ada</b>');
  assert.equal(tracker.activePlayer.position, 23);
  for (const name of ['', '  ', 'a'.repeat(33), null, 12]) {
    assert.throws(() => tracker.renamePlayer('player-1', name));
    assert.throws(() => tracker.addPlayer(name));
  }
  assert.equal(tracker.renamePlayer('player-1', ' a'.trim().repeat(32)).name.length, 32);
});

test('manual adjustments are per-player, allow exact zero, and have no board tile maximum', () => {
  const tracker = new PlayerTracker();
  tracker.setPosition('player-1', 250000);
  tracker.adjust('player-1', 7);
  assert.equal(tracker.players[0].position, 250007);
  assert.equal(tracker.players[1].position, 0);
  tracker.adjust('player-1', -250008);
  assert.equal(tracker.players[0].position, 0);
  tracker.setPosition('player-2', 12);
  assert.equal(tracker.setPosition('player-2', 0).position, 0);
  for (const invalid of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '3', null]) {
    assert.throws(() => tracker.setPosition('player-1', invalid));
  }
  for (const invalid of [0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '3', null]) {
    assert.throws(() => tracker.adjust('player-1', invalid));
  }
});

test('overflowing manual and dice movements saturate at a safe integer', () => {
  const tracker = new PlayerTracker();
  tracker.setPosition('player-1', Number.MAX_SAFE_INTEGER - 1);
  assert.equal(tracker.adjust('player-1', Number.MAX_SAFE_INTEGER).position, Number.MAX_SAFE_INTEGER);
  tracker.recordRoll('overflow', 4);
  assert.equal(tracker.applyRoll().to, Number.MAX_SAFE_INTEGER);
  assert.equal(tracker.adjust('player-1', -Number.MAX_SAFE_INTEGER).position, 0);
});

test('a roll captures its player and applies once even after changing the active player', () => {
  const tracker = new PlayerTracker();
  tracker.setPosition('player-1', 8);
  assert.equal(tracker.recordRoll('roll-1', 4), true);
  tracker.setActive('player-2');
  tracker.renamePlayer('player-1', 'Ada');
  assert.deepEqual(tracker.pendingRoll, { id: 'roll-1', value: 4, playerId: 'player-1' });
  assert.deepEqual(tracker.applyRoll(), { playerId: 'player-1', name: 'Ada', from: 8, to: 12, value: 4 });
  assert.equal(tracker.activeId, 'player-2');
  assert.equal(tracker.players[1].position, 0);
  assert.equal(tracker.applyRoll(), null);
  assert.equal(tracker.recordRoll('roll-1', 4), false);
  assert.equal(tracker.applyRoll(), null);
});

test('pending and applied dice preserve their captured player and deduplication across refresh', () => {
  const tracker = new PlayerTracker();
  tracker.renamePlayer('player-1', 'Grace');
  tracker.setPosition('player-1', 2);
  tracker.recordRoll('persisted-roll', 3);
  tracker.setActive('player-2');
  const pendingRestored = roundTrip(tracker);
  assert.equal(pendingRestored.recordRoll('persisted-roll', 1), false);
  assert.deepEqual(pendingRestored.applyRoll(), { playerId: 'player-1', name: 'Grace', from: 2, to: 5, value: 3 });
  const appliedRestored = roundTrip(pendingRestored);
  assert.equal(appliedRestored.activeId, 'player-2');
  assert.equal(appliedRestored.players[0].position, 5);
  assert.equal(appliedRestored.pendingRoll, null);
  assert.equal(appliedRestored.recordRoll('persisted-roll', 3), false);
  assert.equal(appliedRestored.applyRoll(), null);
});

test('replacing or clearing pending dice prevents their old IDs from being retargeted', () => {
  const tracker = new PlayerTracker();
  tracker.recordRoll('first', 1);
  tracker.setActive('player-2');
  tracker.recordRoll('second', 2);
  assert.equal(tracker.recordRoll('first', 1), false);
  assert.equal(tracker.pendingRoll.id, 'second');
  assert.equal(tracker.clearPending(), true);
  assert.equal(tracker.clearPending(), false);
  assert.equal(tracker.recordRoll('second', 2), false);
  assert.equal(tracker.applyRoll(), null);
});

test('removing a pending target clears its die, preserves the minimum roster, and assigns a valid active player', () => {
  const tracker = new PlayerTracker();
  tracker.recordRoll('removed-target', 4);
  tracker.removePlayer('player-1');
  assert.equal(tracker.activeId, 'player-2');
  assert.equal(tracker.pendingRoll, null);
  assert.equal(tracker.applyRoll(), null);
  assert.equal(tracker.removePlayer('player-2'), null);
  assert.equal(tracker.canRemove, false);
  const added = tracker.addPlayer('Replacement');
  assert.notEqual(added.id, tracker.players[0].id);
  tracker.setActive(added.id);
  assert.equal(tracker.recordRoll('removed-target', 4), false);
  assert.throws(() => tracker.setActive('missing'));
  assert.throws(() => tracker.removePlayer('missing'));
});

test('removing a different player leaves the captured roll attached to its original player', () => {
  const tracker = new PlayerTracker();
  tracker.addPlayer();
  tracker.recordRoll('stay', 2);
  tracker.setActive('player-3');
  tracker.removePlayer('player-3');
  assert.ok(tracker.players.some(player => player.id === tracker.activeId));
  assert.equal(tracker.applyRoll().playerId, 'player-1');
});

test('reset zeros counters while preserving names, roster, active player, and used roll protection', () => {
  const tracker = new PlayerTracker();
  tracker.addPlayer('Lin');
  tracker.recordRoll('used-before-reset', 4);
  tracker.applyRoll();
  tracker.setActive('player-3');
  tracker.recordRoll('pending-before-reset', 2);
  tracker.setPosition('player-3', 40);
  tracker.resetPositions();
  assert.deepEqual(tracker.players.map(player => player.position), [0, 0, 0]);
  assert.equal(tracker.activeId, 'player-3');
  assert.equal(tracker.activePlayer.name, 'Lin');
  assert.equal(tracker.pendingRoll, null);
  assert.equal(tracker.recordRoll('used-before-reset', 4), false);
  assert.equal(tracker.recordRoll('pending-before-reset', 2), false);
  assert.equal(tracker.recordRoll('new-after-reset', 2), true);
});

test('snapshots and public getters are independent copies with a bounded roll ledger', () => {
  const tracker = new PlayerTracker();
  for (let index = 0; index < 100; index++) {
    tracker.recordRoll(`roll-${index}`, 1);
    tracker.applyRoll();
  }
  const snapshot = tracker.snapshot();
  assert.equal(snapshot.recentRollIds.length, MAX_RECENT_ROLLS);
  assert.equal(roundTrip(tracker).recordRoll('roll-99', 1), false);
  snapshot.players[0].position = -3;
  snapshot.recentRollIds.length = 0;
  tracker.players[0].name = 'Mutated';
  tracker.activePlayer.position = -2;
  tracker.recordRoll('new-pending', 2);
  tracker.pendingRoll.playerId = 'player-2';
  assert.equal(tracker.players[0].position, 100);
  assert.equal(tracker.activePlayer.name, 'Player 1');
  assert.equal(tracker.pendingRoll.playerId, 'player-1');
});

test('restore rejects invalid rosters and safely handles corrupt or unsupported snapshots', () => {
  const defaultPlayers = new PlayerTracker().players;
  const valid = new PlayerTracker().snapshot();
  const sparse = new PlayerTracker().snapshot();
  delete sparse.players[0];
  sparse.activeId = 'player-2';
  for (const saved of [null, [], 'data', {}, { ...valid, version: 2 }, { ...valid, players: [] },
    sparse,
    { ...valid, players: [valid.players[0], valid.players[0]] },
    { ...valid, players: [{ id: 'player-1', name: 'Ada', position: -1 }] },
    { ...valid, players: [{ id: 'player-1', name: '', position: 0 }] },
    { ...valid, players: [{ id: '__proto__', name: 'Ada', position: 0 }] },
    { get version() { throw new Error('Hostile getter'); } },
  ]) assert.deepEqual(PlayerTracker.restore(saved).players, defaultPlayers);

  const allPlayers = new PlayerTracker();
  allPlayers.addPlayer();
  allPlayers.addPlayer();
  const oversized = allPlayers.snapshot();
  oversized.players.push({ id: 'player-5', name: 'Extra', position: 0 });
  assert.equal(PlayerTracker.restore(oversized).players.length, 4);
  const corruptOptional = { ...valid, activeId: 'missing', pendingRoll: { id: 'bad', value: 6, playerId: 'player-1' }, recentRollIds: [null, 0, '', {}, 'used'] };
  const restored = PlayerTracker.restore(corruptOptional);
  assert.equal(restored.activeId, 'player-1');
  assert.equal(restored.pendingRoll, null);
  assert.equal(restored.recordRoll('used', 1), false);
  assert.equal(restored.recordRoll('fresh', 1), true);
});

test('restore cannot replay a pending ID that is already in the completed roll ledger', () => {
  const tracker = new PlayerTracker();
  tracker.recordRoll('completed', 3);
  tracker.applyRoll();
  const saved = tracker.snapshot();
  saved.pendingRoll = { id: 'completed', value: 3, playerId: 'player-1' };
  const restored = PlayerTracker.restore(saved);
  assert.equal(restored.pendingRoll, null);
  assert.equal(restored.applyRoll(), null);
  assert.equal(restored.players[0].position, 3);
});

test('invalid roll values and identifiers cannot replace a valid pending die', () => {
  const tracker = new PlayerTracker();
  tracker.recordRoll('valid', 2);
  for (const value of [0, 5, 2.5, '2', NaN, Infinity]) assert.throws(() => tracker.recordRoll('bad', value));
  for (const id of ['', ' ', null, 42, 'a'.repeat(129)]) assert.throws(() => tracker.recordRoll(id, 2));
  assert.deepEqual(tracker.pendingRoll, { id: 'valid', value: 2, playerId: 'player-1' });
});


test('automatic dice movement advances only the selected player once across reloads', () => {
  const tracker = new PlayerTracker();
  tracker.setPosition('player-1', 10);
  const move = tracker.advanceRoll('automatic-1', 3);
  assert.deepEqual(move, {playerId:'player-1',name:'Player 1',from:10,to:13,value:3});
  assert.equal(tracker.pendingRoll, null);
  tracker.setActive('player-2');
  assert.equal(tracker.advanceRoll('automatic-1',3),null);
  const restored = roundTrip(tracker);
  assert.equal(restored.advanceRoll('automatic-1',3),null);
  restored.advanceRoll('automatic-2',4);
  restored.advanceRoll('automatic-3',2);
  assert.equal(restored.players[0].position,13);
  assert.equal(restored.players[1].position,6);
  restored.resetPositions();
  assert.equal(restored.advanceRoll('automatic-3',2),null);
  assert.ok(restored.players.every(p=>p.position===0));
});


test('automatic turns cycle through four players and do not advance twice for a repeated roll', () => {
  const tracker = new PlayerTracker();
  tracker.addPlayer(); tracker.addPlayer();
  const ids = tracker.players.map(p=>p.id);
  for(let i=0;i<4;i++) {
    const turn = tracker.playTurn(`turn-${i}`,i+1);
    assert.equal(turn.playerId,ids[i]);
    assert.equal(turn.nextPlayer.id,ids[(i+1)%4]);
    assert.equal(tracker.playTurn(`turn-${i}`,i+1),null);
    assert.equal(tracker.activeId,ids[(i+1)%4]);
  }
  assert.deepEqual(tracker.players.map(p=>p.position),[1,2,3,4]);
  const restored = roundTrip(tracker);
  assert.equal(restored.activeId,ids[0]);
  assert.equal(restored.playTurn('turn-3',4),null);
  assert.equal(restored.activeId,ids[0]);
  restored.removePlayer(ids[1]);
  const next=restored.playTurn('after-remove',2);
  assert.equal(next.nextPlayer.id,ids[2]);
  while(restored.players.length>1)restored.removePlayer(restored.players.at(-1).id);
  const solo=restored.playTurn('solo-turn',3);
  assert.equal(solo.playerId,solo.nextPlayer.id);
});
