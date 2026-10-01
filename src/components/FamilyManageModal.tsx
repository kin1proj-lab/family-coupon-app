import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Crown,
  Mail,
  CheckCircle,
  Plus,
  Home,
  Shield,
  Send,
} from 'lucide-react';
import { Family, FamilyInvite, Language, User } from '../types';
import { getTranslation } from '../i18n/translations';

interface FamilyManageModalProps {
  families: Family[];
  activeFamily: Family;
  currentUser: User;
  invites: FamilyInvite[];
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSelectFamily: (familyId: string) => void;
  onCreateFamily: (name: string, emoji: string) => void;
  onSendInvite: (familyId: string, email: string) => void;
  onAcceptInvite: (inviteId: string) => void;
  onDeclineInvite: (inviteId: string) => void;
}

export const FamilyManageModal: React.FC<FamilyManageModalProps> = ({
  families,
  activeFamily,
  currentUser,
  invites,
  lang,
  isOpen,
  onClose,
  onSelectFamily,
  onCreateFamily,
  onSendInvite,
  onAcceptInvite,
  onDeclineInvite,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);

  const [inviteEmail, setInviteEmail] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyEmoji, setNewFamilyEmoji] = useState('🏡');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isOwnerOfActiveFamily = activeFamily.ownerId === currentUser.id;

  // Invites targeted to the current user's email
  const myPendingInvites = invites.filter(
    (inv) =>
      inv.invitedEmail.toLowerCase() === currentUser.email.toLowerCase() &&
      inv.status === 'pending'
  );

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onSendInvite(activeFamily.id, inviteEmail.trim());
    setInviteEmail('');
    setInviteSuccessMsg(t.inviteSentSuccess);
    setTimeout(() => setInviteSuccessMsg(''), 4000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    onCreateFamily(newFamilyName.trim(), newFamilyEmoji);
    setNewFamilyName('');
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 p-5 sm:p-6 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              {activeFamily.emoji || '🏡'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.myFamilies}</h2>
              <p className="text-sky-100 text-xs">
                {isHe ? 'ניהול משפחות, חברים והרשאות' : 'Manage families, members & permissions'}
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Pending Invites Banner for current user */}
          {myPendingInvites.length > 0 && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-300 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>{t.pendingInvites}</span>
              </div>
              {myPendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 bg-white rounded-xl border border-sky-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">{inv.familyName}</span>
                    <p className="text-slate-500">
                      {isHe ? 'הוזמנת ע"י' : 'Invited by'} {inv.invitedByName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAcceptInvite(inv.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t.acceptInvite}
                    </button>
                    <button
                      onClick={() => onDeclineInvite(inv.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {t.declineInvite}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Families Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                <span>{t.switchFamily}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.createFamily}</span>
              </button>
            </div>

            {/* Create family form */}
            {showCreateForm && (
              <form
                onSubmit={handleCreateSubmit}
                className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3"
              >
                <div className="text-xs font-bold text-blue-900">{t.createFamily}</div>
                <div className="flex gap-2">
                  <select
                    value={newFamilyEmoji}
                    onChange={(e) => setNewFamilyEmoji(e.target.value)}
                    className="px-2 py-2 bg-white border border-slate-200 rounded-xl text-lg"
                  >
                    <option value="🏡">🏡</option>
                    <option value="❤️">❤️</option>
                    <option value="🌟">🌟</option>
                    <option value="🛒">🛒</option>
                    <option value="🏖️">🏖️</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder={isHe ? 'שם המשפחה (למשל: משפחת לוי)' : 'Family name (e.g. Levi Family)'}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {families.map((fam) => {
                const isActive = fam.id === activeFamily.id;
                const isOwner = fam.ownerId === currentUser.id;
                return (
                  <div
                    key={fam.id}
                    onClick={() => onSelectFamily(fam.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 bg-slate-100 rounded-xl">
                        {fam.emoji || '🏡'}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{fam.name}</span>
                          {isOwner && (
                            <span title="Owner">
                              <Crown className="w-3.5 h-3.5 text-blue-600" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {fam.members.length} {isHe ? 'חברים' : 'members'}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full">
                        {isHe ? 'פעיל' : 'Active'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Active Family Members Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>
                  {t.familyMembers} ({activeFamily.name})
                </span>
              </h3>
            </div>

            {/* Members List */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {activeFamily.members.map((member) => {
                const isMemberOwner = member.role === 'owner';
                const isMe = member.userId === currentUser.id;
                return (
                  <div
                    key={member.userId}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {member.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isMe && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                              {isHe ? 'אני' : 'You'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{member.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                          isMemberOwner
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isMemberOwner && <Crown className="w-3 h-3 text-blue-600" />}
                        {isMemberOwner ? t.owner : t.member}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Invite Form (Visible to Owner) */}
            {isOwnerOfActiveFamily ? (
              <form
                onSubmit={handleInviteSubmit}
                className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>{t.inviteByEmail}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder={t.invitePlaceholder}
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.sendInvite}</span>
                  </button>
                </div>
                {inviteSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{inviteSuccessMsg}</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isHe
                    ? 'בעל המשפחה יכול להזמין חברים לפי כתובת אימייל. החברים יקבלו הזמנה ויוכלו לאשר ולהצטרף.'
                    : 'The family owner can invite members by email. When they log in, they will see the invite to join.'}
                </p>
              </form>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>
                  {isHe
                    ? 'רק מנהל המשפחה (Owner) יכול להזמין חברים חדשים.'
                    : 'Only the family owner can invite new members.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
