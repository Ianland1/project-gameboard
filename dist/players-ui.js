const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createPlayerController({getTracker, onChange, isBusy, announce}) {
  let rosterKey = '';

  function message(text) {
    $('#players-message').textContent = text;
    announce(text);
  }
  function commit() { sync(); onChange(); }
  function positionMessage(player) {
    return `${player.name} is on space ${player.position}.`;
  }

  function sync() {
    const tracker = getTracker();
    const players = tracker.players;
    const key = players.map(p => p.id).join('|');
    if (key !== rosterKey) {
      $('#players-grid').innerHTML = players.map((player, index) => `<div class="player-counter" data-player-id="${player.id}"><div class="player-name-row"><input type="radio" name="active-player" value="${player.id}" aria-label="Select ${esc(player.name)} as active player"><input class="player-name" data-player-name="${player.id}" maxlength="32" value="${esc(player.name)}" aria-label="Name for player ${index + 1}" autocomplete="off"><button class="player-remove" data-player-remove="${player.id}" aria-label="Remove ${esc(player.name)}" title="Remove player">×</button></div><label class="player-space-label" for="position-${player.id}">Space</label><input id="position-${player.id}" class="player-position" data-player-position="${player.id}" type="number" min="0" step="1" inputmode="numeric" value="${player.position}" aria-label="Position for ${esc(player.name)}"><div class="player-stepper"><button data-player-adjust="${player.id}" data-delta="-1" aria-label="Move ${esc(player.name)} back one space">−</button><button data-player-adjust="${player.id}" data-delta="1" aria-label="Move ${esc(player.name)} forward one space">+</button></div></div>`).join('');
      rosterKey = key;
    }
    const busy = isBusy();
    for (const player of players) {
      const row = document.querySelector(`[data-player-id="${player.id}"]`);
      row.classList.toggle('is-active', tracker.activeId === player.id);
      const radio = row.querySelector('input[name="active-player"]');
      radio.checked = tracker.activeId === player.id;
      radio.disabled = busy;
      radio.setAttribute('aria-label', `Select ${player.name} as active player`);
      const name = row.querySelector('.player-name');
      if (document.activeElement !== name) name.value = player.name;
      name.disabled = busy;
      const position = row.querySelector('.player-position');
      if (document.activeElement !== position) position.value = String(player.position);
      position.disabled = busy;
      position.setAttribute('aria-label', `Position for ${player.name}`);
      const remove = row.querySelector('.player-remove');
      remove.disabled = busy || !tracker.canRemove;
      remove.setAttribute('aria-label', `Remove ${player.name}`);
      for (const button of row.querySelectorAll('[data-player-adjust]')) {
        const back = button.dataset.delta === '-1';
        button.disabled = busy || (back && player.position === 0) || (!back && player.position === Number.MAX_SAFE_INTEGER);
        button.setAttribute('aria-label', `Move ${player.name} ${back ? 'back' : 'forward'} one space`);
      }
    }
    $('#players-count').textContent = `${players.length} / 4 players`;
    $('#players-active').textContent = `${busy ? 'Next up' : 'Rolling for'} ${tracker.activePlayer.name}`;
    $('#player-add').disabled = busy || !tracker.canAdd;
    $('#player-add').title = tracker.canAdd ? 'Add a player' : 'Maximum of four players';
  }

  $('#player-add').addEventListener('click', () => {
    if (isBusy()) return;
    const player = getTracker().addPlayer();
    if (!player) return;
    commit();
    const input = document.querySelector(`[data-player-name="${player.id}"]`);
    input?.focus();
    input?.select?.();
    message(`${player.name} added at space 0.`);
  });
  $('#players-grid').addEventListener('input', event => {
    const id = event.target.dataset.playerName;
    if (!id || isBusy()) return;
    const name = event.target.value.trim();
    if (!name) return;
    try { getTracker().renamePlayer(id, name); commit(); } catch { /* Keep the last valid name while editing. */ }
  });
  $('#players-grid').addEventListener('change', event => {
    if (isBusy()) return;
    const input = event.target;
    try {
      if (input.name === 'active-player') {
        getTracker().setActive(input.value);
        commit();
        message(`${getTracker().activePlayer.name} is selected for the next roll.`);
      } else if (input.dataset.playerName) {
        const current = getTracker().players.find(p => p.id === input.dataset.playerName);
        if (!current) return;
        if (input.value.trim()) getTracker().renamePlayer(current.id, input.value);
        input.value = getTracker().players.find(p => p.id === current.id).name;
        commit();
      } else if (input.dataset.playerPosition) {
        const raw = input.value.trim();
        const player = getTracker().setPosition(input.dataset.playerPosition, raw === '' ? NaN : Number(raw));
        input.value = String(player.position);
        commit();
        message(positionMessage(player));
      }
    } catch {
      const current = getTracker().players.find(p => p.id === (input.dataset.playerPosition || input.dataset.playerName));
      if (current) input.value = input.dataset.playerPosition ? String(current.position) : current.name;
      message(input.dataset.playerPosition ? 'Enter a whole-number position of 0 or more.' : 'Use a player name between 1 and 32 characters.');
    }
  });
  $('#players-grid').addEventListener('click', event => {
    if (isBusy()) return;
    const adjust = event.target.closest('[data-player-adjust]');
    const remove = event.target.closest('[data-player-remove]');
    if (adjust) {
      const player = getTracker().adjust(adjust.dataset.playerAdjust, Number(adjust.dataset.delta));
      commit();
      message(positionMessage(player));
    } else if (remove) {
      const player = getTracker().removePlayer(remove.dataset.playerRemove);
      if (!player) return;
      commit();
      message(`${player.name} removed.`);
    }
  });
  sync();
  return {sync,message};
}
