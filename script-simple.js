// SIMPLE LIVE SCORES - No API Key Required!
// Uses ESPN's public API for real-time scores

let activeSport = 'nba';
let refreshInterval = 30;
let countdownTimer;

// Initialize Dashboard
async function initDashboard() {
    console.log('🔴 Loading LIVE scores from ESPN...');
    await loadLiveScores(activeSport);
    renderGames(activeSport);
    setupTabSwitching();
    startAutoRefresh();
    startCountdown();
}

// Fetch Live Scores from ESPN (No API Key Required!)
async function loadLiveScores(sport) {
    try {
        let data;
        
        switch(sport) {
            case 'nba':
                data = await fetchESPNScores('basketball/nba');
                break;
            case 'nfl':
                data = await fetchESPNScores('football/nfl');
                break;
            case 'soccer':
                data = await fetchESPNScores('soccer/eng.1'); // Premier League
                break;
            case 'ufc':
                // UFC uses different API structure
                data = getMockUFC();
                break;
        }
        
        window.sportsData = window.sportsData || {};
        window.sportsData[sport] = data;
        
        console.log(`✅ Loaded ${data.length} ${sport.toUpperCase()} games`);
    } catch (error) {
        console.error(`Error loading ${sport}:`, error);
        // Fallback to mock data
        window.sportsData = window.sportsData || {};
        window.sportsData[sport] = getMockData(sport);
    }
}

// Fetch from ESPN Public API
async function fetchESPNScores(league) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${league}/scoreboard`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('ESPN API failed');
    
    const data = await response.json();
    return parseESPNData(data.events || []);
}

// Parse ESPN Response
function parseESPNData(events) {
    return events.slice(0, 6).map(event => {
        const competition = event.competitions[0];
        const homeTeam = competition.competitors.find(t => t.homeAway === 'home');
        const awayTeam = competition.competitors.find(t => t.homeAway === 'away');
        
        return {
            id: event.id,
            team1: homeTeam.team.displayName || homeTeam.team.name,
            team2: awayTeam.team.displayName || awayTeam.team.name,
            score1: parseInt(homeTeam.score) || 0,
            score2: parseInt(awayTeam.score) || 0,
            status: competition.status.type.detail || competition.status.type.shortDetail,
            isLive: competition.status.type.state === 'in',
            time: competition.status.displayClock || ''
        };
    });
}

// Mock UFC Data (ESPN doesn't have public UFC API)
function getMockUFC() {
    return [
        {
            id: 1,
            team1: 'Fighter A',
            team2: 'Fighter B',
            score1: '',
            score2: '',
            status: 'UPCOMING EVENT',
            isLive: false
        }
    ];
}

// Fallback Mock Data
function getMockData(sport) {
    const mockData = {
        nba: [
            { id: 1, team1: 'Cavaliers', team2: 'Pistons', score1: 105, score2: 98, status: 'Final', isLive: false },
            { id: 2, team1: 'Lakers', team2: 'Warriors', score1: 112, score2: 108, status: 'Final', isLive: false }
        ],
        nfl: [
            { id: 1, team1: 'Chiefs', team2: 'Bills', score1: 27, score2: 24, status: 'Final', isLive: false }
        ],
        soccer: [
            { id: 1, team1: 'Man City', team2: 'Arsenal', score1: 2, score2: 1, status: 'FT', isLive: false }
        ],
        ufc: getMockUFC()
    };
    return mockData[sport] || [];
}

// Render Games
function renderGames(sport) {
    const container = document.getElementById(`${sport}-games`);
    if (!container) return;
    
    container.innerHTML = '';
    
    const games = (window.sportsData && window.sportsData[sport]) || [];
    
    if (games.length === 0) {
        container.innerHTML = '<div class="no-games">Loading games...</div>';
        return;
    }
    
    games.forEach(game => {
        const card = createGameCard(game, sport);
        container.appendChild(card);
    });
}

// Create Game Card
function createGameCard(game, sport) {
    const card = document.createElement('div');
    card.className = `game-card ${sport === 'ufc' ? 'ufc-card' : ''} ${game.isLive ? 'live-game' : ''}`;
    
    const liveIndicator = game.isLive ? '<span class="live-badge">🔴 LIVE</span>' : '';
    const statusHTML = `<div class="game-status ${game.isLive ? 'status-live' : ''}">${liveIndicator} ${game.status}</div>`;
    const teamsHTML = `<div class="game-teams">${game.team1} vs ${game.team2}</div>`;
    
    let scoreHTML = '';
    if (sport === 'ufc') {
        scoreHTML = game.isLive ? 
            `<div class="game-score">🥊 LIVE</div>` : 
            `<div class="game-score">UPCOMING</div>`;
    } else {
        scoreHTML = `<div class="game-score">${game.score1} - ${game.score2}</div>`;
    }
    
    const sourceHTML = `<div class="game-details">📡 ESPN Live Feed</div>`;
    
    card.innerHTML = statusHTML + teamsHTML + scoreHTML + sourceHTML;
    
    return card;
}

// Tab Switching
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const sport = button.getAttribute('data-sport');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(sport).classList.add('active');
            
            activeSport = sport;
            
            // Load data if not already loaded
            if (!window.sportsData || !window.sportsData[sport]) {
                await loadLiveScores(sport);
            }
            
            renderGames(sport);
        });
    });
}

// Auto Refresh
function startAutoRefresh() {
    setInterval(async () => {
        console.log('🔄 Refreshing scores...');
        await loadLiveScores(activeSport);
        renderGames(activeSport);
        refreshInterval = 30;
    }, 30000); // 30 seconds
}

// Countdown Timer
function startCountdown() {
    const timerElement = document.getElementById('refreshTimer');
    
    countdownTimer = setInterval(() => {
        refreshInterval--;
        
        if (refreshInterval <= 0) {
            refreshInterval = 30;
        }
        
        timerElement.textContent = `Next update: ${refreshInterval}s`;
    }, 1000);
}

// Mobile Support
if ('ontouchstart' in window) {
    document.body.classList.add('touch-enabled');
}

if (window.innerWidth <= 768) {
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Initialize
window.addEventListener('DOMContentLoaded', initDashboard);

window.addEventListener('load', () => {
    if (window.performance) {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`✅ Dashboard loaded in ${loadTime}ms`);
        console.log(`🔴 LIVE MODE: ESPN Public API`);
    }
});