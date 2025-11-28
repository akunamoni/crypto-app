import React from "react";
import cryptoSvg from "../assets/svg/bitcoinSvg.svg";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-400 text-white fixed w-full shadow-lg z-50">
      <div className="flex items-center justify-between px-6 py-3 w-full">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <img
            src={cryptoSvg}
            alt="crypto logo"
            className="h-10 w-10 cursor-pointer"
          />
          <span className="text-2xl font-semibold ">Crypto</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:block">
          <ul className="flex gap-10 text-lg">
            <li>
              <Link
                to="/"
                className="px-3 py-1 rounded hover:bg-blue/20 transition-all"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/chart"
                className="px-3 py-1 rounded hover:bg-blue/20 transition-all"
              >
                Chart
              </Link>
            </li>
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
