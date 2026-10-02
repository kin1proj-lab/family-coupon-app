import React, { useState } from 'react';
import {
  Ticket,
  Users,
  Copy,
  Check,
  Plus,
  Globe,
  LogOut,
  Mail,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { FamilyInvite, Language, User } from '../types';
import { getTranslation } from '../i18n/translations';

interface OnboardingNoFamilyScreenProps {
  currentUser: User;
  invites: FamilyInvite[];
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
  onCreateFamily: (name: string, emoji: string) => void;
  onAcceptInvite: (inviteId: string) => void;
}

export const OnboardingNoFamilyScreen: React.FC<OnboardingNoFamilyScreenProps> = ({
  currentUser,
  invites,
  lang,
  onLanguageChange,
  onLogout,
  onCreateFamily,
  onAcceptInvite,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyEmoji, setFamilyEmoji] = useState('🏡');

  // Filter pending invites targeting this user's email
  const myPendingInvites = invites.filter(
    (inv) =>
      inv.invitedEmail.toLowerCase() === (currentUser.email || '').toLowerCase() &&
      inv.status === 'pending'
  );

  const handleCopyEmail = () => {
    if (!currentUser.email) return;
    navigator.clipboard.writeText(currentUser.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    onCreateFamily(familyName.trim(), familyEmoji);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6"
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* Top Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Ticket className="w-5 h-5 rotate-[-12deg]" />
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-tight">
              {t.appName}
            </div>
            <div className="text-[11px] text-blue-200">
              {isHe ? 'כספת קופונים משפחתית' : 'Family Coupon Vault'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => onLanguageChange(isHe ? 'en' : 'he')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{isHe ? 'English' : 'עברית'}</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isHe ? 'התנתק' : 'Logout'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto my-6 space-y-6">
        {/* Welcome greeting */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{isHe ? 'שלב החיבור הראשון' : 'First Step Connection'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isHe ? `שלום ${currentUser.name}! 👋` : `Welcome, ${currentUser.name}! 👋`}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {isHe
              ? 'כדי להתחיל לנהל שוברים וקופונים, בחר כיצד להמשיך: בקש מבן משפחה לשתף אותך, או צור משפחה חדשה בעצמך.'
              : 'To start managing family coupons, choose how to proceed: ask a family member to invite you, or create your own family.'}
          </p>
        </div>

        {/* 2 Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Option 1: Connect to existing family */}
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl backdrop-blur-sm">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Users className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {isHe ? '1. הצטרפות למשפחה קיימת' : '1. Join an Existing Family'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isHe
                    ? 'בקש מבן המשפחה שלך לשתף אותך ולהזין את כתובת המייל שלך:'
                    : 'Ask your family member to invite you using your email address:'}
                </p>
              </div>

              {/* Email box with copy button */}
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-mono text-blue-200 truncate select-all">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{isHe ? 'הועתק!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isHe ? 'העתק מייל' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Pending Invites list if any */}
              {myPendingInvites.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>{isHe ? 'נמצאו הזמנות הממתינות לאישורך:' : 'Found pending invites for you:'}</span>
                  </div>
                  {myPendingInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {inv.familyName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isHe ? 'הוזמנת ע"י' : 'Invited by'} {inv.invitedByName}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onAcceptInvite(inv.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        {isHe ? 'הצטרף עכשיו' : 'Accept & Join'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  {isHe
                    ? 'ברגע שבן משפחה ישלח לך הזמנה, היא תופיע כאן אוטומטית בזמן אמת ותוכל להצטרף בלחיצה אחת.'
                    : 'Once a family member sends an invite to your email, it will appear here in real-time.'}
                </div>
              )}
            </div>
          </div>

          {/* Option 2: Create a new family */}
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl backdrop-blur-sm">
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {isHe ? '2. יצירת משפחה חדשה' : '2. Create a New Family'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isHe
                    ? 'רוצה לפתוח כספת משפחתית משלך ולהזמין אליה בני משפחה?'
                    : 'Want to start your own family vault and invite family members?'}
                </p>
              </div>

              {/* Family name and Emoji input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  {isHe ? 'שם המשפחה והסמל:' : 'Family Name & Icon:'}
                </label>
                <div className="flex gap-2">
                  <select
                    value={familyEmoji}
                    onChange={(e) => setFamilyEmoji(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-lg text-white outline-none cursor-pointer"
                  >
                    <option value="🏡">🏡</option>
                    <option value="❤️">❤️</option>
                    <option value="🌟">🌟</option>
                    <option value="🛒">🛒</option>
                    <option value="🏖️">🏖️</option>
                    <option value="👑">👑</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder={isHe ? 'למשל: משפחת ישראלי' : 'e.g. Israeli Family'}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 focus:border-blue-400 rounded-xl text-xs sm:text-sm text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!familyName.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isHe ? 'צור כספת משפחתית' : 'Create Family Vault'}</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center py-2 text-xs text-slate-500">
        <p>
          {isHe
            ? 'מאובטח ומסונכרן בזמן אמת בענן Firebase'
            : 'Secured and synchronized in real-time with Firebase'}
        </p>
      </footer>
    </div>
  );
};
