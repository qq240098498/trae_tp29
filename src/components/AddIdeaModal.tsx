import { useState, useEffect } from 'react';
import type { RecipientType, BudgetRange } from '@/types/gift';
import { RECIPIENT_TYPE_CONFIG, BUDGET_RANGE_CONFIG } from '@/types/gift';
import { useGiftStore } from '@/store/useGiftStore';
import { X, Plus, Tag, Gift } from 'lucide-react';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddIdeaModal({ isOpen, onClose }: AddIdeaModalProps) {
  const addGiftIdea = useGiftStore((state) => state.addGiftIdea);
  const [formData, setFormData] = useState({
    recipientType: 'worker' as RecipientType,
    budgetRange: '200-300' as BudgetRange,
    recipientLabel: '',
    title: '',
    gifts: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        recipientType: 'worker',
        budgetRange: '200-300',
        recipientLabel: '',
        title: '',
        gifts: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = '请输入标题';
    }
    const giftsList = formData.gifts
      .split(/[,，、\n]/)
      .map((g) => g.trim())
      .filter(Boolean);
    if (giftsList.length === 0) {
      newErrors.gifts = '请至少输入一个礼物建议';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const giftsList = formData.gifts
      .split(/[,，、\n]/)
      .map((g) => g.trim())
      .filter(Boolean);

    addGiftIdea({
      recipientType: formData.recipientType,
      budgetRange: formData.budgetRange,
      recipientLabel: formData.recipientLabel.trim() || undefined,
      title: formData.title.trim(),
      gifts: giftsList,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary-500" />
            添加成功经验
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Tag className="w-4 h-4 inline mr-1" />
              收礼人类型
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(RECIPIENT_TYPE_CONFIG) as RecipientType[]).map((type) => {
                const config = RECIPIENT_TYPE_CONFIG[type];
                const isSelected = formData.recipientType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, recipientType: type })}
                    className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'gradient-primary text-white shadow-soft scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xl">{config.emoji}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              预算区间
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(BUDGET_RANGE_CONFIG) as BudgetRange[]).map((range) => {
                const config = BUDGET_RANGE_CONFIG[range];
                const isSelected = formData.budgetRange === range;
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setFormData({ ...formData, budgetRange: range })}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'gradient-primary text-white shadow-soft scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              收礼人称呼 (可选)
            </label>
            <input
              type="text"
              value={formData.recipientLabel}
              onChange={(e) => setFormData({ ...formData, recipientLabel: e.target.value })}
              placeholder="如：同事、闺蜜、妈妈等"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> 标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="如：200-300元送同事"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Gift className="w-4 h-4 inline mr-1" />
              <span className="text-red-500">*</span> 礼物清单
            </label>
            <textarea
              value={formData.gifts}
              onChange={(e) => setFormData({ ...formData, gifts: e.target.value })}
              placeholder="用逗号或换行分隔，如：办公腰靠、加湿器、书"
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                errors.gifts ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.gifts && (
              <p className="text-red-500 text-sm mt-1">{errors.gifts}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              💡 提示：用逗号、顿号或换行分隔多个礼物
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 px-4 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-soft"
            >
              添加到灵感库
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
