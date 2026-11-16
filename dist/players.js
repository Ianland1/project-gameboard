/** Physical-board player counters. Positions have no board-specific upper limit. */
export const MAX_PLAYERS = 4;
export const MAX_RECENT_ROLLS = 32;
const MAX_POSITION = Number.MAX_SAFE_INTEGER;
const MAX_ROLL_ID_LENGTH = 128;
const PLAYER_IDS = Array.from({ length: MAX_PLAYERS }, (_, index) => `player-${index + 1}`);

function playerName(name) {
  if (typeof name !== 'string') throw new TypeError('Player name must be text');
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 32) throw new RangeError('Player names require 1–32 characters');
  return trimmed;
}

function validRollId(id) {
  return typeof id === 'string' && id.length > 0 && id.length <= MAX_ROLL_ID_LENGTH && id.trim().length > 0;
}

function validPosition(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function copyPlayer(player) { return player ? { ...player } : null; }

export class PlayerTracker {
  #players;
  #activeId;
  #pendingRoll = null;
  #recentRollIds = [];

  constructor() {
    this.#players = [1, 2].map(number => ({ id: `player-${number}`, name: `Player ${number}`, position: 0 }));
    this.#activeId = this.#players[0].id;
  }

  // Copies prevent UI code or persisted objects from changing model invariants.
  get players() { return this.#players.map(copyPlayer); }
  get activeId() { return this.#activeId; }
  get activePlayer() { return copyPlayer(this.#find(this.#activeId)); }
  get pendingRoll() { return this.#pendingRoll ? { ...this.#pendingRoll } : null; }
  get canAdd() { return this.#players.length < MAX_PLAYERS; }
  get canRemove() { return this.#players.length > 1; }

  #find(id) { return this.#players.find(player => player.id === id); }
  #requirePlayer(id) {
    const player = this.#find(id);
    if (!player) throw new RangeError('Unknown player');
    return player;
  }
  #remember(id) {
    if (!this.#recentRollIds.includes(id)) this.#recentRollIds.push(id);
    this.#recentRollIds = this.#recentRollIds.slice(-MAX_RECENT_ROLLS);
  }

  /** Return the added player, or null when all four player slots are occupied. */
  addPlayer(name) {
    if (!this.canAdd) return null;
    const id = PLAYER_IDS.find(candidate => !this.#find(candidate));
    const number = PLAYER_IDS.indexOf(id) + 1;
    const player = { id, name: name === undefined ? `Player ${number}` : playerName(name), position: 0 };
    this.#players.push(player);
    return copyPlayer(player);
  }

  /** Return the renamed player. Names remain plain text, including HTML-like text. */
  renamePlayer(id, name) {
    const player = this.#requirePlayer(id);
    player.name = playerName(name);
    return copyPlayer(player);
  }

  /** Return the removed player, or null when only one player remains. */
  removePlayer(id) {
    const player = this.#requirePlayer(id);
    if (!this.canRemove) return null;
    const index = this.#players.indexOf(player);
    if (this.#pendingRoll?.playerId === id) this.clearPending();
    this.#players.splice(index, 1);
    if (this.#activeId === id) this.#activeId = this.#players[Math.min(index, this.#players.length - 1)].id;
    return copyPlayer(player);
  }

  setActive(id) {
    const player = this.#requirePlayer(id);
    this.#activeId = id;
    return copyPlayer(player);
  }

  /** Return the updated player; valid counters are nonnegative safe integers. */
  setPosition(id, value) {
    const player = this.#requirePlayer(id);
    if (!validPosition(value)) throw new RangeError('Position must be a nonnegative safe integer');
    player.position = value === 0 ? 0 : value;
    return copyPlayer(player);
  }

  /** Return the updated player, clamping adjustments at zero and MAX_SAFE_INTEGER. */
  adjust(id, delta) {
    const player = this.#requirePlayer(id);
    if (!Number.isSafeInteger(delta)) throw new RangeError('Adjustment must be a safe integer');
    if (delta > 0) player.position = delta > MAX_POSITION - player.position ? MAX_POSITION : player.position + delta;
    else player.position = delta < -player.position ? 0 : player.position + delta;
    return copyPlayer(player);
  }

  /** Capture the active player for a new roll. Return false for a recent/repeated ID. */
  recordRoll(id, value) {
    if (!validRollId(id)) throw new TypeError('Roll ID must be 1–128 characters of text');
    if (!Number.isInteger(value) || value < 1 || value > 4) throw new RangeError('Roll must be 1–4');
    if (this.#recentRollIds.includes(id) || this.#pendingRoll?.id === id) return false;
    this.clearPending();
    this.#pendingRoll = { id, value, playerId: this.#activeId };
    return true;
  }

  /** Move the captured player once and return the movement, or null with no roll. */
  applyRoll() {
    const roll = this.#pendingRoll;
    if (!roll) return null;
    const player = this.#find(roll.playerId);
    this.clearPending();
    if (!player) return null;
    const from = player.position;
    this.adjust(player.id, roll.value);
    return { playerId: player.id, name: player.name, from, to: player.position, value: roll.value };
  }

  /** Automatically advance the selected player once for a new dice result. */
  advanceRoll(id, value) {
    if (!this.recordRoll(id, value)) return null;
    return this.applyRoll();
  }

  nextPlayer() {
    const index = this.#players.findIndex(player => player.id === this.#activeId);
    this.#activeId = this.#players[(index + 1) % this.#players.length].id;
    return this.activePlayer;
  }

  /** Complete one dice turn; duplicate results cannot move or skip a player. */
  playTurn(id, value) {
    const move = this.advanceRoll(id, value);
    if (!move) return null;
    return { ...move, nextPlayer: this.nextPlayer() };
  }

  /** Discard the pending roll and retain its ID against replay. Return whether one existed. */
  clearPending() {
    if (!this.#pendingRoll) return false;
    this.#remember(this.#pendingRoll.id);
    this.#pendingRoll = null;
    return true;
  }

  /** Keep the roster and active player; old roll IDs remain protected against replay. */
  resetPositions() {
    this.clearPending();
    for (const player of this.#players) player.position = 0;
    return this.players;
  }

  snapshot() {
    return {
      version: 1,
      players: this.players,
      activeId: this.#activeId,
      pendingRoll: this.pendingRoll,
      recentRollIds: [...this.#recentRollIds],
    };
  }

  /** Restore a bounded v1 snapshot. Invalid rosters fall back to a fresh two-player game. */
  static restore(saved) {
    const tracker = new PlayerTracker();
    try {
      if (!saved || typeof saved !== 'object' || Array.isArray(saved) || saved.version !== 1 || !Array.isArray(saved.players) || saved.players.length < 1) return tracker;
      const players = Array.from(saved.players.slice(0, MAX_PLAYERS), player => {
        if (!player || !PLAYER_IDS.includes(player.id) || !validPosition(player.position)) throw new Error('Invalid player');
        return { id: player.id, name: playerName(player.name), position: player.position === 0 ? 0 : player.position };
      });
      if (new Set(players.map(player => player.id)).size !== players.length) return tracker;
      tracker.#players = players;
      tracker.#activeId = players.some(player => player.id === saved.activeId) ? saved.activeId : players[0].id;
      if (Array.isArray(saved.recentRollIds)) {
        for (const id of saved.recentRollIds.slice(-MAX_RECENT_ROLLS)) if (validRollId(id)) tracker.#remember(id);
      }
      const pending = saved.pendingRoll;
      if (pending && validRollId(pending.id) && Number.isInteger(pending.value) && pending.value >= 1 && pending.value <= 4 && tracker.#find(pending.playerId) && !tracker.#recentRollIds.includes(pending.id)) {
        tracker.#pendingRoll = { id: pending.id, value: pending.value, playerId: pending.playerId };
      }
      return tracker;
    } catch {
      return new PlayerTracker();
    }
  }
}
