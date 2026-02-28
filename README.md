# 🔥 Event Pulse Live Dashboard

**Professional Sports Broadcast Dashboard for YouTube Live Chat Rooms**

A broadcast-quality, real-time sports dashboard designed specifically for OBS Browser Source integration. Features stunning visual effects, auto-refreshing scores, and multi-sport support.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-00FF00?style=for-the-badge)
![OBS Compatible](https://img.shields.io/badge/OBS-Compatible-FF0000?style=for-the-badge)
![Mobile Ready](https://img.shields.io/badge/Mobile-Ready-FFFF00?style=for-the-badge)

## 🎯 Features

### Core Functionality
- ✅ Multi-sport tabs: NBA 🏀, NFL 🏈, Soccer ⚽, UFC 🥊
- ✅ Real-time score simulation with auto-refresh every 30 seconds
- ✅ Broadcast-quality dark red/black theme (#FF0000, #000000)
- ✅ SmartLink integration for monetization
- ✅ OBS Browser Source optimized (1920x1080)
- ✅ Fully mobile responsive
- ✅ Zero copyright content
- ✅ Lightweight (< 100KB total)

### Visual Effects
- Pulsing LIVE indicator (green dot animation)
- Glassmorphism tab buttons with red glow
- Massive gradient score displays
- Smooth hover animations with lift effects
- Custom shimmer effects on game cards
- Professional typography with Orbitron font

## 🚀 Quick Start

### GitHub Pages Deployment

1. **Enable GitHub Pages:**
   - Go to repository Settings
   - Navigate to Pages section
   - Source: Deploy from `main` branch
   - Save and wait for deployment

2. **Access Your Dashboard:**
   ```
   https://samotech.github.io/EventPulseChat/
   ```

### Local Development

```bash
# Clone the repository
git clone https://github.com/SamoTech/EventPulseChat.git

# Navigate to directory
cd EventPulseChat

# Open in browser
open index.html
```

## 🎥 OBS Studio Setup

### Step-by-Step Instructions

1. **Add Browser Source:**
   - Open OBS Studio
   - Click `+` in Sources panel
   - Select `Browser`
   - Name it "Event Pulse Dashboard"

2. **Configure Browser Source:**
   ```
   URL: https://samotech.github.io/EventPulseChat/
   Width: 1920
   Height: 1080
   FPS: 30
   ```

3. **Custom CSS (Optional - for transparency):**
   ```css
   body {
       background: transparent !important;
   }
   ```

4. **Advanced Settings:**
   - ✅ Shutdown source when not visible
   - ✅ Refresh browser when scene becomes active
   - Refresh Rate: 10 seconds (recommended)

5. **Performance Optimization:**
   - Use Hardware Acceleration
   - Enable Browser Source Hardware Acceleration in OBS Settings
   - Set FPS to match your stream (30fps recommended)

### OBS Hotkeys (Optional)

- Set hotkey to refresh browser source manually
- Useful for forcing immediate data updates

## 📱 Mobile Support

The dashboard is fully responsive with breakpoints:

- **Desktop:** >1200px (4-column grid)
- **Tablet:** 768px-1200px (2-column grid)
- **Mobile:** <768px (single column, stacked tabs)

Mobile optimizations:
- Touch-friendly tab buttons
- Pinch-zoom disabled for OBS stability
- Optimized font sizes
- Reorganized layout for vertical viewing

## 🎨 Customization

### Color Scheme

Edit `style.css` to customize colors:

```css
/* Primary Colors */
--primary-red: #FF0000;
--background-black: #000000;
--score-green: #00FF00;
--status-yellow: #FFFF00;
--text-white: #FFFFFF;
```

### Sport Data

Edit `script.js` to modify mock data:

```javascript
const sportsData = {
    nba: [
        {
            team1: 'Your Team',
            team2: 'Opponent',
            score1: 100,
            score2: 95,
            status: 'Q4 | 5:00 LEFT'
        }
    ]
};
```

### API Integration (Future)

The dashboard is structured for easy API integration:

1. Replace mock data in `sportsData` object
2. Implement fetch functions:
   ```javascript
   async function fetchLiveScores(sport) {
       const response = await fetch(`YOUR_API_URL/${sport}`);
       return await response.json();
   }
   ```
3. Update `updateScores()` function to call API

## 📊 Performance Metrics

### Target Metrics
- ✅ Load time: < 2 seconds
- ✅ Total size: < 100KB
- ✅ Animation: 60fps
- ✅ No external dependencies (except Google Fonts)

### Monitoring

Check browser console for load time:
```javascript
// Automatically logged on page load
Dashboard loaded in XXXXms
```

## 🔧 Technical Stack

- **HTML5:** Semantic structure
- **CSS3:** Advanced animations, glassmorphism, gradients
- **Vanilla JavaScript:** No frameworks (lightweight)
- **Google Fonts:** Orbitron (400, 700, 900)

## 📁 File Structure

```
EventPulseChat/
├── index.html          # Main dashboard structure
├── style.css           # Complete styling & animations
├── script.js           # Tab switching, data management, auto-refresh
└── README.md           # This file
```

## 💰 SmartLink Integration

The dashboard includes prominent SmartLink monetization:

- **Location:** Fixed footer (left side)
- **URL:** https://omg10.com/4/10663409
- **Targeting:** US/CA/AU deals
- **Style:** Red button with yellow border, hover glow effect

## 🎯 Use Cases

1. **YouTube Live Streams:**
   - Overlay during sports commentary
   - Full-screen dashboard for chat interaction
   - Picture-in-picture mode

2. **Twitch Broadcasts:**
   - Scene for sports discussion
   - Between-game filler content

3. **Discord Stage Events:**
   - Screen share for watch parties
   - Community engagement tool

4. **Sports Bars/Venues:**
   - Digital signage display
   - Multiple monitor setup

## ⚡ Auto-Refresh System

- **Interval:** 30 seconds
- **Visual Countdown:** Top-right corner
- **Score Updates:** Random +1-3 points per refresh
- **Time Updates:** Simulated game clock progression
- **Status Changes:** Automatic quarter/period transitions

## 🏆 Success Criteria

- ✅ Loads in < 2s
- ✅ Tabs switch smoothly
- ✅ Scores auto-update every 30s
- ✅ OBS Browser Source compatible
- ✅ Mobile responsive
- ✅ GitHub Pages ready
- ✅ SmartLink prominent & clickable
- ✅ Zero copyright content
- ✅ < 100KB total size

## 🐛 Troubleshooting

### Dashboard not loading in OBS
- Check URL is correct and accessible
- Verify browser source dimensions (1920x1080)
- Clear OBS browser cache
- Try refreshing browser source

### Scores not updating
- Check browser console for errors
- Verify JavaScript is enabled
- Ensure auto-refresh is running (check countdown timer)

### Mobile layout issues
- Clear browser cache
- Check viewport meta tag
- Test in different mobile browsers

### Performance issues
- Reduce OBS browser source FPS to 30
- Enable hardware acceleration
- Close unnecessary OBS sources

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share improvements

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review troubleshooting section

## 🎬 Credits

- **Developer:** SamoTech
- **Design:** Broadcast-quality sports dashboard
- **Typography:** Google Fonts (Orbitron)
- **Monetization:** SmartLink integration

---

**Built with ❤️ for professional sports broadcasting**

🔴 LIVE | 🏀 NBA | 🏈 NFL | ⚽ SOCCER | 🥊 UFC