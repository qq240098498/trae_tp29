import { useState, useEffect, useMemo } from 'react';
import type { GiftPlan, GiftScene, Relationship } from '@/types/gift';
import { SCENE_CONFIG, REACTION_CONFIG } from '@/types/gift';
import { useGiftStore, calculateYearsAgo } from '@/store/useGiftStore';
import { getTodayStr, formatDate } from '@/utils/dateUtils';
import { X, User, Calendar, DollarSign, FileText, AlertTriangle, Lightbulb, History } from 'lucide-react';

interface GiftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPlan?: GiftPlan;
}

const SCENES: GiftScene[] = ['birthday', 'wedding', 'baby', 'springFestival', 'housewarming', 'anniversary', 'graduation', 'other'];

const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: 'relative', label: '亲戚' },
  { value: 'friend', label: '朋友' },
  { value: 'colleague', label: '同事' },
];

export function GiftFormModal({ isOpen, onClose, editPlan }: GiftFormModalProps) {
  const { addPlan, updatePlan, pastRecords } = useGiftStore();
  const [formData, setFormData] = useState({
    scene: 'birthday' as GiftScene,
    customScene: '',
    recipientName: '',
    relationship: 'friend' as Relationship,
    giftDate: '',
    budget: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const recipientPastRecords = useMemo(() => {
    const name = formData.recipientName.trim();
    if (!name) return [];
    return pastRecords
      .filter((r) => r.recipientName === name)
      .sort((a, b) => new Date(b.giftDate).getTime() - new Date(a.giftDate).getTime());
  }, [formData.recipientName, pastRecords]);

  const lastYearRecord = useMemo(() => {
    return recipientPastRecords.find((r) => calculateYearsAgo(r.giftDate) >= 1);
  }, [recipientPastRecords]);

  const dislikedItems = useMemo(() => {
    return recipientPastRecords.filter((r) => r.recipientReaction === 'disliked');
  }, [recipientPastRecords]);

  useEffect(() => {
    if (editPlan) {
      setFormData({
        scene: editPlan.scene,
        customScene: editPlan.customScene || '',
        recipientName: editPlan.recipientName,
        relationship: editPlan.relationship,
        giftDate: editPlan.giftDate,
        budget: editPlan.budget.toString(),
        notes: editPlan.notes || '',
      });
    } else {
      setFormData({
        scene: 'birthday',
        customScene: '',
        recipientName: '',
        relationship: 'friend',
        giftDate: '',
        budget: '',
        notes: '',
      });
    }
    setErrors({});
  }, [editPlan, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = '请输入收礼人姓名';
    }
    if (!formData.giftDate) {
      newErrors.giftDate = '请选择送礼日期';
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = '请输入有效的预算金额';
    }
    if (formData.scene === 'other' && !formData.customScene.trim()) {
      newErrors.customScene = '请输入自定义场景名称';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const planData = {
      scene: formData.scene,
      customScene: formData.scene === 'other' ? formData.customScene.trim() : undefined,
      recipientName: formData.recipientName.trim(),
      relationship: formData.relationship,
      giftDate: formData.giftDate,
      budget: parseFloat(formData.budget),
      isPurchased: editPlan?.isPurchased || false,
      actualCost: editPlan?.actualCost,
      purchaseDate: editPlan?.purchaseDate,
      notes: formData.notes.trim() || undefined,
    };

    if (editPlan) {
      updatePlan(editPlan.id, planData);
    } else {
      addPlan(planData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-800">
            {editPlan ? '✏️ 编辑送礼计划' : '🎁 添加送礼计划'}
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
              送礼场景
            </label>
            <div className="flex flex-wrap gap-2">
              {SCENES.map((scene) => {
                const config = SCENE_CONFIG[scene];
                const isSelected = formData.scene === scene;
                return (
                  <button
                    key={scene}
                    type="button"
                    onClick={() => setFormData({ ...formData, scene })}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isSelected
                        ? 'gradient-primary text-white shadow-soft scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-lg">{config.emoji}</span>
                    {config.label}
                  </button>
                );
              })}
            </div>
            {formData.scene === 'other' && (
              <input
                type="text"
                value={formData.customScene}
                onChange={(e) => setFormData({ ...formData, customScene: e.target.value })}
                placeholder="请输入自定义场景名称"
                className={`mt-3 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.customScene ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
            )}
            {errors.customScene && (
              <p className="text-red-500 text-sm mt-1">{errors.customScene}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              收礼人姓名
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              placeholder="请输入收礼人姓名"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.recipientName ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.recipientName && (
              <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>
            )}

            {recipientPastRecords.length > 0 && (
              <div className="mt-4 space-y-3 animate-fade-in-up">
                {lastYearRecord && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-amber-800 mb-1">
                          💡 往年送礼提醒
                        </div>
                        <p className="text-sm text-amber-700">
                          {calculateYearsAgo(lastYearRecord.giftDate) > 0
                            ? `${calculateYearsAgo(lastYearRecord.giftDate)}年前送了「${lastYearRecord.giftItem}」`
                            : '今年送了「' + lastYearRecord.giftItem + '」'}
                          {lastYearRecord.recipientReaction && (
                            <span className="ml-1">
                              ，对方反应
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${REACTION_CONFIG[lastYearRecord.recipientReaction].color}`}>
                                {REACTION_CONFIG[lastYearRecord.recipientReaction].emoji}
                                {REACTION_CONFIG[lastYearRecord.recipientReaction].label}
                              </span>
                            </span>
                          )}
                          {lastYearRecord.actualCost !== undefined && (
                            <span className="ml-1">，花费 ¥{lastYearRecord.actualCost}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {dislikedItems.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-red-800 mb-2">
                          ⚠️ 注意避免！对方不喜欢的礼物
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {dislikedItems.map((item) => (
                            <span
                              key={item.id}
                              className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              ❌ {item.giftItem}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {recipientPastRecords.length > 1 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <History className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-blue-800 mb-2">
                          📋 历史送礼记录（共 {recipientPastRecords.length} 次）
                        </div>
                        <div className="space-y-1.5">
                          {recipientPastRecords.slice(0, 5).map((record) => (
                            <div
                              key={record.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-blue-700">
                                {formatDate(record.giftDate)}：{record.giftItem}
                              </span>
                              {record.recipientReaction && (
                                <span className={`px-1.5 py-0.5 rounded text-xs ${REACTION_CONFIG[record.recipientReaction].color}`}>
                                  {REACTION_CONFIG[record.recipientReaction].emoji}
                                </span>
                              )}
                            </div>
                          ))}
                          {recipientPastRecords.length > 5 && (
                            <div className="text-xs text-blue-600 mt-1">
                              还有 {recipientPastRecords.length - 5} 条更多记录...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              与收礼人关系
            </label>
            <div className="flex gap-3">
              {RELATIONSHIPS.map((rel) => (
                <button
                  key={rel.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, relationship: rel.value })}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    formData.relationship === rel.value
                      ? 'gradient-primary text-white shadow-soft'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rel.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              送礼日期
            </label>
            <input
              type="date"
              value={formData.giftDate}
              onChange={(e) => setFormData({ ...formData, giftDate: e.target.value })}
              min={getTodayStr()}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.giftDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.giftDate && (
              <p className="text-red-500 text-sm mt-1">{errors.giftDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              预算金额 (元)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="请输入预算金额"
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.budget ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              备注 (可选)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="记录收礼人喜好、送礼建议等..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
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
              {editPlan ? '保存修改' : '添加计划'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
