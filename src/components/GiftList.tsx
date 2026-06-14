import { useMemo } from 'react';
import { useGiftStore, getFilteredPlans } from '@/store/useGiftStore';
import { GiftCard } from './GiftCard';
import { Gift, Plus } from 'lucide-react';
import type { GiftPlanWithReminder } from '@/types/gift';

interface GiftListProps {
  onEdit: (plan: GiftPlanWithReminder) => void;
  onAdd: () => void;
}

export function GiftList({ onEdit, onAdd }: GiftListProps) {
  const plans = useGiftStore((state) => state.plans);
  const filters = useGiftStore((state) => state.filters);
  const filteredPlans = useMemo(
    () => getFilteredPlans(plans, filters),
    [plans, filters]
  );

  if (filteredPlans.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
          <Gift className="w-12 h-12 text-primary-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">还没有送礼计划</h3>
        <p className="text-gray-500 mb-6">
          点击下方按钮添加你的第一个送礼计划吧！
        </p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-soft"
        >
          <Plus className="w-5 h-5" />
          添加送礼计划
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredPlans.map((plan, index) => (
        <GiftCard key={plan.id} plan={plan} index={index} onEdit={onEdit} />
      ))}
    </div>
  );
}
