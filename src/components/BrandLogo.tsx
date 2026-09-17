import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'icon-only' | 'hero';
  theme?: 'light' | 'dark';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'compact',
  theme = 'light',
  className = ''
}) => {
  const isDark = theme === 'dark';
  const axeColor = isDark ? '#FFFFFF' : '#1E084A';
  const comptaColor = isDark ? '#A78BFA' : '#7024E3';
  const baselineColor = isDark ? '#DDD6FE' : '#250D5A';

  // SVG dimensions according to variant
  let iconSize = 36;
  if (variant === 'hero') iconSize = 68;
  if (variant === 'full') iconSize = 44;
  if (variant === 'icon-only') iconSize = 38;

  return (
    <div className={`flex items-center gap-3 ${variant === 'hero' ? 'flex-col text-center' : ''} ${className}`}>
      {/* Official Emblem: Dynamic Arched 'A' Ribbon + 3 Financial Growth Bars + Calculator Operators Box */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id={`ribbonGrad-${theme}`} x1="50" y1="180" x2="160" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#23085A" />
            <stop offset="35%" stopColor="#4C1D95" />
            <stop offset="70%" stopColor="#7024E3" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id={`barGrad1-${theme}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#2E1065" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>

          <linearGradient id={`barGrad2-${theme}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#3B0764" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>

          <linearGradient id={`barGrad3-${theme}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          <linearGradient id={`calcGrad-${theme}`} x1="150" y1="160" x2="200" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="60%" stopColor="#7024E3" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>

        {/* Dynamic Sweeping Ribbon 'A' */}
        <path
          d="M 62 168 C 54 167 54 156 60 148 C 84 116 108 72 126 44 C 131 38 139 38 143 43 C 162 70 174 98 178 108 C 174 108 160 108 148 108 C 112 108 82 140 62 168 Z"
          fill={`url(#ribbonGrad-${theme})`}
        />
        <path
          d="M 62 168 C 78 142 110 109 146 109 C 158 109 168 109 176 108 C 172 100 160 74 143 45 C 139 39 131 39 126 45 C 108 73 84 117 60 150 C 55 156 56 165 62 168 Z"
          fill="none"
          stroke={`url(#ribbonGrad-${theme})`}
          strokeWidth="2"
        />

        {/* 3 Financial Growth Bars */}
        <rect x="108" y="148" width="11" height="22" rx="5.5" fill={`url(#barGrad1-${theme})`} />
        <rect x="126" y="136" width="11" height="34" rx="5.5" fill={`url(#barGrad2-${theme})`} />
        <rect x="144" y="122" width="11" height="48" rx="5.5" fill={`url(#barGrad3-${theme})`} />

        {/* Rounded Calculator Screen & Operators Box */}
        <path
          d="M 168 110 L 194 110 C 202 110 208 116 208 124 L 208 156 C 208 164 202 170 194 170 L 168 170"
          fill="none"
          stroke={`url(#calcGrad-${theme})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Calculator Dividing Crosshair */}
        <line x1="182" y1="120" x2="182" y2="160" stroke={`url(#calcGrad-${theme})`} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="165" y1="140" x2="200" y2="140" stroke={`url(#calcGrad-${theme})`} strokeWidth="2.2" strokeLinecap="round" />

        {/* Arithmetic Operators: +, -, x, = */}
        {/* Top-Left: + */}
        <line x1="170" y1="128" x2="178" y2="128" stroke={`url(#calcGrad-${theme})`} strokeWidth="2.4" strokeLinecap="round" />
        <line x1="174" y1="124" x2="174" y2="132" stroke={`url(#calcGrad-${theme})`} strokeWidth="2.4" strokeLinecap="round" />

        {/* Top-Right: - */}
        <line x1="187" y1="128" x2="195" y2="128" stroke={`url(#calcGrad-${theme})`} strokeWidth="2.4" strokeLinecap="round" />

        {/* Bottom-Left: x */}
        <line x1="171" y1="149" x2="177" y2="155" stroke={`url(#calcGrad-${theme})`} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="177" y1="149" x2="171" y2="155" stroke={`url(#calcGrad-${theme})`} strokeWidth="2.2" strokeLinecap="round" />

        {/* Bottom-Right: = */}
        <line x1="187" y1="150" x2="195" y2="150" stroke={`url(#calcGrad-${theme})`} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="187" y1="154" x2="195" y2="154" stroke={`url(#calcGrad-${theme})`} strokeWidth="2.2" strokeLinecap="round" />
      </svg>

      {/* Typography: AxeCompta + Slogan Baseline */}
      {variant !== 'icon-only' && (
        <div className={`flex flex-col ${variant === 'hero' ? 'items-center' : 'items-start'}`}>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-heading tracking-tight leading-none ${
                variant === 'hero' ? 'text-4xl font-black' : variant === 'full' ? 'text-2xl font-extrabold' : 'text-xl font-extrabold'
              }`}
              style={{ color: axeColor }}
            >
              Axe<span style={{ color: comptaColor }}>Compta</span>
            </span>
            <span className="px-1.5 py-0.5 bg-[#EDE9FE] text-[#7024E3] text-[9px] font-bold tracking-wider uppercase rounded font-mono border border-[#DDD6FE]">
              SYSCOHADA
            </span>
          </div>

          {(variant === 'full' || variant === 'hero') && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-3 h-[1px] bg-[#7024E3]/40" />
              <span
                className="text-[8.5px] font-bold tracking-[0.2em] uppercase"
                style={{ color: baselineColor }}
              >
                MAÎTRISE • FIABILITÉ • PERFORMANCE
              </span>
              <span className="w-3 h-[1px] bg-[#7024E3]/40" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
