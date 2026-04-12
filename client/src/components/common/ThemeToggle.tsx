import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

interface ThemeToggleProps {
  /** Use "dark-bg" when the toggle sits on a dark/green background (navbar).
   *  Use "light-bg" when it sits on a light/white background (admin header). */
  variant?: "dark-bg" | "light-bg";
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = "dark-bg" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [pressed, setPressed] = useState(false);

  const isOnLight = variant === "light-bg";

  const handleClick = () => {
    setPressed(true);
    toggleTheme();
    setTimeout(() => setPressed(false), 300);
  };

  // Colours for icon
  const iconColor = isOnLight
    ? isDark
      ? "#ca8a04"   // yellow-600 — sun on light header in dark mode
      : "#15803d"   // green-700 — moon on light header in light mode
    : isDark
    ? "#fde047"     // yellow-300 — sun on dark header
    : "#d1fae5";    // green-100 — moon on dark header

  // Hover / pressed backgrounds
  const hoverBg = isOnLight
    ? "rgba(0,0,0,0.06)"
    : "rgba(255,255,255,0.15)";
  const pressedBg = isOnLight
    ? "rgba(0,0,0,0.10)"
    : "rgba(255,255,255,0.22)";

  return (
    <>
      <style>{`
        @keyframes theme-icon-in {
          from { opacity: 0; transform: rotate(-60deg) scale(0.5); }
          to   { opacity: 1; transform: rotate(0deg)   scale(1);   }
        }
        .theme-icon-anim { animation: theme-icon-in 0.3s cubic-bezier(.16,1,.3,1) forwards; }
      `}</style>

      <button
        onClick={handleClick}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className="relative flex items-center justify-center w-10 h-10 rounded-full focus:outline-none transition-all duration-150"
        style={{
          background: pressed ? pressedBg : "transparent",
          boxShadow: pressed
            ? isOnLight
              ? "inset 0 2px 5px rgba(0,0,0,0.12)"
              : "inset 0 2px 5px rgba(0,0,0,0.25)"
            : "none",
          transform: pressed ? "scale(0.90)" : "scale(1)",
        }}
        onMouseEnter={(e) => {
          if (!pressed) e.currentTarget.style.background = hoverBg;
        }}
        onMouseLeave={(e) => {
          if (!pressed) e.currentTarget.style.background = "transparent";
        }}
      >
        <span key={theme} className="theme-icon-anim flex items-center justify-center">
          {isDark ? (
            /* Sun — click to go light */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={iconColor}
              style={{ width: 19, height: 19 }}
              aria-hidden="true"
            >
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          ) : (
            /* Moon — click to go dark */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={iconColor}
              style={{ width: 19, height: 19 }}
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </button>
    </>
  );
};

export default ThemeToggle;
