// ─── WebSocket Client — Duel / Matchmaking ────────────────────────────
// Connects to the TypeMaster server for real-time online matchmaking.

const WS_URL = (() => {
  const loc = window.location;
  const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  return proto + '//' + loc.host;
})();

let   _ws           = null;
let   _reconnectTimer = null;
const _handlers     = {};   // event type → [callback, ...]
let   _authPayload  = null; // stored to re-send on reconnect
let   _connected    = false;

// ─── Internal ─────────────────────────────────────────────────────────
function _emit(type, data) {
  (_handlers[type] || []).forEach(fn => fn(data));
}

function _send(obj) {
  if (_ws && _ws.readyState === WebSocket.OPEN) {
    _ws.send(JSON.stringify(obj));
  }
}

function _connect() {
  if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) return;

  try {
    _ws = new WebSocket(WS_URL);
  } catch (e) {
    console.warn('[WS] Cannot connect:', e.message);
    _scheduleReconnect();
    return;
  }

  _ws.onopen = () => {
    _connected = true;
    console.log('[WS] Connected');
    if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; }
    if (_authPayload) _send(_authPayload);
    _emit('connected', {});
  };

  _ws.onmessage = e => {
    try {
      const msg = JSON.parse(e.data);
      _emit(msg.type, msg);
      _emit('*', msg);
    } catch {}
  };

  _ws.onclose = () => {
    _connected = false;
    console.log('[WS] Disconnected');
    _emit('disconnected', {});
    _scheduleReconnect();
  };

  _ws.onerror = () => {
    _ws.close();
  };
}

function _scheduleReconnect() {
  if (_reconnectTimer) return;
  _reconnectTimer = setTimeout(() => {
    _reconnectTimer = null;
    _connect();
  }, 3000);
}

// ─── Public API ────────────────────────────────────────────────────────

/** Register a handler for a server message type. */
export function onWS(type, fn) {
  if (!_handlers[type]) _handlers[type] = [];
  _handlers[type].push(fn);
}

/** Authenticate with the server (called after login). */
export function wsAuth(username, displayName, ratingPoints) {
  _authPayload = { type: 'auth', username, displayName, ratingPoints };
  if (!_ws || _ws.readyState === WebSocket.CLOSED || _ws.readyState === WebSocket.CLOSING) {
    _connect();
  } else {
    _send(_authPayload);
  }
}

/** Enter matchmaking queue and start playing. */
export function wsFindMatch(duration) {
  _send({ type: 'find_match', duration });
}

/** Submit local game result to server for matching. */
export function wsSubmitResult(result) {
  _send({
    type:     'submit_result',
    speed:    result.speed    || 0,
    accuracy: result.accuracy || 0,
    chars:    result.chars    || 0,
    errors:   result.errors   || 0,
  });
}

/** Leave matchmaking queue. */
export function wsCancelQueue() {
  _send({ type: 'cancel_queue' });
}

/** Forfeit a duel (user left mid-game). */
export function wsForfeit() {
  _send({ type: 'forfeit' });
}

/** True if socket is open. */
export function wsIsConnected() {
  return _connected && _ws && _ws.readyState === WebSocket.OPEN;
}
