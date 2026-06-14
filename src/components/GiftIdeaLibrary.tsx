import { useState, useMemo } from 'react';
import type { RecipientType, BudgetRange, GiftIdea } from '@/types/gift';
import { RECIPIENT_TYPE_CONFIG, BUDGET_RANGE_CONFIG } from '@/types/gift';
import { useGiftStore } from '@/store/useGiftStore';
import { AddIdeaModal } from '@/components/AddIdeaModal';
import { ArrowLeft, Plus, Trash2, Sparkles, Filter, Lightbulb, Star } from 'lucide-react';

interface GiftIdeaLibraryProps {
  onClose: () => void;
}

export function GiftIdeaLibrary({ onClose }: GiftIdeaLibraryProps) {
  const getGiftIdeas = useGiftStore((state) => state.getGiftIdeas);
  const deleteGiftIdea = useGiftStore((state) => state.deleteGiftIdea);
  const [recipientFilter, setRecipientFilter] = useState<RecipientType | 'all'>('all');
  const [budgetFilter, setBudgetFilter] = useState<BudgetRange | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredIdeas = useMemo(() => {
    return getGiftIdeas(recipientFilter, budgetFilter);
  }, [recipientFilter, budgetFilter, getGiftIdeas]);

  const handleDelete = (id: string) => {
    deleteGiftIdea(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="gradient-amber text-white py-6 px-4 md:px-8 rounded-b-3xl shadow-soft mb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-display tracking-wide">
                    礼物灵感库
                  </h1>
                  <p className="text-white/80 text-sm">
                    找到最适合的礼物灵感 ✨
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-300"
              title="添加成功经验"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">筛选灵感</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-2 block">收礼人类型</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setRecipientFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    recipientFilter === 'all'
                      ? 'gradient-amber text-white shadow-soft scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {(Object.keys(RECIPIENT_TYPE_CONFIG) as RecipientType[]).map((type) => {
                  const config = RECIPIENT_TYPE_CONFIG[type];
                  const isSelected = recipientFilter === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setRecipientFilter(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                        isSelected
                          ? 'gradient-amber text-white shadow-soft scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>{config.emoji}</span>
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">预算区间</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setBudgetFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    budgetFilter === 'all'
                      ? 'gradient-amber text-white shadow-soft scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部预算
                </button>
                {(Object.keys(BUDGET_RANGE_CONFIG) as BudgetRange[]).map((range) => {
                  const config = BUDGET_RANGE_CONFIG[range];
                  const isSelected = budgetFilter === range;
                  return (
                    <button
                      key={range}
                      onClick={() => setBudgetFilter(range)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'gradient-amber text-white shadow-soft scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            共找到 <span className="font-semibold text-amber-600">{filteredIdeas.length}</span> 条灵感
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>带星标的为您的成功经验</span>
          </div>
        </div>

        {filteredIdeas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-10 h-10 text-amber-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无匹配的灵感</h3>
            <p className="text-sm text-gray-500 mb-6">
              试试调整筛选条件，或者添加您自己的成功经验吧！
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2.5 gradient-amber text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-soft inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加成功经验
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredIdeas.map((idea, index) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={index}
                onDelete={() => setDeleteConfirmId(idea.id)}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 gradient-amber text-white rounded-full shadow-soft flex items-center justify-center hover:scale-110 transition-transform duration-300 z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      <AddIdeaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除这条成功经验吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea, index, onDelete }: { idea: GiftIdea; index: number; onDelete: () => void }) {
  const recipientConfig = RECIPIENT_TYPE_CONFIG[idea.recipientType];
  const budgetConfig = BUDGET_RANGE_CONFIG[idea.budgetRange];

  return (
    <div
      className={`bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in-up transition-all duration-300 hover:shadow-soft hover:-translate-y-1 relative ${
        idea.isCustom ? 'ring-2 ring-amber-200' : ''
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {idea.isCustom && (
        <>
          <div className="absolute top-3 right-3 z-10">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-3 left-3 z-10 p-1.5 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3 pr-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{recipientConfig.emoji}</span>
              <h3 className="text-lg font-semibold text-gray-800">
                {idea.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                {recipientConfig.label}
                {idea.recipientLabel && ` · ${idea.recipientLabel}`}
              </span>
              <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                {budgetConfig.label}
              </span>
              {idea.isCustom && (
                <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500" />
                  我的经验
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            推荐礼物
          </div>
          <div className="flex flex-wrap gap-2">
            {idea.gifts.map((gift, giftIndex) => (
              <span
                key={giftIndex}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-gray-700 rounded-lg text-sm border border-amber-100 hover:border-amber-200 transition-colors"
              >
                🎁 {gift}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
