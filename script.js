// Mock Data Storage
const sportsData = {
    nba: [
        {
            id: 1,
            team1: 'Cavaliers',
            team2: 'Pistons',
            score1: 92,
            score2: 85,
            status: 'Q4 | 2:15 LEFT',
            period: 'Q4'
        },
        {
            id: 2,
            team1: 'Knicks',
            team2: 'Bucks',
            score1: 78,
            score2: 81,
            status: 'Q3 | 5:42 LEFT',
            period: 'Q3'
        },
        {
            id: 3,
            team1: 'Grizzlies',
            team2: 'Mavericks',
            score1: 105,
            score2: 103,
            status: 'FINAL',
            period: 'Final'
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
            period: 'Q4'
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
            period: 'Final'
        },
        {
            id: 2,
            team1: 'Real Madrid',
            team2: 'Barcelona',
            score1: 1,
            score2: 1,
            status: "67' LIVE",
            period: 'Live'
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
            period: 'Round 3'
        }
    ]
};

// Current active sport
let activeSport = 'nba';
let refreshInterval = 30;
let countdownTimer;

// Initialize Dashboard
function initDashboard() {
    renderGames(activeSport);
    setupTabSwitching();
    startAutoRefresh();
    startCountdown();
}

// Render Games for Active Sport
function renderGames(sport) {
    const container = document.getElementById(`${sport}-games`);
    container.innerHTML = '';
    
    const games = sportsData[sport];
    
    games.forEach(game => {
        const card = createGameCard(game, sport);
        container.appendChild(card);
    });
}

// Create Game Card Element
function createGameCard(game, sport) {
    const card = document.createElement('div');
    card.className = `game-card ${sport === 'ufc' ? 'ufc-card' : ''}`;
    
    const statusHTML = `<div class="game-status">${game.status}</div>`;
    const teamsHTML = `<div class="game-teams">${game.team1} vs ${game.team2}</div>`;
    
    let scoreHTML = '';
    if (sport === 'ufc') {
        scoreHTML = `<div class="game-score">LIVE FIGHT</div>`;
    } else {
        scoreHTML = `<div class="game-score">${game.score1} - ${game.score2}</div>`;
    }
    
    const detailsHTML = sport === 'nba' ? 
        `<div class="game-details">NBA Regular Season</div>` :
        sport === 'nfl' ? 
        `<div class="game-details">NFL Championship</div>` :
        sport === 'soccer' ? 
        `<div class="game-details">Premier League</div>` :
        `<div class="game-details">UFC Main Event</div>`;
    
    card.innerHTML = statusHTML + teamsHTML + scoreHTML + detailsHTML;
    
    return card;
}

// Tab Switching
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sport = button.getAttribute('data-sport');
            
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            document.getElementById(sport).classList.add('active');
            
            // Update active sport
            activeSport = sport;
            renderGames(sport);
        });
    });
}

// Simulate Live Score Updates
function updateScores() {
    Object.keys(sportsData).forEach(sport => {
        sportsData[sport].forEach(game => {
            // Only update if game is not final and not UFC
            if (!game.status.includes('FINAL') && sport !== 'ufc') {
                const randomUpdate = Math.random();
                
                // 40% chance to update score
                if (randomUpdate > 0.6) {
                    const scoreIncrease = Math.floor(Math.random() * 3) + 1;
                    
                    // Randomly increase either team's score
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
                        } else {
                            game.status = `${minute}' LIVE`;
                        }
                    }
                }
            }
        });
    });
    
    // Re-render current sport
    renderGames(activeSport);
}

// Auto Refresh System
function startAutoRefresh() {
    setInterval(() => {
        updateScores();
        refreshInterval = 30; // Reset countdown
    }, 30000); // 30 seconds
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
    }
});