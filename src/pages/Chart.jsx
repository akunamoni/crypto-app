import { useEffect, useState, useRef } from "react";
import CandleStickChart from "../components/CandleStickChart";
import axios from "axios";
import SymbolsDropdown from "../components/Symbols";
import clockSvg from "../assets/svg/clock.svg";

const ChartPage = () => {
  const [exchangeInfo, setExchangeInfo] = useState([]);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("4h");
  const chartContainerRef = useRef(null);

  const timeframes = [
    "1s",
    "1m",
    "3m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "4h",
    "6h",
    "8h",
    "12h",
    "1d",
    "3d",
    "1w",
    "1M",
  ];

  const fetchExchangeInfo = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/exchangeInfo"
      );
      setExchangeInfo(response.data.symbols);
    } catch (err) {
      console.error("Error fetching exchangeInfo:", err);
    }
  };

  useEffect(() => {
    fetchExchangeInfo();
  }, []);

  return (
    <div className="App w-full h-full flex flex-col">

      {/* Header */}
      <div className="bg-white py-3 w-full shadow-lg flex items-center gap-4 px-4">
        {/* Symbol Dropdown */}
        <SymbolsDropdown
          selectedOption={symbol}
          setSelectedOption={setSymbol}
          data={exchangeInfo}
        />

        {/* Timeframe Dropdown */}
        <div className="relative inline-block">
          <img
            className="absolute top-[9px] left-4 h-[1.3rem] w-[1.3rem]"
            src={clockSvg}
            alt="clock"
          />
          <select
            className="border border-gray-3 rounded py-2 pl-10 pr-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue mx-2"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            {timeframes.map((value, index) => (
              <option key={index} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        className="relative  flex-1 w-full mx-8"
        style={{ minHeight: "460px" ,minWidth:"300px",width:"1200px"}} // ensures chart is visible
      >
        <CandleStickChart
          symbol={symbol}
          interval={timeframe}
          containerRef={chartContainerRef} // pass ref for responsive resizing
        />
      </div>
    </div>
  );
};

export default ChartPage;
