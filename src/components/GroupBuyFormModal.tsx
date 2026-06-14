import { useState, useEffect } from 'react';
import type { GroupBuy, GiftScene, Relationship } from '@/types/gift';
import { SCENE_CONFIG } from '@/types/gift';
import { useGiftStore } from '@/store/useGiftStore';
import { getTodayStr } from '@/utils/dateUtils';
import { X, User, Calendar, DollarSign, FileText, Users, ShoppingBag } from 'lucide-react';

interface GroupBuyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editGroupBuy?: GroupBuy;
}

const SCENES: GiftScene[] = ['birthday', 'wedding', 'baby', 'springFestival', 'housewarming', 'anniversary', 'graduation', 'other'];

const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: 'relative', label: '亲戚' },
  { value: 'friend', label: '朋友' },
  { value: 'colleague', label: '同事' },
];

export function GroupBuyFormModal({ isOpen, onClose, editGroupBuy }: GroupBuyFormModalProps) {
  const { addGroupBuy, updateGroupBuy } = useGiftStore();
  const [formData, setFormData] = useState({
    title: '',
    scene: 'birthday' as GiftScene,
    customScene: '',
    recipientName: '',
    relationship: 'friend' as Relationship,
    giftItem: '',
    totalBudget: '',
    giftDate: '',
    purchaseExecutorName: '',
    purchaseExecutorAmount: '',
    participantNames: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editGroupBuy) {
      const executor = editGroupBuy.participants.find(p => p.id === editGroupBuy.purchaseExecutorId);
      const otherParticipants = editGroupBuy.participants.filter(p => p.id !== editGroupBuy.purchaseExecutorId);
      setFormData({
        title: editGroupBuy.title,
        scene: editGroupBuy.scene,
        customScene: editGroupBuy.customScene || '',
        recipientName: editGroupBuy.recipientName,
        relationship: editGroupBuy.relationship,
        giftItem: editGroupBuy.giftItem,
        totalBudget: editGroupBuy.totalBudget.toString(),
        giftDate: editGroupBuy.giftDate,
        purchaseExecutorName: executor?.name || '',
        purchaseExecutorAmount: executor?.amount.toString() || '',
        participantNames: otherParticipants.map(p => `${p.name}:${p.amount}`).join('\n'),
        notes: editGroupBuy.notes || '',
      });
    } else {
      setFormData({
        title: '',
        scene: 'birthday',
        customScene: '',
        recipientName: '',
        relationship: 'friend',
        giftItem: '',
        totalBudget: '',
        giftDate: '',
        purchaseExecutorName: '',
        purchaseExecutorAmount: '',
        participantNames: '',
        notes: '',
      });
    }
    setErrors({});
  }, [editGroupBuy, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = '请输入拼单标题';
    }
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = '请输入收礼人姓名';
    }
    if (!formData.giftItem.trim()) {
      newErrors.giftItem = '请输入礼物名称';
    }
    if (!formData.giftDate) {
      newErrors.giftDate = '请选择送礼日期';
    }
    if (!formData.totalBudget || parseFloat(formData.totalBudget) <= 0) {
      newErrors.totalBudget = '请输入有效的总预算';
    }
    if (!formData.purchaseExecutorName.trim()) {
      newErrors.purchaseExecutorName = '请输入购买执行人姓名';
    }
    if (!formData.purchaseExecutorAmount || parseFloat(formData.purchaseExecutorAmount) <= 0) {
      newErrors.purchaseExecutorAmount = '请输入执行人出资额';
    }
    if (formData.scene === 'other' && !formData.customScene.trim()) {
      newErrors.customScene = '请输入自定义场景名称';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseParticipants = () => {
    const participants: { name: string; amount: number }[] = [];
    
    if (formData.purchaseExecutorName.trim() && formData.purchaseExecutorAmount) {
      participants.push({
        name: formData.purchaseExecutorName.trim(),
        amount: parseFloat(formData.purchaseExecutorAmount),
      });
    }
    
    if (formData.participantNames.trim()) {
      const lines = formData.participantNames.trim().split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed) {
          const parts = trimmed.split(':');
          const name = parts[0].trim();
          const amount = parts[1] ? parseFloat(parts[1].trim()) : 0;
          if (name && amount > 0) {
            participants.push({ name, amount });
          }
        }
      });
    }
    
    return participants;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const participants = parseParticipants();
    const totalBudget = parseFloat(formData.totalBudget);
    
    const groupBuyData = {
      title: formData.title.trim(),
      scene: formData.scene,
      customScene: formData.scene === 'other' ? formData.customScene.trim() : undefined,
      recipientName: formData.recipientName.trim(),
      relationship: formData.relationship,
      giftItem: formData.giftItem.trim(),
      totalBudget,
      actualCost: editGroupBuy?.actualCost,
      giftDate: formData.giftDate,
      purchaseExecutorId: '',
      participants: participants.map(p => ({
        name: p.name,
        amount: p.amount,
        paidAmount: 0,
        isPaid: false,
      })),
      notes: formData.notes.trim() || undefined,
    };

    if (editGroupBuy) {
      const executorIndex = participants.findIndex(p => p.name === formData.purchaseExecutorName.trim());
      const updatedParticipants = participants.map((p, index) => {
        const existing = editGroupBuy.participants.find(ep => ep.name === p.name);
        return {
          id: existing?.id || '',
          name: p.name,
          amount: p.amount,
          paidAmount: existing?.paidAmount || 0,
          isPaid: existing?.isPaid || false,
          paidAt: existing?.paidAt,
        };
      });
      
      updateGroupBuy(editGroupBuy.id, {
        ...groupBuyData,
        purchaseExecutorId: updatedParticipants[executorIndex]?.id || editGroupBuy.purchaseExecutorId,
        participants: updatedParticipants,
      });
    } else {
      const tempParticipants = participants.map((p, index) => ({
        id: `temp-${index}`,
        name: p.name,
        amount: p.amount,
        paidAmount: 0,
        isPaid: false,
      }));
      
      const executorIndex = participants.findIndex(p => p.name === formData.purchaseExecutorName.trim());
      
      addGroupBuy({
        ...groupBuyData,
        purchaseExecutorId: tempParticipants[executorIndex]?.id || tempParticipants[0].id,
        participants: tempParticipants,
      });
    }

    onClose();
  };

  const participants = parseParticipants();
  const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0);
  const budgetDiff = parseFloat(formData.totalBudget) - totalAmount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-800">
            {editGroupBuy ? '✏️ 编辑拼单' : '👥 创建拼单'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              拼单标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：小明生日拼单"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

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

          <div className="grid grid-cols-2 gap-4">
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
              <div className="flex gap-2">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ShoppingBag className="w-4 h-4 inline mr-1" />
                礼物名称
              </label>
              <input
                type="text"
                value={formData.giftItem}
                onChange={(e) => setFormData({ ...formData, giftItem: e.target.value })}
                placeholder="请输入礼物名称"
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
                <DollarSign className="w-4 h-4 inline mr-1" />
                总预算 (元)
              </label>
              <input
                type="number"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                placeholder="请输入总预算"
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.totalBudget ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.totalBudget && (
                <p className="text-red-500 text-sm mt-1">{errors.totalBudget}</p>
              )}
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

          <div className="bg-purple-50 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              参与人员
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  购买执行人姓名 *
                </label>
                <input
                  type="text"
                  value={formData.purchaseExecutorName}
                  onChange={(e) => setFormData({ ...formData, purchaseExecutorName: e.target.value })}
                  placeholder="执行人姓名"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.purchaseExecutorName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.purchaseExecutorName && (
                  <p className="text-red-500 text-xs mt-1">{errors.purchaseExecutorName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  执行人出资额 (元) *
                </label>
                <input
                  type="number"
                  value={formData.purchaseExecutorAmount}
                  onChange={(e) => setFormData({ ...formData, purchaseExecutorAmount: e.target.value })}
                  placeholder="出资额"
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.purchaseExecutorAmount ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.purchaseExecutorAmount && (
                  <p className="text-red-500 text-xs mt-1">{errors.purchaseExecutorAmount}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                其他参与人（每行一个，格式：姓名:金额）
              </label>
              <textarea
                value={formData.participantNames}
                onChange={(e) => setFormData({ ...formData, participantNames: e.target.value })}
                placeholder={"张三:100\n李四:150\n王五:200"}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {participants.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded-xl">
                <div className="text-xs font-medium text-gray-600 mb-2">参与人列表预览：</div>
                <div className="space-y-1">
                  {participants.map((p, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">{p.name}</span>
                      <span className="text-purple-600 font-medium">¥{p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">合计</span>
                  <span className={`font-bold ${budgetDiff === 0 ? 'text-green-600' : budgetDiff > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    ¥{totalAmount.toFixed(2)}
                    {budgetDiff !== 0 && (
                      <span className="ml-2 text-xs font-normal">
                        ({budgetDiff > 0 ? '超出' : '不足'} ¥{Math.abs(budgetDiff).toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
              </div>
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
              placeholder="记录一些补充说明..."
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
              {editGroupBuy ? '保存修改' : '创建拼单'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
