import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]`}
    >
      {/* Background Circle / Shield */}
      <circle cx="50" cy="50" r="48" fill="url(#goldGradient)" fillOpacity="0.05" stroke="url(#goldGradient)" strokeWidth="0.5" />
      
      {/* Main Pulse Line */}
      <path 
        d="M20 60H35L42 30L58 75L65 45L72 60H80" 
        stroke="url(#goldGradient)" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="animate-heartbeat"
      />
      
      {/* Stylized 'G' / Outer Ring */}
      <path 
        d="M75 35C70 25 60 20 50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50V45" 
        stroke="url(#goldGradient)" 
        strokeWidth="5" 
        strokeLinecap="round"
      />

      {/* Center Dot */}
      <circle cx="50" cy="50" r="5" fill="url(#goldGradient)" className="animate-ping origin-center" />
      <circle cx="50" cy="50" r="4" fill="url(#goldGradient)" />

      <defs>
        <linearGradient id="goldGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}
