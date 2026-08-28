import React, { useId } from 'react';
import { BranchCode } from '../types';

interface BranchLogoProps {
  branch: BranchCode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'watermark' | 'print';
  className?: string;
  showText?: boolean;
}

export const BranchLogo: React.FC<BranchLogoProps> = ({
  branch,
  size = 'md',
  className = '',
  showText = false
}) => {
  const rawId = useId();
  const uniqueId = `logo_${branch}_${rawId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Dimensions mapping
  const dimensionMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    '2xl': 'w-36 h-36',
    '3xl': 'w-64 h-64',
    watermark: 'w-80 h-80 sm:w-96 sm:h-96',
    print: 'w-24 h-24'
  };

  const branchDetails = {
    HAS: {
      code: 'HAS',
      kuText: 'Yekîneya endezyariyê li Hesekê',
      arText: 'الوحدة الهندسية في الحسكة',
      nameAr: 'وحدة الحسكة'
    },
    QAM: {
      code: 'QAM',
      kuText: 'Yekîneya endezyariyê li Qamişlo',
      arText: 'الوحدة الهندسية في قامشلو',
      nameAr: 'وحدة القامشلي'
    },
    DER: {
      code: 'DER',
      kuText: 'Yekîneya endezyariyê li Dêrikê',
      arText: 'الوحدة الهندسية في ديريك',
      nameAr: 'وحدة ديريك'
    }
  };

  const curr = branchDetails[branch] || branchDetails.HAS;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative shrink-0 ${dimensionMap[size]} select-none`}>
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Upper text path for Kurdish top arc (clockwise) */}
            <path
              id={`ku-top-arc-${uniqueId}`}
              d="M 55,200 A 145,145 0 0,1 345,200"
              fill="none"
            />
            {/* Upper text path for Arabic top arc */}
            <path
              id={`ar-top-arc-${uniqueId}`}
              d="M 68,200 A 132,132 0 0,1 332,200"
              fill="none"
            />
            {/* Gradient for subtle seal depth */}
            <radialGradient id={`seal-bg-${uniqueId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="90%" stopColor="#FAFAFA" />
              <stop offset="100%" stopColor="#F0F0F0" />
            </radialGradient>
          </defs>

          {/* Background White Circle */}
          <circle cx="200" cy="200" r="195" fill={`url(#seal-bg-${uniqueId})`} />

          {/* Outer Bold Red Border */}
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            stroke="#D32F2F"
            strokeWidth="8"
          />

          {/* Inner Thin Red Border */}
          <circle
            cx="200"
            cy="200"
            r="174"
            fill="none"
            stroke="#D32F2F"
            strokeWidth="3.5"
          />

          {/* Upper Outer Kurdish Arc Text */}
          <text
            fontSize="18"
            fontWeight="bold"
            fill="#111827"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            <textPath
              href={`#ku-top-arc-${uniqueId}`}
              startOffset="50%"
              textAnchor="middle"
            >
              sendikaya Endezyaran li parêzgeha Hesekê
            </textPath>
          </text>

          {/* Upper Inner Arabic Arc Text */}
          <text
            fontSize="21"
            fontWeight="bold"
            fill="#111827"
            fontFamily="'Cairo', 'Amiri', system-ui, sans-serif"
          >
            <textPath
              href={`#ar-top-arc-${uniqueId}`}
              startOffset="50%"
              textAnchor="middle"
            >
              نقابة المهندسين في محافظة الحسكة
            </textPath>
          </text>

          {/* CENTER EMBLEM GRAPHICS */}
          <g transform="translate(200, 200)">
            
            {/* Golden Drafting Compass (top) */}
            {/* Compass top hinge & knob */}
            <circle cx="0" cy="-100" r="8" fill="#B48318" stroke="#7A5308" strokeWidth="2" />
            <circle cx="0" cy="-100" r="4" fill="#FFFFFF" />
            <circle cx="0" cy="-115" r="4.5" fill="#B48318" stroke="#7A5308" strokeWidth="1.5" />
            <line x1="0" y1="-108" x2="0" y2="-115" stroke="#B48318" strokeWidth="3" />

            {/* Compass legs extending downward */}
            <line x1="-4" y1="-93" x2="-22" y2="-5" stroke="#B48318" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="4" y1="-93" x2="16" y2="-5" stroke="#B48318" strokeWidth="4.5" strokeLinecap="round" />
            
            {/* Sharp needle tips */}
            <line x1="-22" y1="-5" x2="-24" y2="4" stroke="#4B5563" strokeWidth="2.5" />
            <line x1="16" y1="-5" x2="18" y2="4" stroke="#4B5563" strokeWidth="2.5" />

            {/* Compass adjustment arc / wing */}
            <path
              d="M -18,-50 Q 0,-44 18,-50"
              fill="none"
              stroke="#B48318"
              strokeWidth="3"
            />
            <circle cx="0" cy="-47" r="3" fill="#7A5308" />

            {/* Drafting Scale / Green T-Square Head */}
            <path
              d="M -50,-62 L -38,-78 Q -32,-50 -32,-35 Q -38,-22 -50,-38 Z"
              fill="#10984E"
              stroke="#075E30"
              strokeWidth="1.5"
            />
            {/* Horizontal T-Square Blade */}
            <rect
              x="-48"
              y="-58"
              width="100"
              height="10"
              rx="1.5"
              fill="#A0AEC0"
              stroke="#4A5568"
              strokeWidth="1.5"
            />

            {/* Magenta Architectural Pitched Roof Structure */}
            <path
              d="M -110,35 L -85,15 L -20,40 L 0,-15 L 20,40 L 70,5 L 110,50 L 80,50 L 20,25 L -20,25 L -75,6 Z"
              fill="#A21CAF"
              stroke="#701A75"
              strokeWidth="1"
            />
            
            {/* Chimney / Accent pin */}
            <rect x="-5" y="-12" width="7" height="15" rx="1" fill="#A21CAF" />
            <circle cx="-1.5" cy="-14" r="4" fill="#A21CAF" />

            {/* House facade lines and windows below roof */}
            <path
              d="M -90,32 L -90,56 L -20,56 L -20,38"
              fill="#FFFFFF"
              stroke="#A21CAF"
              strokeWidth="1.5"
            />
            {/* Left 4-pane window */}
            <g transform="translate(-62, 38)">
              <rect x="-6" y="-6" width="5" height="5" fill="#A0AEC0" />
              <rect x="1" y="-6" width="5" height="5" fill="#A0AEC0" />
              <rect x="-6" y="1" width="5" height="5" fill="#A0AEC0" />
              <rect x="1" y="1" width="5" height="5" fill="#A0AEC0" />
            </g>

            <path
              d="M 20,38 L 20,56 L 90,56 L 90,32"
              fill="#FFFFFF"
              stroke="#A21CAF"
              strokeWidth="1.5"
            />
            {/* Right 4-pane window */}
            <g transform="translate(48, 38)">
              <rect x="-6" y="-6" width="5" height="5" fill="#A0AEC0" />
              <rect x="1" y="-6" width="5" height="5" fill="#A0AEC0" />
              <rect x="-6" y="1" width="5" height="5" fill="#A0AEC0" />
              <rect x="1" y="1" width="5" height="5" fill="#A0AEC0" />
            </g>

            {/* Green ground curved arc baseline */}
            <path
              d="M -110,65 Q 0,48 110,65"
              fill="none"
              stroke="#15803D"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Center S.E.P.H Acronym in Bold Green */}
            <text
              x="0"
              y="92"
              textAnchor="middle"
              fontSize="24"
              fontWeight="900"
              fontFamily="'Arial Black', Impact, sans-serif"
              fill="#0E703C"
              letterSpacing="2.5"
            >
              S.E.P.H
            </text>
          </g>

          {/* LOWER SECTION DIVIDER RED ARC */}
          <path
            d="M 25,290 Q 200,312 375,290"
            fill="none"
            stroke="#D32F2F"
            strokeWidth="3.5"
          />

          {/* Lower Kurdish Branch Inscription */}
          <text
            x="200"
            y="320"
            textAnchor="middle"
            fontSize="17.5"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#111827"
          >
            {curr.kuText}
          </text>

          {/* Lower Arabic Branch Inscription */}
          <text
            x="200"
            y="355"
            textAnchor="middle"
            fontSize="21"
            fontWeight="bold"
            fontFamily="'Cairo', 'Amiri', system-ui, sans-serif"
            fill="#111827"
          >
            {curr.arText}
          </text>
        </svg>
      </div>

      {showText && (
        <div className="text-right">
          <div className="text-xs font-bold text-white leading-tight">
            {curr.nameAr}
          </div>
          <div className="text-[10px] font-mono text-[#00FFD1]">
            {curr.kuText}
          </div>
        </div>
      )}
    </div>
  );
};
