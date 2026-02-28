# 🔥 Event Pulse Live Dashboard

**Professional Sports Broadcast Dashboard with Real-Time API Integration**

A broadcast-quality, real-time sports dashboard designed for OBS Browser Source integration. Now featuring **live API support** for NBA, NFL, Soccer, and UFC with multiple provider options.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-00FF00?style=for-the-badge)
![OBS Compatible](https://img.shields.io/badge/OBS-Compatible-FF0000?style=for-the-badge)
![API Ready](https://img.shields.io/badge/API-Ready-FFFF00?style=for-the-badge)

## 🎯 Features

### Core Functionality
- ✅ **Real-time API integration** with multiple sports providers
- ✅ Multi-sport tabs: NBA 🏀, NFL 🏈, Soccer ⚽, UFC 🥊
- ✅ Live score updates every 10-30 seconds
- ✅ Automatic fallback to mock data if API fails
- ✅ Broadcast-quality dark red/black theme
- ✅ SmartLink monetization integration
- ✅ OBS Browser Source optimized (1920x1080)
- ✅ Fully mobile responsive
- ✅ < 50KB total size (ultra-lightweight)

### New API Features
- 🔴 **Live data from multiple providers**
- 🔄 Smart caching to respect API rate limits
- ⚡ 10-second refresh for live games
- 🎯 Configurable API providers
- 🛡️ Automatic fallback system
- 📊 Performance monitoring

## 🚀 Quick Start

### 1. Enable GitHub Pages

1. Go to [Repository Settings → Pages](https://github.com/SamoTech/EventPulseChat/settings/pages)
2. Source: **Deploy from main branch**
3. Save and wait 2-3 minutes
4. Access at: **https://samotech.github.io/EventPulseChat/**

### 2. Configure APIs (Optional)

Edit `api-config.js` to enable live data:

```javascript
const API_CONFIG = {
    USE_LIVE_API: true,  // Change to true
    
    providers: {
        balldontlie: {
            enabled: true,
            apiKey: 'YOUR_API_KEY_HERE',  // Get from balldontlie.io
            sports: ['nba']
        },
        apiSports: {
            enabled: true,
            apiKey: 'YOUR_API_KEY_HERE',  // Get from api-sports.io
            sports: ['soccer', 'nfl', 'ufc']
        }
    }
};
```

### 3. Get Free API Keys

## 📡 Supported API Providers

### Recommended Free APIs (2026)

#### 1. BALLDONTLIE (NBA)
- **Coverage:** NBA only
- **Free Tier:** 100 requests/day
- **Best For:** NBA live scores & stats
- **Sign Up:** [https://www.balldontlie.io](https://www.balldontlie.io)
- **Rate Limit:** Perfect for dashboard use

#### 2. API-SPORTS (Multi-Sport)
- **Coverage:** NFL, Soccer (40+ leagues), UFC/MMA
- **Free Tier:** 100 requests/day
- **Best For:** Multi-sport coverage
- **Sign Up:** [https://api-sports.io](https://api-sports.io)
- **Features:** Real-time updates every 15 seconds

#### 3. THE ODDS API (Alternative)
- **Coverage:** All major sports + betting odds
- **Free Tier:** 500 requests/month
- **Best For:** Adding betting data
- **Sign Up:** [https://the-odds-api.com](https://the-odds-api.com)

#### 4. SportsData.IO (Premium)
- **Coverage:** Professional-grade data
- **Free Tier:** Trial available
- **Best For:** Production apps
- **Sign Up:** [https://sportsdata.io](https://sportsdata.io)

### API Comparison Table

| Provider | NBA | NFL | Soccer | UFC | Free Tier | Best For |
|----------|-----|-----|--------|-----|-----------|----------|
| **BALLDONTLIE** | ✅ | ❌ | ❌ | ❌ | 100/day | NBA focus |
| **API-SPORTS** | ✅ | ✅ | ✅ | ✅ | 100/day | Multi-sport |
| **The Odds API** | ✅ | ✅ | ✅ | ✅ | 500/month | Betting data |
| **SportsData.IO** | ✅ | ✅ | ✅ | ❌ | Trial | Professional |

## 🎥 OBS Studio Setup

### Quick Setup

1. **Add Browser Source:**
   - OBS Studio → Sources → `+` → Browser
   - Name: "Event Pulse Dashboard"

2. **Configure:**
   ```
   URL: https://samotech.github.io/EventPulseChat/
   Width: 1920
   Height: 1080
   FPS: 30
   ```

3. **Advanced Settings:**
   - ✅ Shutdown source when not visible
   - ✅ Refresh browser when scene becomes active
   - Custom CSS (optional transparency):
     ```css
     body { background: transparent !important; }
     ```

## ⚙️ Configuration Guide

### Enable Live API Mode

1. **Edit `api-config.js`:**
   ```javascript
   USE_LIVE_API: true  // Enable live data
   ```

2. **Add API Keys:**
   ```javascript
   balldontlie: {
       apiKey: 'your_actual_key_here'
   }
   ```

3. **Test in Console:**
   - Open browser DevTools (F12)
   - Check console for: `🔴 LIVE API MODE ENABLED`
   - Verify: `✅ Live data loaded for nba`

### Adjust Refresh Rates

```javascript
refreshIntervals: {
    liveGames: 10000,   // 10 seconds (live games)
    upcoming: 60000,    // 1 minute (scheduled)
    finished: 300000    // 5 minutes (final)
}
```

### Rate Limit Management

The dashboard automatically:
- ✅ Caches responses for 30 seconds
- ✅ Prevents duplicate API calls
- ✅ Falls back to mock data if quota exceeded
- ✅ Shows console warnings for API issues

## 🔧 API Integration Details

### How It Works

1. **Mode Selection:**
   - `USE_LIVE_API: false` → Mock data simulation
   - `USE_LIVE_API: true` → Real API calls

2. **Data Flow:**
   ```
   User clicks tab → Check cache → 
   API call (if needed) → Parse data → 
   Render cards → Auto-refresh loop
   ```

3. **Fallback System:**
   - API fails → Console warning
   - Dashboard continues with mock data
   - No user disruption

### API Response Parsing

**NBA (BALLDONTLIE):**
```javascript
{
    home_team: { full_name: "Cleveland Cavaliers" },
    visitor_team: { full_name: "Detroit Pistons" },
    home_team_score: 105,
    visitor_team_score: 98,
    period: 4,
    status: "Final"
}
```

**Soccer (API-SPORTS):**
```javascript
{
    teams: {
        home: { name: "Manchester City" },
        away: { name: "Arsenal" }
    },
    goals: { home: 2, away: 1 },
    fixture: { status: { elapsed: 67 } }
}
```

## 📊 Performance Metrics

### File Sizes
- **Total:** ~26 KB (with API integration)
- **index.html:** 3 KB
- **style.css:** 8.5 KB
- **script.js:** 11 KB (enhanced with API)
- **api-config.js:** 3.5 KB

### Load Times
- **Initial Load:** < 1 second
- **API Response:** 200-500ms (average)
- **Refresh Cycle:** 10-30 seconds (configurable)

### API Usage Estimates

**Daily Usage (typical broadcast):**
- 3-hour stream = 360-1080 API calls
- Recommendation: Upgrade to paid tier for heavy use
- Free tier suitable for testing and short streams

## 🎨 Customization

### Add New API Provider

```javascript
// In api-config.js
myCustomAPI: {
    enabled: true,
    baseURL: 'https://api.example.com',
    apiKey: 'YOUR_KEY',
    sports: ['nba']
}
```

```javascript
// In script.js
async function fetchFromCustomAPI() {
    const response = await fetch(
        API_CONFIG.providers.myCustomAPI.baseURL + '/games',
        { headers: { 'Authorization': API_CONFIG.providers.myCustomAPI.apiKey } }
    );
    return await response.json();
}
```

### Modify Sport Coverage

Edit `api-config.js` to enable/disable sports:
```javascript
balldontlie: {
    sports: ['nba']  // Remove to disable NBA
}
```

## 🐛 Troubleshooting

### API Not Working

1. **Check Console (F12):**
   - Look for `🔴 LIVE API MODE ENABLED`
   - Check for error messages

2. **Verify API Key:**
   - Test key directly on provider website
   - Ensure no extra spaces in `api-config.js`

3. **Check Rate Limits:**
   - Console shows: `Using cached data`
   - Wait 30 seconds between manual refreshes

4. **CORS Issues:**
   - GitHub Pages supports CORS
   - Local testing may require `http-server`

### Dashboard Shows "No Games Available"

- **Cause:** API returned empty array (no games today)
- **Fix:** Dashboard automatically falls back to mock data
- **Verify:** Check sport schedule on provider website

### Scores Not Updating

1. Open DevTools Console
2. Look for API errors
3. Check network tab for failed requests
4. Verify `USE_LIVE_API: true` in config

## 📱 Mobile Support

- **Responsive breakpoints:** 768px, 1200px
- **Touch-friendly tabs**
- **Optimized layouts**
- **API caching** reduces mobile data usage

## 🔒 Security Best Practices

### API Key Protection

⚠️ **Important:** Never commit API keys to public repos

**Option 1: Environment Variables (Advanced)**
```javascript
const API_KEY = process.env.BALLDONTLIE_KEY;
```

**Option 2: Separate Config File**
```javascript
// Create api-config.local.js (add to .gitignore)
const API_CONFIG = {
    providers: {
        balldontlie: {
            apiKey: 'your_private_key'
        }
    }
};
```

**Option 3: Backend Proxy (Recommended for Production)**
- Create serverless function (Vercel/Netlify)
- Proxy API requests through backend
- Keep keys server-side only

## 🚀 Deployment Options

### GitHub Pages (Current)
- ✅ Free hosting
- ✅ Auto-deployment
- ⚠️ API keys visible in source

### Vercel (Recommended)
- ✅ Environment variables support
- ✅ Serverless functions
- ✅ Automatic HTTPS
- Deploy: `vercel --prod`

### Netlify
- ✅ Similar to Vercel
- ✅ Build plugins
- Deploy: `netlify deploy --prod`

## 📈 Future Enhancements

- [ ] Backend API proxy for key security
- [ ] WebSocket real-time updates
- [ ] Historical data charts
- [ ] User authentication
- [ ] Custom team favorites
- [ ] Push notifications
- [ ] Multiple language support

## 🔗 Resources

- **Live Demo:** https://samotech.github.io/EventPulseChat/
- **Repository:** https://github.com/SamoTech/EventPulseChat
- **Issues:** https://github.com/SamoTech/EventPulseChat/issues

### API Documentation
- [BALLDONTLIE Docs](https://docs.balldontlie.io)
- [API-SPORTS Docs](https://api-sports.io/documentation)
- [The Odds API Docs](https://the-odds-api.com/docs)

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Test thoroughly
4. Submit pull request

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/SamoTech/EventPulseChat/issues)
- **API Questions:** Check provider documentation
- **OBS Help:** [OBS Forums](https://obsproject.com/forum/)

---

**Built with ❤️ for professional sports broadcasting**

🔴 LIVE API | 🏀 NBA | 🏈 NFL | ⚽ SOCCER | 🥊 UFC

*Last Updated: February 2026*