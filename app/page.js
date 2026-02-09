'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, AlertCircle, BarChart3, DollarSign, Brain, Search,
  Moon, Sun, Star, StarOff, Plus, X, RefreshCw, Newspaper, PieChart
} from 'lucide-react';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareStocks, setCompareStocks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      const savedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      const savedPortfolio = JSON.parse(localStorage.getItem('portfolio') || '[]');
      setDarkMode(savedDarkMode);
      setWatchlist(savedWatchlist);
      setPortfolio(savedPortfolio);
    }
  }, []);
  
  const analyzeStock = async (stockTicker = ticker) => {
    const upperTicker = stockTicker.toUpperCase().trim();
    if (!upperTicker) {
      setError('Please enter a stock ticker');
      return;
    }
    setLoading(true);
    setError(null);
    if (!compareMode) setAnalysis(null);
    
    try {
      const response = await fetch(`/api/analyze?ticker=${upperTicker}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to analyze');
      
      if (compareMode) {
        setCompareStocks(prev => [...prev.filter(s => s.ticker !== data.ticker), data].slice(-3));
      } else {
        setAnalysis(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };
  
  const addToWatchlist = (stock) => {
    if (!watchlist.find(s => s.ticker === stock.ticker)) {
      const newList = [...watchlist, {
        ticker: stock.ticker,
        name: stock.companyName,
        price: stock.currentPrice,
        change: stock.priceChange24h
      }];
      setWatchlist(newList);
      localStorage.setItem('watchlist', JSON.stringify(newList));
    }
  };
  
  const removeFromWatchlist = (ticker) => {
    const newList = watchlist.filter(s => s.ticker !== ticker);
    setWatchlist(newList);
    localStorage.setItem('watchlist', JSON.stringify(newList));
  };
  
  const addToPortfolio = () => {
    if (!analysis) return;
    const shares = prompt('How many shares?');
    const buyPrice = prompt('Buy price per share?');
    if (shares && buyPrice) {
      const newPortfolio = [...portfolio, {
        ticker: analysis.ticker,
        name: analysis.companyName,
        shares: parseFloat(shares),
        buyPrice: parseFloat(buyPrice),
        currentPrice: analysis.currentPrice
      }];
      setPortfolio(newPortfolio);
      localStorage.setItem('portfolio', JSON.stringify(newPortfolio));
    }
  };
  
  const getPredictionColor = (pred) => {
    const colors = {
      'STRONG_BUY': darkMode ? 'text-green-400 bg-green-900/30 border-green-500' : 'text-green-600 bg-green-50 border-green-200',
      'BUY': darkMode ? 'text-green-400 bg-green-900/30 border-green-500' : 'text-green-500 bg-green-50 border-green-200',
      'HOLD': darkMode ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500' : 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'SELL': darkMode ? 'text-red-400 bg-red-900/30 border-red-500' : 'text-red-500 bg-red-50 border-red-200',
      'STRONG_SELL': darkMode ? 'text-red-400 bg-red-900/30 border-red-500' : 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[pred] || 'text-gray-600';
  };
  
  const getScoreColor = (score) => score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900';
  const cardClass = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white/20 border-white/30 text-white placeholder-white/50';
  
  return (
    <div className={`min-h-screen ${bgClass} p-6 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Stock Analysis Pro</h1>
            <p className="text-blue-200 text-sm">Real-Time • Advanced Indicators • Portfolio Tracking</p>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleDarkMode} className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white/20'} text-white hover:bg-blue-600 transition`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setCompareMode(!compareMode)} className={`px-3 py-2 rounded ${compareMode ? 'bg-blue-600' : darkMode ? 'bg-gray-700' : 'bg-white/20'} text-white text-sm hover:bg-blue-700 transition`}>
              {compareMode ? 'Exit Compare' : 'Compare'}
            </button>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className={`${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-900/30 border-red-500'} border rounded p-3 mb-4 text-red-100 text-xs`}>
          <AlertCircle className="inline mr-2" size={16} />
          <strong>Risk Disclaimer:</strong> Educational tool only. Not financial advice. Invest responsibly.
        </div>
        
        {/* Search */}
        <div className={`${cardClass} rounded-lg p-4 mb-4`}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && analyzeStock()}
                placeholder="Enter ticker (AAPL, TSLA, etc.)"
                className={`w-full pl-10 pr-4 py-2 rounded ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
            </div>
            <button
              onClick={() => analyzeStock()}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold text-sm transition"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Analyze'}
            </button>
          </div>
          {error && <div className="mt-2 text-red-400 text-xs">{error}</div>}
        </div>
        
        <div className="flex gap-4">
          {/* Main Content */}
          <div className="flex-1">
            
            {/* Compare Mode */}
            {compareMode && compareStocks.length > 0 && (
              <div className={`${cardClass} rounded-lg p-4 mb-4`}>
                <h2 className="text-xl font-bold mb-3">Stock Comparison</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {compareStocks.map(stock => (
                    <div key={stock.ticker} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-3 relative`}>
                      <button onClick={() => setCompareStocks(prev => prev.filter(s => s.ticker !== stock.ticker))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                      <h3 className="font-bold">{stock.ticker}</h3>
                      <p className="text-xs opacity-70 mb-1">{stock.companyName}</p>
                      <p className="text-xl font-semibold">${stock.currentPrice.toFixed(2)}</p>
                      <p className={`text-xs ${stock.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.priceChange24h >= 0 ? '+' : ''}{stock.priceChange24h.toFixed(2)}%
                      </p>
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex justify-between"><span>Technical:</span><span>{stock.technicalScore}</span></div>
                        <div className="flex justify-between"><span>Fundamental:</span><span>{stock.fundamentalScore}</span></div>
                        <div className="flex justify-between"><span>Sentiment:</span><span>{stock.sentimentScore}</span></div>
                        <div className={`mt-2 px-2 py-1 rounded text-center font-bold text-xs ${getPredictionColor(stock.overallPrediction)}`}>
                          {stock.overallPrediction.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Main Analysis */}
            {analysis && !compareMode && (
              <div className="space-y-4">
                
                {/* Tabs */}
                <div className={`${cardClass} rounded-lg overflow-hidden`}>
                  <div className="flex border-b border-gray-700">
                    {['overview', 'technical', 'fundamentals', 'news'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-2 text-sm font-semibold transition ${
                          activeTab === tab 
                            ? (darkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-600')
                            : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-4">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-2xl font-bold">{analysis.ticker}</h2>
                              <button onClick={() => watchlist.find(s => s.ticker === analysis.ticker) ? removeFromWatchlist(analysis.ticker) : addToWatchlist(analysis)} className="text-yellow-500 hover:text-yellow-600 transition">
                                {watchlist.find(s => s.ticker === analysis.ticker) ? <Star fill="currentColor" size={18} /> : <StarOff size={18} />}
                              </button>
                              <button onClick={addToPortfolio} className="text-blue-500 hover:text-blue-600 transition"><Plus size={18} /></button>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{analysis.companyName}</p>
                            {analysis.sector && <p className="text-xs opacity-60">{analysis.sector} • {analysis.industry}</p>}
                            <div className="flex items-baseline gap-2 mt-2">
                              <p className="text-2xl font-semibold">${analysis.currentPrice.toFixed(2)}</p>
                              <span className={`font-semibold ${analysis.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {analysis.priceChange24h >= 0 ? '+' : ''}{analysis.priceChange24h.toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-xs opacity-50 mt-1">{analysis.lastUpdated}</p>
                          </div>
                          <div className="text-right">
                            <div className={`inline-block px-3 py-1 rounded font-bold border-2 text-sm ${getPredictionColor(analysis.overallPrediction)}`}>
                              {analysis.overallPrediction.replace('_', ' ')}
                            </div>
                            <div className="text-xs mt-1">Confidence: {analysis.confidenceLevel}%</div>
                            <div className="text-xs opacity-70">{analysis.timeHorizon}</div>
                          </div>
                        </div>
                        
                        <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded p-3 mb-4 text-sm`}>
                          {analysis.reasoning}
                        </div>
                        
                        {/* Scores */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {[
                            { name: 'Technical', score: analysis.technicalScore, icon: BarChart3 },
                            { name: 'Fundamental', score: analysis.fundamentalScore, icon: DollarSign },
                            { name: 'Sentiment', score: analysis.sentimentScore, icon: Brain }
                          ].map(({ name, score, icon: Icon }) => (
                            <div key={name}>
                              <div className="flex items-center gap-1 mb-1">
                                <Icon size={14} className="text-blue-500" />
                                <span className="text-xs font-semibold">{name}</span>
                              </div>
                              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 overflow-hidden`}>
                                <div className={`h-full ${getScoreColor(score)} transition-all duration-500`} style={{ width: `${score}%` }} />
                              </div>
                              <div className="text-right text-xs mt-0.5 opacity-70">{score}/100</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Price Targets */}
                        <div className="mb-4">
                          <h3 className="text-sm font-bold mb-2">6-Month Price Targets</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {['conservative', 'moderate', 'optimistic'].map((type, i) => {
                              const colors = ['red', 'yellow', 'green'];
                              const target = analysis.priceTargets[type];
                              const change = ((target / analysis.currentPrice - 1) * 100);
                              return (
                                <div key={type} className={`border border-${colors[i]}-200 rounded p-2 ${darkMode ? `bg-${colors[i]}-900/20` : `bg-${colors[i]}-50`}`}>
                                  <div className={`text-xs text-${colors[i]}-600 font-semibold ${darkMode ? `text-${colors[i]}-400` : ''}`}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </div>
                                  <div className={`text-lg font-bold text-${colors[i]}-700 ${darkMode ? `text-${colors[i]}-300` : ''}`}>
                                    ${target.toFixed(2)}
                                  </div>
                                  <div className="text-xs opacity-70">{change.toFixed(1)}% {change > 0 ? '↑' : '↓'}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Strengths & Risks */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <h3 className="text-sm font-bold mb-2 text-green-600 flex items-center gap-1">
                              <TrendingUp size={16} /> Strengths
                            </h3>
                            <ul className="space-y-1 text-xs">
                              {analysis.keyStrengths.map((s, i) => (
                                <li key={i} className="flex gap-1"><span className="text-green-500">+</span><span>{s}</span></li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold mb-2 text-red-600 flex items-center gap-1">
                              <AlertCircle size={16} /> Risks
                            </h3>
                            <ul className="space-y-1 text-xs">
                              {analysis.keyRisks.map((r, i) => (
                                <li key={i} className="flex gap-1"><span className="text-red-500">!</span><span>{r}</span></li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Technical Tab */}
                    {activeTab === 'technical' && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">Technical Indicators</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {[
                            { label: 'Trend', value: analysis.technicalIndicators.trend },
                            { label: 'Momentum', value: analysis.technicalIndicators.momentum },
                            { label: 'Support', value: `$${analysis.technicalIndicators.support.toFixed(2)}` },
                            { label: 'Resistance', value: `$${analysis.technicalIndicators.resistance.toFixed(2)}` },
                            { label: 'RSI', value: analysis.technicalIndicators.rsi || 'N/A' },
                            { label: 'MACD', value: analysis.technicalIndicators.macd || 'N/A' },
                            { label: 'SMA 20', value: analysis.technicalIndicators.sma20 ? `$${parseFloat(analysis.technicalIndicators.sma20).toFixed(2)}` : 'N/A' },
                            { label: 'SMA 50', value: analysis.technicalIndicators.sma50 ? `$${parseFloat(analysis.technicalIndicators.sma50).toFixed(2)}` : 'N/A' }
                          ].map(({ label, value }) => (
                            <div key={label} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-2`}>
                              <div className="text-xs opacity-70">{label}</div>
                              <div className="font-semibold">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Fundamentals Tab */}
                    {activeTab === 'fundamentals' && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">Fundamental Metrics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {[
                            { label: 'P/E Ratio', value: analysis.fundamentals?.pe || 'N/A' },
                            { label: 'EPS', value: analysis.fundamentals?.eps ? `$${analysis.fundamentals.eps}` : 'N/A' },
                            { label: 'Beta', value: analysis.fundamentals?.beta || 'N/A' },
                            { label: 'Dividend Yield', value: analysis.fundamentals?.dividendYield ? `${(analysis.fundamentals.dividendYield * 100).toFixed(2)}%` : 'N/A' },
                            { label: 'Profit Margin', value: analysis.fundamentals?.profitMargin ? `${(analysis.fundamentals.profitMargin * 100).toFixed(2)}%` : 'N/A' },
                            { label: 'ROE', value: analysis.fundamentals?.roe ? `${(analysis.fundamentals.roe * 100).toFixed(2)}%` : 'N/A' },
                            { label: 'Debt/Equity', value: analysis.fundamentals?.debtToEquity || 'N/A' },
                            { label: 'Market Cap', value: analysis.marketCap ? `$${(analysis.marketCap / 1e9).toFixed(2)}B` : 'N/A' },
                            { label: '52W High', value: analysis.fundamentals?.high52Week ? `$${analysis.fundamentals.high52Week}` : 'N/A' },
                            { label: '52W Low', value: analysis.fundamentals?.low52Week ? `$${analysis.fundamentals.low52Week}` : 'N/A' }
                          ].map(({ label, value }) => (
                            <div key={label} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-2`}>
                              <div className="text-xs opacity-70">{label}</div>
                              <div className="font-semibold">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* News Tab */}
                    {activeTab === 'news' && (
                      <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <Newspaper size={20} /> Recent News
                        </h3>
                        {analysis.news && analysis.news.length > 0 ? (
                          <div className="space-y-2">
                            {analysis.news.map((item, i) => (
                              <div key={i} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-3`}>
                                <h4 className="font-semibold text-sm mb-1">{item.headline}</h4>
                                <p className="text-xs opacity-70 mb-1">{item.summary}</p>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="opacity-60">{item.source}</span>
                                  {item.url && item.url !== '#' && (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                      Read More →
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} rounded p-3 text-sm`}>
                            <AlertCircle className="inline mr-2" size={16} />
                            Add FINNHUB_API_KEY to environment variables for real-time news
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - Watchlist & Portfolio */}
          <div className="w-64 space-y-4">
            {/* Watchlist */}
            <div className={`${cardClass} rounded-lg p-4`}>
              <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
                <Star size={16} /> Watchlist
              </h3>
              {watchlist.length > 0 ? (
                <div className="space-y-2">
                  {watchlist.map(stock => (
                    <div key={stock.ticker} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-2 relative`}>
                      <button onClick={() => removeFromWatchlist(stock.ticker)} className="absolute top-1 right-1 text-gray-400 hover:text-red-500">
                        <X size={12} />
                      </button>
                      <button onClick={() => analyzeStock(stock.ticker)} className="text-left w-full">
                        <div className="font-semibold text-sm">{stock.ticker}</div>
                        <div className="text-xs opacity-70 truncate">{stock.name}</div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs opacity-60">No stocks in watchlist</p>
              )}
            </div>
            
            {/* Portfolio */}
            <div className={`${cardClass} rounded-lg p-4`}>
              <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
                <PieChart size={16} /> Portfolio
              </h3>
              {portfolio.length > 0 ? (
                <div className="space-y-2">
                  {portfolio.map((holding, i) => {
                    const profit = (holding.currentPrice - holding.buyPrice) * holding.shares;
                    const profitPct = ((holding.currentPrice - holding.buyPrice) / holding.buyPrice) * 100;
                    return (
                      <div key={i} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-2`}>
                        <div className="font-semibold text-sm">{holding.ticker}</div>
                        <div className="text-xs opacity-70">{holding.shares} shares @ ${holding.buyPrice}</div>
                        <div className={`text-xs font-semibold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {profit >= 0 ? '+' : ''}${profit.toFixed(2)} ({profitPct.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs opacity-60">No holdings tracked</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
