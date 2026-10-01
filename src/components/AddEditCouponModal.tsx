import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Tag,
  MapPin,
  Barcode,
  DollarSign,
  FileText,
  Check,
  Camera,
  Upload,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { Coupon, CouponCategory, Family, Language, User } from '../types';
import { getTranslation } from '../i18n/translations';

interface AddEditCouponModalProps {
  coupon?: Coupon | null;
  family: Family;
  currentUser: User;
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSave: (couponData: Partial<Coupon>) => void;
}

export const AddEditCouponModal: React.FC<AddEditCouponModalProps> = ({
  coupon,
  family,
  currentUser,
  lang,
  isOpen,
  onClose,
  onSave,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);
  const isEditing = !!coupon;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(coupon?.title || '');
  const [storeName, setStoreName] = useState(coupon?.storeName || '');
  const [whereToUse, setWhereToUse] = useState(coupon?.whereToUse || '');
  const [code, setCode] = useState(coupon?.code || '');
  const [pin, setPin] = useState(coupon?.pin || '');
  const [imageUrl, setImageUrl] = useState<string>(coupon?.imageUrl || '');
  const [barcodeType, setBarcodeType] = useState<'CODE128' | 'QR' | 'NONE'>(
    coupon?.barcodeType || 'CODE128'
  );
  const [initialValue, setInitialValue] = useState<number>(coupon?.initialValue || 300);
  const [currentValue, setCurrentValue] = useState<number>(
    coupon ? coupon.currentValue : 300
  );
  const [currency, setCurrency] = useState(coupon?.currency || '₪');
  const [expirationDate, setExpirationDate] = useState<string>(
    coupon?.expirationDate || ''
  );
  const [category, setCategory] = useState<CouponCategory>(coupon?.category || 'groceries');
  const [terms, setTerms] = useState(coupon?.terms || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickExpiry = (days: number) => {
    const d = new Date(Date.now() + days * 86400000);
    setExpirationDate(d.toISOString().split('T')[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(isHe ? 'אנא בחר קובץ תמונה תקין' : 'Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !storeName.trim()) {
      setError(
        isHe
          ? 'אנא מלא שם קופון ושם חנות'
          : 'Please enter a coupon title and store name.'
      );
      return;
    }

    // Code is NOT mandatory if an image was provided!
    if (!code.trim() && !imageUrl.trim()) {
      setError(
        isHe
          ? 'יש להזין קוד קופון או להעלות תמונה של השובר'
          : 'Please provide either a coupon code or upload a voucher image.'
      );
      return;
    }

    if (initialValue <= 0) {
      setError(isHe ? 'ערך הקופון חייב להיות חיובי' : 'Coupon value must be greater than 0');
      return;
    }

    const payload: Partial<Coupon> = {
      familyId: family.id,
      title: title.trim(),
      storeName: storeName.trim(),
      whereToUse: whereToUse.trim() || storeName.trim(),
      code: code.trim() || undefined,
      pin: pin.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      barcodeType: code.trim() ? barcodeType : 'NONE',
      initialValue: Number(initialValue),
      currentValue: isEditing ? Number(currentValue) : Number(initialValue),
      currency,
      expirationDate: expirationDate || null,
      category,
      terms: terms.trim() || undefined,
      createdBy: coupon?.createdBy || currentUser.id,
      createdByName: coupon?.createdByName || currentUser.name,
      createdAt: coupon?.createdAt || new Date().toISOString(),
      history: coupon?.history || [],
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 p-5 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{isEditing ? t.editCoupon : t.newCoupon}</h2>
              <p className="text-sky-100 text-xs">
                {isHe ? 'עבור משפחת' : 'For'} {family.name}
              </p>
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
        <form onSubmit={handleSubmit} id="coupon-form" className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Store Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {t.title} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {t.storeName} *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={t.storePlaceholder}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Where to use (URL or branch) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.whereToUse}</span>
            </label>
            <input
              type="text"
              value={whereToUse}
              onChange={(e) => setWhereToUse(e.target.value)}
              placeholder={t.whereToUsePlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
            />
            <p className="text-[11px] text-slate-500">
              {isHe
                ? 'אם תזין קישור אתר (URL), יופיע כפתור פתיחה נוח למימוש בקניות אונליין!'
                : 'Entering a URL gives a 1-click button to jump directly to the online store!'}
            </p>
          </div>

          {/* Image Upload / Capture Section (Code is optional if image is attached) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>{t.photoVoucher}</span>
              </label>
              <span className="text-[11px] text-blue-800 font-medium">
                {t.optionalCodeHint}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-xl border border-sky-300 bg-white p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Voucher preview"
                    className="w-16 h-12 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="text-xs font-medium text-slate-700">
                    {isHe ? 'תמונה צורפה בהצלחה' : 'Image attached'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                  >
                    {t.changePhoto}
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    {t.removePhoto}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sky-300 hover:border-blue-500 hover:bg-white rounded-xl p-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">
                  {t.tapToUpload}
                </span>
              </div>
            )}
          </div>

          {/* Code, PIN, Barcode Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {t.couponCode} {imageUrl ? '' : '*'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t.codePlaceholder}
                className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold tracking-wider focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {t.pinCode}
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.pinPlaceholder}
                className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {t.barcodeType}
              </label>
              <select
                value={barcodeType}
                onChange={(e) => setBarcodeType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              >
                <option value="CODE128">{t.code128}</option>
                <option value="QR">{t.qrCode}</option>
                <option value="NONE">{t.none}</option>
              </select>
            </div>
          </div>

          {/* Value and Currency */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {t.initialValue} *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={initialValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInitialValue(val);
                  if (!isEditing) setCurrentValue(val);
                }}
                className="w-full px-3.5 py-2.5 font-mono font-bold text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            {isEditing && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {t.currentValue}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 font-mono font-bold text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {t.currency}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none"
              >
                <option value="₪">₪ (ILS Shekel)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
              </select>
            </div>
          </div>

          {/* Expiration date with quick chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.expirationDate}</span>
              </label>
              <button
                type="button"
                onClick={() => setExpirationDate('')}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                {t.noExpiry}
              </button>
            </div>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
            />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">{isHe ? 'תוקף מהיר:' : 'Quick set:'}</span>
              <button
                type="button"
                onClick={() => handleQuickExpiry(30)}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                +1 {isHe ? 'חודש' : 'mo'}
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpiry(90)}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                +3 {isHe ? 'חודשים' : 'mo'}
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpiry(365)}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                +1 {isHe ? 'שנה' : 'yr'}
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.category}</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CouponCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="groceries">{t.cat_groceries}</option>
              <option value="fashion">{t.cat_fashion}</option>
              <option value="dining">{t.cat_dining}</option>
              <option value="electronics">{t.cat_electronics}</option>
              <option value="entertainment">{t.cat_entertainment}</option>
              <option value="home">{t.cat_home}</option>
              <option value="travel">{t.cat_travel}</option>
              <option value="other">{t.cat_other}</option>
            </select>
          </div>

          {/* Terms & notes */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.terms}</span>
            </label>
            <textarea
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder={t.termsPlaceholder}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none placeholder:text-slate-400 resize-none"
            />
          </div>
        </form>

        {/* Fixed Footer */}
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
            form="coupon-form"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{t.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
