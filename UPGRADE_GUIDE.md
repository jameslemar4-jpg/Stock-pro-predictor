# 📈 Upgrade Guide: Basic → Pro

## What You're Getting

Your basic stock predictor is getting a MASSIVE upgrade with:

✅ **10x more analysis power** (RSI, MACD, moving averages)
✅ **Professional UI** (dark mode, tabs, charts)
✅ **User features** (watchlist, portfolio, comparison)
✅ **Better data** (more fundamental metrics, news)

## Quick Upgrade (5 Minutes)

### Step 1: Backup Current Deployment (Optional)

If you want to keep your current version:
1. Go to your GitHub repository
2. Create a branch: `git checkout -b backup-basic`
3. Push it: `git push origin backup-basic`

### Step 2: Replace Files

**Option A: Git Command Line**
```bash
# Navigate to your project folder
cd stock-predictor-app

# Delete old files
rm -rf app/* package.json

# Copy Pro files
cp -r /path/to/stock-predictor-pro/* .

# Commit and push
git add .
git commit -m "Upgrade to Pro version with all features"
git push
```

**Option B: Manual**
1. Download the `stock-predictor-pro` folder
2. Delete everything in your current `stock-predictor-app` folder
3. Copy all files from `stock-predictor-pro` into `stock-predictor-app`
4. Push to GitHub (Vercel auto-deploys)

### Step 3: Update Dependencies (Automatic)

When you push, Vercel will automatically:
- Install new dependencies (recharts, etc.)
- Build the new version
- Deploy it

No manual intervention needed!

### Step 4: (Optional) Add API Keys

For enhanced features:

1. **Alpha Vantage** (recommended):
   - Get key: https://www.alphavantage.co/support/#api-key
   - In Vercel: Settings → Environment Variables
   - Add: `ALPHA_VANTAGE_API_KEY=your_key_here`
   - Redeploy

2. **Finnhub** (for news):
   - Get key: https://finnhub.io/register
   - In Vercel: Settings → Environment Variables
   - Add: `FINNHUB_API_KEY=your_key_here`
   - Redeploy

## What Changed?

### New Files
- `app/api/analyze/route.js` - Enhanced with 500+ lines of analysis logic
- `app/page.js` - Completely rewritten with all Pro features
- `package.json` - New dependencies (recharts, etc.)

### Same Files (No Changes)
- `app/layout.js`
- `app/globals.css`
- `tailwind.config.js`
- `postcss.config.js`
- `next.config.js`
- `.gitignore`

## Testing the Upgrade

After deployment:

1. **Visit your app** - Should load immediately
2. **Try dark mode** - Click moon/sun icon
3. **Analyze a stock** - Try AAPL
4. **Check watchlist** - Add stock with star icon
5. **View tabs** - Click Overview, Technical, Fundamentals, News
6. **See charts** - Should appear on Overview tab
7. **Compare mode** - Click "Compare" button

## Troubleshooting

### Build Failed?

**Error: "Module not found: Can't resolve 'recharts'"**
- Solution: Vercel should auto-install. If not, wait 2 minutes and redeploy

**Error: "Page not found"**
- Solution: Make sure all files are in the root, not a subdirectory

### Features Not Working?

**Watchlist/Portfolio not saving**
- Check browser console for LocalStorage errors
- Try in incognito mode
- Clear cache and retry

**Charts not showing**
- Check if stock has historical data
- Some stocks may not have 90-day history
- Try major stocks (AAPL, MSFT, TSLA)

**News showing "API not configured"**
- This is normal without API key
- Add FINNHUB_API_KEY to fix

### Performance Issues?

If app feels slow:
- Add Alpha Vantage API key (reduces Yahoo Finance fallbacks)
- Clear browser cache
- Try different stock (some have more data to load)

## Rolling Back (If Needed)

If something goes wrong:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find your last working deployment
4. Click "..." → "Promote to Production"

Or in Git:
```bash
git revert HEAD
git push
```

## Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Analysis Indicators | 3 | 10+ |
| Data Points | ~10 | ~30 |
| UI | Single view | Tabbed interface |
| Dark Mode | No | Yes |
| Watchlist | No | Yes (unlimited) |
| Portfolio | No | Yes |
| Comparison | No | Yes (3-way) |
| Charts | No | Yes (90-day) |
| News | No | Yes (with API) |
| Mobile | Basic | Fully optimized |

## Cost

**Zero.**

- Vercel hosting: Still free
- API usage: Still free tier
- All features: Free forever

You're just getting a better app with the same costs.

## Next Steps

After upgrading:

1. **Test all features** - Click around, try different stocks
2. **Add to watchlist** - Build your list of favorites
3. **Track portfolio** - Add your holdings
4. **Enable news** - Get Finnhub API key
5. **Customize** - Adjust analysis weights if needed

## Need Help?

1. Check the main README.md
2. Review FEATURES.md for full capability list
3. Look at browser console for errors
4. Check Vercel deployment logs

## Feedback

Love the upgrade? Issues? Let me know!

The Pro version gives you everything you asked for - enjoy! 🚀
