import React, { useState } from 'react';
import {
  Ticket,
  ChevronDown,
  Globe,
  Plus,
  Users,
  Crown,
  Zap,
  Cloud,
} from 'lucide-react';
import { Family, Language, User } from '../types';
import { getTranslation } from '../i18n/translations';

interface HeaderProps {
  families: Family[];
  activeFamily: Family;
  currentUser: User;
  allUsers: User[];
  lang: Language;
  cloudSyncActive?: boolean;
  onLanguageChange: (lang: Language) => void;
  onSelectFamily: (familyId: string) => void;
  onSwitchUser: (userId: string) => void;
  onOpenAddCoupon: () => void;
  onOpenQuickAdd: () => void;
  onOpenManageFamilies: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  families,
  activeFamily,
  currentUser,
  allUsers,
  lang,
  cloudSyncActive = true,
  onLanguageChange,
  onSelectFamily,
  onSwitchUser,
  onOpenAddCoupon,
  onOpenQuickAdd,
  onOpenManageFamilies,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);

  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isOwner = activeFamily.ownerId === currentUser.id;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transform hover:scale-105 transition-transform">
              <Ticket className="w-6 h-6 rotate-[-12deg]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
                  {t.appName}
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Vault
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t.appTagline}
              </p>
            </div>
          </div>

          {/* Center: Family Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFamilyDropdownOpen(!familyDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 transition-colors cursor-pointer border border-slate-200"
            >
              <span className="text-lg">{activeFamily.emoji || '🏡'}</span>
              <div className="text-left rtl:text-right">
                <div className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[120px] sm:max-w-[180px]">
                  {activeFamily.name}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span>{activeFamily.members.length} {isHe ? 'חברים' : 'members'}</span>
                  {isOwner && (
                    <Crown className="w-2.5 h-2.5 text-blue-600" />
                  )}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {/* Family Dropdown Menu */}
            {familyDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setFamilyDropdownOpen(false)}
                />
                <div
                  className="absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-20 animate-in fade-in zoom-in-95 ltr:left-0 rtl:right-0"
                  dir={isHe ? 'rtl' : 'ltr'}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.myFamilies}
                  </div>

                  <div className="space-y-1">
                    {families.map((fam) => {
                      const isActive = fam.id === activeFamily.id;
                      return (
                        <button
                          key={fam.id}
                          onClick={() => {
                            onSelectFamily(fam.id);
                            setFamilyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 text-blue-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{fam.emoji || '🏡'}</span>
                            <span>{fam.name}</span>
                          </div>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setFamilyDropdownOpen(false);
                        onOpenManageFamilies();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>{isHe ? 'ניהול משפחות והזמנות...' : 'Manage Families & Invites...'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right actions: Cloud Status, Language, User Profile Switcher, Quick Add, Full Add Coupon */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Cloud Storage Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span>{isHe ? 'מסד נתונים בענן (Firestore)' : 'Cloud DB Live'}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(isHe ? 'en' : 'he')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Toggle Hebrew / English"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{isHe ? 'English' : 'עברית'}</span>
            </button>

            {/* User Switcher (For testing permissions) */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                title={t.switchUser}
              >
                <div className={`w-7 h-7 rounded-xl ${currentUser.avatarColor} text-white text-xs font-bold flex items-center justify-center`}>
                  {currentUser.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden md:block text-left rtl:text-right">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    {isOwner && <Crown className="w-2.5 h-2.5 text-blue-600" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                    {currentUser.email}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div
                    className="absolute top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-20 animate-in fade-in zoom-in-95 ltr:right-0 rtl:left-0"
                    dir={isHe ? 'rtl' : 'ltr'}
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t.switchUser}
                    </div>

                    <div className="space-y-1">
                      {allUsers.map((u) => {
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSwitchUser(u.id);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-blue-50 text-blue-900 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg ${u.avatarColor} text-white text-[10px] font-bold flex items-center justify-center`}>
                                {u.name.slice(0, 1)}
                              </div>
                              <div className="text-left rtl:text-right">
                                <div className="font-semibold">{u.name}</div>
                                <div className="text-[10px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Add Button (⚡) */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-sky-100 hover:bg-sky-200 text-blue-900 font-bold text-xs border border-sky-300 transition-all cursor-pointer"
              title={t.quickAddTitle}
            >
              <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span className="hidden sm:inline">{t.quickAdd}</span>
            </button>

            {/* Add Coupon Button */}
            <button
              onClick={onOpenAddCoupon}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">{t.addCoupon}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
