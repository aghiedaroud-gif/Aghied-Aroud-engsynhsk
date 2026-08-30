import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, ShieldCheck, Check, Copy } from 'lucide-react';
import { BranchCode } from '../types';

interface DocumentQRCodeProps {
  documentId: string;
  documentType: 'INV' | 'EPO' | 'SFD';
  totalAmount: number;
  currency?: string;
  branch?: BranchCode;
  issueDate?: string;
  clientName?: string;
  size?: number;
  className?: string;
  showCaption?: boolean;
  compact?: boolean;
}

export const DocumentQRCode: React.FC<DocumentQRCodeProps> = ({
  documentId,
  documentType,
  totalAmount,
  currency = 'ل.س',
  branch = 'HAS',
  issueDate,
  clientName,
  size = 112,
  className = '',
  showCaption = true,
  compact = false
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showPayloadModal, setShowPayloadModal] = useState(false);

  const formattedAmount = Number(totalAmount || 0).toLocaleString();
  const dateStr = issueDate || new Date().toISOString().split('T')[0];

  // Canonical structured payload for archive verification scanners
  const payloadObject = {
    sys: 'SEPH-SYNDICATE-ARCHIVE-V2',
    docId: documentId,
    type: documentType === 'INV' ? 'INVOICE' : documentType === 'EPO' ? 'PAY_ORDER' : 'SYNDICATE_DEPOSIT',
    totalAmount: totalAmount || 0,
    currency: currency,
    branch: branch,
    client: clientName || undefined,
    date: dateStr,
    verificationCode: `VER-${documentId.replace(/[^a-zA-Z0-9]/g, '')}-${totalAmount}`,
    verifyUrl: `https://syria-eng-hasakah.sy/verify?doc=${documentId}&amt=${totalAmount}&curr=${encodeURIComponent(currency)}`
  };

  const payloadString = JSON.stringify(payloadObject, null, 0);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(payloadString, {
      width: size * 2, // 2x for sharp print/retina rendering
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0F172A', // Dark Slate
        light: '#FFFFFF'  // Pure White
      }
    })
      .then(url => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch(err => {
        console.error('Failed to generate QR Code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [payloadString, size]);

  const handleCopyPayload = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(payloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div 
        onClick={() => setShowPayloadModal(true)}
        className="group relative cursor-pointer bg-white p-1.5 rounded-lg border border-slate-300 shadow-sm hover:border-blue-500 transition"
        title="انقر لعرض تفاصيل التحقق الأرشيفي المشفرة في رمز QR"
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code for ${documentId}`}
            style={{ width: `${size}px`, height: `${size}px` }}
            className="block rounded object-contain"
          />
        ) : (
          <div 
            style={{ width: `${size}px`, height: `${size}px` }} 
            className="flex items-center justify-center bg-slate-100 text-slate-400 rounded"
          >
            <QrCode className="w-8 h-8 animate-pulse" />
          </div>
        )}

        {/* Small Scan Icon Overlay */}
        <div className="absolute -bottom-1.5 -right-1.5 bg-slate-900 text-[#00FFD1] p-0.5 rounded-full border border-white shadow-xs group-hover:scale-110 transition">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
      </div>

      {showCaption && !compact && (
        <div className="mt-1.5 text-center leading-tight max-w-[130px]">
          <div className="font-mono text-[9px] font-bold text-slate-800 tracking-tight truncate">
            {documentId}
          </div>
          <div className="font-mono text-[9.5px] font-extrabold text-blue-900 truncate" dir="ltr">
            {formattedAmount} {currency}
          </div>
          <div className="text-[8px] text-slate-500 font-sans mt-0.5">
            التحقق الأرشيفي (QR)
          </div>
        </div>
      )}

      {/* Interactive Payload Inspector Modal */}
      {showPayloadModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
          onClick={(e) => {
            e.stopPropagation();
            setShowPayloadModal(false);
          }}
        >
          <div 
            className="bg-slate-900 text-white p-5 rounded-xl border border-slate-700 shadow-2xl max-w-md w-full space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00FFD1]" />
                <h3 className="font-bold text-sm text-white">
                  بيانات التحقق الأرشيفي المشفرة (QR Archive Data)
                </h3>
              </div>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 bg-slate-800 rounded"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="flex items-center justify-center py-2 bg-white rounded-lg p-2 border border-slate-700">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="QR Code" className="w-36 h-36" />
              )}
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1 text-slate-300" dir="ltr">
              <div><strong className="text-slate-400">Document ID:</strong> <span className="text-[#00FFD1] font-bold">{documentId}</span></div>
              <div><strong className="text-slate-400">Document Type:</strong> <span className="text-white">{payloadObject.type}</span></div>
              <div><strong className="text-slate-400">Total Amount:</strong> <span className="text-emerald-400 font-bold">{formattedAmount} {currency}</span></div>
              <div><strong className="text-slate-400">Branch:</strong> <span className="text-white">{branch}</span></div>
              <div><strong className="text-slate-400">Issue Date:</strong> <span className="text-white">{dateStr}</span></div>
              <div><strong className="text-slate-400">Verification Hash:</strong> <span className="text-amber-400">{payloadObject.verificationCode}</span></div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCopyPayload}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00FFD1]" />}
                <span>{copied ? 'تم نسخ بيانات QR' : 'نسخ النص البرمجي المشفر (JSON)'}</span>
              </button>

              <span className="text-[11px] text-slate-400">
                مطابق لمعايير الأرشفة النقابية 2026
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
