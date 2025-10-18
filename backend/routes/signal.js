const express = require('express');
const router = express.Router();
const axios = require('axios');
const { EMA, RSI, MACD, BollingerBands, SMA } = require('technicalindicators');
const authMiddleware = require('../middleware/auth');

// Forex pair mapping
const FOREX_PAIRS = {
  'EURUSD': { from: 'EUR', to: 'USD', name: 'EUR/USD' },
  'GBPUSD': { from: 'GBP', to: 'USD', name: 'GBP/USD' },
  'USDJPY': { from: 'USD', to: 'JPY', name: 'USD/JPY' },
  'AUDUSD': { from: 'AUD', to: 'USD', name: 'AUD/USD' },
  'USDCAD': { from: 'USD', to: 'CAD', name: 'USD/CAD' },
  'USDCHF': { from: 'USD', to: 'CHF', name: 'USD/CHF' },
  'NZDUSD': { from: 'NZD', to: 'USD', name: 'NZD/USD' },
  'EURGBP': { from: 'EUR', to: 'GBP', name: 'EUR/GBP' },
  'EURJPY': { from: 'EUR', to: 'JPY', name: 'EUR/JPY' },
  'GBPJPY': { from: 'GBP', to: 'JPY', name: 'GBP/JPY' }
};

// Timeframe mapping for Twelve Data API
const TIMEFRAMES = {
  '15min': { interval: '15min', outputsize: 100 },
  '60min': { interval: '1h', outputsize: 100 },
  '4hour': { interval: '4h', outputsize: 100 },
  'daily': { interval: '1day', outputsize: 100 }
};

// Generate demo/simulated data for testing
function generateDemoData(basePrice = 1.0950, periods = 100) {
  const data = {};
  const now = new Date();
  
  let currentPrice = basePrice;
  
  for (let i = periods; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    
    // Simulate realistic price movement
    const change = (Math.random() - 0.5) * 0.005; // ±0.5% movement
    currentPrice = currentPrice * (1 + change);
    
    const open = currentPrice;
    const high = currentPrice * (1 + Math.random() * 0.002);
    const low = currentPrice * (1 - Math.random() * 0.002);
    const close = low + (high - low) * Math.random();
    
    data[dateStr] = {
      '1. open': open.toFixed(5),
      '2. high': high.toFixed(5),
      '3. low': low.toFixed(5),
      '4. close': close.toFixed(5)
    };
  }
  
  return data;
}

// Helper function to fetch forex data from Twelve Data API
async function fetchForexData(fromSymbol, toSymbol, timeframe = 'daily') {
  try {
    const tfConfig = TIMEFRAMES[timeframe] || TIMEFRAMES['daily'];
    const symbol = `${fromSymbol}/${toSymbol}`;
    
    // Use demo key if no API key provided, otherwise use user's key
    const apiKey = process.env.TWELVE_DATA_API_KEY || 'demo';
    
    const params = {
      symbol: symbol,
      interval: tfConfig.interval,
      outputsize: tfConfig.outputsize,
      apikey: apiKey,
      format: 'JSON'
    };

    const response = await axios.get('https://api.twelvedata.com/time_series', {
      params,
      timeout: 10000
    });

    // Check for errors
    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'API error');
    }

    if (!response.data.values || response.data.values.length === 0) {
      throw new Error('No data available for this forex pair');
    }

    // Convert Twelve Data format to our internal format
    const timeSeries = {};
    response.data.values.forEach(item => {
      timeSeries[item.datetime] = {
        '1. open': item.open,
        '2. high': item.high,
        '3. low': item.low,
        '4. close': item.close
      };
    });

    return timeSeries;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('Twelve Data API rate limit reached');
      throw new Error('API call frequency limit reached. Please try again later.');
    }
    console.error('Twelve Data API error:', error.message);
    throw error;
  }
}

// Helper function to parse OHLC data
function parseOHLCData(timeSeries) {
  const dates = Object.keys(timeSeries).sort(); // Sort chronologically
  
  return dates.map(date => ({
    time: date,
    open: parseFloat(timeSeries[date]['1. open']),
    high: parseFloat(timeSeries[date]['2. high']),
    low: parseFloat(timeSeries[date]['3. low']),
    close: parseFloat(timeSeries[date]['4. close'])
  }));
}

// Helper function to calculate EMA
function calculateEMA(prices, period) {
  if (prices.length < period) {
    return null;
  }

  const emaValues = EMA.calculate({
    period: period,
    values: prices
  });

  return emaValues;
}

// Helper function to calculate RSI
function calculateRSI(prices, period = 14) {
  if (prices.length < period) {
    return null;
  }

  const rsiValues = RSI.calculate({
    period: period,
    values: prices
  });

  return rsiValues;
}

// Helper function to calculate MACD
function calculateMACDIndicator(prices) {
  if (prices.length < 26) {
    return null;
  }

  const macdData = MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  return macdData;
}

// Helper function to calculate Bollinger Bands
function calculateBollingerBandsIndicator(prices, period = 20, stdDev = 2) {
  if (prices.length < period) {
    return null;
  }

  const bbData = BollingerBands.calculate({
    period: period,
    values: prices,
    stdDev: stdDev
  });

  return bbData;
}

// Helper function to calculate Support and Resistance levels
function calculateSupportResistance(ohlcData, lookback = 20) {
  const recent = ohlcData.slice(-lookback);
  const highs = recent.map(d => d.high);
  const lows = recent.map(d => d.low);
  
  const resistance = Math.max(...highs);
  const support = Math.min(...lows);
  
  return { support, resistance };
}

// Enhanced signal determination with multiple indicators
function determineEnhancedSignal(shortEMA, longEMA, rsi, macd) {
  if (!shortEMA || !longEMA) {
    return { signal: 'HOLD', confidence: 0, strength: 'weak' };
  }

  const diff = shortEMA - longEMA;
  const percentDiff = Math.abs(diff / longEMA) * 100;

  let signal = 'HOLD';
  let signalCount = 0;
  let totalSignals = 2; // Start with EMA signals

  // EMA Signal
  if (shortEMA > longEMA) {
    signal = 'BUY';
    signalCount++;
  } else if (shortEMA < longEMA) {
    signal = 'SELL';
    signalCount++;
  }

  // RSI Signal (oversold < 30, overbought > 70)
  if (rsi) {
    totalSignals++;
    if (rsi < 30 && signal === 'BUY') {
      signalCount++;
    } else if (rsi > 70 && signal === 'SELL') {
      signalCount++;
    } else if (rsi >= 30 && rsi <= 70) {
      signalCount += 0.5; // Neutral RSI adds half point
    }
  }

  // MACD Signal
  if (macd && macd.MACD !== undefined && macd.signal !== undefined) {
    totalSignals++;
    if (macd.MACD > macd.signal && signal === 'BUY') {
      signalCount++;
    } else if (macd.MACD < macd.signal && signal === 'SELL') {
      signalCount++;
    }
  }

  const confidence = Math.min((signalCount / totalSignals) * 100, 100);
  
  let strength = 'weak';
  if (confidence >= 75) strength = 'strong';
  else if (confidence >= 50) strength = 'moderate';

  return {
    signal,
    confidence,
    strength
  };
}

// Helper function to determine trading signal
function determineSignal(shortEMA, longEMA) {
  if (!shortEMA || !longEMA) {
    return { signal: 'HOLD', confidence: 0 };
  }

  const diff = shortEMA - longEMA;
  const percentDiff = Math.abs(diff / longEMA) * 100;

  let signal = 'HOLD';
  if (shortEMA > longEMA) {
    signal = 'BUY';
  } else if (shortEMA < longEMA) {
    signal = 'SELL';
  }

  return {
    signal,
    confidence: Math.min(percentDiff * 10, 100) // Scale to 0-100
  };
}

// GET /api/signal?symbol=EURUSD&timeframe=daily - Get trading signal for a forex pair
router.get('/signal', authMiddleware, async (req, res) => {
  try {
    const { symbol, timeframe = 'daily' } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    // Validate timeframe
    if (!TIMEFRAMES[timeframe]) {
      return res.status(400).json({ 
        error: 'Invalid timeframe',
        availableTimeframes: Object.keys(TIMEFRAMES)
      });
    }

    const symbolUpper = symbol.toUpperCase().replace('/', '');
    const forexPair = FOREX_PAIRS[symbolUpper];

    if (!forexPair) {
      return res.status(400).json({ 
        error: 'Invalid forex pair',
        availablePairs: Object.values(FOREX_PAIRS).map(p => p.name)
      });
    }

    // Fetch data from Alpha Vantage with fallback to demo data
    let timeSeries;
    let actualTimeframe = timeframe;
    let usingDemoData = false;
    
    try {
      timeSeries = await fetchForexData(forexPair.from, forexPair.to, timeframe);
    } catch (error) {
      // If intraday timeframe fails, try daily
      if (timeframe !== 'daily' && error.message.includes('No data available')) {
        console.log(`Intraday data not available for ${forexPair.name}, falling back to daily data`);
        try {
          timeSeries = await fetchForexData(forexPair.from, forexPair.to, 'daily');
          actualTimeframe = 'daily';
        } catch (dailyError) {
          // If daily also fails, use demo data
          console.log(`Daily data also failed, using demo data for ${forexPair.name}`);
          const basePrices = {
            'EURUSD': 1.0950, 'GBPUSD': 1.2650, 'USDJPY': 149.50,
            'AUDUSD': 0.6450, 'USDCAD': 1.3750, 'USDCHF': 0.8850,
            'NZDUSD': 0.5950, 'EURGBP': 0.8650, 'EURJPY': 163.50, 'GBPJPY': 189.00
          };
          timeSeries = generateDemoData(basePrices[symbolUpper] || 1.0000);
          usingDemoData = true;
          actualTimeframe = 'daily';
        }
      } else if (error.message.includes('API call frequency limit')) {
        // If rate limited, use demo data
        console.log(`API rate limit reached, using demo data for ${forexPair.name}`);
        const basePrices = {
          'EURUSD': 1.0950, 'GBPUSD': 1.2650, 'USDJPY': 149.50,
          'AUDUSD': 0.6450, 'USDCAD': 1.3750, 'USDCHF': 0.8850,
          'NZDUSD': 0.5950, 'EURGBP': 0.8650, 'EURJPY': 163.50, 'GBPJPY': 189.00
        };
        timeSeries = generateDemoData(basePrices[symbolUpper] || 1.0000);
        usingDemoData = true;
        actualTimeframe = 'daily';
      } else {
        // For other errors, still try demo data as last resort
        console.log(`Error fetching data: ${error.message}, using demo data for ${forexPair.name}`);
        const basePrices = {
          'EURUSD': 1.0950, 'GBPUSD': 1.2650, 'USDJPY': 149.50,
          'AUDUSD': 0.6450, 'USDCAD': 1.3750, 'USDCHF': 0.8850,
          'NZDUSD': 0.5950, 'EURGBP': 0.8650, 'EURJPY': 163.50, 'GBPJPY': 189.00
        };
        timeSeries = generateDemoData(basePrices[symbolUpper] || 1.0000);
        usingDemoData = true;
        actualTimeframe = 'daily';
      }
    }
    
    // Parse OHLC data
    const ohlcData = parseOHLCData(timeSeries);
    
    // Extract closing prices and highs/lows
    const closePrices = ohlcData.map(d => d.close);
    const highPrices = ohlcData.map(d => d.high);
    const lowPrices = ohlcData.map(d => d.low);
    
    // Calculate EMAs
    const shortPeriod = 10;
    const longPeriod = 20;
    
    const emaShort = calculateEMA(closePrices, shortPeriod);
    const emaLong = calculateEMA(closePrices, longPeriod);
    
    // Calculate RSI
    const rsiValues = calculateRSI(closePrices, 14);
    
    // Calculate MACD
    const macdValues = calculateMACDIndicator(closePrices);
    
    // Calculate Bollinger Bands
    const bbValues = calculateBollingerBandsIndicator(closePrices, 20, 2);
    
    // Calculate Support and Resistance
    const { support, resistance } = calculateSupportResistance(ohlcData, 20);
    
    // Get latest values
    const latestShortEMA = emaShort ? emaShort[emaShort.length - 1] : null;
    const latestLongEMA = emaLong ? emaLong[emaLong.length - 1] : null;
    const latestPrice = closePrices[closePrices.length - 1];
    const latestRSI = rsiValues ? rsiValues[rsiValues.length - 1] : null;
    const latestMACD = macdValues ? macdValues[macdValues.length - 1] : null;
    const latestBB = bbValues ? bbValues[bbValues.length - 1] : null;
    
    // Determine enhanced signal
    const { signal, confidence, strength } = determineEnhancedSignal(
      latestShortEMA, 
      latestLongEMA, 
      latestRSI, 
      latestMACD
    );
    
    // Prepare EMA data for charting (align with dates)
    const emaShortData = emaShort ? ohlcData.slice(-emaShort.length).map((d, i) => ({
      time: d.time,
      value: emaShort[i]
    })) : [];
    
    const emaLongData = emaLong ? ohlcData.slice(-emaLong.length).map((d, i) => ({
      time: d.time,
      value: emaLong[i]
    })) : [];

    // Prepare RSI data for charting
    const rsiData = rsiValues ? ohlcData.slice(-rsiValues.length).map((d, i) => ({
      time: d.time,
      value: rsiValues[i]
    })) : [];

    // Prepare MACD data for charting
    const macdData = macdValues ? ohlcData.slice(-macdValues.length).map((d, i) => ({
      time: d.time,
      MACD: macdValues[i].MACD,
      signal: macdValues[i].signal,
      histogram: macdValues[i].histogram
    })) : [];

    // Prepare Bollinger Bands data for charting
    const bbData = bbValues ? ohlcData.slice(-bbValues.length).map((d, i) => ({
      time: d.time,
      upper: bbValues[i].upper,
      middle: bbValues[i].middle,
      lower: bbValues[i].lower
    })) : [];

    // Calculate trend direction
    const priceChange = ohlcData[ohlcData.length - 1].close - ohlcData[ohlcData.length - 2].close;
    const priceChangePercent = (priceChange / ohlcData[ohlcData.length - 2].close) * 100;

    // Calculate PIPs (percentage in point)
    // For JPY pairs, 1 pip = 0.01, for others 1 pip = 0.0001
    const isJPYPair = forexPair.to === 'JPY';
    const pipMultiplier = isJPYPair ? 100 : 10000;
    const priceChangePips = priceChange * pipMultiplier;
    
    // Calculate potential profit/loss in pips for the signal
    let potentialPips = 0;
    if (signal === 'BUY') {
      potentialPips = (resistance - latestPrice) * pipMultiplier;
    } else if (signal === 'SELL') {
      potentialPips = (latestPrice - support) * pipMultiplier;
    }

    // Calculate typical spread (estimated)
    const estimatedSpread = isJPYPair ? 0.02 : 0.0002; // 2 pips typical spread
    const spreadPips = estimatedSpread * pipMultiplier;

    // Calculate margin requirement (assuming 1:100 leverage)
    const standardLot = 100000; // Standard lot size
    const leverage = 100;
    const marginRequired = (latestPrice * standardLot) / leverage;

    // Calculate risk/reward ratio
    let riskRewardRatio = 0;
    if (signal === 'BUY') {
      const risk = latestPrice - support;
      const reward = resistance - latestPrice;
      riskRewardRatio = risk > 0 ? reward / risk : 0;
    } else if (signal === 'SELL') {
      const risk = resistance - latestPrice;
      const reward = latestPrice - support;
      riskRewardRatio = risk > 0 ? reward / risk : 0;
    }

    res.json({
      symbol: forexPair.name,
      price: latestPrice,
      signal,
      confidence: confidence.toFixed(2),
      strength,
      priceChange: priceChange.toFixed(5),
      priceChangePercent: priceChangePercent.toFixed(2),
      demoMode: usingDemoData,
      timeframe: actualTimeframe,
      forex: {
        priceChangePips: priceChangePips.toFixed(1),
        potentialPips: potentialPips.toFixed(1),
        spreadPips: spreadPips.toFixed(1),
        marginRequired: marginRequired.toFixed(2),
        leverage: `1:${leverage}`,
        lotSize: '1 standard lot (100,000 units)',
        pipValue: isJPYPair ? '0.01' : '0.0001',
        riskRewardRatio: riskRewardRatio.toFixed(2)
      },
      indicators: {
        ema10: latestShortEMA ? latestShortEMA.toFixed(5) : null,
        ema20: latestLongEMA ? latestLongEMA.toFixed(5) : null,
        rsi: latestRSI ? latestRSI.toFixed(2) : null,
        macd: latestMACD ? {
          MACD: latestMACD.MACD.toFixed(5),
          signal: latestMACD.signal.toFixed(5),
          histogram: latestMACD.histogram.toFixed(5)
        } : null,
        bollingerBands: latestBB ? {
          upper: latestBB.upper.toFixed(5),
          middle: latestBB.middle.toFixed(5),
          lower: latestBB.lower.toFixed(5)
        } : null,
        support: support.toFixed(5),
        resistance: resistance.toFixed(5)
      },
      chartData: {
        ohlc: ohlcData.slice(-60), // Last 60 data points for chart
        ema10: emaShortData.slice(-60),
        ema20: emaLongData.slice(-60),
        rsi: rsiData.slice(-60),
        macd: macdData.slice(-60),
        bollingerBands: bbData.slice(-60)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Signal generation error:', error);
    
    if (error.message.includes('API call frequency')) {
      return res.status(429).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Error generating trading signal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/forex-pairs - Get list of available forex pairs
router.get('/forex-pairs', authMiddleware, (req, res) => {
  const pairs = Object.entries(FOREX_PAIRS).map(([key, value]) => ({
    symbol: key,
    name: value.name,
    from: value.from,
    to: value.to
  }));

  res.json({ pairs });
});

module.exports = router;
