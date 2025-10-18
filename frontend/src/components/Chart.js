import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { useTheme } from '../context/ThemeContext';
import './Chart.css';

function Chart({ chartData, symbol }) {
  const chartContainerRef = useRef();
  const rsiContainerRef = useRef();
  const chartRef = useRef(null);
  const rsiChartRef = useRef(null);
  const { theme } = useTheme();
  const [showBB, setShowBB] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  useEffect(() => {
    if (!chartData || !chartContainerRef.current) return;

    // Clear previous charts safely
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {
        // Chart already disposed, ignore error
      }
      chartRef.current = null;
    }

    if (rsiChartRef.current) {
      try {
        rsiChartRef.current.remove();
      } catch (e) {
        // Chart already disposed, ignore error
      }
      rsiChartRef.current = null;
    }

    const chartOptions = {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: theme === 'dark' ? '#1e293b' : '#ffffff' },
        textColor: theme === 'dark' ? '#f1f5f9' : '#000000',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#334155' : '#e0e0e0' },
        horzLines: { color: theme === 'dark' ? '#334155' : '#e0e0e0' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#334155' : '#e0e0e0',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#334155' : '#e0e0e0',
        timeVisible: true,
        rightOffset: 5,
      },
    };

    // Create main price chart
    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // Format data for candlestick
    const candlestickData = chartData.ohlc.map(d => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(candlestickData);

    // Add Bollinger Bands
    if (showBB && chartData.bollingerBands && chartData.bollingerBands.length > 0) {
      const bbUpper = chart.addLineSeries({
        color: '#9333ea',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        title: 'BB Upper',
      });
      bbUpper.setData(chartData.bollingerBands.map(d => ({
        time: d.time,
        value: d.upper
      })));

      const bbMiddle = chart.addLineSeries({
        color: '#9333ea',
        lineWidth: 1,
        title: 'BB Middle',
      });
      bbMiddle.setData(chartData.bollingerBands.map(d => ({
        time: d.time,
        value: d.middle
      })));

      const bbLower = chart.addLineSeries({
        color: '#9333ea',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        title: 'BB Lower',
      });
      bbLower.setData(chartData.bollingerBands.map(d => ({
        time: d.time,
        value: d.lower
      })));
    }

    // Add EMA 10 line
    if (chartData.ema10 && chartData.ema10.length > 0) {
      const ema10Series = chart.addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
        title: 'EMA 10',
      });
      ema10Series.setData(chartData.ema10);
    }

    // Add EMA 20 line
    if (chartData.ema20 && chartData.ema20.length > 0) {
      const ema20Series = chart.addLineSeries({
        color: '#f59e0b',
        lineWidth: 2,
        title: 'EMA 20',
      });
      ema20Series.setData(chartData.ema20);
    }

    // Fit content
    chart.timeScale().fitContent();

    // Create RSI chart
    if (showRSI && chartData.rsi && chartData.rsi.length > 0 && rsiContainerRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        width: rsiContainerRef.current.clientWidth,
        height: 150,
        layout: {
          background: { color: theme === 'dark' ? '#1e293b' : '#ffffff' },
          textColor: theme === 'dark' ? '#f1f5f9' : '#000000',
        },
        grid: {
          vertLines: { color: theme === 'dark' ? '#334155' : '#e0e0e0' },
          horzLines: { color: theme === 'dark' ? '#334155' : '#e0e0e0' },
        },
        rightPriceScale: {
          borderColor: theme === 'dark' ? '#334155' : '#e0e0e0',
        },
        timeScale: {
          borderColor: theme === 'dark' ? '#334155' : '#e0e0e0',
          timeVisible: true,
          rightOffset: 5,
        },
      });

      rsiChartRef.current = rsiChart;

      const rsiSeries = rsiChart.addLineSeries({
        color: '#8b5cf6',
        lineWidth: 2,
        title: 'RSI',
      });
      rsiSeries.setData(chartData.rsi);

      // Add RSI overbought/oversold lines
      const overboughtLine = rsiChart.addLineSeries({
        color: '#ef4444',
        lineWidth: 1,
        lineStyle: 2,
      });
      overboughtLine.setData(chartData.rsi.map(d => ({ time: d.time, value: 70 })));

      const oversoldLine = rsiChart.addLineSeries({
        color: '#22c55e',
        lineWidth: 1,
        lineStyle: 2,
      });
      oversoldLine.setData(chartData.rsi.map(d => ({ time: d.time, value: 30 })));

      rsiChart.timeScale().fitContent();

      // Sync time scales
      chart.timeScale().subscribeVisibleTimeRangeChange(() => {
        if (rsiChartRef.current) {
          try {
            rsiChart.timeScale().setVisibleRange(chart.timeScale().getVisibleRange());
          } catch (e) {
            // Ignore
          }
        }
      });

      rsiChart.timeScale().subscribeVisibleTimeRangeChange(() => {
        if (chartRef.current) {
          try {
            chart.timeScale().setVisibleRange(rsiChart.timeScale().getVisibleRange());
          } catch (e) {
            // Ignore
          }
        }
      });
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        try {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        } catch (e) {
          // Chart disposed, ignore
        }
      }
      if (rsiContainerRef.current && rsiChartRef.current) {
        try {
          rsiChartRef.current.applyOptions({
            width: rsiContainerRef.current.clientWidth,
          });
        } catch (e) {
          // Chart disposed, ignore
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          // Chart already disposed, ignore error
        }
        chartRef.current = null;
      }
      if (rsiChartRef.current) {
        try {
          rsiChartRef.current.remove();
        } catch (e) {
          // Chart already disposed, ignore error
        }
        rsiChartRef.current = null;
      }
    };
  }, [chartData, theme, showBB, showRSI]);

  if (!chartData) {
    return (
      <div className="chart-container">
        <div className="chart-placeholder">No chart data available</div>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3>{symbol} Price Chart</h3>
        <div className="chart-controls">
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
              EMA 10
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
              EMA 20
            </span>
            {showBB && (
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#9333ea' }}></span>
                Bollinger Bands
              </span>
            )}
          </div>
          <div className="chart-toggles">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showBB}
                onChange={(e) => setShowBB(e.target.checked)}
              />
              <span>Bollinger Bands</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showRSI}
                onChange={(e) => setShowRSI(e.target.checked)}
              />
              <span>RSI</span>
            </label>
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} className="chart-container" />
      
      {showRSI && chartData.rsi && chartData.rsi.length > 0 && (
        <div className="rsi-chart-section">
          <div className="rsi-header">
            <h4>RSI (14)</h4>
            <div className="rsi-legend">
              <span className="rsi-level overbought">Overbought (70)</span>
              <span className="rsi-level oversold">Oversold (30)</span>
            </div>
          </div>
          <div ref={rsiContainerRef} className="rsi-chart-container" />
        </div>
      )}
    </div>
  );
}

export default Chart;
