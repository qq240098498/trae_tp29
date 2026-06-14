import { useState, useEffect } from 'react';
import type { PastGiftRecord, GiftScene, Relationship, RecipientReaction } from '@/types/gift';
import { SCENE_CONFIG, REACTION_CONFIG } from '@/types/gift';
import { useGiftStore } from '@/store/useGiftStore';
import { X, User, Calendar, DollarSign, FileText } from 'lucide-react';

interface PastRecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRecord?: PastGiftRecord;
}

const SCENES: GiftScene[] = ['birthday', 'wedding', 'baby', 'springFestival', 'housewarming', 'anniversary', 'graduation', 'other'];

const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: 'relative', label: '亲戚' },
  { value: 'friend', label: '朋友' },
  { value: 'colleague', label: '同事' },
];

export function PastRecordFormModal({ isOpen, onClose, editRecord }: PastRecordFormModalProps) {
  const { addPastRecord, updatePastRecord } = useGiftStore();
  const [formData, setFormData] = useState({
    recipientName: '',
    relationship: 'friend' as Relationship,
    giftItem: '',
    giftDate: '',
    actualCost: '',
    scene: 'birthday' as GiftScene,
    customScene: '',
    recipientReaction: undefined as RecipientReaction | undefined,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editRecord) {
      setFormData({
        recipientName: editRecord.recipientName,
        relationship: editRecord.relationship,
        giftItem: editRecord.giftItem,
        giftDate: editRecord.giftDate,
        actualCost: editRecord.actualCost?.toString() || '',
        scene: editRecord.scene,
        customScene: editRecord.customScene || '',
        recipientReaction: editRecord.recipientReaction,
        notes: editRecord.notes || '',
      });
    } else {
      setFormData({
        recipientName: '',
        relationship: 'friend',
        giftItem: '',
        giftDate: '',
        actualCost: '',
        scene: 'birthday',
        customScene: '',
        recipientReaction: undefined,
        notes: '',
      });
    }
    setErrors({});
  }, [editRecord, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = '请输入收礼人姓名';
    }
    if (!formData.giftItem.trim()) {
      newErrors.giftItem = '请输入礼物名称';
    }
    if (!formData.giftDate) {
      newErrors.giftDate = '请选择送礼日期';
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

    const recordData = {
      recipientName: formData.recipientName.trim(),
      relationship: formData.relationship,
      giftItem: formData.giftItem.trim(),
      giftDate: formData.giftDate,
      actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
      scene: formData.scene,
      customScene: formData.scene === 'other' ? formData.customScene.trim() : undefined,
      recipientReaction: formData.recipientReaction,
      notes: formData.notes.trim() || undefined,
    };

    if (editRecord) {
      updatePastRecord(editRecord.id, recordData);
    } else {
      addPastRecord(recordData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-800">
            {editRecord ? '✏️ 编辑往年记录' : '📝 添加往年送礼记录'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                送礼日期
              </label>
              <input
                type="date"
                value={formData.giftDate}
                onChange={(e) => setFormData({ ...formData, giftDate: e.target.value })}
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
                实际花费 (元)
              </label>
              <input
                type="number"
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                placeholder="选填"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> 礼物名称
            </label>
            <input
              type="text"
              value={formData.giftItem}
              onChange={(e) => setFormData({ ...formData, giftItem: e.target.value })}
              placeholder="如：保温杯、围巾、香水等"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.giftItem ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.giftItem && (
              <p className="text-red-500 text-sm mt-1">{errors.giftItem}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              收礼人反应
            </label>
            <div className="flex gap-2">
              {(Object.keys(REACTION_CONFIG) as RecipientReaction[]).map((key) => {
                const cfg = REACTION_CONFIG[key];
                const isSelected = formData.recipientReaction === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, recipientReaction: isSelected ? undefined : key })}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                      isSelected
                        ? `${cfg.color} ring-2 ring-offset-2 ring-primary-400 scale-105`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xl">{cfg.emoji}</span>
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              备注 (可选)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="记录更多细节..."
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
              {editRecord ? '保存修改' : '添加记录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
