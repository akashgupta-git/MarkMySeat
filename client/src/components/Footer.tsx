import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-4 h-4">
                <path d="M6 24V8l10 10 10-10v16" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-lg group-hover:text-primary transition-colors">
              MarkMySeat
            </span>
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
