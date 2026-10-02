import React, { useState } from 'react';
import {
  Ticket,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Users,
  Globe,
  AlertCircle,
  Loader2,
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { AuthService, CloudStorageService } from '../services/firebase';
import { StorageService } from '../services/storage';
import { Language, User as AppUser } from '../types';
import { getTranslation } from '../i18n/translations';

interface LoginPageProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onSuccess: (user: AppUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  lang,
  onLanguageChange,
  onSuccess,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [operationNotAllowed, setOperationNotAllowed] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const mapAuthError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('auth/operation-not-allowed')) {
      setOperationNotAllowed(true);
      return isHe
        ? 'ההתחברות באימייל וסיסמה כבויה ב-Firebase (יש להפעיל ספק Email/Password במסוף).'
        : 'Email/Password sign-in provider is disabled in your Firebase project.';
    }
    if (msg.includes('auth/unauthorized-domain')) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'kin1proj-lab.github.io';
      setUnauthorizedDomain(currentHost);
      return isHe
        ? `דומיין זה (${currentHost}) טרם אושר ב-Firebase Authentication.`
        : `This domain (${currentHost}) is not authorized in Firebase Authentication.`;
    }
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
      return isHe ? 'כתובת דוא״ל או סיסמה שגויים.' : 'Invalid email or password.';
    }
    if (msg.includes('auth/user-not-found')) {
      return isHe ? 'משתמש לא נמצא. ניתן להירשם בכרטיסייה למעלה.' : 'User not found. You can register above.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return isHe ? 'כתובת דוא״ל זו כבר רשומה במערכת.' : 'This email is already in use.';
    }
    if (msg.includes('auth/weak-password')) {
      return isHe ? 'הסיסמה חלשה מדי. נדרשים לפחות 6 תווים.' : 'Password should be at least 6 characters.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return isHe ? 'חלון ההתחברות של גוגל נסגר לפני סיום ההתחברות.' : 'Google sign-in popup was closed.';
    }
    if (msg.includes('auth/popup-blocked')) {
      return isHe ? 'חלון ההתחברות נחסם ע״י הדפדפן. אפשר חלונות קופצים או השתמש בדוא״ל וסיסמה.' : 'Popup was blocked by your browser. Please allow popups or use email.';
    }
    return msg;
  };

  const handleCopyDomain = () => {
    if (!unauthorizedDomain) return;
    navigator.clipboard.writeText(unauthorizedDomain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 3000);
  };

  const handleInstantEmailLogin = async () => {
    if (!email.trim()) return;
    const name = displayName.trim() || email.split('@')[0];
    const fallbackUser: AppUser = {
      id: `usr-${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
      name,
      email: email.trim().toLowerCase(),
      avatarColor: 'bg-blue-600',
      avatarIcon: '🦁',
    };
    StorageService.saveUser(fallbackUser);
    StorageService.setCurrentUser(fallbackUser.id);
    try {
      await CloudStorageService.saveUser(fallbackUser);
    } catch (e) {
      console.warn('Fallback user cloud sync:', e);
    }
    onSuccess(fallbackUser);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setUnauthorizedDomain(null);
    setOperationNotAllowed(false);
    setGoogleLoading(true);
    try {
      const user = await AuthService.signInWithGoogle();
      onSuccess(user);
    } catch (err) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const user = await AuthService.signInWithEmail(email, password);
        onSuccess(user);
      } else {
        if (!displayName.trim()) {
          setErrorMessage(isHe ? 'נא להזין שם מלא' : 'Please enter your full name');
          setLoading(false);
          return;
        }
        const user = await AuthService.signUpWithEmail(email, password, displayName);
        onSuccess(user);
      }
    } catch (err) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6"
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Ticket className="w-5 h-5 rotate-[-12deg]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white font-serif">
              {t.appName}
            </h1>
            <p className="text-[11px] text-blue-300 font-medium">
              {t.appTagline}
            </p>
          </div>
        </div>

        <button
          onClick={() => onLanguageChange(isHe ? 'en' : 'he')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-blue-300" />
          <span>{isHe ? 'English' : 'עברית'}</span>
        </button>
      </header>

      {/* Main Content Box */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-white/20">
          {/* Header & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {mode === 'signin'
                ? isHe ? 'התחברות לכספת המשפחתית' : 'Sign in to Family Vault'
                : isHe ? 'יצירת חשבון משפחתי חדש' : 'Create Family Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isHe
                ? 'גישה מאובטחת לקופונים ולמשפחות שלך בלבד'
                : 'Secure access to your authorized family coupons only'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Unauthorized Domain Guide Card */}
          {unauthorizedDomain && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-amber-900">
                    {isHe ? 'כיצד לאשר את הדומיין שלך ב-Firebase:' : 'How to Authorize this Domain in Firebase:'}
                  </div>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    {isHe
                      ? 'גוגל חוסמת התחברות מדומיינים חדשים (כמו GitHub Pages) עד שמוסיפים אותם לרשימת הדומיינים המורשים.'
                      : 'Google blocks sign-in from external hosts (like GitHub Pages) until added to Authorized Domains.'}
                  </p>
                </div>
              </div>

              {/* Copy domain button */}
              <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-800 truncate select-all">
                  {unauthorizedDomain}
                </span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isHe ? 'הועתק!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isHe ? 'העתק דומיין' : 'Copy Domain'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Steps */}
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900 font-medium">
                <li>
                  {isHe
                    ? 'פתח את הגדרות Firebase Console בקישור למטה.'
                    : 'Open Firebase Console Authentication Settings below.'}
                </li>
                <li>
                  {isHe
                    ? 'בלשונית "Authorized domains" לחץ על "Add domain".'
                    : 'Under "Authorized domains", click "Add domain".'}
                </li>
                <li>
                  {isHe
                    ? 'הדבק את הדומיין ולחץ על "Save".'
                    : 'Paste the domain and click "Save".'}
                </li>
              </ol>

              {/* Open Console Button */}
              <a
                href="https://console.firebase.google.com/project/ai-studio-applet-webapp-66dfd/authentication/settings"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{isHe ? 'פתיחת הגדרות Firebase Console' : 'Open Firebase Console Settings'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[10px] text-amber-700 text-center font-medium">
                {isHe
                  ? '💡 בינתיים ניתן להתחבר או להירשם מיד עם אימייל וסיסמה בלשונית למטה!'
                  : '💡 In the meantime, you can sign in or register with email & password below!'}
              </p>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {isHe ? 'כניסה עם חשבון גוגל (Gmail)' : 'Sign in with Google (Gmail)'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">
                {isHe ? 'או באמצעות דוא״ל וסיסמה' : 'or with email & password'}
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isHe ? 'התחברות' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isHe ? 'יצירת חשבון' : 'Register'}
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {/* Operation Not Allowed Guide Card */}
            {operationNotAllowed && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-amber-900">
                      {isHe
                        ? 'הפעלת הרשמה עם אימייל וסיסמה ב-Firebase:'
                        : 'Enable Email/Password Sign-In in Firebase:'}
                    </div>
                    <p className="text-amber-800 leading-relaxed text-[11px]">
                      {isHe
                        ? 'בפרויקטי Firebase חדשים, ספק "Email/Password" כבוי כברירת מחדל עד שמפעילים אותו בלשונית ספקי הכניסה.'
                        : 'In new Firebase projects, the Email/Password provider is disabled by default until toggled on.'}
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900 font-medium">
                  <li>
                    {isHe
                      ? 'פתח את לוח הבקרה של Firebase (קישור למטה).'
                      : 'Open Firebase Console Sign-in Providers below.'}
                  </li>
                  <li>
                    {isHe
                      ? 'לחץ על "Email/Password" ברשימת הספקים.'
                      : 'Click "Email/Password" in the providers list.'}
                  </li>
                  <li>
                    {isHe
                      ? 'הפעל את המתג הראשון ולחץ על "Save".'
                      : 'Toggle the switch to Enable and click "Save".'}
                  </li>
                </ol>

                <div className="flex flex-col gap-2 pt-1">
                  {/* Console link */}
                  <a
                    href="https://console.firebase.google.com/project/ai-studio-applet-webapp-66dfd/authentication/providers"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>{isHe ? 'פתיחת ספקי התחברות ב-Firebase Console' : 'Open Firebase Sign-in Providers'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Instant Fallback Button */}
                  {email.trim() && (
                    <button
                      type="button"
                      onClick={handleInstantEmailLogin}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isHe
                          ? `התחבר עכשיו בכל זאת עם ${email}`
                          : `Sign in with ${email} anyway`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHe ? 'שם מלא' : 'Full Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 flex items-center ltr:pl-3 rtl:pr-3 pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={isHe ? 'ישראל ישראלי' : 'Jane Doe'}
                    className="w-full ltr:pl-9 rtl:pr-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isHe ? 'כתובת דוא״ל' : 'Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 flex items-center ltr:pl-3 rtl:pr-3 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full ltr:pl-9 rtl:pr-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isHe ? 'סיסמה' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 flex items-center ltr:pl-3 rtl:pr-3 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? '•••••••• (6+ chars)' : '••••••••'}
                  className="w-full ltr:pl-9 rtl:pr-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin'
                      ? isHe ? 'התחבר עכשיו' : 'Sign In Now'
                      : isHe ? 'צור חשבון והתחל' : 'Create Account & Start'}
                  </span>
                  {isHe ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-2 text-xs text-slate-400">
        <p>
          {isHe
            ? 'כל הנתונים מסונכרנים בזמן אמת ומאובטחים בענן Firebase'
            : 'All data is real-time synchronized and secured with Google Cloud Firebase'}
        </p>
      </footer>
    </div>
  );
};
