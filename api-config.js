// API Configuration for Event Pulse Dashboard
// Replace API keys with your own from respective providers

const API_CONFIG = {
    // Toggle between mock data and live API
    USE_LIVE_API: false, // Set to true to enable live data
    
    // API Providers Configuration
    providers: {
        // BALLDONTLIE - Free NBA API (100 requests/day)
        // Sign up: https://www.balldontlie.io
        balldontlie: {
            enabled: true,
            baseURL: 'https://api.balldontlie.io/v1',
            apiKey: 'YOUR_BALLDONTLIE_API_KEY', // Free tier available
            sports: ['nba'],
            rateLimit: 100, // requests per day
        },
        
        // API-SPORTS - Multi-sport API (100 requests/day free)
        // Sign up: https://api-sports.io
        apiSports: {
            enabled: true,
            baseURL: 'https://v3.football.api-sports.io',
            apiKey: 'YOUR_API_SPORTS_KEY',
            sports: ['soccer', 'nfl', 'ufc'],
            rateLimit: 100,
        },
        
        // THE ODDS API - Free tier (500 requests/month)
        // Sign up: https://the-odds-api.com
        theOddsAPI: {
            enabled: false,
            baseURL: 'https://api.the-odds-api.com/v4',
            apiKey: 'YOUR_ODDS_API_KEY',
            sports: ['basketball_nba', 'americanfootball_nfl', 'soccer', 'mma_mixed_martial_arts'],
            rateLimit: 500,
        },
        
        // SPORTSDATA.IO - Professional tier
        // Sign up: https://sportsdata.io
        sportsDataIO: {
            enabled: false,
            baseURL: 'https://api.sportsdata.io/v3',
            apiKey: 'YOUR_SPORTSDATA_API_KEY',
            sports: ['nba', 'nfl', 'soccer'],
            rateLimit: 1000,
        }
    },
    
    // Refresh intervals (in milliseconds)
    refreshIntervals: {
        liveGames: 10000,  // 10 seconds for live games
        upcoming: 60000,   // 1 minute for upcoming games
        finished: 300000   // 5 minutes for finished games
    },
    
    // Fallback to mock data if API fails
    fallbackToMock: true,
    
    // Cache settings
    cache: {
        enabled: true,
        duration: 30000 // 30 seconds
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}