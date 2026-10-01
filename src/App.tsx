import React, { useState, useEffect, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Sparkles,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  Coupon,
  Family,
  FamilyInvite,
  FilterState,
  Language,
  User,
} from './types';
import { StorageService } from './services/storage';
import { CloudStorageService, testFirestoreConnection } from './services/firebase';
import { getTranslation } from './i18n/translations';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { CouponCard } from './components/CouponCard';
import { CouponDetailModal } from './components/CouponDetailModal';
import { RedeemModal } from './components/RedeemModal';
import { AddEditCouponModal } from './components/AddEditCouponModal';
import { QuickAddModal } from './components/QuickAddModal';
import { FamilyManageModal } from './components/FamilyManageModal';

export default function App() {
  const [lang, setLang] = useState<Language>('he');
  const t = getTranslation(lang);
  const isHe = lang === 'he';

  // Core data states
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [activeFamilyId, setActiveFamilyId] = useState<string>('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [invites, setInvites] = useState<FamilyInvite[]>([]);

  // Modals state
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [redeemingCoupon, setRedeemingCoupon] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isManageFamiliesOpen, setIsManageFamiliesOpen] = useState(false);

  // Default Filter: ONLY show activated coupons that can be used!
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    store: 'all',
    category: 'all',
    expiration: 'all',
    valueRange: 'all',
    usageStatus: 'usable', // DEFAULT: Usable & Active coupons!
    sortBy: 'expiry_asc',
  });

  // Initialize and load from storage and Firestore
  useEffect(() => {
    // 1. Load initial cache
    const loadedUsers = StorageService.getUsers();
    const loadedCurrentUser = StorageService.getCurrentUser();
    const loadedFamilies = StorageService.getFamilies();
    const loadedActiveFamId = StorageService.getActiveFamilyId();
    const loadedCoupons = StorageService.getCoupons();
    const loadedInvites = StorageService.getInvites();

    setUsers(loadedUsers);
    setCurrentUser(loadedCurrentUser);
    setFamilies(loadedFamilies);
    setActiveFamilyId(loadedActiveFamId);
    setCoupons(loadedCoupons);
    setInvites(loadedInvites);

    // 2. Connect to Cloud Firestore & set up real-time sync
    testFirestoreConnection().then((connected) => {
      if (connected) {
        CloudStorageService.seedInitialDataIfNeeded();
      }
    });

    const unsubCoupons = CloudStorageService.subscribeToCoupons((cloudCoupons) => {
      setCoupons(cloudCoupons);
      StorageService.saveCoupons(cloudCoupons);
    });

    const unsubFamilies = CloudStorageService.subscribeToFamilies((cloudFamilies) => {
      setFamilies(cloudFamilies);
      StorageService.saveFamilies(cloudFamilies);
    });

    const unsubInvites = CloudStorageService.subscribeToInvites((cloudInvites) => {
      setInvites(cloudInvites);
      StorageService.saveInvites(cloudInvites);
    });

    return () => {
      unsubCoupons();
      unsubFamilies();
      unsubInvites();
    };
  }, []);

  // Update HTML dir and lang
  useEffect(() => {
    document.documentElement.dir = isHe ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isHe]);

  // Active Family object
  const activeFamily = useMemo(() => {
    return families.find((f) => f.id === activeFamilyId) || families[0] || null;
  }, [families, activeFamilyId]);

  // Coupons for active family
  const familyCoupons = useMemo(() => {
    if (!activeFamily) return [];
    return coupons.filter((c) => c.familyId === activeFamily.id);
  }, [coupons, activeFamily]);

  // Unique stores for the filter dropdown
  const uniqueStores = useMemo(() => {
    const stores = new Set<string>();
    familyCoupons.forEach((c) => {
      if (c.storeName) stores.add(c.storeName);
    });
    return Array.from(stores).sort();
  }, [familyCoupons]);

  // Filtered & Sorted coupons
  const displayedCoupons = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return familyCoupons
      .filter((c) => {
        // Search
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchStore = c.storeName.toLowerCase().includes(q);
          const matchCode = c.code ? c.code.toLowerCase().includes(q) : false;
          const matchWhere = c.whereToUse.toLowerCase().includes(q);
          if (!matchTitle && !matchStore && !matchCode && !matchWhere) return false;
        }

        // Store
        if (filters.store !== 'all' && c.storeName !== filters.store) {
          return false;
        }

        // Category
        if (filters.category !== 'all' && c.category !== filters.category) {
          return false;
        }

        // Value Range
        if (filters.valueRange === 'under100' && c.currentValue >= 100) return false;
        if (
          filters.valueRange === '100to300' &&
          (c.currentValue < 100 || c.currentValue > 300)
        )
          return false;
        if (filters.valueRange === 'over300' && c.currentValue <= 300) return false;

        // Expiration
        if (filters.expiration !== 'all') {
          if (!c.expirationDate) {
            if (filters.expiration === 'expired') return false;
            if (filters.expiration === 'expiring_soon') return false;
          } else {
            const exp = new Date(c.expirationDate);
            exp.setHours(0, 0, 0, 0);
            const daysDiff = Math.ceil(
              (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (filters.expiration === 'expired' && daysDiff >= 0) return false;
            if (
              filters.expiration === 'expiring_soon' &&
              (daysDiff < 0 || daysDiff > 7)
            )
              return false;
            if (filters.expiration === 'active' && daysDiff < 0) return false;
          }
        }

        // Usage Status (Default is 'usable' = currentValue > 0 AND not expired)
        if (filters.usageStatus === 'usable') {
          if (c.currentValue <= 0) return false;
          if (c.expirationDate) {
            const exp = new Date(c.expirationDate);
            exp.setHours(0, 0, 0, 0);
            if (exp.getTime() < today.getTime()) return false;
          }
        } else if (filters.usageStatus === 'unused') {
          if (c.currentValue !== c.initialValue) return false;
        } else if (filters.usageStatus === 'partially_used') {
          if (c.currentValue <= 0 || c.currentValue >= c.initialValue) return false;
        } else if (filters.usageStatus === 'fully_used') {
          if (c.currentValue > 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'expiry_asc') {
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return a.expirationDate.localeCompare(b.expirationDate);
        }
        if (filters.sortBy === 'expiry_desc') {
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return b.expirationDate.localeCompare(a.expirationDate);
        }
        if (filters.sortBy === 'value_desc') {
          return b.currentValue - a.currentValue;
        }
        if (filters.sortBy === 'value_asc') {
          return a.currentValue - b.currentValue;
        }
        if (filters.sortBy === 'created_desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (filters.sortBy === 'store_asc') {
          return a.storeName.localeCompare(b.storeName);
        }
        return 0;
      });
  }, [familyCoupons, filters]);

  // Statistics
  const stats = useMemo(() => {
    let totalAvailable = 0;
    let expiringCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    familyCoupons.forEach((c) => {
      totalAvailable += c.currentValue;
      if (c.expirationDate && c.currentValue > 0) {
        const exp = new Date(c.expirationDate);
        exp.setHours(0, 0, 0, 0);
        const days = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (days >= 0 && days <= 7) {
          expiringCount++;
        }
      }
    });

    return {
      totalAvailable,
      count: familyCoupons.filter((c) => c.currentValue > 0).length,
      expiringCount,
    };
  }, [familyCoupons]);

  // Handle Switch Family
  const handleSelectFamily = (familyId: string) => {
    setActiveFamilyId(familyId);
    StorageService.setActiveFamilyId(familyId);
  };

  // Handle Switch Current User (Demo auth)
  const handleSwitchUser = (userId: string) => {
    StorageService.setCurrentUser(userId);
    const u = users.find((x) => x.id === userId) || users[0];
    setCurrentUser(u);
  };

  // Handle Partial or Full Deduction
  const handleRedeemCoupon = (
    couponId: string,
    amount: number,
    userId: string,
    note?: string
  ) => {
    const redeemingUser = users.find((u) => u.id === userId) || currentUser!;
    let targetUpdatedCoupon: Coupon | null = null;

    const updated = coupons.map((c) => {
      if (c.id !== couponId) return c;
      const newBalance = Math.max(0, c.currentValue - amount);
      const usageEntry = {
        id: `usage-${Date.now()}`,
        couponId: c.id,
        userId: redeemingUser.id,
        userName: redeemingUser.name,
        amountUsed: amount,
        remainingAfter: newBalance,
        usedAt: new Date().toISOString(),
        note,
      };
      const updatedItem: Coupon = {
        ...c,
        currentValue: newBalance,
        history: [usageEntry, ...c.history],
      };
      targetUpdatedCoupon = updatedItem;
      return updatedItem;
    });

    setCoupons(updated);
    StorageService.saveCoupons(updated);
    if (targetUpdatedCoupon) {
      CloudStorageService.saveCoupon(targetUpdatedCoupon);
    }

    // Close both the redeem popup and detail popup after approval
    setRedeemingCoupon(null);
    setSelectedCoupon(null);
  };

  // Handle Undo Usage
  const handleUndoUsage = (couponId: string, usageId: string) => {
    let targetUpdatedCoupon: Coupon | null = null;
    const updated = coupons.map((c) => {
      if (c.id !== couponId) return c;
      const targetUsage = c.history.find((h) => h.id === usageId);
      if (!targetUsage) return c;
      const restoredBalance = Math.min(
        c.initialValue,
        c.currentValue + targetUsage.amountUsed
      );
      const updatedItem: Coupon = {
        ...c,
        currentValue: restoredBalance,
        history: c.history.filter((h) => h.id !== usageId),
      };
      targetUpdatedCoupon = updatedItem;
      return updatedItem;
    });

    setCoupons(updated);
    StorageService.saveCoupons(updated);
    if (targetUpdatedCoupon) {
      CloudStorageService.saveCoupon(targetUpdatedCoupon);
    }

    if (selectedCoupon && selectedCoupon.id === couponId) {
      const fresh = updated.find((c) => c.id === couponId);
      if (fresh) setSelectedCoupon(fresh);
    }
  };

  // Handle Save (Add or Edit)
  const handleSaveCoupon = (payload: Partial<Coupon>) => {
    let savedCoupon: Coupon;
    if (editingCoupon) {
      savedCoupon = { ...editingCoupon, ...payload } as Coupon;
      const updated = coupons.map((c) =>
        c.id === editingCoupon.id ? savedCoupon : c
      );
      setCoupons(updated);
      StorageService.saveCoupons(updated);
    } else {
      savedCoupon = {
        ...(payload as Coupon),
        id: `coup-${Date.now()}`,
      };
      const updated = [savedCoupon, ...coupons];
      setCoupons(updated);
      StorageService.saveCoupons(updated);
    }
    // Sync to Cloud Firestore
    CloudStorageService.saveCoupon(savedCoupon);

    // Always close modals after saving
    setIsAddModalOpen(false);
    setIsQuickAddOpen(false);
    setEditingCoupon(null);
  };

  // Handle Delete
  const handleDeleteCoupon = (couponId: string) => {
    const updated = coupons.filter((c) => c.id !== couponId);
    setCoupons(updated);
    StorageService.saveCoupons(updated);
    // Delete in Cloud Firestore
    CloudStorageService.deleteCoupon(couponId);
  };

  // Handle Create Family
  const handleCreateFamily = (name: string, emoji: string) => {
    if (!currentUser) return;
    const newFam: Family = {
      id: `fam-${Date.now()}`,
      name,
      ownerId: currentUser.id,
      emoji: emoji || '🏡',
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    const updated = [...families, newFam];
    setFamilies(updated);
    StorageService.saveFamilies(updated);
    // Sync to Cloud Firestore
    CloudStorageService.saveFamily(newFam);

    setActiveFamilyId(newFam.id);
    StorageService.setActiveFamilyId(newFam.id);
  };

  // Handle Send Invite
  const handleSendInvite = (familyId: string, email: string) => {
    if (!currentUser || !activeFamily) return;
    const newInvite: FamilyInvite = {
      id: `inv-${Date.now()}`,
      familyId,
      familyName: activeFamily.name,
      invitedEmail: email.toLowerCase(),
      invitedBy: currentUser.id,
      invitedByName: currentUser.name,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const updated = [...invites, newInvite];
    setInvites(updated);
    StorageService.saveInvites(updated);
    // Sync to Cloud Firestore
    CloudStorageService.saveInvite(newInvite);
  };

  // Handle Accept Invite
  const handleAcceptInvite = (inviteId: string) => {
    if (!currentUser) return;
    const invite = invites.find((i) => i.id === inviteId);
    if (!invite) return;

    let targetUpdatedFamily: Family | null = null;
    const updatedFamilies = families.map((fam) => {
      if (fam.id !== invite.familyId) return fam;
      if (fam.members.some((m) => m.userId === currentUser.id)) return fam;
      const updatedFam: Family = {
        ...fam,
        members: [
          ...fam.members,
          {
            userId: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: 'member' as const,
            joinedAt: new Date().toISOString(),
          },
        ],
      };
      targetUpdatedFamily = updatedFam;
      return updatedFam;
    });

    const updatedInvite: FamilyInvite = { ...invite, status: 'accepted' as const };
    const updatedInvites = invites.map((i) =>
      i.id === inviteId ? updatedInvite : i
    );

    setFamilies(updatedFamilies);
    StorageService.saveFamilies(updatedFamilies);
    setInvites(updatedInvites);
    StorageService.saveInvites(updatedInvites);

    // Sync to Cloud Firestore
    if (targetUpdatedFamily) {
      CloudStorageService.saveFamily(targetUpdatedFamily);
    }
    CloudStorageService.saveInvite(updatedInvite);

    setActiveFamilyId(invite.familyId);
    StorageService.setActiveFamilyId(invite.familyId);
  };

  // Handle Decline Invite
  const handleDeclineInvite = (inviteId: string) => {
    const invite = invites.find((i) => i.id === inviteId);
    if (!invite) return;
    const updatedInvite: FamilyInvite = { ...invite, status: 'declined' as const };
    const updatedInvites = invites.map((i) =>
      i.id === inviteId ? updatedInvite : i
    );
    setInvites(updatedInvites);
    StorageService.saveInvites(updatedInvites);
    // Sync to Cloud Firestore
    CloudStorageService.saveInvite(updatedInvite);
  };

  if (!currentUser || !activeFamily) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="animate-spin text-blue-600">
          <Ticket className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50/70 text-slate-800 pb-20 selection:bg-blue-200"
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <Header
        families={families}
        activeFamily={activeFamily}
        currentUser={currentUser}
        allUsers={users}
        lang={lang}
        onLanguageChange={setLang}
        onSelectFamily={handleSelectFamily}
        onSwitchUser={handleSwitchUser}
        onOpenAddCoupon={() => setIsAddModalOpen(true)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenManageFamilies={() => setIsManageFamiliesOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner with Family Summary & Value Stats (Blue/Indigo palette) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/15">
          {/* Subtle background glow */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-sky-300/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-sky-100 mb-2">
                <span>{activeFamily.emoji || '🏡'}</span>
                <span>{activeFamily.name}</span>
                <span>•</span>
                <span>
                  {activeFamily.members.length} {isHe ? 'בני משפחה שותפים' : 'family members'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isHe ? 'כספת השוברים והקופונים' : 'Family Coupon Vault'}
              </h2>
              <p className="text-sky-100 text-sm mt-1 max-w-xl">
                {isHe
                  ? 'שתפו קופונים עם כל המשפחה, עדכנו ניצול חלקי בזמן אמת, והציגו ברקוד או תמונה ישירות לקופאי/ת!'
                  : 'Share coupons across your family, record partial deductions, and scan barcodes or images directly at the cashier!'}
              </p>
            </div>

            {/* Quick Summary Cards & Fast Action */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Total Available Balance */}
              <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center min-w-[130px]">
                <div className="text-[11px] font-medium text-sky-100">
                  {t.totalSavings}
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5">
                  {stats.totalAvailable} <span className="text-lg font-bold">₪</span>
                </div>
              </div>

              {/* Total Active Usable Coupons */}
              <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center min-w-[110px]">
                <div className="text-[11px] font-medium text-sky-100">
                  {isHe ? 'קופונים פעילים' : 'Active Coupons'}
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5">
                  {stats.count}
                </div>
              </div>

              {/* Fast Quick Add Button in Hero */}
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="p-3.5 rounded-2xl bg-white text-blue-900 font-bold text-xs hover:bg-sky-50 shadow-md hover:scale-105 transition-all cursor-pointer flex flex-col items-center justify-center min-w-[90px]"
                title={t.quickAddTitle}
              >
                <Zap className="w-5 h-5 text-blue-600 fill-blue-600 mb-0.5" />
                <span>{t.quickAdd}</span>
              </button>
            </div>
          </div>

          {/* Expiring Soon Alert */}
          {stats.expiringCount > 0 && (
            <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="font-semibold text-white">
                  {isHe
                    ? `שים לב: ${stats.expiringCount} קופונים עומדים לפוג בשבוע הקרוב!`
                    : `Heads up: ${stats.expiringCount} coupon(s) expiring within the next 7 days!`}
                </span>
              </div>
              <button
                onClick={() => setFilters({ ...filters, expiration: 'expiring_soon' })}
                className="font-bold underline text-sky-100 hover:text-white cursor-pointer shrink-0"
              >
                {isHe ? 'הצג אותם' : 'Filter by soon'}
              </button>
            </div>
          )}
        </div>

        {/* Filters and Search Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          uniqueStores={uniqueStores}
          lang={lang}
        />

        {/* Coupons Grid */}
        {displayedCoupons.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8 rotate-12" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{t.emptyTitle}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t.emptySubtitle}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
                <span>{t.quickAdd}</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addCoupon}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                lang={lang}
                onSelect={setSelectedCoupon}
                onRedeem={setRedeemingCoupon}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedCoupon && (
        <CouponDetailModal
          coupon={selectedCoupon}
          lang={lang}
          isOpen={!!selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onOpenRedeem={(c) => setRedeemingCoupon(c)}
          onOpenEdit={(c) => setEditingCoupon(c)}
          onDelete={handleDeleteCoupon}
          onUndoUsage={handleUndoUsage}
        />
      )}

      {/* Redeem Modal (Full / Partial deduction with calculation and fixed scroll) */}
      {redeemingCoupon && (
        <RedeemModal
          coupon={redeemingCoupon}
          family={activeFamily}
          currentUser={currentUser}
          lang={lang}
          isOpen={!!redeemingCoupon}
          onClose={() => setRedeemingCoupon(null)}
          onRedeem={handleRedeemCoupon}
        />
      )}

      {/* Add / Edit Coupon Full Modal */}
      {(isAddModalOpen || editingCoupon) && (
        <AddEditCouponModal
          coupon={editingCoupon}
          family={activeFamily}
          currentUser={currentUser}
          lang={lang}
          isOpen={isAddModalOpen || !!editingCoupon}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCoupon(null);
          }}
          onSave={handleSaveCoupon}
        />
      )}

      {/* Quick Add Fast Coupon Modal (Store, Value, Image) */}
      {isQuickAddOpen && (
        <QuickAddModal
          existingCoupons={coupons}
          family={activeFamily}
          currentUser={currentUser}
          lang={lang}
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSave={handleSaveCoupon}
        />
      )}

      {/* Family Manage Modal */}
      {isManageFamiliesOpen && (
        <FamilyManageModal
          families={families}
          activeFamily={activeFamily}
          currentUser={currentUser}
          invites={invites}
          lang={lang}
          isOpen={isManageFamiliesOpen}
          onClose={() => setIsManageFamiliesOpen(false)}
          onSelectFamily={handleSelectFamily}
          onCreateFamily={handleCreateFamily}
          onSendInvite={handleSendInvite}
          onAcceptInvite={handleAcceptInvite}
          onDeclineInvite={handleDeclineInvite}
        />
      )}
    </div>
  );
}
