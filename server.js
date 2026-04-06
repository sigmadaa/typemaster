// TypeMaster — WebSocket Matchmaking Server
// Run:  node server.js
// Clients connect to ws://localhost:3000

const http      = require('http');
const express   = require('express');
const WebSocket = require('ws');
const path      = require('path');
const fs        = require('fs');

const PORT = process.env.PORT || 3000;

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ─── Admin ─────────────────────────────────────────────────────────────
// Set env var ADMIN_USERNAME to designate an admin account.
// That user gets admin:true on register and all privileges (VIP, bans, etc).
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || '').toLowerCase().trim();

// ─── Persistent user registry ──────────────────────────────────────────
// Stores { username, displayName, passwordHash, createdAt, admin?, banned? }
const USERS_FILE = path.join(__dirname, 'users.json');

function loadRegisteredUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch { return []; }
}

function saveRegisteredUsers() {
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(registeredUsers, null, 2)); }
  catch (e) { console.error('[USERS] Failed to save:', e.message); }
}

let registeredUsers = loadRegisteredUsers();
console.log(`[USERS] Loaded ${registeredUsers.length} registered user(s)`);

// ─── REST API ──────────────────────────────────────────────────────────
// Check if a username is available
app.get('/api/users/check/:username', (req, res) => {
  const uname = (req.params.username || '').toLowerCase().trim();
  const taken = registeredUsers.some(u => u.username === uname);
  res.json({ available: !taken });
});

// Register a new username (atomically check + claim)
app.post('/api/users/register', (req, res) => {
  const { displayName, passwordHash } = req.body || {};
  if (!displayName || !passwordHash) {
    return res.status(400).json({ ok: false, error: 'Неверные данные' });
  }
  const uname = displayName.toLowerCase().trim();
  if (registeredUsers.some(u => u.username === uname)) {
    return res.status(409).json({ ok: false, error: 'Это имя уже занято другим игроком' });
  }
  const isAdmin = ADMIN_USERNAME && uname === ADMIN_USERNAME;
  registeredUsers.push({ username: uname, displayName: displayName.trim(), passwordHash, createdAt: Date.now(), admin: isAdmin || undefined });
  saveRegisteredUsers();
  console.log(`[REGISTER] New user: ${uname}${isAdmin ? ' [ADMIN]' : ''}`);
  res.json({ ok: true, admin: !!isAdmin });
});

// ─── User status (public) ──────────────────────────────────────────────
app.get('/api/users/status/:username', (req, res) => {
  const uname = (req.params.username || '').toLowerCase().trim();
  const user = registeredUsers.find(u => u.username === uname);
  if (!user) return res.json({ exists: false });
  res.json({ exists: true, banned: !!user.banned, admin: !!user.admin });
});

// ─── Admin endpoints ──────────────────────────────────────────────────
// List all users (admin only)
app.get('/api/admin/users', (req, res) => {
  const aname = (req.query.admin || '').toLowerCase().trim();
  const ahash = req.query.hash || '';
  const adminUser = registeredUsers.find(u => u.username === aname && u.admin);
  if (!adminUser || adminUser.passwordHash !== ahash) {
    return res.status(403).json({ ok: false, error: 'Нет прав' });
  }
  res.json({
    ok: true,
    users: registeredUsers.map(u => ({
      username:    u.username,
      displayName: u.displayName,
      banned:      !!u.banned,
      admin:       !!u.admin,
      createdAt:   u.createdAt,
    }))
  });
});

// Ban / unban a user (admin only)
app.post('/api/admin/ban', (req, res) => {
  const { adminUsername, adminPasswordHash, targetUsername, ban } = req.body || {};
  const adminUser = registeredUsers.find(u => u.username === (adminUsername || '').toLowerCase() && u.admin);
  if (!adminUser || adminUser.passwordHash !== adminPasswordHash) {
    return res.status(403).json({ ok: false, error: 'Нет прав' });
  }
  const target = registeredUsers.find(u => u.username === (targetUsername || '').toLowerCase());
  if (!target) return res.status(404).json({ ok: false, error: 'Пользователь не найден' });
  if (target.admin) return res.status(400).json({ ok: false, error: 'Нельзя забанить администратора' });
  target.banned = !!ban;
  saveRegisteredUsers();
  console.log(`[ADMIN] ${adminUser.username} ${ban ? 'BANNED' : 'UNBANNED'} ${target.username}`);
  res.json({ ok: true, banned: target.banned });
});

// Grant / revoke admin (only if ADMIN_USERNAME is set and requester is admin)
app.post('/api/admin/setadmin', (req, res) => {
  const { adminUsername, adminPasswordHash, targetUsername, admin } = req.body || {};
  const adminUser = registeredUsers.find(u => u.username === (adminUsername || '').toLowerCase() && u.admin);
  if (!adminUser || adminUser.passwordHash !== adminPasswordHash) {
    return res.status(403).json({ ok: false, error: 'Нет прав' });
  }
  const target = registeredUsers.find(u => u.username === (targetUsername || '').toLowerCase());
  if (!target) return res.status(404).json({ ok: false, error: 'Пользователь не найден' });
  target.admin = !!admin;
  saveRegisteredUsers();
  console.log(`[ADMIN] ${target.username} admin=${target.admin}`);
  res.json({ ok: true });
});

// Activate VIP code on the server side (stores nothing — client manages expiry,
// server just validates the code is real and returns days; -1 = lifetime)
const VIP_CODES_SRV = {
  'VIP99-DEMO1': 30, 'VIP99-DEMO2': 30, 'VIP99-START': 30, 'VIP99-TEST1': 30,
  'VIP249-DEMO1': 90, 'VIP249-DEMO2': 90, 'VIP249-START': 90, 'VIP249-TEST1': 90,
  'VIP499-DEMO1': -1, 'VIP499-DEMO2': -1, 'VIP499-START': -1, 'VIP499-TEST1': -1,
};
app.post('/api/vip/validate', (req, res) => {
  const code = ((req.body || {}).code || '').trim().toUpperCase();
  const days = VIP_CODES_SRV[code];
  if (days === undefined) return res.status(400).json({ ok: false, error: 'Неверный код' });
  res.json({ ok: true, days, forever: days === -1 });
});

// ─── State ─────────────────────────────────────────────────────────────
// clients: Map<ws, { username, displayName, ratingPoints }>
const clients = new Map();

// searchQueue: Array<{ ws, username, displayName, ratingPoints, joinedAt, _searchTimeout }>
// Only players currently SEARCHING (haven't been matched yet).
const searchQueue = [];

// activeMatches: Map<matchId, {
//   p1: { ws, username, displayName, ratingPoints, result: null|{} },
//   p2: { ws, username, displayName, ratingPoints, result: null|{} },
//   duration, startedAt, _resultTimeout
// }>
const activeMatches = new Map();

// ─── Helpers ───────────────────────────────────────────────────────────
function send(ws, obj) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function broadcastQueueSize() {
  const size = searchQueue.length;
  wss.clients.forEach(ws => {
    const info = clients.get(ws);
    // Show count excluding yourself
    const mySize = searchQueue.filter(e => e.username !== info?.username).length;
    send(ws, { type: 'queue_status', size: mySize });
  });
}

// ─── ELO ───────────────────────────────────────────────────────────────
function calcDelta(myRating, oppRating, win, draw) {
  if (draw) return 0;
  if (!win) return -10;
  const K = 32;
  const expected = 1 / (1 + Math.pow(10, (oppRating - myRating) / 400));
  return Math.max(1, Math.round(K * (1 - expected)));
}

// ─── Matchmaking ────────────────────────────────────────────────────────
// Rating range expands as wait time increases:
//   0–30 s  →  ±50
//   30–90 s →  ±200
//   90 s+   →  unlimited
function ratingRange(entry) {
  const waited = (Date.now() - entry.joinedAt) / 1000;
  if (waited < 30)  return 50;
  if (waited < 90)  return 200;
  return Infinity;
}

function tryMatch(newEntry) {
  const range = ratingRange(newEntry);
  const candidates = searchQueue.filter(e =>
    e.username !== newEntry.username &&
    Math.abs(e.ratingPoints - newEntry.ratingPoints) <= range
  );
  if (!candidates.length) return false;

  candidates.sort((a, b) =>
    Math.abs(a.ratingPoints - newEntry.ratingPoints) -
    Math.abs(b.ratingPoints - newEntry.ratingPoints)
  );
  const opponent = candidates[0];

  // Remove both from search queue and cancel their search timeouts
  [opponent, newEntry].forEach(e => {
    if (e._searchTimeout) clearTimeout(e._searchTimeout);
    const idx = searchQueue.indexOf(e);
    if (idx !== -1) searchQueue.splice(idx, 1);
  });
  broadcastQueueSize();

  const matchId  = genId();
  const duration = 60; // seconds — both play the same duration

  const match = {
    p1: { ws: opponent.ws, username: opponent.username, displayName: opponent.displayName, ratingPoints: opponent.ratingPoints, result: null },
    p2: { ws: newEntry.ws, username: newEntry.username, displayName: newEntry.displayName, ratingPoints: newEntry.ratingPoints, result: null },
    duration,
    startedAt: Date.now(),
    // If a player hasn't submitted in duration + 30s → auto-forfeit them
    _resultTimeout: setTimeout(() => resolveMatch(matchId, true), (duration + 30) * 1000),
  };
  activeMatches.set(matchId, match);

  // Notify both players — they start the game simultaneously on receiving this
  const payload = (me, opp) => ({
    type:     'match_found',
    matchId,
    duration,
    opponent: { displayName: opp.displayName, ratingPoints: opp.ratingPoints },
  });
  send(match.p1.ws, payload(match.p1, match.p2));
  send(match.p2.ws, payload(match.p2, match.p1));

  console.log(`[MATCH_FOUND] ${opponent.username} vs ${newEntry.username}`);
  return true;
}

// ─── Resolve match when both results are in (or timeout) ───────────────
function resolveMatch(matchId, timedOut = false) {
  const match = activeMatches.get(matchId);
  if (!match) return;
  activeMatches.delete(matchId);
  clearTimeout(match._resultTimeout);

  const { p1, p2 } = match;

  // Auto-forfeit any player who didn't submit
  if (!p1.result) p1.result = { speed: 0, accuracy: 0, chars: 0, errors: 0, forfeit: true };
  if (!p2.result) p2.result = { speed: 0, accuracy: 0, chars: 0, errors: 0, forfeit: true };

  const s1 = p1.result.speed * 0.7 + p1.result.accuracy * 0.3;
  const s2 = p2.result.speed * 0.7 + p2.result.accuracy * 0.3;
  const p1Win = s1 > s2;
  const draw  = Math.abs(s1 - s2) < 0.001;

  const d1 = calcDelta(p1.ratingPoints, p2.ratingPoints,  p1Win,           draw);
  const d2 = calcDelta(p2.ratingPoints, p1.ratingPoints, !p1Win && !draw,  draw);

  send(p1.ws, {
    type:        'duel_result',
    matchId,
    win:         p1Win,
    draw,
    myResult:    p1.result,
    theirResult: p2.result,
    opponent:    { displayName: p2.displayName, ratingPoints: p2.ratingPoints },
    ratingDelta: d1,
    newRating:   Math.max(0, p1.ratingPoints + d1),
  });
  send(p2.ws, {
    type:        'duel_result',
    matchId,
    win:         !p1Win && !draw,
    draw,
    myResult:    p2.result,
    theirResult: p1.result,
    opponent:    { displayName: p1.displayName, ratingPoints: p1.ratingPoints },
    ratingDelta: d2,
    newRating:   Math.max(0, p2.ratingPoints + d2),
  });

  console.log(`[DUEL_RESULT] ${p1.username}(${d1 >= 0 ? '+' : ''}${d1}) vs ${p2.username}(${d2 >= 0 ? '+' : ''}${d2})`);
}

// ─── Message Handlers ──────────────────────────────────────────────────
function handleMessage(ws, msg) {
  const type = msg.type;

  if (type === 'auth') {
    // Reject banned users immediately
    const authUname = (msg.username || '').toLowerCase().trim();
    const regEntry = registeredUsers.find(u => u.username === authUname);
    if (regEntry?.banned) {
      send(ws, { type: 'banned', message: 'Ваш аккаунт заблокирован администратором.' });
      ws.close();
      return;
    }
    clients.set(ws, {
      username:     msg.username,
      displayName:  msg.displayName || msg.username,
      ratingPoints: msg.ratingPoints || 1000,
    });
    // Auto-register existing users (migration: they already have an account in localStorage)
    const uname = (msg.username || '').toLowerCase().trim();
    if (uname && !registeredUsers.some(u => u.username === uname)) {
      registeredUsers.push({
        username:     uname,
        displayName:  msg.displayName || uname,
        passwordHash: msg.passwordHash || '',
        createdAt:    Date.now(),
        migrated:     true,
      });
      saveRegisteredUsers();
      console.log(`[REGISTER] Auto-migrated existing user: ${uname}`);
    }
    const mySize = searchQueue.filter(e => e.username !== msg.username).length;
    send(ws, { type: 'queue_status', size: mySize });
    console.log(`[AUTH] ${msg.username} (⭐${msg.ratingPoints})`);
    return;
  }

  const info = clients.get(ws);
  if (!info) { send(ws, { type: 'error', message: 'Сначала пройди аутентификацию' }); return; }

  // ── find_match ─────────────────────────────────────────────────────
  if (type === 'find_match') {
    // Remove any stale queue entry for this user
    const stale = searchQueue.findIndex(e => e.username === info.username);
    if (stale !== -1) {
      if (searchQueue[stale]._searchTimeout) clearTimeout(searchQueue[stale]._searchTimeout);
      searchQueue.splice(stale, 1);
    }

    const entry = {
      ws,
      username:     info.username,
      displayName:  info.displayName,
      ratingPoints: info.ratingPoints,
      joinedAt:     Date.now(),
    };

    // Search timeout: 2 minutes — if no opponent found, cancel quietly
    entry._searchTimeout = setTimeout(() => {
      const idx = searchQueue.indexOf(entry);
      if (idx === -1) return; // already matched
      searchQueue.splice(idx, 1);
      broadcastQueueSize();
      send(ws, { type: 'no_opponent' });
      console.log(`[TIMEOUT] ${info.username} — no opponent found`);
    }, 2 * 60 * 1000);

    searchQueue.push(entry);
    broadcastQueueSize();
    send(ws, { type: 'searching' });
    console.log(`[QUEUE] ${info.username} searching… (queue: ${searchQueue.length})`);

    // Try to match with someone already waiting
    tryMatch(entry);
    return;
  }

  // ── submit_result ──────────────────────────────────────────────────
  if (type === 'submit_result') {
    // Find which active match this player belongs to
    let match = null, mySlot = null;
    for (const [id, m] of activeMatches) {
      if (m.p1.username === info.username) { match = m; mySlot = 'p1'; break; }
      if (m.p2.username === info.username) { match = m; mySlot = 'p2'; break; }
    }
    if (!match) {
      send(ws, { type: 'error', message: 'Нет активного матча' });
      return;
    }
    match[mySlot].result = {
      speed:    msg.speed    || 0,
      accuracy: msg.accuracy || 0,
      chars:    msg.chars    || 0,
      errors:   msg.errors   || 0,
    };
    console.log(`[RESULT] ${info.username} → speed:${match[mySlot].result.speed} acc:${match[mySlot].result.accuracy}%`);

    // Tell client to show "waiting for opponent to finish"
    send(ws, { type: 'waiting_opponent' });

    // If both players submitted — resolve immediately
    if (match.p1.result && match.p2.result) {
      // Find matchId
      for (const [id, m] of activeMatches) {
        if (m === match) { resolveMatch(id); break; }
      }
    }
    return;
  }

  // ── cancel_queue ───────────────────────────────────────────────────
  if (type === 'cancel_queue') {
    const idx = searchQueue.findIndex(e => e.username === info.username);
    if (idx !== -1) {
      if (searchQueue[idx]._searchTimeout) clearTimeout(searchQueue[idx]._searchTimeout);
      searchQueue.splice(idx, 1);
    }
    broadcastQueueSize();
    send(ws, { type: 'queue_cancelled' });
    console.log(`[CANCEL] ${info.username} left queue`);
    return;
  }

  // ── forfeit ────────────────────────────────────────────────────────
  if (type === 'forfeit') {
    for (const [id, m] of activeMatches) {
      const slot = m.p1.username === info.username ? 'p1' : m.p2.username === info.username ? 'p2' : null;
      if (!slot) continue;
      m[slot].result = { speed: 0, accuracy: 0, chars: 0, errors: 0, forfeit: true };
      send(ws, { type: 'forfeit_ack' });
      console.log(`[FORFEIT] ${info.username}`);
      // Resolve if opponent already submitted
      if (m.p1.result && m.p2.result) resolveMatch(id);
      break;
    }
    return;
  }
}

function handleDisconnect(ws) {
  const info = clients.get(ws);
  if (info) {
    // Remove from search queue
    const idx = searchQueue.findIndex(e => e.username === info.username);
    if (idx !== -1) {
      if (searchQueue[idx]._searchTimeout) clearTimeout(searchQueue[idx]._searchTimeout);
      searchQueue.splice(idx, 1);
      broadcastQueueSize();
    }
    // Forfeit any active match
    for (const [id, m] of activeMatches) {
      const slot = m.p1.username === info.username ? 'p1' : m.p2.username === info.username ? 'p2' : null;
      if (!slot) continue;
      m[slot].result = { speed: 0, accuracy: 0, chars: 0, errors: 0, forfeit: true };
      if (m.p1.result && m.p2.result) resolveMatch(id);
      break;
    }
    clients.delete(ws);
    console.log(`[DISCONNECT] ${info.username}`);
  }
}

// ─── WebSocket listener ────────────────────────────────────────────────
wss.on('connection', ws => {
  ws.on('message', raw => {
    try { handleMessage(ws, JSON.parse(raw)); }
    catch (e) { console.error('Bad message:', e.message); }
  });
  ws.on('close',  () => handleDisconnect(ws));
  ws.on('error',  () => handleDisconnect(ws));
});

// ─── Periodic retry: expand range for long-waiting searchers ──────────
setInterval(() => {
  for (const entry of [...searchQueue]) {
    if (searchQueue.includes(entry)) tryMatch(entry);
  }
}, 15 * 1000);

// ═══════════════════════════════════════════════════════════════════════
// ─── CLANS ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

const CLANS_FILE   = path.join(__dirname, 'clans.json');
const BATTLES_FILE = path.join(__dirname, 'clan_battles.json');

function loadClans()   { try { return JSON.parse(fs.readFileSync(CLANS_FILE,   'utf8')); } catch { return []; } }
function loadBattles() { try { return JSON.parse(fs.readFileSync(BATTLES_FILE, 'utf8')); } catch { return []; } }
function saveClans(d)   { try { fs.writeFileSync(CLANS_FILE,   JSON.stringify(d, null, 2)); } catch(e){console.error('[CLANS] save error', e.message);} }
function saveBattles(d) { try { fs.writeFileSync(BATTLES_FILE, JSON.stringify(d, null, 2)); } catch(e){console.error('[BATTLES] save error', e.message);} }

let clans   = loadClans();
let battles = loadBattles();
console.log(`[CLANS] Loaded ${clans.length} clan(s), ${battles.length} battle(s)`);

function clanGenId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function getUserClan(username) {
  return clans.find(c => c.members.includes(username)) || null;
}

/** Broadcast a WS message to all online members of a clan */
function broadcastToClan(clanId, msg) {
  const clan = clans.find(c => c.id === clanId);
  if (!clan) return;
  wss.clients.forEach(ws => {
    const info = clients.get(ws);
    if (info && clan.members.includes(info.username)) send(ws, msg);
  });
}

/** Auto-finish expired battles */
function tickBattles() {
  const now = Date.now();
  let changed = false;
  battles.forEach(b => {
    if (b.status === 'active' && b.endsAt <= now) {
      b.status = 'finished';
      const s1 = b.scores[b.clan1Id]?.total || 0;
      const s2 = b.scores[b.clan2Id]?.total || 0;
      b.winnerId = s1 > s2 ? b.clan1Id : s2 > s1 ? b.clan2Id : null; // null = draw
      // Update clan win/loss records
      const c1 = clans.find(c => c.id === b.clan1Id);
      const c2 = clans.find(c => c.id === b.clan2Id);
      if (b.winnerId && c1 && c2) {
        if (b.winnerId === b.clan1Id) { c1.wins = (c1.wins||0)+1; c2.losses = (c2.losses||0)+1; }
        else                          { c2.wins = (c2.wins||0)+1; c1.losses = (c1.losses||0)+1; }
      }
      changed = true;
      broadcastToClan(b.clan1Id, { type: 'clan_battle_finished', battleId: b.id, winnerId: b.winnerId });
      broadcastToClan(b.clan2Id, { type: 'clan_battle_finished', battleId: b.id, winnerId: b.winnerId });
      console.log(`[BATTLE_END] ${b.clan1Id} vs ${b.clan2Id} → winner: ${b.winnerId || 'draw'}`);
    }
  });
  if (changed) { saveClans(clans); saveBattles(battles); }
}
setInterval(tickBattles, 30 * 1000);

// ── GET /api/clans ────────────────────────────────────────────────────
app.get('/api/clans', (req, res) => {
  res.json(clans.map(c => ({
    id:         c.id,
    tag:        c.tag,
    name:       c.name,
    desc:       c.description || '',
    avatar:     c.avatar || null,
    leaderId:   c.leaderId,
    isVipLeader: c.isVipLeader || false,
    members:    c.members.length,
    maxMembers: c.isVipLeader ? 30 : 10,
    wins:       c.wins    || 0,
    losses:     c.losses  || 0,
    totalScore: c.totalScore || 0,
    createdAt:  c.createdAt,
  })));
});

// ── GET /api/clans/mine?username=xxx ──────────────────────────────────
app.get('/api/clans/mine', (req, res) => {
  const username = (req.query.username || '').toLowerCase().trim();
  if (!username) return res.json({ clan: null });
  const clan = getUserClan(username);
  if (!clan) return res.json({ clan: null });
  const activeBattle = battles.find(b =>
    (b.clan1Id === clan.id || b.clan2Id === clan.id) && b.status === 'active'
  ) || null;
  const pendingChallenge = battles.find(b =>
    b.clan2Id === clan.id && b.status === 'pending'
  ) || null;
  res.json({ clan, activeBattle, pendingChallenge });
});

// ── GET /api/clans/:id ─────────────────────────────────────────────────
app.get('/api/clans/:id', (req, res) => {
  const clan = clans.find(c => c.id === req.params.id);
  if (!clan) return res.status(404).json({ ok: false, error: 'Клан не найден' });
  res.json(clan);
});

// ── POST /api/clans/create ────────────────────────────────────────────
app.post('/api/clans/create', (req, res) => {
  const { username, tag, name, description, isVipLeader, avatar } = req.body || {};
  if (!username || !tag || !name) return res.status(400).json({ ok: false, error: 'Укажи тег, название' });
  const uname = username.toLowerCase().trim();
  const cleanTag = tag.toUpperCase().replace(/[^A-ZА-ЯЁ0-9]/gi, '').slice(0, 5);
  const cleanName = name.trim().slice(0, 32);
  if (cleanTag.length < 2) return res.status(400).json({ ok: false, error: 'Тег: 2–5 символов' });
  if (cleanName.length < 2) return res.status(400).json({ ok: false, error: 'Название: мин. 2 символа' });

  if (getUserClan(uname)) return res.status(409).json({ ok: false, error: 'Ты уже состоишь в клане' });
  if (clans.find(c => c.tag === cleanTag)) return res.status(409).json({ ok: false, error: 'Тег уже занят' });
  if (clans.find(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
    return res.status(409).json({ ok: false, error: 'Такое название уже занято' });
  }

  const clan = {
    id:          clanGenId(),
    tag:         cleanTag,
    name:        cleanName,
    description: (description || '').trim().slice(0, 100),
    avatar:      avatar || null,
    leaderId:    uname,
    isVipLeader: !!isVipLeader,
    members:     [uname],
    wins:        0,
    losses:      0,
    totalScore:  0,
    createdAt:   Date.now(),
  };
  clans.push(clan);
  saveClans(clans);
  console.log(`[CLAN_CREATE] [${cleanTag}] ${cleanName} by ${uname}`);
  res.json({ ok: true, clan });
});

// ── POST /api/clans/join ──────────────────────────────────────────────
app.post('/api/clans/join', (req, res) => {
  const { username, clanId } = req.body || {};
  if (!username || !clanId) return res.status(400).json({ ok: false, error: 'Неверные данные' });
  const uname = username.toLowerCase().trim();
  if (getUserClan(uname)) return res.status(409).json({ ok: false, error: 'Ты уже состоишь в клане — сначала выйди' });
  const clan = clans.find(c => c.id === clanId);
  if (!clan) return res.status(404).json({ ok: false, error: 'Клан не найден' });
  const maxMembers = clan.isVipLeader ? 30 : 10;
  if (clan.members.length >= maxMembers) return res.status(409).json({ ok: false, error: `Клан заполнен (макс. ${maxMembers})` });
  clan.members.push(uname);
  saveClans(clans);
  broadcastToClan(clan.id, { type: 'clan_member_joined', username: uname, clanId: clan.id });
  console.log(`[CLAN_JOIN] ${uname} → [${clan.tag}]`);
  res.json({ ok: true, clan });
});

// ── POST /api/clans/leave ─────────────────────────────────────────────
app.post('/api/clans/leave', (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ ok: false, error: 'Неверные данные' });
  const uname = username.toLowerCase().trim();
  const clan = getUserClan(uname);
  if (!clan) return res.status(404).json({ ok: false, error: 'Ты не состоишь в клане' });

  clan.members = clan.members.filter(m => m !== uname);

  // If leader left, assign new leader or disband
  if (clan.leaderId === uname) {
    if (clan.members.length === 0) {
      // Disband clan
      const idx = clans.indexOf(clan);
      if (idx !== -1) clans.splice(idx, 1);
      // Cancel active battles
      battles.forEach(b => {
        if ((b.clan1Id === clan.id || b.clan2Id === clan.id) && b.status !== 'finished') {
          b.status = 'cancelled';
        }
      });
      saveClans(clans); saveBattles(battles);
      console.log(`[CLAN_DISBAND] [${clan.tag}] by leader leaving`);
      return res.json({ ok: true, disbanded: true });
    }
    clan.leaderId = clan.members[0];
    broadcastToClan(clan.id, { type: 'clan_new_leader', newLeaderId: clan.leaderId, clanId: clan.id });
  }

  saveClans(clans);
  broadcastToClan(clan.id, { type: 'clan_member_left', username: uname, clanId: clan.id });
  console.log(`[CLAN_LEAVE] ${uname} ← [${clan.tag}]`);
  res.json({ ok: true });
});

// ── POST /api/clans/kick ──────────────────────────────────────────────
app.post('/api/clans/kick', (req, res) => {
  const { username, targetUsername } = req.body || {};
  if (!username || !targetUsername) return res.status(400).json({ ok: false, error: 'Неверные данные' });
  const uname  = username.toLowerCase().trim();
  const target = targetUsername.toLowerCase().trim();
  const clan = getUserClan(uname);
  if (!clan) return res.status(404).json({ ok: false, error: 'Ты не в клане' });
  if (clan.leaderId !== uname) return res.status(403).json({ ok: false, error: 'Только лидер может исключать' });
  if (target === uname) return res.status(400).json({ ok: false, error: 'Нельзя исключить себя' });
  clan.members = clan.members.filter(m => m !== target);
  saveClans(clans);
  console.log(`[CLAN_KICK] ${target} из [${clan.tag}] by ${uname}`);
  res.json({ ok: true });
});

// ── POST /api/clans/battle/challenge ──────────────────────────────────
app.post('/api/clans/battle/challenge', (req, res) => {
  const { username, targetClanId } = req.body || {};
  if (!username || !targetClanId) return res.status(400).json({ ok: false, error: 'Неверные данные' });
  const uname = username.toLowerCase().trim();
  const myClan = getUserClan(uname);
  if (!myClan) return res.status(400).json({ ok: false, error: 'Ты не в клане' });
  if (myClan.leaderId !== uname) return res.status(403).json({ ok: false, error: 'Только лидер может вызывать на бой' });
  if (myClan.id === targetClanId) return res.status(400).json({ ok: false, error: 'Нельзя воевать с самим собой' });

  const targetClan = clans.find(c => c.id === targetClanId);
  if (!targetClan) return res.status(404).json({ ok: false, error: 'Клан-соперник не найден' });

  // Check no active/pending battle already exists between these two clans
  const existing = battles.find(b =>
    (b.clan1Id === myClan.id || b.clan2Id === myClan.id) &&
    ['active','pending'].includes(b.status)
  );
  if (existing) return res.status(409).json({ ok: false, error: 'У твоего клана уже есть активный вызов или битва' });

  const battle = {
    id:       clanGenId(),
    clan1Id:  myClan.id,
    clan2Id:  targetClan.id,
    clan1Tag: myClan.tag,
    clan2Tag: targetClan.tag,
    clan1Name: myClan.name,
    clan2Name: targetClan.name,
    status:   'pending',   // pending → active → finished
    createdAt: Date.now(),
    endsAt:   null,  // set when accepted
    scores: {
      [myClan.id]:    { total: 0, contributions: {} },
      [targetClan.id]: { total: 0, contributions: {} },
    },
    winnerId: null,
  };
  battles.push(battle);
  saveBattles(battles);

  broadcastToClan(targetClan.id, { type: 'clan_challenge_received', battleId: battle.id, fromClanName: myClan.name, fromClanTag: myClan.tag });
  console.log(`[CLAN_CHALLENGE] [${myClan.tag}] → [${targetClan.tag}]`);
  res.json({ ok: true, battle });
});

// ── POST /api/clans/battle/accept ─────────────────────────────────────
app.post('/api/clans/battle/accept', (req, res) => {
  const { username, battleId } = req.body || {};
  const uname = (username || '').toLowerCase().trim();
  const battle = battles.find(b => b.id === battleId);
  if (!battle || battle.status !== 'pending') return res.status(404).json({ ok: false, error: 'Вызов не найден или уже недействителен' });
  const myClan = getUserClan(uname);
  if (!myClan || myClan.id !== battle.clan2Id) return res.status(403).json({ ok: false, error: 'Только лидер клана-цели может принять вызов' });
  if (myClan.leaderId !== uname) return res.status(403).json({ ok: false, error: 'Только лидер может принять вызов' });

  const BATTLE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  battle.status  = 'active';
  battle.startedAt = Date.now();
  battle.endsAt  = Date.now() + BATTLE_DURATION_MS;
  saveBattles(battles);

  broadcastToClan(battle.clan1Id, { type: 'clan_battle_started', battleId: battle.id, endsAt: battle.endsAt, opponentTag: battle.clan2Tag });
  broadcastToClan(battle.clan2Id, { type: 'clan_battle_started', battleId: battle.id, endsAt: battle.endsAt, opponentTag: battle.clan1Tag });
  console.log(`[BATTLE_START] [${battle.clan1Tag}] vs [${battle.clan2Tag}] — ends ${new Date(battle.endsAt).toISOString()}`);
  res.json({ ok: true, battle });
});

// ── POST /api/clans/battle/decline ────────────────────────────────────
app.post('/api/clans/battle/decline', (req, res) => {
  const { username, battleId } = req.body || {};
  const uname = (username || '').toLowerCase().trim();
  const battle = battles.find(b => b.id === battleId);
  if (!battle || battle.status !== 'pending') return res.status(404).json({ ok: false, error: 'Вызов не найден' });
  const myClan = getUserClan(uname);
  if (!myClan || myClan.id !== battle.clan2Id) return res.status(403).json({ ok: false, error: 'Нет прав' });
  battle.status = 'declined';
  saveBattles(battles);
  broadcastToClan(battle.clan1Id, { type: 'clan_challenge_declined', battleId: battle.id, byTag: battle.clan2Tag });
  res.json({ ok: true });
});

// ── POST /api/clans/battle/contribute ────────────────────────────────
// Called after a game session to submit score to the active battle
app.post('/api/clans/battle/contribute', (req, res) => {
  const { username, speed, accuracy } = req.body || {};
  if (!username) return res.status(400).json({ ok: false, error: 'Нет данных' });
  const uname = (username || '').toLowerCase().trim();
  const clan = getUserClan(uname);
  if (!clan) return res.json({ ok: false, contributed: false, reason: 'not_in_clan' });

  const battle = battles.find(b =>
    (b.clan1Id === clan.id || b.clan2Id === clan.id) && b.status === 'active'
  );
  if (!battle) return res.json({ ok: true, contributed: false, reason: 'no_battle' });

  const score = Math.round((speed || 0) * 0.7 + (accuracy || 0) * 0.3);
  const prevBest = battle.scores[clan.id].contributions[uname] || 0;

  // Only update if this is the player's best score in this battle
  if (score > prevBest) {
    const diff = score - prevBest;
    battle.scores[clan.id].contributions[uname] = score;
    battle.scores[clan.id].total = (battle.scores[clan.id].total || 0) + diff;
    clan.totalScore = (clan.totalScore || 0) + diff;
    saveBattles(battles);
    saveClans(clans);

    // Broadcast live update to both clans
    const oppClanId = battle.clan1Id === clan.id ? battle.clan2Id : battle.clan1Id;
    const update = {
      type:     'clan_battle_update',
      battleId: battle.id,
      scores: {
        [battle.clan1Id]: battle.scores[battle.clan1Id].total,
        [battle.clan2Id]: battle.scores[battle.clan2Id].total,
      }
    };
    broadcastToClan(clan.id, update);
    broadcastToClan(oppClanId, update);
  }

  res.json({ ok: true, contributed: true, score, prevBest });
});

// ── GET /api/clans/battle/:id ─────────────────────────────────────────
app.get('/api/clans/battle/:id', (req, res) => {
  const battle = battles.find(b => b.id === req.params.id);
  if (!battle) return res.status(404).json({ ok: false, error: 'Битва не найдена' });
  res.json(battle);
});

// ═══════════════════════════════════════════════════════════════════════

server.listen(PORT, () => {
  console.log(`\n✅ TypeMaster server running at http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   Open the game at http://localhost:${PORT}/index.html\n`);
});

