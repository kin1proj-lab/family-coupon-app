import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  Key,
  FileText,
  User,
  History,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Maximize2,
  Zap,
} from 'lucide-react';
import { Coupon, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { BarcodeRenderer } from './BarcodeRenderer';

interface CouponDetailModalProps {
  coupon: Coupon;
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onOpenRedeem: (coupon: Coupon) => void;
  onFastFullRedeem?: (coupon: Coupon) => void;
  onOpenEdit: (coupon: Coupon) => void;
  onDelete: (couponId: string) => void;
  onUndoUsage: (couponId: string, usageId: string) => void;
}

export const CouponDetailModal: React.FC<CouponDetailModalProps> = ({
  coupon,
  lang,
  isOpen,
  onClose,
  onOpenRedeem,
  onFastFullRedeem,
  onOpenEdit,
  onDelete,
  onUndoUsage,
}) => {
  const [photoZoomed, setPhotoZoomed] = useState(false);

  if (!isOpen) return null;
  const isHe = lang === 'he';
  const t = getTranslation(lang);

  const isUrl =
    coupon.whereToUse.startsWith('http://') ||
    coupon.whereToUse.startsWith('https://') ||
    coupon.whereToUse.includes('.co.il') ||
    coupon.whereToUse.includes('.com');

  const urlHref = coupon.whereToUse.startsWith('http')
    ? coupon.whereToUse
    : `https://${coupon.whereToUse}`;

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

  const percentLeft =
    coupon.initialValue > 0
      ? Math.round((coupon.currentValue / coupon.initialValue) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Header Ticket Banner - Fixed */}
        <div className="relative bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white p-5 sm:p-6 shrink-0 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {coupon.storeName}
              </span>
              <h2 className="text-2xl font-bold mt-2">{coupon.title}</h2>
              <p className="text-sky-100 text-xs mt-1">
                {isHe ? 'נוצר ע"י' : 'Added by'} {coupon.createdByName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Balance card badge inside banner */}
          <div className="mt-5 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-sky-100 font-medium">
                {t.remainingValue}
              </div>
              <div className="text-3xl font-extrabold font-mono mt-0.5">
                {coupon.currentValue} {coupon.currency}
              </div>
              <div className="text-xs text-sky-200 mt-0.5">
                {t.initialValue}: {coupon.initialValue} {coupon.currency} ({percentLeft}% {isHe ? 'נותר' : 'left'})
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    onClose();
                    onOpenRedeem(coupon);
                  }}
                  disabled={coupon.currentValue <= 0}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                    coupon.currentValue > 0
                      ? 'bg-white text-blue-900 hover:bg-sky-50 hover:scale-[1.02]'
                      : 'bg-white/40 text-white/70 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>{isHe ? 'ניצול חלקי...' : 'Deduct Partial...'}</span>
                </button>

                {coupon.currentValue > 0 && onFastFullRedeem && (
                  <button
                    onClick={() => {
                      onFastFullRedeem(coupon);
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:scale-[1.02]"
                    title={isHe ? 'סימון כנוצל במלואו ללא פופאפ' : 'Mark fully used immediately without popup'}
                  >
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>{isHe ? 'סיום מהיר (נוצל מלא ⚡)' : 'Fast Mark Used ⚡'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Voucher Image (Full preview for cashier scan) */}
          {coupon.imageUrl && (
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 text-center space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>{t.photoVoucher}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPhotoZoomed(!photoZoomed)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{photoZoomed ? (isHe ? 'הקטן' : 'Shrink') : (isHe ? 'הגדל לקופה' : 'Enlarge for Cashier')}</span>
                </button>
              </div>

              <div
                className={`relative rounded-xl overflow-hidden bg-white p-2 border border-slate-200 transition-all flex items-center justify-center ${
                  photoZoomed ? 'max-h-[550px]' : 'max-h-64'
                }`}
              >
                <img
                  src={coupon.imageUrl}
                  alt={coupon.title}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Barcode & Cashier Scanner Area (if code exists) */}
          {coupon.code && (
            <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-200/80 text-center space-y-3">
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <span>{t.barcodeTitle}</span>
              </div>

              <div className="max-w-md mx-auto">
                <BarcodeRenderer code={coupon.code} type={coupon.barcodeType} height={68} />
              </div>

              {coupon.pin && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 shadow-xs">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {t.pinCode}: <strong className="text-slate-900">{coupon.pin}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Where to use & Link */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{t.whereToUse}</span>
              </div>
              <div className="text-sm font-medium text-slate-800 break-words">
                {coupon.whereToUse}
              </div>
              {isUrl && (
                <a
                  href={urlHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-100/70 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.openStoreLink}</span>
                </a>
              )}
            </div>

            {/* Expiration date */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{t.expirationDate}</span>
              </div>
              <div className="text-sm font-medium text-slate-800">
                {coupon.expirationDate || t.noExpiry}
              </div>
              {expiryStatus === 'expired' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  {t.expired} ({Math.abs(daysDiff)} {isHe ? 'ימים עברו' : 'days ago'})
                </span>
              )}
              {expiryStatus === 'soon' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
                  <Clock className="w-3 h-3" />
                  {daysDiff === 0 ? t.todayExpiry : `${daysDiff} ${t.daysLeft}`}
                </span>
              )}
              {expiryStatus === 'active' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle className="w-3 h-3" />
                  {t.active} ({daysDiff} {t.daysLeft})
                </span>
              )}
            </div>
          </div>

          {/* Notes & Terms */}
          {coupon.terms && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-1.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{t.terms}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{coupon.terms}</p>
            </div>
          )}

          {/* Usage History Timeline */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">{t.usageHistory}</h3>
              </div>
              <span className="text-xs text-slate-500">
                {coupon.history.length} {isHe ? 'רישומים' : 'records'}
              </span>
            </div>

            {coupon.history.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                {t.noUsageYet}
              </div>
            ) : (
              <div className="space-y-2.5">
                {coupon.history.map((usage) => (
                  <div
                    key={usage.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          -{usage.amountUsed} {coupon.currency}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({t.remainingWas} {usage.remainingAfter} {coupon.currency})
                        </span>
                      </div>
                      {usage.note && (
                        <p className="text-xs text-slate-600 italic">"{usage.note}"</p>
                      )}
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <User className="w-3 h-3 text-slate-400" />
                          {usage.userName}
                        </span>
                        <span>•</span>
                        <span>{new Date(usage.usedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUndoUsage(coupon.id, usage.id)}
                      title={t.undoUsage}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions - Fixed */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEdit(coupon);
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{t.editCoupon}</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(t.confirmDelete)) {
                  onDelete(coupon.id);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.deleteCoupon}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
