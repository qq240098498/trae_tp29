import { useGiftStore } from '@/store/useGiftStore';
import type { FilterOptions, Relationship } from '@/types/gift';
import { RELATIONSHIP_CONFIG } from '@/types/gift';
import { Filter } from 'lucide-react';

const STATUS_OPTIONS: { value: FilterOptions['status']; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待准备' },
  { value: 'purchased', label: '已购买' },
];

export function FilterBar() {
  const filters = useGiftStore((state) => state.filters);
  const setFilters = useGiftStore((state) => state.setFilters);

  const relationshipOptions: { value: 'all' | Relationship; label: string }[] = [
    { value: 'all', label: '全部关系' },
    { value: 'relative', label: RELATIONSHIP_CONFIG.relative.label },
    { value: 'friend', label: RELATIONSHIP_CONFIG.friend.label },
    { value: 'colleague', label: RELATIONSHIP_CONFIG.colleague.label },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">筛选</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-2 block">状态</label>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters({ status: option.value })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filters.status === option.value
                    ? 'gradient-primary text-white shadow-soft scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-2 block">关系</label>
          <div className="flex gap-2 flex-wrap">
            {relationshipOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters({ relationship: option.value as FilterOptions['relationship'] })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filters.relationship === option.value
                    ? 'gradient-primary text-white shadow-soft scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
