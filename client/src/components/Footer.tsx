import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Film, Heart, Github, Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.04] mt-auto relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link to="/" className="group">
              <Logo size="sm" />
            </Link>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Film className="w-3 h-3" />
              Your premium movie booking experience
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            {[
              { label: "About", href: "#" },
              { label: "Contact", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Privacy", href: "#" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-600 hover:text-white transition-colors duration-300 text-xs font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Social + Credit */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-3">
              <a href="https://github.com/akashgupta-git" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 border border-white/[0.04]">
                <Github className="w-3.5 h-3.5" />
              </a>
              <a href="mailto:contact@markmyseat.com" className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 border border-white/[0.04]">
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by{" "}
              <span className="text-gray-400 font-medium">Akash</span>
            </p>
          </div>
        </div>

        <div className="border-t border-white/[0.04] mt-8 pt-4 text-center text-[10px] text-gray-700 tracking-wide">
          &copy; {new Date().getFullYear()} MarkMySeat. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;