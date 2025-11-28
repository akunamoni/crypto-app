import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createChart } from "lightweight-charts";
import axios from "axios";
import { fromZonedTime } from "date-fns-tz";

function CandleStickChart({ symbol = "BTCUSDT", interval = "4h", containerRef }) {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const isFetchingRef = useRef(false);
  const [chartData, setChartData] = useState([]);

  // Convert timestamp to IST (seconds)
  const convertToIST = (timestamp) =>
    Math.floor(fromZonedTime(new Date(timestamp), "Asia/Kolkata").getTime() / 1000);

  // ------------------ Fetch Initial Candle Data ------------------
  const fetchInitialData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`
      );
      const formatted = data.map((item) => ({
        time: convertToIST(item[0]),
        open: +item[1],
        high: +item[2],
        low: +item[3],
        close: +item[4],
      }));
      setChartData(formatted);
    } catch (err) {
      console.error("Initial fetch error:", err);
    }
  }, [symbol, interval]);

  // ------------------ Fetch More Data on Scroll ------------------
  const fetchMoreData = useCallback(
    async (endTime) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const { data } = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&endTime=${endTime}`
        );
        const newData = data.map((item) => ({
          time: convertToIST(item[0]),
          open: +item[1],
          high: +item[2],
          low: +item[3],
          close: +item[4],
        }));

        setChartData((prev) => {
          const merged = [...newData, ...prev];
          const map = new Map();
          merged.forEach((c) => map.set(c.time, c));
          return Array.from(map.values()).sort((a, b) => a.time - b.time);
        });
      } catch (err) {
        console.error("Error fetching more:", err);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [symbol, interval]
  );

  // ------------------ WebSocket for Realtime ------------------
  const handleWSMessage = useCallback((e) => {
    const msg = JSON.parse(e.data);
    if (!msg.k) return;
    const k = msg.k;
    const newCandle = {
      time: convertToIST(k.t),
      open: +k.o,
      high: +k.h,
      low: +k.l,
      close: +k.c,
    };
    setChartData((prev) => {
      const index = prev.findIndex((c) => c.time === newCandle.time);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newCandle;
        return updated;
      }
      return [...prev, newCandle];
    });
  }, []);

  const connectWS = useCallback(() => {
    if (!symbol || !interval) return;
    const wsURL = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`;
    wsRef.current = new WebSocket(wsURL);

    wsRef.current.onopen = () => console.log("WebSocket connected:", wsURL);
    wsRef.current.onmessage = handleWSMessage;
    wsRef.current.onclose = () => setTimeout(connectWS, 2000);
    wsRef.current.onerror = (err) => wsRef.current.close();
  }, [symbol, interval, handleWSMessage]);

  // ------------------ Init ------------------
  useEffect(() => {
    fetchInitialData();
    connectWS();
    return () => wsRef.current?.close();
  }, [fetchInitialData, connectWS]);

  // ------------------ Chart Creation & Responsive ------------------
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: { background: { color: "#ffffff" }, textColor: "#000" },
      grid: { vertLines: { color: "#e1e1e1" }, horzLines: { color: "#e1e1e1" } },
      crosshair: { mode: 1 },
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#4caf50",
      downColor: "#f44336",
      wickUpColor: "#4caf50",
      wickDownColor: "#f44336",
      borderVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Load more data when scrolling left
    chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
      const earliest = chartData[0]?.time;
      if (range.from <= earliest) fetchMoreData(earliest * 1000);
    });

    // Auto-resize using ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [containerRef, chartData, fetchMoreData]);

  // ------------------ Update Chart Data ------------------
  useEffect(() => {
    if (candleSeriesRef.current && chartData.length > 0) {
      candleSeriesRef.current.setData(chartData);
    }
  }, [chartData]);

  return null; // Chart is rendered directly into containerRef
}

export default CandleStickChart;
