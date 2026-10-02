import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Check,
  Sparkles,
  Smile,
  Palette,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { Language, ThemeMode, User } from '../types';
import { getTranslation } from '../i18n/translations';

export const USER_AVATAR_ICONS = [
  { id: 'lion', icon: '🦁', nameHe: 'אריה', nameEn: 'Lion' },
  { id: 'fox', icon: '🦊', nameHe: 'שועל', nameEn: 'Fox' },
  { id: 'panda', icon: '🐼', nameHe: 'פנדה', nameEn: 'Panda' },
  { id: 'rocket', icon: '🚀', nameHe: 'חללית', nameEn: 'Rocket' },
  { id: 'star', icon: '⭐', nameHe: 'כוכב', nameEn: 'Star' },
  { id: 'crown', icon: '👑', nameHe: 'כתר', nameEn: 'Crown' },
  { id: 'unicorn', icon: '🦄', nameHe: 'חד-קרן', nameEn: 'Unicorn' },
  { id: 'cat', icon: '🐱', nameHe: 'חתול', nameEn: 'Cat' },
  { id: 'dog', icon: '🐶', nameHe: 'כלב', nameEn: 'Dog' },
  { id: 'avocado', icon: '🥑', nameHe: 'אבוקדו', nameEn: 'Avocado' },
] as const;

export const AVATAR_COLORS = [
  { id: 'blue', class: 'bg-blue-600', nameHe: 'כחול', nameEn: 'Blue' },
  { id: 'purple', class: 'bg-purple-600', nameHe: 'סגול', nameEn: 'Purple' },
  { id: 'emerald', class: 'bg-emerald-600', nameHe: 'ירוק', nameEn: 'Emerald' },
  { id: 'amber', class: 'bg-amber-600', nameHe: 'כתום', nameEn: 'Amber' },
  { id: 'rose', class: 'bg-rose-600', nameHe: 'ורוד', nameEn: 'Rose' },
];

interface UserSettingsModalProps {
  currentUser: User;
  lang: Language;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (updatedUser: User) => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  currentUser,
  lang,
  theme,
  onThemeChange,
  isOpen,
  onClose,
  onSaveUser,
}) => {
  if (!isOpen) return null;

  const isHe = lang === 'he';
  const t = getTranslation(lang);

  const [name, setName] = useState(currentUser.name);
  const [selectedIcon, setSelectedIcon] = useState<string>(
    currentUser.avatarIcon || '🦁'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    currentUser.avatarColor || 'bg-blue-600'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      avatarIcon: selectedIcon,
      avatarColor: selectedColor,
    };

    onSaveUser(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Smile className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {isHe ? 'הגדרות משתמש ותצוגה' : 'User Settings & Appearance'}
              </h3>
              <p className="text-[11px] text-sky-100">
                {isHe
                  ? 'בחר אייקון שייצג אותך והתאם את מראה האפליקציה'
                  : 'Customize your avatar and theme preferences'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl ${selectedColor} text-white text-2xl flex items-center justify-center shadow-md shrink-0 transition-all`}
            >
              <span>{selectedIcon}</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                {isHe ? 'תצוגה מקדימה' : 'Live Preview'}
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {name || currentUser.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentUser.email}
              </div>
            </div>
          </div>

          {/* 1. Theme Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span>{isHe ? 'מצב תצוגה (נושא)' : 'Appearance Mode'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{isHe ? 'בהיר' : 'Light'}</span>
              </button>

              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-purple-400" />
                <span>{isHe ? 'כהה' : 'Dark'}</span>
              </button>

              <button
                type="button"
                onClick={() => onThemeChange('system')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-sky-500" />
                <span>{isHe ? 'אוטומטי' : 'System'}</span>
              </button>
            </div>
          </div>

          {/* 2. Pick Icon from 10 icons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span>
                {isHe
                  ? 'בחר אייקון אישי (מתוך 10 אייקונים)'
                  : 'Select an Avatar Icon (Max 10 Icons)'}
              </span>
            </label>

            <div className="grid grid-cols-5 gap-2.5">
              {USER_AVATAR_ICONS.map((item) => {
                const isSelected = selectedIcon === item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.icon)}
                    className={`h-13 rounded-2xl text-2xl flex flex-col items-center justify-center transition-all cursor-pointer border relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 shadow-md scale-105 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                    title={isHe ? item.nameHe : item.nameEn}
                  >
                    <span>{item.icon}</span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      {isHe ? item.nameHe : item.nameEn}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 ltr:right-1 rtl:left-1 w-3 h-3 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Pick Color */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span>{isHe ? 'צבע רקע לאייקון' : 'Avatar Background Color'}</span>
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((col) => {
                const isSelected = selectedColor === col.class;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColor(col.class)}
                    className={`w-9 h-9 rounded-xl ${col.class} flex items-center justify-center text-white transition-all cursor-pointer ${
                      isSelected ? 'ring-3 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={isHe ? col.nameHe : col.nameEn}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Display Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {isHe ? 'שם לתצוגה' : 'Display Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-750 focus:border-blue-500 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {isHe ? 'שמור שינויים' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

