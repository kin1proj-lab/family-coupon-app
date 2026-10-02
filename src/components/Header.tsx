import React, { useState } from 'react';
import {
  Ticket,
  ChevronDown,
  Globe,
  Plus,
  Users,
  Crown,
  Zap,
  LogOut,
  Check,
  User as UserIcon,
  Smile,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { Family, Language, ThemeMode, User } from '../types';
import { getTranslation } from '../i18n/translations';

interface HeaderProps {
  families: Family[];
  activeFamily: Family;
  currentUser: User;
  lang: Language;
  theme: ThemeMode;
  onLanguageChange: (lang: Language) => void;
  onToggleTheme: () => void;
  onSelectFamily: (familyId: string) => void;
  onLogout: () => void;
  onOpenAddCoupon: () => void;
  onOpenQuickAdd: () => void;
  onOpenManageFamilies: () => void;
  onOpenUserSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  families,
  activeFamily,
  currentUser,
  lang,
  theme,
  onLanguageChange,
  onToggleTheme,
  onSelectFamily,
  onLogout,
  onOpenAddCoupon,
  onOpenQuickAdd,
  onOpenManageFamilies,
  onOpenUserSettings,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isOwner = activeFamily.ownerId === currentUser.id;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs w-full max-w-full overflow-x-clip transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Left: Brand Logo & Current Active Family */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Ticket className="w-5 h-5 sm:w-6 sm:h-6 rotate-[-12deg]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif truncate">
                  {t.appName}
                </span>
              </div>
              {/* Active Family Name & Emoji badge */}
              <button
                type="button"
                onClick={onOpenManageFamilies}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-sky-400 hover:text-blue-900 dark:hover:text-sky-300 truncate cursor-pointer"
                title={isHe ? 'לחץ לניהול משפחות' : 'Click to manage families'}
              >
                <span>{activeFamily.emoji || '🏡'}</span>
                <span className="truncate max-w-[100px] sm:max-w-[150px]">{activeFamily.name}</span>
                {isOwner && <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Right: Quick Add, Add Coupon & User Menu Icon */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Add Button (⚡) - Always visible in main */}
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/70 dark:hover:bg-sky-900 text-blue-900 dark:text-sky-200 font-bold text-xs border border-sky-300 dark:border-sky-800 transition-all cursor-pointer shadow-2xs"
              title={t.quickAddTitle}
            >
              <Zap className="w-4 h-4 text-blue-600 dark:text-sky-400 fill-blue-600 dark:fill-sky-400" />
              <span className="hidden xs:inline text-xs">{t.quickAdd}</span>
            </button>

            {/* Add Coupon Button (➕) - Always visible in main */}
            <button
              type="button"
              onClick={onOpenAddCoupon}
              className="flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              title={t.addCoupon}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">{t.addCoupon}</span>
            </button>

            {/* Dark Mode Quick Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer transition-all"
              title={isDark ? (isHe ? 'מעבר למצב בהיר' : 'Switch to Light Mode') : (isHe ? 'מעבר למצב כהה' : 'Switch to Dark Mode')}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Icon Button -> Opens action list (My families, Language, Logout) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-800 shadow-2xs cursor-pointer transition-all"
                title={currentUser.name}
              >
                <div
                  className={`w-8 h-8 rounded-xl ${
                    currentUser.avatarColor || 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                  } text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {currentUser.avatarIcon ? (
                    <span>{currentUser.avatarIcon}</span>
                  ) : (
                    <span>{currentUser.name.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 hidden sm:block ltr:mr-1 rtl:ml-1" />
              </button>

              {/* User Actions Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div
                    className="absolute top-full mt-2 w-72 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 ltr:right-0 rtl:left-0 text-slate-800 dark:text-slate-100"
                    dir={isHe ? 'rtl' : 'ltr'}
                  >
                    {/* User profile header inside menu */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl ${
                            currentUser.avatarColor || 'bg-blue-600'
                          } text-white text-base font-bold flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          {currentUser.avatarIcon ? (
                            <span>{currentUser.avatarIcon}</span>
                          ) : (
                            <span>{currentUser.name.slice(0, 1).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                            <span>{currentUser.name}</span>
                            {isOwner && (
                              <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                            {currentUser.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions List with explicit titles */}
                    <div className="space-y-1">
                      {/* Action 1: My Families */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenManageFamilies();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-start"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div>{isHe ? 'המשפחות שלי' : 'My Families'}</div>
                            <div className="text-[10px] font-normal text-slate-400">
                              {activeFamily.emoji} {activeFamily.name} ({families.length})
                            </div>
                          </div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 rotate-[-90deg] rtl:rotate-[90deg]" />
                      </button>

                      {/* Action 2: User Settings & Avatar Icon */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenUserSettings();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-start"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 text-sm">
                            {currentUser.avatarIcon || <Smile className="w-4 h-4" />}
                          </div>
                          <div>
                            <div>{isHe ? 'הגדרות משתמש ואייקון' : 'User Settings & Avatar'}</div>
                            <div className="text-[10px] font-normal text-slate-400">
                              {isHe ? 'בחר אייקון מתוך 10 אייקונים' : 'Choose from 10 icons'}
                            </div>
                          </div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 rotate-[-90deg] rtl:rotate-[90deg]" />
                      </button>

                      {/* Action 3: Dark Mode Toggle in Menu */}
                      <button
                        type="button"
                        onClick={() => {
                          onToggleTheme();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-start"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                          </div>
                          <div>
                            <div>{isHe ? 'מצב תצוגה' : 'Appearance'}</div>
                            <div className="text-[10px] font-normal text-slate-400">
                              {isDark ? (isHe ? 'כהה (לחץ למעבר לבהיר)' : 'Dark (Click for Light)') : (isHe ? 'בהיר (לחץ למעבר לכהה)' : 'Light (Click for Dark)')}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                          {isDark ? '🌙' : '☀️'}
                        </span>
                      </button>

                      {/* Action 4: Language */}
                      <button
                        type="button"
                        onClick={() => {
                          onLanguageChange(isHe ? 'en' : 'he');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-start"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <div>{isHe ? 'שפה' : 'Language'}</div>
                            <div className="text-[10px] font-normal text-slate-400">
                              {isHe ? 'עברית (עבור ל-English)' : 'English (Switch to עברית)'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                          {isHe ? 'EN' : 'עב'}
                        </span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {/* Action 5: Logout */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors cursor-pointer text-start"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span>{isHe ? 'התנתקות' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
