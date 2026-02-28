// ============================================================
// EventPulseChat — script-simple.js  (FIXED)
// Bugs fixed:
//   1. Tab switching now correctly shows/hides panels
//   2. Each tab switch triggers a fresh data fetch for that sport
//   3. setInterval is cleared and restarted cleanly on tab switch
//   4. Fetch has AbortController timeout + proper error state
//   5. No duplicate intervals accumulating across tab switches
//   6. Tab is highlighted correctly (active class synced)
// ============================================================

'use strict';

// ─── State ───────────────────────────────────────────────────────────────────
let activeSport    = 'soccer';
let refreshInterval = null;
let countdownTimer  = null;
let countdown       = 30;

// ─── Sport → ESPN API path map ───────────────────────────────────────────────
const SPORT_PATHS = {
  soccer:   ['soccer/eng.1', 'soccer/esp.1', 'soccer/ita.1', 'soccer/ger.1', 'soccer/fra.1', 'soccer/uefa.champions'],
  nba:      ['basketball/nba'],
  nfl:      ['football/nfl'],
  tennis:   ['tennis/atp', 'tennis/wta'],
  hockey:   ['hockey/nhl'],
  baseball: ['baseball/mlb'],
  cricket:  ['cricket/intl'],
};

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

// ─── Fetch with timeout ───────────────────────────────────────────────────────
async function fetchScores(sportPath) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${ESPN_BASE}/${sportPath}/scoreboard`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[EventPulse] Failed to load ${sportPath}: ${err.name === 'AbortError' ? 'Timeout' : err.message}`);
    return null;
  }
}

// ─── Fetch all paths for a sport (soccer has multiple leagues) ─────────────
async function fetchAllForSport(sport) {
  const paths = SPORT_PATHS[sport];
  if (!paths) return null; // mock sport
  const results = await Promise.all(paths.map(fetchScores));
  // Merge all events into one flat array
  const allEvents = results
    .filter(Boolean)
    .flatMap(data => data.events || []);
  return allEvents;
}

// ─── Sort events: live first → scheduled by date → final ─────────────────────
function sortEvents(events) {
  const ORDER = { in: 0, pre: 1, post: 2 };
  return [...events].sort((a, b) => {
    const stateA = ORDER[a.status?.type?.state] ?? 1;
    const stateB = ORDER[b.status?.type?.state] ?? 1;
    if (stateA !== stateB) return stateA - stateB;
    // Within the same state, sort by date ascending
    const dateA = new Date(a.date || a.competitions?.[0]?.date || 0).getTime();
    const dateB = new Date(b.date || b.competitions?.[0]?.date || 0).getTime();
    return dateA - dateB;
  });
}

// ─── Render games for a sport ─────────────────────────────────────────────────
function renderGames(sport, events) {
  const container = document.getElementById(`${sport}-games`);
  if (!container) return;

  // ── No data / error state ──
  if (events === null) {
    container.innerHTML = '';
    const msg = document.createElement('div');
    msg.className = 'no-games-msg';
    msg.innerHTML = '<p>⚠️ Could not load scores. Retrying in 30s...</p>';
    container.appendChild(msg);
    return;
  }

  // ── No events today ──
  if (!events.length) {
    container.innerHTML = '';
    const msg = document.createElement('div');
    msg.className = 'no-games-msg';
    msg.innerHTML = '<p>✅ No live or recent games right now.<br><small>Check back on game day!</small></p>';
    container.appendChild(msg);
    return;
  }

  // ── Sort: live → scheduled → final ──
  const sorted = sortEvents(events);

  // ── Render event cards ──
  container.innerHTML = '';
  sorted.forEach(event => {
    const card = buildGameCard(event);
    container.appendChild(card);
  });
}

// ─── Build a single game card (safe — no innerHTML with API data) ─────────────
function buildGameCard(event) {
  const competitions = event.competitions || [];
  const comp         = competitions[0] || {};
  const competitors  = comp.competitors || [];
  const status       = event.status || {};
  const statusType   = status.type || {};

  const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
  const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};

  const isLive    = statusType.state === 'in';
  const isFinal   = statusType.state === 'post';
  const statusTxt = statusType.shortDetail || statusType.description || 'Scheduled';

  // Card wrapper
  const card = document.createElement('div');
  card.className = 'game-card' + (isLive ? ' live' : '');
  card.setAttribute('data-event-id', event.id || '');
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${getTeamName(home)} vs ${getTeamName(away)}`);

  // League badge (top of card)
  const leagueBadge = document.createElement('div');
  leagueBadge.className = 'card-league-badge';
  leagueBadge.textContent = event.league?.name || event.season?.slug || '';
  card.appendChild(leagueBadge);

  // Live badge
  if (isLive) {
    const badge = document.createElement('span');
    badge.className = 'live-badge';
    badge.textContent = '🔴 LIVE';
    card.appendChild(badge);
  }

  // Event name (competition/match title)
  const eventNameEl = document.createElement('div');
  eventNameEl.className = 'card-event-name';
  eventNameEl.textContent = event.name || '';
  card.appendChild(eventNameEl);

  // Teams row
  const teamsRow = document.createElement('div');
  teamsRow.className = 'teams-row';

  teamsRow.appendChild(buildTeamBlock(away, 'away'));

  const vs = document.createElement('span');
  vs.className = 'vs-separator';
  vs.textContent = isLive || isFinal ? 'vs' : 'vs';
  teamsRow.appendChild(vs);

  teamsRow.appendChild(buildTeamBlock(home, 'home'));
  card.appendChild(teamsRow);

  // Score row (only if in progress or final)
  if (isLive || isFinal) {
    const scoreRow = document.createElement('div');
    scoreRow.className = 'score-row';

    const awayScore = document.createElement('span');
    awayScore.className = 'score';
    awayScore.textContent = away.score ?? '-';

    const dash = document.createElement('span');
    dash.className = 'score-dash';
    dash.textContent = '–';

    const homeScore = document.createElement('span');
    homeScore.className = 'score';
    homeScore.textContent = home.score ?? '-';

    scoreRow.appendChild(awayScore);
    scoreRow.appendChild(dash);
    scoreRow.appendChild(homeScore);
    card.appendChild(scoreRow);
  }

  // Status row
  const statusRow = document.createElement('div');
  statusRow.className = 'status-row';
  const statusSpan = document.createElement('span');
  statusSpan.className = 'game-status' + (isLive ? ' status-live' : isFinal ? ' status-final' : '');
  statusSpan.textContent = statusTxt;
  statusRow.appendChild(statusSpan);
  card.appendChild(statusRow);

  // Date / time in GMT
  const eventDate = event.date || event.competitions?.[0]?.date || null;
  if (eventDate) {
    const dateEl = document.createElement('div');
    dateEl.className = 'card-datetime';
    dateEl.textContent = '🕐 ' + formatGMT(eventDate);
    card.appendChild(dateEl);
  }

  // Click → open modal
  card.addEventListener('click', () => openModal(event, home, away, statusTxt));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(event, home, away, statusTxt); });

  return card;
}

function buildTeamBlock(team, side) {
  const block = document.createElement('div');
  block.className = `team-block team-${side}`;

  const logo = document.createElement('img');
  logo.className = 'team-logo';
  logo.src   = team.team?.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png&w=40&h=40';
  logo.alt   = '';  // decorative — name is in text below
  logo.width  = 40;
  logo.height = 40;
  logo.onerror = () => { logo.style.display = 'none'; };
  block.appendChild(logo);

  const name = document.createElement('span');
  name.className = 'team-name';
  name.textContent = getTeamName(team);
  block.appendChild(name);

  const record = team.records?.[0]?.summary;
  if (record) {
    const rec = document.createElement('span');
    rec.className = 'team-record';
    rec.textContent = record;
    block.appendChild(rec);
  }

  return block;
}

function getTeamName(team) {
  return team.team?.shortDisplayName || team.team?.displayName || team.team?.name || '–';
}

// ─── Load + render for active sport ──────────────────────────────────────────
async function loadAndRender(sport) {
  const container = document.getElementById(`${sport}-games`);
  if (!container) return;

  // Show loading state
  container.innerHTML = '';
  const loading = document.createElement('div');
  loading.className = 'loading-msg';
  loading.textContent = '⏳ Loading live scores...';
  container.appendChild(loading);

  const events = await fetchAllForSport(sport);
  renderGames(sport, events);
}

// ─── Tab switching — THE CRITICAL FIX ────────────────────────────────────────
function switchTab(sport) {
  if (sport === activeSport) return;

  // 1. Deactivate all tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  // 2. Hide all tab content panels
  document.querySelectorAll('.tab-content').forEach(panel => {
    panel.classList.remove('active');
    panel.style.display = 'none';
  });

  // 3. Activate the clicked tab button
  const activeBtn = document.querySelector(`.tab-button[data-sport="${sport}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-selected', 'true');
  }

  // 4. Show the correct content panel
  const activePanel = document.getElementById(sport);
  if (activePanel) {
    activePanel.classList.add('active');
    activePanel.style.display = 'block';
  }

  // 5. Update state
  activeSport = sport;

  // 6. Stop old interval, reset countdown
  stopAutoRefresh();
  resetCountdown();

  // 7. Fetch data for the newly active sport
  loadAndRender(sport);

  // 8. Start fresh auto-refresh for new sport
  startAutoRefresh(sport);
}

// ─── Auto-refresh ─────────────────────────────────────────────────────────────
function startAutoRefresh(sport) {
  stopAutoRefresh();
  refreshInterval = setInterval(() => {
    if (document.visibilityState === 'hidden') return; // don't fetch when tab is backgrounded
    loadAndRender(sport);
    resetCountdown();
  }, 30000);
}

function stopAutoRefresh() {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// ─── Countdown display ────────────────────────────────────────────────────────
function resetCountdown() {
  countdown = 30;
  if (countdownTimer) clearInterval(countdownTimer);
  updateCountdownDisplay();

  countdownTimer = setInterval(() => {
    countdown--;
    if (countdown <= 0) countdown = 30;
    updateCountdownDisplay();
  }, 1000);
}

function updateCountdownDisplay() {
  const el = document.getElementById('countdown');
  if (el) el.textContent = `${countdown}s`;
}

// ─── Format a date string to GMT display ─────────────────────────────────────
function formatGMT(dateStr) {
  if (!dateStr) return '–';
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return '–';
    return d.toLocaleString('en-GB', {
      timeZone: 'UTC',
      weekday: 'short',
      day:     '2-digit',
      month:   'short',
      year:    'numeric',
      hour:    '2-digit',
      minute:  '2-digit',
      hour12:  false,
    }).replace(',', '') + ' GMT';
  } catch {
    return '–';
  }
}

// ─── Modal ────────────────────────────────────────────────────────────────────
let lastFocusedElement = null;

const FALLBACK_LOGO = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png&w=72&h=72';

function openModal(event, home, away, statusTxt) {
  const modal = document.getElementById('game-modal');
  if (!modal) return;

  lastFocusedElement = document.activeElement;

  // ── Date / time in GMT ────────────────────────────────────────────────────
  const eventDate = event.date || event.competitions?.[0]?.date || null;
  setModalField('modal-datetime',    formatGMT(eventDate));
  setModalField('modal-status',      statusTxt);

  // ── Text fields ───────────────────────────────────────────────────────────
  setModalField('modal-event-name',  event.name || `${getTeamName(away)} vs ${getTeamName(home)}`);
  setModalField('modal-away-name',   getTeamName(away));
  setModalField('modal-away-abbr',   away.team?.abbreviation || '');
  setModalField('modal-away-score',  away.score ?? '–');
  setModalField('modal-away-record', away.records?.[0]?.summary || '');
  setModalField('modal-home-name',   getTeamName(home));
  setModalField('modal-home-abbr',   home.team?.abbreviation || '');
  setModalField('modal-home-score',  home.score ?? '–');
  setModalField('modal-home-record', home.records?.[0]?.summary || '');
  setModalField('modal-venue',       event.competitions?.[0]?.venue?.fullName || '–');
  setModalField('modal-attendance',  event.competitions?.[0]?.attendance
                                       ? event.competitions[0].attendance.toLocaleString()
                                       : '–');
  setModalField('modal-league',      event.league?.name || '–');
  setModalField('modal-broadcast',   getBroadcast(event));

  // ── Team logos ────────────────────────────────────────────────────────────
  setModalLogo('modal-away-logo', away.team?.logo, getTeamName(away));
  setModalLogo('modal-home-logo', home.team?.logo, getTeamName(home));

  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');

  const firstFocusable = modal.querySelector('button, [tabindex="0"]');
  if (firstFocusable) firstFocusable.focus();

  document.addEventListener('keydown', handleModalKey);
}

// Set a logo img src safely, falling back to ESPN default if missing or broken
function setModalLogo(imgId, logoUrl, teamName) {
  const img = document.getElementById(imgId);
  if (!img) return;

  img.alt = teamName; // descriptive alt for screen readers

  // Use ESPN's combiner to resize the logo to 72×72 for crisp display
  const src = logoUrl
    ? `https://a.espncdn.com/combiner/i?img=${encodeURIComponent(logoUrl.replace('https://a.espncdn.com', ''))}&w=72&h=72&transparent=true`
    : FALLBACK_LOGO;

  img.src = '';          // reset first to force reload if same sport re-opens
  img.onerror = () => {  // if ESPN combiner fails, fall back to direct URL then default
    img.onerror = () => { img.src = FALLBACK_LOGO; img.onerror = null; };
    img.src = logoUrl || FALLBACK_LOGO;
  };
  img.src = src;
}

function setModalField(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getBroadcast(event) {
  const broadcasts = event.competitions?.[0]?.broadcasts || [];
  return broadcasts.map(b => b.names?.join(', ')).filter(Boolean).join(' | ') || '–';
}

function closeModal() {
  const modal = document.getElementById('game-modal');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleModalKey);
  if (lastFocusedElement) lastFocusedElement.focus();
}

function handleModalKey(e) {
  if (e.key === 'Escape') closeModal();
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  // Wire up tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const sport = btn.getAttribute('data-sport');
      if (sport) switchTab(sport);
    });
  });

  // Wire up modal close button
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  const modal = document.getElementById('game-modal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  }

  // Hide all panels first, then show default (soccer)
  document.querySelectorAll('.tab-content').forEach(panel => {
    panel.style.display = 'none';
    panel.classList.remove('active');
  });

  const defaultPanel = document.getElementById('soccer');
  if (defaultPanel) {
    defaultPanel.style.display = 'block';
    defaultPanel.classList.add('active');
  }

  const defaultBtn = document.querySelector('.tab-button[data-sport="soccer"]');
  if (defaultBtn) {
    defaultBtn.classList.add('active');
    defaultBtn.setAttribute('aria-selected', 'true');
  }

  // Initial load for default sport
  loadAndRender('soccer');
  startAutoRefresh('soccer');
  resetCountdown();

  // Pause refresh when page is hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      loadAndRender(activeSport);
      startAutoRefresh(activeSport);
      resetCountdown();
    } else {
      stopAutoRefresh();
      if (countdownTimer) clearInterval(countdownTimer);
    }
  });

  console.log('[EventPulse] ✅ Initialized');
}

// ─── Run on DOM ready ─────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
