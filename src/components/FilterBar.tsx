import React from 'react';
import {
  Search,
  ArrowUpDown,
  RotateCcw,
  MapPin,
  Calendar,
  Tag,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { FilterState, Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  uniqueStores: string[];
  lang: Language;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  uniqueStores,
  lang,
}) => {
  const isHe = lang === 'he';
  const t = getTranslation(lang);

  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filters, search: val });
  };

  const handleStoreChange = (val: string) => {
    onFilterChange({ ...filters, store: val });
  };

  const handleValueChange = (val: FilterState['valueRange']) => {
    onFilterChange({ ...filters, valueRange: val });
  };

  const handleExpiryChange = (val: FilterState['expiration']) => {
    onFilterChange({ ...filters, expiration: val });
  };

  const handleSortChange = (val: FilterState['sortBy']) => {
    onFilterChange({ ...filters, sortBy: val });
  };

  const handleReset = () => {
    onFilterChange({
      search: '',
      store: 'all',
      category: 'all',
      expiration: 'all',
      valueRange: 'all',
      usageStatus: 'usable', // Default to active usable coupons!
      sortBy: 'expiry_asc',
    });
  };

  const hasNonDefaultFilters =
    filters.search ||
    filters.store !== 'all' ||
    filters.category !== 'all' ||
    filters.expiration !== 'all' ||
    filters.valueRange !== 'all' ||
    filters.usageStatus !== 'usable';

  return (
    <div
      className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4"
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ltr:left-3.5 rtl:right-3.5" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Sort by dropdown & reset */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="expiry_asc">{t.sortExpirySoonest}</option>
              <option value="expiry_desc">{t.sortExpiryLatest}</option>
              <option value="value_desc">{t.sortValueHighLow}</option>
              <option value="value_asc">{t.sortValueLowHigh}</option>
              <option value="created_desc">{t.sortNewest}</option>
              <option value="store_asc">{t.sortStore}</option>
            </select>
          </div>

          {hasNonDefaultFilters && (
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title={t.clearFilters}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter selectors row: Where to use, Value, Expiration, Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Where to Use (Store Filter) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-600" />
            <span>{t.filterByStore}</span>
          </label>
          <select
            value={filters.store}
            onChange={(e) => handleStoreChange(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
          >
            <option value="all">{t.allStores}</option>
            {uniqueStores.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Value Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-blue-600" />
            <span>{t.filterByValue}</span>
          </label>
          <select
            value={filters.valueRange}
            onChange={(e) => handleValueChange(e.target.value as any)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
          >
            <option value="all">{t.allValues}</option>
            <option value="under100">{t.valUnder100}</option>
            <option value="100to300">{t.val100to300}</option>
            <option value="over300">{t.valOver300}</option>
          </select>
        </div>

        {/* Expiration Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-600" />
            <span>{t.filterByExpiry}</span>
          </label>
          <select
            value={filters.expiration}
            onChange={(e) => handleExpiryChange(e.target.value as any)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
          >
            <option value="all">{t.allExpiries}</option>
            <option value="active">{t.active}</option>
            <option value="expiring_soon">{t.expiringSoon}</option>
            <option value="expired">{t.expired}</option>
          </select>
        </div>

        {/* Usage Status Filter (Default: Usable Active) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3 h-3 text-blue-600" />
            <span>{t.filterByStatus}</span>
          </label>
          <select
            value={filters.usageStatus}
            onChange={(e) =>
              onFilterChange({ ...filters, usageStatus: e.target.value as any })
            }
            className={`w-full py-2 px-2.5 border rounded-xl text-xs font-semibold outline-none transition-colors ${
              filters.usageStatus === 'usable'
                ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
            }`}
          >
            <option value="usable">✨ {t.usableActive}</option>
            <option value="all">{t.allStatuses}</option>
            <option value="unused">{t.available}</option>
            <option value="partially_used">{t.partiallyUsed}</option>
            <option value="fully_used">{t.fullyUsed}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
