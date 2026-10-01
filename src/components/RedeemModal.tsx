import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, Calculator, Sparkles, User as UserIcon, Tag, AlertCircle } from 'lucide-react';
import { Coupon, Family, Language, User } from '../types';
import { getTranslation } from '../i18n/translations';

interface RedeemModalProps {
  coupon: Coupon;
  family: Family;
  currentUser: User;
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (couponId: string, amount: number, userId: string, note?: string) => void;
}

export const RedeemModal: React.FC<RedeemModalProps> = ({
  coupon,
  family,
  currentUser,
  lang,
  isOpen,
  onClose,
  onRedeem,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);

  const [mode, setMode] = useState<'partial' | 'full'>('partial');
  const [amount, setAmount] = useState<number>(() => {
    if (coupon.currentValue === 300) return 120;
    return Math.min(coupon.currentValue, 50);
  });
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const currentVal = coupon.currentValue;
  const deductionAmount = mode === 'full' ? currentVal : amount;
  const remainingAfter = Math.max(0, currentVal - deductionAmount);

  const handleQuickAmount = (val: number) => {
    setMode('partial');
    setAmount(Math.min(val, currentVal));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deductionAmount <= 0) {
      setError(isHe ? 'יש להזין סכום גדול מ-0' : 'Please enter an amount greater than 0');
      return;
    }
    if (deductionAmount > currentVal) {
      setError(
        isHe
          ? `הסכום לניכוי (${deductionAmount} ${coupon.currency}) גבוה מהיתרה הזמינה (${currentVal} ${coupon.currency})`
          : `Amount (${deductionAmount} ${coupon.currency}) exceeds remaining balance (${currentVal} ${coupon.currency})`
      );
      return;
    }

    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#0284c7', '#3b82f6', '#10b981', '#6366f1'],
      });
    } catch {
      // ignore
    }

    onClose();
    onRedeem(coupon.id, deductionAmount, selectedUserId, note.trim() || undefined);
  };

  const presets = [
    50,
    100,
    120, // Highlight 120 from user's example
    200,
  ].filter((p) => p < currentVal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 p-5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t.markAsUsed}</h3>
              <p className="text-sky-100 text-xs line-clamp-1">{coupon.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="redeem-form" className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('partial');
                if (amount <= 0 || amount > currentVal) {
                  setAmount(Math.min(currentVal, 120));
                }
                setError('');
              }}
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'partial'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>{t.partialRedemption}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('full');
                setError('');
              }}
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'full'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>{t.fullRedemption}</span>
            </button>
          </div>

          {/* Amount input & Quick Chips for Partial */}
          {mode === 'partial' && (
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t.amountToDeduct} ({coupon.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={currentVal}
                  step="any"
                  value={amount || ''}
                  onChange={(e) => {
                    setAmount(Number(e.target.value));
                    setError('');
                  }}
                  className="w-full text-2xl font-bold font-mono px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-colors"
                  placeholder="0"
                />
                <span className="absolute top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 ltr:right-4 rtl:left-4">
                  {coupon.currency}
                </span>
              </div>

              {/* Quick Presets */}
              {presets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500">{isHe ? 'מהיר:' : 'Quick:'}</span>
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAmount(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                        amount === preset
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset} {coupon.currency}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(currentVal)}
                    className="text-xs px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                  >
                    {isHe ? 'הכל' : 'All'} ({currentVal} {coupon.currency})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Visual Deduction Calculation Card */}
          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-2">
            <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
              {isHe ? 'חישוב יתרה בזמן אמת:' : 'Real-time Balance Update:'}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{t.currentValue}</span>
              <span className="font-mono font-semibold">
                {currentVal} {coupon.currency}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-rose-600 font-medium">
              <span>- {t.amountToDeduct}</span>
              <span className="font-mono font-semibold">
                - {deductionAmount} {coupon.currency}
              </span>
            </div>

            <div className="pt-2 border-t border-sky-200 flex items-center justify-between text-base font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{t.remainingAfterDeduction}:</span>
              </span>
              <span className="font-mono text-xl text-emerald-700 font-extrabold">
                {remainingAfter} {coupon.currency}
              </span>
            </div>

            {coupon.initialValue === 300 && deductionAmount === 120 && (
              <div className="text-xs text-blue-800 bg-blue-100/70 p-2 rounded-lg font-medium">
                {isHe
                  ? '✨ שובר של 300 ₪ נוצל ב-120 ₪ — תישאר יתרה של 180 ₪ לשימוש הבא!'
                  : '✨ 300₪ coupon used 120₪ — remaining balance of 180₪ saved for your family!'}
              </div>
            )}
          </div>

          {/* Who is redeeming */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.whoUsedIt}</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            >
              {family.members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          {/* Usage Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              {t.usageNote}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.usageNotePlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Footer - Fixed at bottom so approve button is ALWAYS visible & reachable */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            form="redeem-form"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{t.confirmDeduction}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
