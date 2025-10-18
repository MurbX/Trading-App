import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Chart from '../components/Chart';
import axios from 'axios';
import '../Dashboard.css';

const FOREX_PAIRS = [
  { value: 'EURUSD', label: 'EUR/USD', flag: '🇪🇺🇺🇸' },
  { value: 'GBPUSD', label: 'GBP/USD', flag: '🇬🇧🇺🇸' },
  { value: 'USDJPY', label: 'USD/JPY', flag: '🇺🇸🇯🇵' },
  { value: 'AUDUSD', label: 'AUD/USD', flag: '🇦🇺🇺🇸' },
  { value: 'USDCAD', label: 'USD/CAD', flag: '🇺🇸🇨🇦' },
  { value: 'USDCHF', label: 'USD/CHF', flag: '🇺🇸🇨🇭' },
  { value: 'NZDUSD', label: 'NZD/USD', flag: '🇳🇿🇺🇸' },
  { value: 'EURGBP', label: 'EUR/GBP', flag: '🇪🇺🇬🇧' },
  { value: 'EURJPY', label: 'EUR/JPY', flag: '🇪🇺🇯🇵' },
  { value: 'GBPJPY', label: 'GBP/JPY', flag: '🇬🇧🇯🇵' }
];

const TIMEFRAMES = [
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: '4hour', label: '4 Hour', icon: '🕐' },
  { value: '60min', label: '1 Hour', icon: '⏱️' },
  { value: '15min', label: '15 Min', icon: '⚡' }
];

function Dashboard() {
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
  const [signalData, setSignalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [watchlist, setWatchlist] = useState(['EURUSD', 'GBPUSD', 'USDJPY']);

  const fetchSignal = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`/api/signal?symbol=${selectedSymbol}&timeframe=${selectedTimeframe}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSignalData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch signal data');
      console.error('Error fetching signal:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, selectedTimeframe, token]);

  useEffect(() => {
    fetchSignal();
  }, [fetchSignal]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSignal();
      }, 60000); // Refresh every 60 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchSignal]);

  const handleSymbolChange = (symbol) => {
    setSelectedSymbol(symbol);
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  const handleRefresh = () => {
    fetchSignal();
  };

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY': return '📈';
      case 'SELL': return '📉';
      case 'HOLD': return '⏸️';
      default: return '❓';
    }
  };

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY': return 'var(--buy-color)';
      case 'SELL': return 'var(--sell-color)';
      case 'HOLD': return 'var(--hold-color)';
      default: return 'var(--text-secondary)';
    }
  };

  const getRSIStatus = (rsi) => {
    if (!rsi) return { status: 'N/A', color: 'var(--text-secondary)' };
    const rsiNum = parseFloat(rsi);
    if (rsiNum > 70) return { status: 'Overbought', color: '#ef4444' };
    if (rsiNum < 30) return { status: 'Oversold', color: '#22c55e' };
    return { status: 'Neutral', color: 'var(--text-secondary)' };
  };

  const getStrengthColor = (strength) => {
    switch (strength?.toLowerCase()) {
      case 'strong': return '#22c55e';
      case 'moderate': return '#f59e0b';
      case 'weak': return '#6b7280';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📊 Forex Trader Pro</h1>
          <span className="header-subtitle">{user?.email || 'User'}</span>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)} 
            className={`btn-auto-refresh ${autoRefresh ? 'active' : ''}`}
            title="Auto-refresh every 60 seconds"
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Auto'} Refresh
          </button>
          <button onClick={handleRefresh} className="btn-refresh" disabled={loading}>
            🔄 Refresh
          </button>
          <button onClick={toggleTheme} className="btn-theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-main">
        {/* LEFT SIDEBAR - Trading Control */}
        <aside className="sidebar sidebar-left">
          <div className="sidebar-section">
            <h3>🎯 Quick Select</h3>
            <div className="pair-grid">
              {FOREX_PAIRS.map(pair => (
                <button
                  key={pair.value}
                  className={`pair-button ${selectedSymbol === pair.value ? 'active' : ''}`}
                  onClick={() => handleSymbolChange(pair.value)}
                  disabled={loading}
                >
                  <span className="pair-flag">{pair.flag}</span>
                  <span className="pair-label">{pair.label}</span>
                  {watchlist.includes(pair.value) && <span className="watchlist-star">⭐</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>⏱️ Timeframe</h3>
            <div className="timeframe-grid">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf.value}
                  className={`timeframe-button ${selectedTimeframe === tf.value ? 'active' : ''}`}
                  onClick={() => handleTimeframeChange(tf.value)}
                  disabled={loading}
                >
                  <span className="tf-icon">{tf.icon}</span>
                  <span className="tf-label">{tf.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>⭐ Watchlist</h3>
            <div className="watchlist-controls">
              <button 
                onClick={() => toggleWatchlist(selectedSymbol)}
                className="btn-watchlist"
              >
                {watchlist.includes(selectedSymbol) ? '⭐ Remove' : '☆ Add to Watchlist'}
              </button>
            </div>
            <div className="watchlist-items">
              {watchlist.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  No pairs in watchlist
                </p>
              ) : (
                watchlist.map(symbol => {
                  const pair = FOREX_PAIRS.find(p => p.value === symbol);
                  return (
                    <div key={symbol} className="watchlist-item">
                      <span>{pair?.flag} {pair?.label}</span>
                      <button 
                        onClick={() => toggleWatchlist(symbol)}
                        className="btn-remove"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* CENTER - Chart */}
        <main className="dashboard-center">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {loading && !signalData && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading signal data...</p>
            </div>
          )}

          {signalData && (
            <>
              <div className="chart-header">
                <div className="chart-title">
                  <h2>{signalData.symbol}</h2>
                  <span className="chart-price">${signalData.price?.toFixed(5)}</span>
                  <span className={`price-change ${parseFloat(signalData.priceChangePercent) >= 0 ? 'positive' : 'negative'}`}>
                    {parseFloat(signalData.priceChangePercent) >= 0 ? '▲' : '▼'} {signalData.priceChangePercent}%
                  </span>
                  {signalData.demoMode && (
                    <span className="demo-badge" title="Using simulated data due to API limitations">
                      🎮 DEMO MODE
                    </span>
                  )}
                </div>
                <div className="signal-badge" style={{ backgroundColor: getSignalColor(signalData.signal) }}>
                  {getSignalIcon(signalData.signal)} {signalData.signal}
                </div>
              </div>
              <Chart chartData={signalData.chartData} symbol={signalData.symbol} />
            </>
          )}
        </main>

        {/* RIGHT SIDEBAR - Signal Details & Analytics */}
        <aside className="sidebar sidebar-right">
          {signalData && (
            <>
              <div className="sidebar-section">
                <h3>📊 Signal Analysis</h3>
                <div className="stat-card">
                  <div className="stat-row">
                    <span className="stat-label">Confidence</span>
                    <div className="confidence-bar-mini">
                      <div 
                        className="confidence-fill" 
                        style={{ 
                          width: `${signalData.confidence}%`,
                          backgroundColor: getSignalColor(signalData.signal)
                        }}
                      />
                    </div>
                    <span className="stat-value">{signalData.confidence}%</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Strength</span>
                    <span 
                      className="stat-badge" 
                      style={{ backgroundColor: getStrengthColor(signalData.strength) }}
                    >
                      {signalData.strength}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sidebar-section">
                <h3>📈 Technical Indicators</h3>
                <div className="stat-card">
                  <div className="stat-row">
                    <span className="stat-label">EMA 10</span>
                    <span className="stat-value">{signalData.indicators?.ema10}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">EMA 20</span>
                    <span className="stat-value">{signalData.indicators?.ema20}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">RSI</span>
                    <span className="stat-value">
                      {signalData.indicators?.rsi}
                      <span 
                        className="stat-badge-small" 
                        style={{ 
                          backgroundColor: getRSIStatus(signalData.indicators?.rsi).color,
                          marginLeft: '8px'
                        }}
                      >
                        {getRSIStatus(signalData.indicators?.rsi).status}
                      </span>
                    </span>
                  </div>
                  {signalData.indicators?.macd && (
                    <>
                      <div className="stat-row">
                        <span className="stat-label">MACD</span>
                        <span className="stat-value">{signalData.indicators.macd.MACD}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">MACD Signal</span>
                        <span className="stat-value">{signalData.indicators.macd.signal}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="sidebar-section">
                <h3>🎯 Key Levels</h3>
                <div className="stat-card">
                  <div className="stat-row">
                    <span className="stat-label">🔴 Resistance</span>
                    <span className="stat-value resistance">{signalData.indicators?.resistance}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">🟢 Support</span>
                    <span className="stat-value support">{signalData.indicators?.support}</span>
                  </div>
                  {signalData.indicators?.bollingerBands && (
                    <>
                      <div className="stat-row">
                        <span className="stat-label">BB Upper</span>
                        <span className="stat-value">{signalData.indicators.bollingerBands.upper}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">BB Lower</span>
                        <span className="stat-value">{signalData.indicators.bollingerBands.lower}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {signalData.forex && (
                <div className="sidebar-section">
                  <h3>💰 Forex Metrics</h3>
                  <div className="stat-card">
                    <div className="stat-row">
                      <span className="stat-label">Price Change</span>
                      <span 
                        className="stat-value" 
                        style={{ 
                          color: parseFloat(signalData.forex.priceChangePips) >= 0 ? 'var(--buy-color)' : 'var(--sell-color)' 
                        }}
                      >
                        {signalData.forex.priceChangePips} pips
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Potential</span>
                      <span className="stat-value" style={{ color: 'var(--primary-color)' }}>
                        {signalData.forex.potentialPips} pips
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Spread</span>
                      <span className="stat-value">{signalData.forex.spreadPips} pips</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Risk/Reward</span>
                      <span 
                        className="stat-value" 
                        style={{ 
                          color: parseFloat(signalData.forex.riskRewardRatio) >= 2 ? 'var(--buy-color)' : 
                                 parseFloat(signalData.forex.riskRewardRatio) >= 1 ? 'var(--hold-color)' : 
                                 'var(--sell-color)' 
                        }}
                      >
                        1:{signalData.forex.riskRewardRatio}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Margin</span>
                      <span className="stat-value">${signalData.forex.marginRequired}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Leverage</span>
                      <span className="stat-value">{signalData.forex.leverage}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="sidebar-section">
                <h3>💡 Trading Tips</h3>
                <div className="tips-card">
                  {signalData.signal === 'BUY' && (
                    <>
                      <p className="tip">✅ Consider buying at current price</p>
                      <p className="tip">🎯 Target: {signalData.indicators?.resistance}</p>
                      <p className="tip">🛡️ Stop Loss: {signalData.indicators?.support}</p>
                    </>
                  )}
                  {signalData.signal === 'SELL' && (
                    <>
                      <p className="tip">✅ Consider selling at current price</p>
                      <p className="tip">🎯 Target: {signalData.indicators?.support}</p>
                      <p className="tip">🛡️ Stop Loss: {signalData.indicators?.resistance}</p>
                    </>
                  )}
                  {signalData.signal === 'HOLD' && (
                    <p className="tip">⏸️ Wait for clearer signals</p>
                  )}
                  {parseFloat(signalData.forex?.riskRewardRatio) < 1 && (
                    <p className="tip warning">⚠️ Poor risk/reward ratio</p>
                  )}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
