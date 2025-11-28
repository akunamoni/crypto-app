import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";

function LiveData() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchterm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true); // <-- loader state

  const ws = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentItems = data.slice(indexOfFirst, indexOfLast);

  const totalPages =
    searchTerm.length && filtered.length > 0
      ? Math.ceil(filtered.length / itemsPerPage)
      : Math.ceil(data.length / itemsPerPage);

  // ------------------------------
  // Fetch initial data from Binance
  // ------------------------------
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true); // show loader
      const response = await axios.get(
        "https://api.binance.com/api/v3/ticker/24hr"
      );

      const filteredData = response.data.filter((i) =>
        i.symbol.endsWith("USDT")
      );

      setData(filteredData);
      setLoading(false); // hide loader
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setLoading(false); // hide loader even on error
    }
  }, []);

  // ------------------------------
  // WebSocket update handler
  // ------------------------------
  const handleWebSocketMessages = useCallback((event) => {
    const messages = JSON.parse(event.data);
    if (!Array.isArray(messages)) return;

    setData((prev) => {
      const updated = [...prev];

      messages.forEach((msg) => {
        if (msg.ping) {
          ws.current?.send(JSON.stringify({ pong: msg.ping }));
          return;
        }

        if (!msg.s.endsWith("USDT")) return;

        const idx = updated.findIndex((o) => o.symbol === msg.s);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], ...msg };
        }
      });

      return updated;
    });
  }, []);

  // ------------------------------
  // Connect WebSocket + fetch initial data
  // ------------------------------
  useEffect(() => {
    fetchInitialData();

    ws.current = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");
    ws.current.onmessage = handleWebSocketMessages;

    return () => ws.current?.close();
  }, [fetchInitialData, handleWebSocketMessages]);

  // ------------------------------
  // Filtering on search
  // ------------------------------
  useEffect(() => {
    if (searchTerm.length === 0) {
      setFiltered([]);
      return;
    }

    const result = data.filter((item) =>
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFiltered(result);
  }, [searchTerm, data]);

  // ------------------------------
  // Pagination change
  // ------------------------------
  const handlePageChange = (page) => setCurrentPage(page);

  // ------------------------------
  // Which data to show?
  // ------------------------------
  const rowsToShow =
    searchTerm.length && filtered.length > 0 ? filtered : currentItems;

  return (
    <div className="mt-5 w-full flex justify-center">
      <div className="w-[90%] min-h-[500px]">
        {/* Search */}
        <div className="mb-3 w-1/5">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchterm(e.target.value)}
            className="w-full border border-gray-3 rounded shadow-sm py-2 pr-3 pl-8 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
            placeholder="Search symbols..."
          />
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue"></div>
          </div>
        ) : (
          <>
            {/* Table */}
            <table className="text-center w-full shadow-lg border-collapse">
              <thead className="bg-blue-400 text-white">
                <tr>
                  <th className="font-semibold p-3">Symbol</th>
                  <th className="font-semibold p-3">Open</th>
                  <th className="font-semibold p-3">High</th>
                  <th className="font-semibold p-3">Low</th>
                  <th className="font-semibold p-3">Close</th>
                  <th className="font-semibold p-3">Change</th>
                  <th className="font-semibold p-3">Change%</th>
                  <th className="font-semibold p-3">Volume</th>
                </tr>
              </thead>

              <tbody>
                {rowsToShow.map((item) => (
                  <tr
                    key={item.symbol}
                    className="p-4 border border-gray-2 cursor-pointer hover:bg-gray-2"
                  >
                    <td className="p-2 font-semibold text-blue">{item.symbol}</td>
                    <td className="p-2 text-blue">{item.openPrice}</td>
                    <td className="p-2 text-blue">{item.highPrice}</td>
                    <td className="p-2 text-blue">{item.lowPrice}</td>
                    <td className="p-2 text-blue">{item.prevClosePrice}</td>

                    <td
                      className={`p-2 font-semibold ${
                        item.priceChange >= 0 ? "text-green" : "text-red"
                      }`}
                    >
                      {item.priceChange}
                    </td>

                    <td
                      className={`p-2 font-semibold ${
                        item.priceChangePercent >= 0 ? "text-green" : "text-red"
                      }`}
                    >
                      {item.priceChangePercent}%
                    </td>

                    <td className="p-2 text-blue">{item.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-end mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LiveData;
