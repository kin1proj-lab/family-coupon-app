import React from 'react';
import {
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  Copy,
  Check,
  Sparkles,
  Barcode,
  AlertTriangle,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { Coupon, Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface CouponCardProps {
  coupon: Coupon;
  lang: Language;
  onSelect: (coupon: Coupon) => void;
  onRedeem: (coupon: Coupon) => void;
  onFastFullRedeem?: (coupon: Coupon) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  lang,
  onSelect,
  onRedeem,
  onFastFullRedeem,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!coupon.code) return;
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl =
    coupon.whereToUse.startsWith('http://') ||
    coupon.whereToUse.startsWith('https://') ||
    coupon.whereToUse.includes('.co.il') ||
    coupon.whereToUse.includes('.com');

  const urlHref = coupon.whereToUse.startsWith('http')
    ? coupon.whereToUse
    : `https://${coupon.whereToUse}`;

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(urlHref, '_blank', 'noopener,noreferrer');
  };

  // Expiration calculation
  let expiryStatus: 'expired' | 'soon' | 'active' | 'none' = 'none';
  let daysDiff = 0;
  if (coupon.expirationDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(coupon.expirationDate);
    expDate.setHours(0, 0, 0, 0);
    daysDiff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) {
      expiryStatus = 'expired';
    } else if (daysDiff <= 7) {
      expiryStatus = 'soon';
    } else {
      expiryStatus = 'active';
    }
  }

  const isFullyUsed = coupon.currentValue <= 0;
  const isPartiallyUsed = coupon.currentValue > 0 && coupon.currentValue < coupon.initialValue;
  const percentage =
    coupon.initialValue > 0
      ? Math.max(0, Math.min(100, Math.round((coupon.currentValue / coupon.initialValue) * 100)))
      : 0;

  return (
    <div
      onClick={() => onSelect(coupon)}
      className={`group relative bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
        isFullyUsed ? 'opacity-70 bg-slate-50/80' : ''
      }`}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* Top Banner with Store, Image Indicator & Expiration Badge */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-blue-900 bg-blue-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
              {coupon.storeName}
            </span>
            {coupon.imageUrl && (
              <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span>{isHe ? 'תמונה' : 'Photo'}</span>
              </span>
            )}
          </div>

          {/* Expiry Pill */}
          {expiryStatus === 'expired' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              <span>{t.expired}</span>
            </span>
          )}
          {expiryStatus === 'soon' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full animate-pulse">
              <Clock className="w-3 h-3" />
              <span>{daysDiff === 0 ? t.todayExpiry : `${daysDiff} ${t.daysLeft}`}</span>
            </span>
          )}
          {expiryStatus === 'active' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              <Calendar className="w-3 h-3" />
              <span>{coupon.expirationDate}</span>
            </span>
          )}
          {expiryStatus === 'none' && (
            <span className="text-[11px] text-slate-400 font-medium">
              {t.noExpiry}
            </span>
          )}
        </div>

        {/* Thumbnail if Image is attached */}
        {coupon.imageUrl && (
          <div className="mb-2.5 w-full h-24 rounded-2xl overflow-hidden bg-slate-100 relative group-hover:ring-2 group-hover:ring-blue-400/40 transition-all">
            <img
              src={coupon.imageUrl}
              alt={coupon.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
            <span className="absolute bottom-1.5 ltr:left-2 rtl:right-2 text-[10px] text-white font-medium bg-slate-900/60 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>{isHe ? 'לחץ לצפייה מלאה' : 'Tap to expand photo'}</span>
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {coupon.title}
        </h3>

        {/* Where to use & Link button */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1 flex-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span className="truncate">{coupon.whereToUse}</span>
          </div>

          {isUrl && (
            <button
              onClick={handleOpenUrl}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              title={t.openStoreLink}
            >
              <ExternalLink className="w-3 h-3" />
              <span>{isHe ? 'אתר' : 'Link'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Perforation line */}
      <div className="relative py-2">
        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-200/90 shadow-inner -translate-y-1/2" />
        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-200/90 shadow-inner -translate-y-1/2" />
        <div className="border-t-2 border-dashed border-slate-200 mx-5" />
      </div>

      {/* Middle & Value section */}
      <div className="p-5 pt-1 space-y-3">
        {/* Value and remaining indicator */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t.remainingValue}
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 flex items-baseline gap-1">
              <span>{coupon.currentValue}</span>
              <span className="text-lg font-semibold text-slate-600">{coupon.currency}</span>
            </div>
          </div>

          {isPartiallyUsed && (
            <div className="text-right">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                {t.partiallyUsed}
              </span>
              <div className="text-xs text-slate-400 mt-1">
                {isHe ? 'מתוך' : 'of'} {coupon.initialValue} {coupon.currency}
              </div>
            </div>
          )}

          {isFullyUsed && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
              {t.fullyUsed}
            </span>
          )}

          {!isPartiallyUsed && !isFullyUsed && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              {t.available}
            </span>
          )}
        </div>

        {/* Progress bar of remaining balance */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              percentage > 50
                ? 'bg-gradient-to-r from-blue-500 to-emerald-500'
                : percentage > 20
                ? 'bg-gradient-to-r from-sky-500 to-amber-500'
                : 'bg-rose-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Code snippet & copy button OR photo indicator */}
        {coupon.code ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold tracking-wider truncate">
              <Barcode className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{coupon.code}</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="text-slate-400 hover:text-slate-800 p-1 transition-colors cursor-pointer"
              title={t.copyCode}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-900 font-medium">
            <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{isHe ? 'שובר צילום - פתח להצגה בקופה' : 'Photo Voucher - Tap to view at cashier'}</span>
          </div>
        )}

        {/* Action Buttons: Partial Deduct & Fast Full Use */}
        <div className="pt-1 flex items-center gap-2">
          {isFullyUsed ? (
            <div className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 text-center flex items-center justify-center gap-1.5 border border-slate-200">
              <Check className="w-4 h-4 text-slate-400" />
              <span>{t.fullyUsed}</span>
            </div>
          ) : (
            <>
              {/* Partial Deduction (Opens popup) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRedeem(coupon);
                }}
                className="flex-1 py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200"
                title={isHe ? 'ניצול סכום חלקי (מחשבון)' : 'Deduct partial balance'}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{isHe ? 'ניצול חלקי' : 'Deduct'}</span>
              </button>

              {/* Fast Full Use Button (No popup, instant!) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFastFullRedeem) {
                    onFastFullRedeem(coupon);
                  }
                }}
                className="flex-1 py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                title={isHe ? 'סיום מהיר: סימון כנוצל במלואו ללא פופאפ' : 'Fast: Mark fully used immediately without popup'}
              >
                <Zap className="w-3.5 h-3.5 fill-white text-white" />
                <span>{isHe ? 'נוצל מלא ⚡' : 'Mark Used ⚡'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
