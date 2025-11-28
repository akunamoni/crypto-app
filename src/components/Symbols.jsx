import React, { useState, useEffect, useRef } from "react";
import lensSvg from "../assets/svg/lens.svg";

const SymbolsDropdown = ({ selectedOption, setSelectedOption, data }) => {
  const [searchTerm, setSearchTerm] = useState(selectedOption);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef();

  const handleSelect = (symbol) => {
    setSelectedOption(symbol);
    setSearchTerm(symbol);
    setIsOpen(false);
  };

  // -----------------------------
  // Filter symbols on search text
  // -----------------------------
  useEffect(() => {
    if (!data?.symbols) return;

    const filtered = data.symbols.filter((s) =>
      s.symbol.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    setFilteredOptions(filtered);
  }, [searchTerm, data]);

  // -----------------------------
  // Close dropdown when clicking outside
  // -----------------------------
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={dropdownRef} className="inline-block w-28 ml-2">
      <div className="relative">
        {/* Search field */}
        <div className="relative">
          <img
            className="absolute top-[9px] left-2 h-[1.3rem] w-[1.3rem]"
            src={lensSvg}
            alt="lens"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onClick={() => setIsOpen(true)}
            placeholder="Symbol..."
            className="w-full border border-gray-3 rounded py-2 pr-3 pl-8 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
          />
        </div>

        {/* Dropdown menu */}
        {isOpen && data?.symbols && (
          <div className="absolute mt-1 w-full bg-white border border-gray-3 rounded shadow-lg z-20">
            <ul className="max-h-60 overflow-y-auto cursor-pointer">

              {/* When search term is empty → show all symbols */}
              {searchTerm.length === 0 &&
                data.symbols.map((value, index) => (
                  <li
                    key={index}
                    className="py-2 px-3 hover:bg-gray-2"
                    onClick={() => handleSelect(value.symbol)}
                  >
                    {value.symbol}
                  </li>
                ))}

              {/* When typing → show filtered results */}
              {searchTerm.length > 0 && filteredOptions.length > 0 &&
                filteredOptions.map((value, index) => (
                  <li
                    key={index}
                    className="py-2 px-3 hover:bg-gray-2"
                    onClick={() => handleSelect(value.symbol)}
                  >
                    {value.symbol}
                  </li>
                ))}

              {/* No results */}
              {searchTerm.length > 0 && filteredOptions.length === 0 && (
                <li className="py-2 px-3 text-gray-5">No options found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymbolsDropdown;
