// app/api/analyze/route.js
import { NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || ''; // Optional: for news

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices, period = 14) {
  if (prices.length < period) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate MACD
function calculateMACD(prices) {
  if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
  
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  return { macd, signal: 0, histogram: macd };
}

function calculateEMA(prices, period) {
  const k = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  
  return ema;
}

// Fetch stock data from Yahoo Finance
async function fetchYahooFinance(ticker) {
  try {
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=3mo&interval=1d`;
    const response = await fetch(quoteUrl);
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      throw new Error('No data found');
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    const timestamps = result.timestamp;
    
    // Get historical prices for technical analysis
    const closePrices = quotes.close.filter(p => p !== null);
    
    return {
      symbol: ticker,
      name: meta.longName || meta.shortName || ticker,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      volume: meta.regularMarketVolume,
      marketCap: meta.marketCap,
      high52Week: meta.fiftyTwoWeekHigh,
      low52Week: meta.fiftyTwoWeekLow,
      historicalPrices: closePrices,
      timestamps: timestamps,
      source: 'yahoo'
    };
  } catch (error) {
    console.error('Yahoo Finance error:', error);
    throw error;
  }
}

// Fetch from Alpha Vantage
async function fetchAlphaVantage(ticker) {
  try {
    // Get quote
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();
    
    if (quoteData['Error Message'] || quoteData['Note']) {
      throw new Error(quoteData['Error Message'] || 'API limit reached');
    }
    
    const quote = quoteData['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error('No data found');
    }
    
    // Get company overview
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const overviewResponse = await fetch(overviewUrl);
    const overview = await overviewResponse.json();
    
    // Get historical data for technical indicators
    const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const dailyResponse = await fetch(dailyUrl);
    const dailyData = await dailyResponse.json();
    
    const timeSeries = dailyData['Time Series (Daily)'] || {};
    const prices = Object.values(timeSeries).map(day => parseFloat(day['4. close'])).reverse();
    
    return {
      symbol: ticker,
      name: overview.Name || ticker,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      marketCap: parseInt(overview.MarketCapitalization) || null,
      high52Week: parseFloat(overview['52WeekHigh']) || null,
      low52Week: parseFloat(overview['52WeekLow']) || null,
      pe: parseFloat(overview.PERatio) || null,
      beta: parseFloat(overview.Beta) || null,
      eps: parseFloat(overview.EPS) || null,
      dividendYield: parseFloat(overview.DividendYield) || null,
      profitMargin: parseFloat(overview.ProfitMargin) || null,
      roe: parseFloat(overview.ReturnOnEquityTTM) || null,
      debtToEquity: parseFloat(overview.DebtToEquity) || null,
      sector: overview.Sector || null,
      industry: overview.Industry || null,
      description: overview.Description || null,
      historicalPrices: prices,
      source: 'alphavantage'
    };
  } catch (error) {
    console.error('Alpha Vantage error:', error);
    throw error;
  }
}

// Fetch news (optional - requires Finnhub API key)
async function fetchNews(ticker) {
  if (!FINNHUB_API_KEY) {
    return [{
      headline: 'News API not configured',
      summary: 'Add FINNHUB_API_KEY to environment variables for real-time news',
      url: '#',
      source: 'System'
    }];
  }
  
  try {
    const newsUrl = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${getDateDaysAgo(7)}&to=${getDateToday()}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(newsUrl);
    const news = await response.json();
    
    return news.slice(0, 5).map(item => ({
      headline: item.headline,
      summary: item.summary,
      url: item.url,
      source: item.source,
      datetime: item.datetime
    }));
  } catch (error) {
    console.error('News fetch error:', error);
    return [];
  }
}

function getDateToday() {
  return new Date().toISOString().split('T')[0];
}

function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Enhanced technical score with RSI and MACD
function calculateTechnicalScore(data) {
  let score = 50;
  
  // Price momentum
  score += data.changePercent * 5;
  
  // 52-week position
  if (data.high52Week && data.low52Week) {
    const range = data.high52Week - data.low52Week;
    const position = (data.price - data.low52Week) / range;
    score += position * 20 - 10;
  }
  
  // RSI analysis
  if (data.historicalPrices && data.historicalPrices.length > 14) {
    const rsi = calculateRSI(data.historicalPrices);
    if (rsi > 70) score -= 10; // Overbought
    else if (rsi < 30) score += 15; // Oversold (buy opportunity)
    else if (rsi >= 40 && rsi <= 60) score += 10; // Healthy middle range
  }
  
  // MACD
  if (data.historicalPrices && data.historicalPrices.length > 26) {
    const macd = calculateMACD(data.historicalPrices);
    if (macd.macd > 0) score += 10;
  }
  
  // Beta
  if (data.beta) {
    if (data.beta < 0.8) score += 10;
    else if (data.beta > 1.8) score -= 5;
  }
  
  // Market cap
  if (data.marketCap) {
    if (data.marketCap > 1000000000000) score += 15;
    else if (data.marketCap > 100000000000) score += 10;
    else score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Enhanced fundamental score
function calculateFundamentalScore(data) {
  let score = 50;
  
  // P/E ratio
  if (data.pe && data.pe > 0) {
    if (data.pe < 15) score += 25;
    else if (data.pe < 25) score += 15;
    else if (data.pe < 40) score += 5;
    else if (data.pe < 60) score -= 5;
    else score -= 15;
  }
  
  // Profit margin
  if (data.profitMargin) {
    if (data.profitMargin > 0.20) score += 15;
    else if (data.profitMargin > 0.10) score += 10;
    else if (data.profitMargin < 0) score -= 15;
  }
  
  // ROE (Return on Equity)
  if (data.roe) {
    if (data.roe > 0.15) score += 15;
    else if (data.roe > 0.10) score += 10;
    else if (data.roe < 0) score -= 10;
  }
  
  // Debt to Equity
  if (data.debtToEquity) {
    if (data.debtToEquity < 0.5) score += 10;
    else if (data.debtToEquity > 2) score -= 10;
  }
  
  // Market cap
  if (data.marketCap) {
    if (data.marketCap > 500000000000) score += 10;
  }
  
  // Dividend yield (for income investors)
  if (data.dividendYield && data.dividendYield > 0.02) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Enhanced sentiment score
function calculateSentimentScore(data) {
  let score = 50;
  
  // Recent price momentum
  if (data.changePercent > 5) score += 25;
  else if (data.changePercent > 3) score += 20;
  else if (data.changePercent > 1) score += 10;
  else if (data.changePercent > 0) score += 5;
  else if (data.changePercent < -5) score -= 25;
  else if (data.changePercent < -3) score -= 20;
  else if (data.changePercent < -1) score -= 10;
  else score -= 5;
  
  // 52-week position
  if (data.high52Week && data.low52Week) {
    const position = (data.price - data.low52Week) / (data.high52Week - data.low52Week);
    if (position > 0.9) score += 15;
    else if (position > 0.7) score += 10;
    else if (position < 0.2) score -= 15;
    else if (position < 0.3) score -= 10;
  }
  
  // Moving average trend (if we have historical data)
  if (data.historicalPrices && data.historicalPrices.length >= 50) {
    const sma50 = data.historicalPrices.slice(-50).reduce((a, b) => a + b, 0) / 50;
    if (data.price > sma50) score += 10;
    else score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

function getPrediction(overallScore) {
  if (overallScore >= 70) return 'STRONG_BUY';
  if (overallScore >= 60) return 'BUY';
  if (overallScore >= 45) return 'HOLD';
  if (overallScore >= 35) return 'SELL';
  return 'STRONG_SELL';
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  
  if (!ticker) {
    return NextResponse.json({ error: 'Ticker parameter required' }, { status: 400 });
  }
  
  try {
    // Fetch stock data
    let stockData;
    try {
      stockData = await fetchAlphaVantage(ticker);
    } catch (error) {
      console.log('Alpha Vantage failed, trying Yahoo Finance...');
      stockData = await fetchYahooFinance(ticker);
    }
    
    // Fetch news (optional)
    const news = await fetchNews(ticker);
    
    // Calculate enhanced scores
    const technicalScore = Math.round(calculateTechnicalScore(stockData));
    const fundamentalScore = Math.round(calculateFundamentalScore(stockData));
    const sentimentScore = Math.round(calculateSentimentScore(stockData));
    const overallScore = (technicalScore + fundamentalScore + sentimentScore) / 3;
    const prediction = getPrediction(overallScore);
    
    // Calculate technical indicators
    const rsi = stockData.historicalPrices?.length > 14 
      ? calculateRSI(stockData.historicalPrices) 
      : null;
    
    const macd = stockData.historicalPrices?.length > 26 
      ? calculateMACD(stockData.historicalPrices) 
      : null;
    
    // Calculate moving averages
    let sma20 = null, sma50 = null, sma200 = null;
    if (stockData.historicalPrices) {
      if (stockData.historicalPrices.length >= 20) {
        sma20 = stockData.historicalPrices.slice(-20).reduce((a, b) => a + b, 0) / 20;
      }
      if (stockData.historicalPrices.length >= 50) {
        sma50 = stockData.historicalPrices.slice(-50).reduce((a, b) => a + b, 0) / 50;
      }
      if (stockData.historicalPrices.length >= 200) {
        sma200 = stockData.historicalPrices.slice(-200).reduce((a, b) => a + b, 0) / 200;
      }
    }
    
    // Confidence calculation
    let confidence = 65;
    if (stockData.marketCap > 500000000000) confidence += 15;
    else if (stockData.marketCap > 100000000000) confidence += 10;
    if (stockData.beta && stockData.beta < 1.0) confidence += 10;
    else if (stockData.beta && stockData.beta > 2.0) confidence -= 10;
    confidence = Math.min(95, Math.max(35, confidence));
    
    // Time horizon
    const timeHorizon = stockData.beta && stockData.beta > 1.8 
      ? 'Short-term (1-4 weeks)' 
      : stockData.beta && stockData.beta > 1.2 
        ? 'Medium-term (1-3 months)' 
        : 'Long-term (3-12 months)';
    
    // Generate strengths and risks
    const keyStrengths = [];
    const keyRisks = [];
    
    if (stockData.changePercent > 2) keyStrengths.push('Strong recent price momentum');
    if (stockData.marketCap > 1000000000000) keyStrengths.push('Large-cap stability and liquidity');
    if (stockData.pe && stockData.pe < 25) keyStrengths.push('Attractive valuation metrics');
    if (stockData.roe && stockData.roe > 0.15) keyStrengths.push('Strong return on equity (>15%)');
    if (stockData.profitMargin && stockData.profitMargin > 0.15) keyStrengths.push('Healthy profit margins');
    if (stockData.dividendYield && stockData.dividendYield > 0.02) keyStrengths.push(`Dividend yield: ${(stockData.dividendYield * 100).toFixed(2)}%`);
    if (rsi && rsi < 35) keyStrengths.push('Oversold conditions (potential buying opportunity)');
    
    if (stockData.changePercent < -2) keyRisks.push('Recent price weakness and negative momentum');
    if (stockData.beta && stockData.beta > 1.5) keyRisks.push('High volatility relative to market');
    if (stockData.pe && stockData.pe > 50) keyRisks.push('Elevated valuation requires strong growth');
    if (stockData.debtToEquity && stockData.debtToEquity > 2) keyRisks.push('High debt-to-equity ratio');
    if (stockData.profitMargin && stockData.profitMargin < 0.05) keyRisks.push('Thin or negative profit margins');
    if (rsi && rsi > 70) keyRisks.push('Overbought conditions (potential correction)');
    
    while (keyStrengths.length < 3) {
      keyStrengths.push(stockData.sector ? `Exposure to ${stockData.sector} sector` : 'Established market presence');
    }
    while (keyRisks.length < 3) {
      keyRisks.push('Market volatility and economic uncertainty');
    }
    
    // Reasoning
    const reasons = [];
    if (stockData.changePercent > 2) reasons.push('strong momentum');
    else if (stockData.changePercent < -2) reasons.push('recent weakness');
    if (stockData.pe && stockData.pe < 25) reasons.push('attractive valuation');
    else if (stockData.pe && stockData.pe > 50) reasons.push('premium valuation');
    if (rsi && rsi < 35) reasons.push('oversold RSI');
    else if (rsi && rsi > 70) reasons.push('overbought RSI');
    
    const reasoning = `${prediction.replace('_', ' ')} rating based on ${reasons.join(', ') || 'current market conditions'}. Price ${stockData.changePercent >= 0 ? 'up' : 'down'} ${Math.abs(stockData.changePercent).toFixed(1)}% today.`;
    
    // Build comprehensive response
    const analysis = {
      ticker: stockData.symbol,
      companyName: stockData.name,
      sector: stockData.sector,
      industry: stockData.industry,
      currentPrice: stockData.price,
      priceChange24h: stockData.changePercent,
      volume: stockData.volume,
      marketCap: stockData.marketCap,
      
      // Scores
      technicalScore,
      fundamentalScore,
      sentimentScore,
      overallPrediction: prediction,
      confidenceLevel: confidence,
      timeHorizon,
      
      // Technical indicators
      technicalIndicators: {
        trend: stockData.changePercent > 1.5 ? 'Bullish' : stockData.changePercent < -1.5 ? 'Bearish' : 'Neutral',
        momentum: (stockData.beta || 1.0) > 1.5 ? 'Strong' : (stockData.beta || 1.0) > 0.8 ? 'Moderate' : 'Weak',
        support: stockData.price * 0.92,
        resistance: stockData.price * 1.08,
        rsi: rsi ? rsi.toFixed(2) : null,
        macd: macd ? macd.macd.toFixed(2) : null,
        sma20: sma20 ? sma20.toFixed(2) : null,
        sma50: sma50 ? sma50.toFixed(2) : null,
        sma200: sma200 ? sma200.toFixed(2) : null
      },
      
      // Fundamental data
      fundamentals: {
        pe: stockData.pe,
        eps: stockData.eps,
        beta: stockData.beta,
        dividendYield: stockData.dividendYield,
        profitMargin: stockData.profitMargin,
        roe: stockData.roe,
        debtToEquity: stockData.debtToEquity,
        high52Week: stockData.high52Week,
        low52Week: stockData.low52Week
      },
      
      // Price targets
      priceTargets: {
        conservative: stockData.price * (1 + (overallScore - 50) * 0.002),
        moderate: stockData.price * (1 + (overallScore - 50) * 0.004),
        optimistic: stockData.price * (1 + (overallScore - 50) * 0.006)
      },
      
      // Analysis
      keyStrengths: keyStrengths.slice(0, 3),
      keyRisks: keyRisks.slice(0, 3),
      reasoning,
      
      // News
      news: news.slice(0, 5),
      
      // Historical data for charts
      historicalData: stockData.historicalPrices && stockData.timestamps ? {
        prices: stockData.historicalPrices.slice(-90),
        timestamps: stockData.timestamps ? stockData.timestamps.slice(-90) : null
      } : null,
      
      // Metadata
      lastUpdated: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      dataSource: stockData.source
    };
    
    return NextResponse.json(analysis);
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch stock data', 
      message: error.message,
      hint: 'Make sure the ticker symbol is valid'
    }, { status: 500 });
  }
}
