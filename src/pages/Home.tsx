import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { FilterBar } from '@/components/FilterBar';
import { GiftList } from '@/components/GiftList';
import { GiftFormModal } from '@/components/GiftFormModal';
import { useGiftStore } from '@/store/useGiftStore';
import { Plus } from 'lucide-react';
import type { GiftPlanWithReminder } from '@/types/gift';

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GiftPlanWithReminder | undefined>();
  const initStore = useGiftStore((state) => state.init);

  useEffect(() => {
    initStore();
  }, [initStore]);

  const handleEdit = (plan: GiftPlanWithReminder) => {
    setEditingPlan(plan);
    setIsAddModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPlan(undefined);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingPlan(undefined);
  };

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-8">
        <StatsOverview />
        <FilterBar />
        <GiftList onEdit={handleEdit} onAdd={handleAdd} />
      </main>

      <button
        onClick={handleAdd}
        className="fixed bottom-6 right-6 w-16 h-16 gradient-primary text-white rounded-full shadow-soft flex items-center justify-center hover:scale-110 transition-transform duration-300 z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      <GiftFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editPlan={editingPlan}
      />
    </div>
  );
}
