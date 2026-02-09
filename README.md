# 🚀 Stock Analysis Pro

The ultimate stock analysis platform with real-time data, advanced indicators, portfolio tracking, and AI-powered insights.

## ✨ What's New in Pro

### 📊 Enhanced Analysis
- **RSI (Relative Strength Index)** - Detect overbought/oversold conditions
- **MACD (Moving Average Convergence Divergence)** - Track momentum
- **Moving Averages** - SMA 20/50/200 for trend analysis
- **8+ Fundamental Metrics** - P/E, ROE, Profit Margin, Debt/Equity, and more

### 🎨 Premium Features
- **Dark Mode** - Eye-friendly interface with toggle
- **Watchlist** - Save and track unlimited favorite stocks
- **Portfolio Tracking** - Monitor your holdings and P&L
- **Stock Comparison** - Compare up to 3 stocks side-by-side
- **Price Charts** - Interactive 90-day price history
- **News Integration** - Real-time news (with API key)
- **Tabs Interface** - Overview, Technical, Fundamentals, News

### 💾 Persistence
- All user data saved in browser (watchlist, portfolio, dark mode preference)
- No login required
- Works offline after first load

## 🚀 Quick Deploy

### Option 1: Upgrade Existing Deployment

1. **Replace your current app folder** with this `stock-predictor-pro` folder
2. **Push to GitHub**:
   ```bash
   cd stock-predictor-pro
   git add .
   git commit -m "Upgrade to Pro version"
   git push
   ```
3. **Vercel auto-deploys** - done!

### Option 2: Fresh Deployment

1. **Upload to GitHub** (same as before)
2. **Deploy to Vercel** (same process)
3. Done!

## 🔑 Optional API Keys (Recommended)

### Alpha Vantage (Better Data)
1. Get free key: https://www.alphavantage.co/support/#api-key
2. Add to Vercel: `ALPHA_VANTAGE_API_KEY=your_key`
3. Benefits: Better fundamentals, historical data, earnings info

### Finnhub (Real-Time News)
1. Get free key: https://finnhub.io/register
2. Add to Vercel: `FINNHUB_API_KEY=your_key`
3. Benefits: Real-time company news in News tab

## 📱 Features Guide

### Watchlist
- Click the ⭐ star icon next to any stock to add to watchlist
- Click stocks in watchlist to instantly analyze them
- Remove with the X button
- Persists across sessions

### Portfolio
- Click the + icon when viewing a stock
- Enter number of shares and buy price
- Track real-time P&L
- See gains/losses as percentage

### Comparison Mode
- Click "Compare" button
- Analyze multiple stocks
- They appear side-by-side
- Compare scores, prices, predictions

### Dark Mode
- Click moon/sun icon to toggle
- Preference saved automatically
- Better for nighttime trading

### Charts
- Interactive 90-day price history
- Hover for exact prices
- Automatic on Overview tab

### Tabs
- **Overview**: Scores, chart, targets, strengths/risks
- **Technical**: RSI, MACD, SMA, support/resistance
- **Fundamentals**: P/E, ROE, margins, debt ratios
- **News**: Latest company news (with API key)

## 🎯 Customization

### Adjust Analysis Weights

Edit `/app/api/analyze/route.js`:

```javascript
// Line 96: Technical scoring
function calculateTechnicalScore(data) {
  let score = 50;
  score += data.changePercent * 5; // Adjust multiplier
  // ... modify weights
}

// Line 134: Fundamental scoring  
function calculateFundamentalScore(data) {
  // Adjust P/E thresholds, margins, etc.
}
```

### Change Buy/Sell Thresholds

Edit line 192:
```javascript
function getPrediction(overallScore) {
  if (overallScore >= 70) return 'STRONG_BUY'; // Adjust threshold
  if (overallScore >= 60) return 'BUY';
  // ... modify as needed
}
```

### Add More Indicators

Add new calculation functions:
```javascript
function calculateBollingerBands(prices) {
  // Your implementation
}
```

Then call in the analysis function.

## 📊 Comparison: Basic vs Pro

| Feature | Basic | Pro |
|---------|-------|-----|
| Stock Analysis | ✅ | ✅ |
| Real-Time Prices | ✅ | ✅ |
| Technical Indicators | 3 basic | RSI, MACD, SMA 20/50/200 |
| Fundamental Metrics | 3 | 10+ |
| Price Charts | ❌ | ✅ 90-day history |
| Dark Mode | ❌ | ✅ |
| Watchlist | ❌ | ✅ Unlimited |
| Portfolio Tracking | ❌ | ✅ |
| Stock Comparison | ❌ | ✅ 3-way |
| News Integration | ❌ | ✅ (with API) |
| Tabs Interface | ❌ | ✅ 4 tabs |
| Mobile Optimized | Basic | Fully Responsive |
| Local Storage | ❌ | ✅ |

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **APIs**: Alpha Vantage, Yahoo Finance, Finnhub
- **Storage**: LocalStorage (client-side)
- **Deployment**: Vercel

## ⚠️ Disclaimer

This tool is for **educational purposes only**. 

- Not financial advice
- Past performance ≠ future results
- All investments carry risk
- Consult a licensed financial advisor
- Developers not responsible for losses

## 🤝 Support

### Troubleshooting

**Stock not found?**
- Verify ticker symbol is correct
- Try major stocks first (AAPL, MSFT, etc.)
- Some OTC stocks may not have full data

**News not showing?**
- Add FINNHUB_API_KEY to environment variables
- Free tier available at finnhub.io

**Charts not rendering?**
- Ensure `recharts` is installed
- Check browser console for errors
- Try refreshing the page

**Watchlist/Portfolio not saving?**
- Check if LocalStorage is enabled
- Try different browser
- Clear cache and retry

## 📄 License

MIT License - Free to use and modify!

---

**Built with ❤️ for serious stock market enthusiasts**

Analyze smarter. Trade confidently.
