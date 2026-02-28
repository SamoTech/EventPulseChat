// Event Pulse Live Dashboard - Enhanced with Real-Time API Integration

// Mock Data Storage (Fallback)
const mockSportsData = {
    nba: [
        {
            id: 1,
            team1: 'Cavaliers',
            team2: 'Pistons',
            score1: 92,
            score2: 85,
            status: 'Q4 | 2:15 LEFT',
            period: 'Q4',
            isLive: true
        },
        {
            id: 2,
            team1: 'Knicks',
            team2: 'Bucks',
            score1: 78,
            score2: 81,
            status: 'Q3 | 5:42 LEFT',
            period: 'Q3',
            isLive: true
        },
        {
            id: 3,
            team1: 'Grizzlies',
            team2: 'Mavericks',
            score1: 105,
            score2: 103,
            status: 'FINAL',
            period: 'Final',
            isLive: false
        }
    ],
    nfl: [
        {
            id: 1,
            team1: 'Chiefs',
            team2: 'Eagles',
            score1: 24,
            score2: 21,
            status: 'Q4 | 3:28 LEFT',
            period: 'Q4',
            isLive: true
        }
    ],
    soccer: [
        {
            id: 1,
            team1: 'Man City',
            team2: 'Arsenal',
            score1: 2,
            score2: 1,
            status: "90+3' FINAL",
            period: 'Final',
            isLive: false
        },
        {
            id: 2,
            team1: 'Real Madrid',
            team2: 'Barcelona',
            score1: 1,
            score2: 1,
            status: "67' LIVE",
            period: 'Live',
            isLive: true
        }
    ],
    ufc: [
        {
            id: 1,
            team1: 'McGregor',
            team2: 'Diaz',
            score1: '',
            score2: '',
            status: 'ROUND 3 | 2:45 ACTIVE',
            period: 'Round 3',
            isLive: true
        }
    ]
};

// Live Data Storage
let sportsData = JSON.parse(JSON.stringify(mockSportsData));
let activeSport = 'nba';
let refreshInterval = 30;
let countdownTimer;
let apiRefreshTimer;
let lastAPICall = {};

// API Configuration (load from api-config.js if available)
const USE_LIVE_API = typeof API_CONFIG !== 'undefined' ? API_CONFIG.USE_LIVE_API : false;

// ===========================================
// API INTEGRATION FUNCTIONS
// ===========================================

// Fetch NBA Live Scores (BALLDONTLIE API)
async function fetchNBAScores() {
    if (!USE_LIVE_API) return null;
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(
            `https://api.balldontlie.io/v1/games?dates[]=${today}`,
            {
                headers: {
                    'Authorization': API_CONFIG?.providers?.balldontlie?.apiKey || ''
                }
            }
        );
        
        if (!response.ok) throw new Error('NBA API request failed');
        
        const data = await response.json();
        return parseNBAData(data.data);
    } catch (error) {
        console.error('NBA API Error:', error);
        return null;
    }
}

// Parse NBA API Response
function parseNBAData(games) {
    return games.slice(0, 5).map((game, index) => ({
        id: game.id || index + 1,
        team1: game.home_team?.full_name || game.home_team?.name || 'Home',
        team2: game.visitor_team?.full_name || game.visitor_team?.name || 'Away',
        score1: game.home_team_score || 0,
        score2: game.visitor_team_score || 0,
        status: game.status || game.period > 0 ? `Q${game.period} | ${game.time || 'LIVE'}` : 'Scheduled',
        period: `Q${game.period || 1}`,
        isLive: game.status === 'Live' || game.period > 0
    }));
}

// Fetch NFL Scores (API-SPORTS)
async function fetchNFLScores() {
    if (!USE_LIVE_API) return null;
    
    try {
        const season = new Date().getFullYear();
        const response = await fetch(
            `https://v1.american-football.api-sports.io/games?league=1&season=${season}`,
            {
                headers: {
                    'x-rapidapi-key': API_CONFIG?.providers?.apiSports?.apiKey || '',
                    'x-rapidapi-host': 'v1.american-football.api-sports.io'
                }
            }
        );
        
        if (!response.ok) throw new Error('NFL API request failed');
        
        const data = await response.json();
        return parseNFLData(data.response);
    } catch (error) {
        console.error('NFL API Error:', error);
        return null;
    }
}

// Parse NFL API Response
function parseNFLData(games) {
    return games.slice(0, 3).map((game, index) => ({
        id: game.game?.id || index + 1,
        team1: game.teams?.home?.name || 'Home',
        team2: game.teams?.away?.name || 'Away',
        score1: game.scores?.home?.total || 0,
        score2: game.scores?.away?.total || 0,
        status: game.game?.status?.short || game.game?.status?.long || 'Scheduled',
        period: `Q${game.game?.status?.short || 1}`,
        isLive: game.game?.status?.short?.includes('Q') || false
    }));
}

// Fetch Soccer Scores (API-SPORTS)
async function fetchSoccerScores() {
    if (!USE_LIVE_API) return null;
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(
            `https://v3.football.api-sports.io/fixtures?date=${today}&league=39`, // Premier League
            {
                headers: {
                    'x-rapidapi-key': API_CONFIG?.providers?.apiSports?.apiKey || '',
                    'x-rapidapi-host': 'v3.football.api-sports.io'
                }
            }
        );
        
        if (!response.ok) throw new Error('Soccer API request failed');
        
        const data = await response.json();
        return parseSoccerData(data.response);
    } catch (error) {
        console.error('Soccer API Error:', error);
        return null;
    }
}

// Parse Soccer API Response
function parseSoccerData(games) {
    return games.slice(0, 4).map((game, index) => ({
        id: game.fixture?.id || index + 1,
        team1: game.teams?.home?.name || 'Home',
        team2: game.teams?.away?.name || 'Away',
        score1: game.goals?.home || 0,
        score2: game.goals?.away || 0,
        status: game.fixture?.status?.elapsed ? `${game.fixture.status.elapsed}' LIVE` : game.fixture?.status?.short || 'NS',
        period: game.fixture?.status?.short === 'FT' ? 'Final' : 'Live',
        isLive: game.fixture?.status?.short === 'LIVE' || game.fixture?.status?.short === '1H' || game.fixture?.status?.short === '2H'
    }));
}

// Fetch UFC Events (API-SPORTS)
async function fetchUFCEvents() {
    if (!USE_LIVE_API) return null;
    
    try {
        const response = await fetch(
            'https://v1.mma.api-sports.io/fights?league=1', // UFC
            {
                headers: {
                    'x-rapidapi-key': API_CONFIG?.providers?.apiSports?.apiKey || '',
                    'x-rapidapi-host': 'v1.mma.api-sports.io'
                }
            }
        );
        
        if (!response.ok) throw new Error('UFC API request failed');
        
        const data = await response.json();
        return parseUFCData(data.response);
    } catch (error) {
        console.error('UFC API Error:', error);
        return null;
    }
}

// Parse UFC API Response
function parseUFCData(fights) {
    return fights.slice(0, 2).map((fight, index) => ({
        id: fight.id || index + 1,
        team1: fight.fighters?.fighter1?.name || 'Fighter 1',
        team2: fight.fighters?.fighter2?.name || 'Fighter 2',
        score1: '',
        score2: '',
        status: fight.status || 'Scheduled',
        period: fight.round ? `Round ${fight.round}` : 'Upcoming',
        isLive: fight.status === 'LIVE' || false
    }));
}

// Master API Fetch Function
async function fetchLiveScores(sport) {
    // Check cache to avoid excessive API calls
    const now = Date.now();
    const cacheKey = sport;
    
    if (lastAPICall[cacheKey] && (now - lastAPICall[cacheKey]) < 30000) {
        console.log(`Using cached data for ${sport}`);
        return sportsData[sport];
    }
    
    lastAPICall[cacheKey] = now;
    
    let apiData = null;
    
    switch(sport) {
        case 'nba':
            apiData = await fetchNBAScores();
            break;
        case 'nfl':
            apiData = await fetchNFLScores();
            break;
        case 'soccer':
            apiData = await fetchSoccerScores();
            break;
        case 'ufc':
            apiData = await fetchUFCEvents();
            break;
    }
    
    // Fallback to mock data if API fails
    if (apiData && apiData.length > 0) {
        sportsData[sport] = apiData;
        console.log(`✅ Live data loaded for ${sport}`);
    } else {
        console.log(`⚠️ Using mock data for ${sport}`);
        sportsData[sport] = mockSportsData[sport];
    }
    
    return sportsData[sport];
}

// ===========================================
// RENDERING FUNCTIONS
// ===========================================

// Initialize Dashboard
async function initDashboard() {
    // Load initial data
    if (USE_LIVE_API) {
        console.log('🔴 LIVE API MODE ENABLED');
        await fetchLiveScores(activeSport);
    } else {
        console.log('⚪ MOCK DATA MODE (Enable API in api-config.js)');
    }
    
    renderGames(activeSport);
    setupTabSwitching();
    startAutoRefresh();
    startCountdown();
}

// Render Games for Active Sport
function renderGames(sport) {
    const container = document.getElementById(`${sport}-games`);
    if (!container) return;
    
    container.innerHTML = '';
    
    const games = sportsData[sport] || [];
    
    if (games.length === 0) {
        container.innerHTML = '<div class="no-games">No games available</div>';
        return;
    }
    
    games.forEach(game => {
        const card = createGameCard(game, sport);
        container.appendChild(card);
    });
}

// Create Game Card Element
function createGameCard(game, sport) {
    const card = document.createElement('div');
    card.className = `game-card ${sport === 'ufc' ? 'ufc-card' : ''} ${game.isLive ? 'live-game' : ''}`;
    
    const statusHTML = `<div class="game-status ${game.isLive ? 'status-live' : ''}">${game.status}</div>`;
    const teamsHTML = `<div class="game-teams">${game.team1} vs ${game.team2}</div>`;
    
    let scoreHTML = '';
    if (sport === 'ufc') {
        scoreHTML = game.isLive ? 
            `<div class="game-score">LIVE FIGHT</div>` : 
            `<div class="game-score">UPCOMING</div>`;
    } else {
        scoreHTML = `<div class="game-score">${game.score1} - ${game.score2}</div>`;
    }
    
    const detailsHTML = sport === 'nba' ? 
        `<div class="game-details">NBA ${USE_LIVE_API ? 'Live' : 'Simulation'}</div>` :
        sport === 'nfl' ? 
        `<div class="game-details">NFL ${USE_LIVE_API ? 'Live' : 'Simulation'}</div>` :
        sport === 'soccer' ? 
        `<div class="game-details">Premier League ${USE_LIVE_API ? 'Live' : 'Simulation'}</div>` :
        `<div class="game-details">UFC ${USE_LIVE_API ? 'Live' : 'Simulation'}</div>`;
    
    card.innerHTML = statusHTML + teamsHTML + scoreHTML + detailsHTML;
    
    return card;
}

// Tab Switching
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const sport = button.getAttribute('data-sport');
            
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            document.getElementById(sport).classList.add('active');
            
            // Update active sport
            activeSport = sport;
            
            // Fetch fresh data if using live API
            if (USE_LIVE_API) {
                await fetchLiveScores(sport);
            }
            
            renderGames(sport);
        });
    });
}

// Update Scores (Mock simulation or API refresh)
async function updateScores() {
    if (USE_LIVE_API) {
        // Fetch fresh data from API
        await fetchLiveScores(activeSport);
    } else {
        // Simulate score updates (original mock logic)
        Object.keys(sportsData).forEach(sport => {
            sportsData[sport].forEach(game => {
                if (!game.status.includes('FINAL') && sport !== 'ufc') {
                    const randomUpdate = Math.random();
                    
                    if (randomUpdate > 0.6) {
                        const scoreIncrease = Math.floor(Math.random() * 3) + 1;
                        
                        if (Math.random() > 0.5) {
                            game.score1 += scoreIncrease;
                        } else {
                            game.score2 += scoreIncrease;
                        }
                    }
                    
                    // Update time remaining
                    if (sport === 'nba' || sport === 'nfl') {
                        const timeMatch = game.status.match(/(\d+):(\d+)/);
                        if (timeMatch) {
                            let minutes = parseInt(timeMatch[1]);
                            let seconds = parseInt(timeMatch[2]);
                            
                            seconds -= Math.floor(Math.random() * 30) + 10;
                            if (seconds < 0) {
                                minutes -= 1;
                                seconds = 59 + seconds;
                            }
                            
                            if (minutes < 0) {
                                game.status = 'FINAL';
                                game.isLive = false;
                            } else {
                                game.status = `${game.period} | ${minutes}:${seconds.toString().padStart(2, '0')} LEFT`;
                            }
                        }
                    } else if (sport === 'soccer') {
                        const minuteMatch = game.status.match(/(\d+)/);
                        if (minuteMatch) {
                            let minute = parseInt(minuteMatch[1]) + Math.floor(Math.random() * 3) + 1;
                            if (minute >= 90) {
                                game.status = `90+${minute - 90}' FINAL`;
                                game.isLive = false;
                            } else {
                                game.status = `${minute}' LIVE`;
                            }
                        }
                    }
                }
            });
        });
    }
    
    // Re-render current sport
    renderGames(activeSport);
}

// Auto Refresh System
function startAutoRefresh() {
    const refreshTime = USE_LIVE_API ? 30000 : 30000; // 30 seconds
    
    setInterval(() => {
        updateScores();
        refreshInterval = 30;
    }, refreshTime);
}

// Countdown Timer Display
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

// Mobile Touch Support
if ('ontouchstart' in window) {
    document.body.classList.add('touch-enabled');
}

// Prevent Zoom on Mobile (for OBS stability)
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

// Initialize on page load
window.addEventListener('DOMContentLoaded', initDashboard);

// Performance Monitoring
window.addEventListener('load', () => {
    if (window.performance) {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Dashboard loaded in ${loadTime}ms`);
        console.log(`API Mode: ${USE_LIVE_API ? '🔴 LIVE' : '⚪ MOCK'}`);
    }
});