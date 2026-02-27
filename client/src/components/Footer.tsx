import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <Link to="/" className="group">
            <Logo size="sm" />
          </Link>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">About</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Contact</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Privacy</a>
          </div>

          {/* Credit */}
          <p className="text-sm text-gray-600">
            Built by <span className="text-gray-400 font-medium">Akash</span>
          </p>
        </div>

        <div className="border-t border-white/5 mt-6 pt-4 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} MarkMySeat. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
