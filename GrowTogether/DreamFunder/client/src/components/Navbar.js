import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";

function Navbar() {
  const { connectWallet, connected, userAddress } = useWeb3Context();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path
      ? "text-blue-700 dark:text-blue-500"
      : "text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-500";
  };

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 px-4 lg:px-6 py-2.5">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        <Link to="/" className="flex items-center">
          <svg
            className="mr-3 h-8 text-gray-900 dark:text-white"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            DreamFunder
          </span>
        </Link>
        <button
          onClick={toggleMenu}
          type="button"
          className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <div
          ref={menuRef}
          className={`${
            isMenuOpen ? "block" : "hidden"
          } w-full md:block md:w-auto`}
          id="navbar-default"
        >
          <ul className="flex flex-col p-4 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link
                to="/"
                className={`block py-2 px-3 rounded md:p-0 ${isActive("/")}`}
                onClick={closeMenu}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/campaigns"
                className={`block py-2 px-3 rounded md:p-0 ${isActive(
                  "/campaigns"
                )}`}
                onClick={closeMenu}
              >
                Campaigns
              </Link>
            </li>
            <li>
              <Link
                to="/create-campaign"
                className={`block py-2 px-3 rounded md:p-0 ${isActive(
                  "/create-campaign"
                )}`}
                onClick={closeMenu}
              >
                Create Campaign
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className={`block py-2 px-3 rounded md:p-0 ${isActive(
                  "/dashboard"
                )}`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            </li>
            <li className="md:hidden">
              {!connected ? (
                <button
                  onClick={() => {
                    connectWallet();
                    closeMenu();
                  }}
                  type="button"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  Connect Wallet
                </button>
              ) : (
                <span className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                  Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </span>
              )}
            </li>
          </ul>
        </div>
        <div className="hidden md:flex items-center lg:order-2">
          {!connected ? (
            <button
              onClick={() => {
                connectWallet();
                closeMenu();
              }}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 mr-1 md:mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Connect Wallet
            </button>
          ) : (
            <span className="text-gray-800 dark:text-white font-medium text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2">
              Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
