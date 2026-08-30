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
          viewBox="0 0 500 500"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Top Kurdish Arc */}
            <path
              id={`ku-top-arc-${uniqueId}`}
              d="M 60,250 A 190,190 0 0,1 440,250"
              fill="none"
            />
            {/* Top Arabic Arc */}
            <path
              id={`ar-top-arc-${uniqueId}`}
              d="M 90,250 A 160,160 0 0,1 410,250"
              fill="none"
            />
            {/* Bottom Kurdish Arc (Right to Left along bottom rim for upright text) */}
            <path
              id={`ku-bot-arc-${uniqueId}`}
              d="M 415,250 A 165,165 0 0,1 85,250"
              fill="none"
            />
            {/* Bottom Arabic Arc */}
            <path
              id={`ar-bot-arc-${uniqueId}`}
              d="M 385,250 A 135,135 0 0,1 115,250"
              fill="none"
            />
          </defs>

          {/* Clean White Background Circle */}
          <circle cx="250" cy="250" r="246" fill="#FFFFFF" />

          {/* Outer Red Border */}
          <circle
            cx="250"
            cy="250"
            r="240"
            fill="none"
            stroke="#E53935"
            strokeWidth="8"
          />

          {/* Inner Red Border */}
          <circle
            cx="250"
            cy="250"
            r="218"
            fill="none"
            stroke="#E53935"
            strokeWidth="2.5"
          />

          {/* Top Kurdish Text */}
          <text
            fontSize="18"
            fontWeight="bold"
            fill="#111827"
            fontFamily="Arial, sans-serif"
          >
            <textPath
              href={`#ku-top-arc-${uniqueId}`}
              startOffset="50%"
              textAnchor="middle"
            >
              sendikaya Endezyaran li parêzgeha Hesekê
            </textPath>
          </text>

          {/* Top Arabic Text */}
          <text
            fontSize="21"
            fontWeight="bold"
            fill="#111827"
            fontFamily="'Cairo', 'Amiri', Arial, sans-serif"
          >
            <textPath
              href={`#ar-top-arc-${uniqueId}`}
              startOffset="50%"
              textAnchor="middle"
            >
              نقابة المهندسين في محافظة الحسكة
            </textPath>
          </text>

          {/* Bottom Kurdish Text */}
          <text
            fontSize="18"
            fontWeight="bold"
            fill="#111827"
            fontFamily="Arial, sans-serif"
          >
            <textPath
              href={`#ku-bot-arc-${uniqueId}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {curr.kuText}
            </textPath>
          </text>

          {/* Bottom Arabic Text */}
          <text
            fontSize="21"
            fontWeight="bold"
            fill="#111827"
            fontFamily="'Cairo', 'Amiri', Arial, sans-serif"
          >
            <textPath
              href={`#ar-bot-arc-${uniqueId}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {curr.arText}
            </textPath>
          </text>

          {/* CENTER EMBLEM */}
          <g transform="translate(250, 240) scale(1.05)">
            
            {/* Drafting Compass */}
            <circle cx="0" cy="-85" r="6" fill="#D97706" />
            <circle cx="0" cy="-85" r="2.5" fill="#FFFFFF" />
            <line x1="0" y1="-79" x2="-16" y2="-10" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="0" y1="-79" x2="16" y2="-10" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="-16" y1="-10" x2="-18" y2="-3" stroke="#374151" strokeWidth="2" />
            <line x1="16" y1="-10" x2="18" y2="-3" stroke="#374151" strokeWidth="2" />
            <path d="M -12,-45 Q 0,-40 12,-45" fill="none" stroke="#D97706" strokeWidth="2.5" />

            {/* T-Square / Drafting Ruler */}
            <path d="M -38,-52 L -28,-64 Q -24,-45 -24,-32 Q -28,-20 -38,-32 Z" fill="#16A34A" />
            <rect x="-36" y="-48" width="72" height="7" rx="1" fill="#9CA3AF" stroke="#4B5563" strokeWidth="1" />

            {/* House / Building Outline */}
            <path
              d="M -80,22 L -62,8 L -14,28 L 0,-12 L 14,28 L 52,4 L 80,36 L 60,36 L 14,18 L -14,18 L -54,4 Z"
              fill="#C026D3"
            />
            <rect x="-3" y="-8" width="6" height="10" fill="#C026D3" />

            {/* House Windows */}
            <path d="M -66,24 L -66,42 L -14,42 L -14,24 Z" fill="#FFFFFF" stroke="#C026D3" strokeWidth="1" />
            <g transform="translate(-44, 30)">
              <rect x="-4" y="-4" width="3" height="3" fill="#9CA3AF" />
              <rect x="1" y="-4" width="3" height="3" fill="#9CA3AF" />
              <rect x="-4" y="1" width="3" height="3" fill="#9CA3AF" />
              <rect x="1" y="1" width="3" height="3" fill="#9CA3AF" />
            </g>

            <path d="M 14,24 L 14,42 L 66,42 L 66,24 Z" fill="#FFFFFF" stroke="#C026D3" strokeWidth="1" />
            <g transform="translate(40, 30)">
              <rect x="-4" y="-4" width="3" height="3" fill="#9CA3AF" />
              <rect x="1" y="-4" width="3" height="3" fill="#9CA3AF" />
              <rect x="-4" y="1" width="3" height="3" fill="#9CA3AF" />
              <rect x="1" y="1" width="3" height="3" fill="#9CA3AF" />
            </g>

            {/* Green Ground Line */}
            <path
              d="M -75,48 Q 0,36 75,48"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* S.E.P.H Text */}
            <text
              x="0"
              y="72"
              textAnchor="middle"
              fontSize="20"
              fontWeight="900"
              fontFamily="Arial Black, sans-serif"
              fill="#15803D"
              letterSpacing="2"
            >
              S.E.P.H
            </text>
          </g>

        </svg>
      </div>

      {showText && (
        <div className="text-right">
          <div className="text-xs font-bold leading-tight">
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
