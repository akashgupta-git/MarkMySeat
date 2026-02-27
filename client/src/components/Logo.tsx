import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: "w-7 h-7", svg: "w-4 h-4", text: "text-lg" },
  md: { box: "w-9 h-9", svg: "w-5 h-5", text: "text-xl" },
  lg: { box: "w-14 h-14", svg: "w-7 h-7", text: "text-2xl" },
  xl: { box: "w-20 h-20", svg: "w-12 h-12", text: "text-3xl" },
};

const Logo: React.FC<LogoProps> = ({ size = "md", showText = true, className = "" }) => {
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`${s.box} bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20`}
      >
        <svg viewBox="0 0 32 32" className={s.svg}>
          <path d="M6 24V8l10 10 10-10v16" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {showText && (
        <span className={`text-white font-bold ${s.text} tracking-tight`}>
          MarkMySeat
        </span>
      )}
    </span>
  );
};

export default Logo;
