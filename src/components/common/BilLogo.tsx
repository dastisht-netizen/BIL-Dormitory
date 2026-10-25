import React from 'react';

export const BilLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md shrink-0`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="#4338CA" strokeWidth="3" />
    <path d="M30 60 C30 45, 50 35, 50 30 C50 35, 70 45, 70 60 C70 70, 50 78, 50 78 C50 78, 30 70, 30 60 Z" fill="#4338CA" />
    <path d="M50 30 L50 78" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M35 52 Q50 62 65 52" stroke="#E2E8F0" strokeWidth="2" fill="none" />
    <circle cx="50" cy="22" r="5" fill="#F59E0B" />
  </svg>
);
