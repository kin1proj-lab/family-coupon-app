import React, { useState, useRef } from 'react';
import {
  X,
  Zap,
  Image as ImageIcon,
  Upload,
  Camera,
  Check,
  Store,
  DollarSign,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Coupon, CouponCategory, Family, Language, User } from '../types';
import { getTranslation } from '../i18n/translations';
import { compressImage } from '../utils/imageCompressor';

interface QuickAddModalProps {
  existingCoupons: Coupon[];
  family: Family;
  currentUser: User;
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSave: (couponData: Partial<Coupon>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  existingCoupons,
  family,
  currentUser,
  lang,
  isOpen,
  onClose,
  onSave,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [storeName, setStoreName] = useState('');
  const [initialValue, setInitialValue] = useState<number>(100);
  const [currency, setCurrency] = useState('₪');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Extract unique stores and their past data (category, whereToUse)
  const storeSuggestions = React.useMemo(() => {
    const map = new Map<string, { count: number; category: CouponCategory; whereToUse: string }>();
    existingCoupons.forEach((c) => {
      if (c.storeName) {
        const key = c.storeName.trim();
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, {
            count: 1,
            category: c.category,
            whereToUse: c.whereToUse,
          });
        }
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8); // Top 8 suggestions
  }, [existingCoupons]);

  const [isCompressing, setIsCompressing] = useState(false);

  const handleSelectStore = (store: string) => {
    setStoreName(store);
    setError('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(isHe ? 'אנא בחר קובץ תמונה תקין' : 'Please select a valid image file');
      return;
    }

    setIsCompressing(true);
    setError('');
    try {
      const compressed = await compressImage(file, 1024, 1024, 0.75);
      setImageUrl(compressed);
    } catch (err) {
      console.warn('Compression fallback to FileReader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setError(isHe ? 'אנא הזן או בחר חנות' : 'Please specify a store name');
      return;
    }
    if (!initialValue || initialValue <= 0) {
      setError(isHe ? 'אנא הזן סכום תקין' : 'Please enter a valid amount');
      return;
    }
    if (!imageUrl) {
      setError(
        isHe
          ? 'אנא העלה תמונה של השובר (או השתמש בהוספה מלאה לקוד בלבד)'
          : 'Please add a voucher image for fast add'
      );
      return;
    }

    // Auto-detect previous settings for this store if available
    const knownStore = storeSuggestions.find(
      ([s]) => s.toLowerCase() === storeName.trim().toLowerCase()
    );

    const detectedCategory: CouponCategory = knownStore ? knownStore[1].category : 'groceries';
    const detectedWhereToUse = knownStore ? knownStore[1].whereToUse : storeName.trim();

    const title = isHe
      ? `שובר ${storeName.trim()}`
      : `${storeName.trim()} Voucher`;

    const payload: Partial<Coupon> = {
      familyId: family.id,
      title,
      storeName: storeName.trim(),
      whereToUse: detectedWhereToUse,
      imageUrl,
      barcodeType: 'NONE',
      initialValue: Number(initialValue),
      currentValue: Number(initialValue),
      currency,
      expirationDate: null,
      category: detectedCategory,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      history: [],
    };

    onClose();
    onSave(payload);
  };

  const quickAmounts = [50, 100, 150, 200, 300, 500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-lg">{t.quickAddTitle}</h3>
                <span className="text-[10px] bg-sky-300 text-blue-950 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                  Fast
                </span>
              </div>
              <p className="text-sky-100 text-xs">{t.quickAddSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} id="quick-add-form" className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* 1. Store / Brand with past suggestions */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span>1. {t.storeName} *</span>
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => {
                setStoreName(e.target.value);
                setError('');
              }}
              placeholder={t.storePlaceholder}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-semibold outline-none transition-colors"
            />

            {/* Suggestions Chips from past coupons */}
            {storeSuggestions.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-medium text-slate-500">
                  {t.recentStores}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {storeSuggestions.map(([name]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectStore(name)}
                      className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                        storeName === name
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Value & Currency */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span>2. {t.initialValue} *</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={initialValue || ''}
                  onChange={(e) => setInitialValue(Number(e.target.value))}
                  placeholder="100"
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-lg font-bold font-mono outline-none"
                />
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-800 focus:border-blue-500 outline-none"
              >
                <option value="₪">₪ (ILS)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
              </select>
            </div>

            {/* Quick value chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInitialValue(amt)}
                  className={`text-xs px-2.5 py-1 rounded-xl border transition-colors cursor-pointer ${
                    initialValue === amt
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {amt} {currency}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Image Upload or Photo Capture */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>3. {t.photoVoucher} *</span>
            </label>

            {/* Hidden Inputs: Gallery/Files (no capture) & Camera (with capture) */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-2xl border-2 border-blue-300 bg-slate-50 p-2 overflow-hidden flex items-center justify-center group">
                <img
                  src={imageUrl}
                  alt="Coupon Voucher"
                  className="max-h-48 rounded-xl object-contain shadow-xs"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold shadow hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isHe ? 'גלריה' : 'Gallery'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold shadow hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>{isHe ? 'מצלמה' : 'Camera'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow hover:bg-rose-600 cursor-pointer"
                  >
                    {t.removePhoto}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Gallery / Device Files */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="border-2 border-dashed border-sky-300 hover:border-blue-500 hover:bg-sky-50/50 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group bg-white shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-blue-600 group-hover:scale-105 transition-transform flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {isHe ? 'העלאה מגלריה / קבצים' : 'Gallery or Files'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {isHe ? 'בחר מתוך אלבום התמונות' : 'Choose from photo library'}
                    </div>
                  </div>
                </button>

                {/* 2. Open Camera */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group bg-white shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {isHe ? 'צילום במצלמה' : 'Open Camera'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {isHe ? 'צלם שובר עכשיו' : 'Snap photo now'}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Optional URL input fallback */}
            {!imageUrl && (
              <div className="pt-1">
                <input
                  type="text"
                  placeholder={t.imageUrlPlaceholder}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-xs transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            form="quick-add-form"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isHe ? 'שמור שובר בקליק' : 'Save Fast Coupon'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
