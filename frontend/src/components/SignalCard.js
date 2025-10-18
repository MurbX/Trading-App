import React from 'react';
import './SignalCard.css';

function SignalCard({ signalData }) {
  if (!signalData) return null;

  const { 
    symbol, 
    price, 
    signal, 
    confidence, 
    strength,
    priceChange,
    priceChangePercent,
    forex,
    indicators, 
    timestamp 
  } = signalData;

  const getSignalColor = () => {
    switch (signal) {
      case 'BUY':
        return 'var(--buy-color)';
      case 'SELL':
        return 'var(--sell-color)';
      case 'HOLD':
        return 'var(--hold-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getSignalIcon = () => {
    switch (signal) {
      case 'BUY':
        return '📈';
      case 'SELL':
        return '📉';
      case 'HOLD':
        return '⏸️';
      default:
        return '❓';
    }
  };

  const getStrengthBadge = () => {
    const colors = {
      strong: '#22c55e',
      moderate: '#f59e0b',
      weak: '#6b7280'
    };
    return (
      <span 
        className="strength-badge" 
        style={{ backgroundColor: colors[strength] || colors.weak }}
      >
        {strength ? strength.toUpperCase() : 'N/A'}
      </span>
    );
  };

  const getRSIStatus = (rsi) => {
    if (!rsi) return { status: 'N/A', color: 'var(--text-secondary)' };
    const rsiNum = parseFloat(rsi);
    if (rsiNum >= 70) return { status: 'Overbought', color: '#ef4444' };
    if (rsiNum <= 30) return { status: 'Oversold', color: '#22c55e' };
    return { status: 'Neutral', color: '#f59e0b' };
  };

  const rsiStatus = getRSIStatus(indicators?.rsi);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const priceChangeColor = parseFloat(priceChange) >= 0 ? '#22c55e' : '#ef4444';

  return (
    <div className="signal-card">
      <div className="signal-header">
        <div>
          <h2>{symbol}</h2>
          <div className="signal-price">{price?.toFixed(5)}</div>
          <div className="price-change" style={{ color: priceChangeColor }}>
            {parseFloat(priceChange) >= 0 ? '▲' : '▼'} {priceChange} ({priceChangePercent}%)
          </div>
        </div>
        {getStrengthBadge()}
      </div>

      <div className="signal-main" style={{ borderColor: getSignalColor() }}>
        <div className="signal-icon">{getSignalIcon()}</div>
        <div className="signal-type" style={{ color: getSignalColor() }}>
          {signal}
        </div>
      </div>

      <div className="signal-confidence">
        <div className="confidence-label">Confidence</div>
        <div className="confidence-bar-container">
          <div
            className="confidence-bar"
            style={{
              width: `${confidence}%`,
              backgroundColor: getSignalColor()
            }}
          />
        </div>
        <div className="confidence-value">{confidence}%</div>
      </div>

      <div className="signal-indicators">
        <h3>Technical Indicators</h3>
        
        <div className="indicator-section">
          <div className="indicator-row">
            <span className="indicator-label">EMA 10:</span>
            <span className="indicator-value">{indicators?.ema10 || 'N/A'}</span>
          </div>
          <div className="indicator-row">
            <span className="indicator-label">EMA 20:</span>
            <span className="indicator-value">{indicators?.ema20 || 'N/A'}</span>
          </div>
        </div>

        <div className="indicator-section">
          <div className="indicator-row">
            <span className="indicator-label">RSI (14):</span>
            <span className="indicator-value">
              {indicators?.rsi || 'N/A'}
              {indicators?.rsi && (
                <span 
                  className="indicator-status" 
                  style={{ color: rsiStatus.color }}
                >
                  {' '}{rsiStatus.status}
                </span>
              )}
            </span>
          </div>
        </div>

        {indicators?.macd && (
          <div className="indicator-section">
            <div className="indicator-row">
              <span className="indicator-label">MACD:</span>
              <span className="indicator-value">{indicators.macd.MACD}</span>
            </div>
            <div className="indicator-row">
              <span className="indicator-label">Signal:</span>
              <span className="indicator-value">{indicators.macd.signal}</span>
            </div>
            <div className="indicator-row">
              <span className="indicator-label">Histogram:</span>
              <span 
                className="indicator-value"
                style={{ color: parseFloat(indicators.macd.histogram) >= 0 ? '#22c55e' : '#ef4444' }}
              >
                {indicators.macd.histogram}
              </span>
            </div>
          </div>
        )}

        {indicators?.bollingerBands && (
          <div className="indicator-section">
            <div className="indicator-row">
              <span className="indicator-label">BB Upper:</span>
              <span className="indicator-value">{indicators.bollingerBands.upper}</span>
            </div>
            <div className="indicator-row">
              <span className="indicator-label">BB Middle:</span>
              <span className="indicator-value">{indicators.bollingerBands.middle}</span>
            </div>
            <div className="indicator-row">
              <span className="indicator-label">BB Lower:</span>
              <span className="indicator-value">{indicators.bollingerBands.lower}</span>
            </div>
          </div>
        )}

        <div className="indicator-section support-resistance">
          <div className="indicator-row">
            <span className="indicator-label">🔴 Resistance:</span>
            <span className="indicator-value resistance">{indicators?.resistance || 'N/A'}</span>
          </div>
          <div className="indicator-row">
            <span className="indicator-label">🟢 Support:</span>
            <span className="indicator-value support">{indicators?.support || 'N/A'}</span>
          </div>
        </div>

        {forex && (
          <>
            <h3 style={{ marginTop: '1rem' }}>Forex Metrics</h3>
            
            <div className="indicator-section forex-metrics">
              <div className="indicator-row">
                <span className="indicator-label">💹 Price Change:</span>
                <span className="indicator-value" style={{ 
                  color: parseFloat(forex.priceChangePips) >= 0 ? 'var(--buy-color)' : 'var(--sell-color)' 
                }}>
                  {forex.priceChangePips} pips
                </span>
              </div>
              <div className="indicator-row">
                <span className="indicator-label">🎯 Potential:</span>
                <span className="indicator-value" style={{ color: 'var(--primary-color)' }}>
                  {forex.potentialPips} pips
                </span>
              </div>
              <div className="indicator-row">
                <span className="indicator-label">📊 Spread:</span>
                <span className="indicator-value">{forex.spreadPips} pips</span>
              </div>
              <div className="indicator-row">
                <span className="indicator-label">💰 Margin Required:</span>
                <span className="indicator-value">${forex.marginRequired}</span>
              </div>
              <div className="indicator-row">
                <span className="indicator-label">⚖️ Leverage:</span>
                <span className="indicator-value">{forex.leverage}</span>
              </div>
              <div className="indicator-row">
                <span className="indicator-label">📦 Lot Size:</span>
                <span className="indicator-value">{forex.lotSize}</span>
              </div>
              <div className="indicator-row">
                <span className="indicator-label">⚡ Pip Value:</span>
                <span className="indicator-value">{forex.pipValue}</span>
              </div>
              <div className="indicator-row">
                <span className="indicator-label">🎲 Risk/Reward:</span>
                <span className="indicator-value" style={{ 
                  color: parseFloat(forex.riskRewardRatio) >= 2 ? 'var(--buy-color)' : 
                         parseFloat(forex.riskRewardRatio) >= 1 ? 'var(--hold-color)' : 
                         'var(--sell-color)' 
                }}>
                  1:{forex.riskRewardRatio}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="signal-footer">
        <small>Last updated: {formatDate(timestamp)}</small>
      </div>
    </div>
  );
}

export default SignalCard;
