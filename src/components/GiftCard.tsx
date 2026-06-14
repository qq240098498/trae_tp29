import { useState } from 'react';
import type { GiftPlanWithReminder } from '@/types/gift';
import { SCENE_CONFIG, RELATIONSHIP_CONFIG } from '@/types/gift';
import { formatDate, formatShortDate } from '@/utils/dateUtils';
import { useGiftStore } from '@/store/useGiftStore';
import { Edit2, Trash2, Check, Calendar, DollarSign, User } from 'lucide-react';

interface GiftCardProps {
  plan: GiftPlanWithReminder;
  index: number;
  onEdit: (plan: GiftPlanWithReminder) => void;
}

export function GiftCard({ plan, index, onEdit }: GiftCardProps) {
  const { markAsPurchased, deletePlan } = useGiftStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [actualCost, setActualCost] = useState(plan.budget.toString());

  const sceneConfig = SCENE_CONFIG[plan.scene];
  const relConfig = RELATIONSHIP_CONFIG[plan.relationship];

  const getDaysDisplay = () => {
    if (plan.isOverdue) {
      return {
        text: `已过期 ${Math.abs(plan.daysRemaining)} 天`,
        gradient: 'bg-gradient-to-b from-gray-400 to-gray-500',
        animate: '',
      };
    }
    if (plan.daysRemaining === 0) {
      return {
        text: '今天',
        gradient: 'gradient-urgent',
        animate: 'animate-breathe',
      };
    }
    if (plan.reminderLevel === 'urgent') {
      return {
        text: `还有 ${plan.daysRemaining} 天`,
        gradient: 'gradient-urgent',
        animate: 'animate-breathe',
      };
    }
    if (plan.reminderLevel === 'normal') {
      return {
        text: `还有 ${plan.daysRemaining} 天`,
        gradient: 'gradient-normal',
        animate: '',
      };
    }
    return {
      text: `还有 ${plan.daysRemaining} 天`,
      gradient: 'gradient-safe',
      animate: '',
    };
  };

  const daysDisplay = getDaysDisplay();
  const sceneLabel = plan.scene === 'other' ? plan.customScene || '其他' : sceneConfig.label;

  const handleMarkPurchased = () => {
    const cost = parseFloat(actualCost) || plan.budget;
    markAsPurchased(plan.id, cost);
    setShowPurchaseModal(false);
  };

  const handleDelete = () => {
    deletePlan(plan.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in-up transition-all duration-300 hover:shadow-soft hover:-translate-y-1 ${
          plan.isPurchased ? 'opacity-75' : ''
        }`}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="flex">
          <div
            className={`w-24 md:w-32 ${daysDisplay.gradient} text-white flex flex-col items-center justify-center py-6 ${daysDisplay.animate}`}
          >
            <span className="text-xs opacity-90 mb-1">
              {plan.isPurchased ? '✓ 已完成' : '倒计时'}
            </span>
            <span className="text-xl md:text-2xl font-bold text-center leading-tight">
              {plan.isPurchased ? '已购买' : daysDisplay.text}
            </span>
            <span className="text-xs opacity-90 mt-1">{formatShortDate(plan.giftDate)}</span>
          </div>

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{sceneConfig.emoji}</span>
                  <span className="text-lg font-semibold text-gray-800">{sceneLabel}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-sm">{plan.recipientName}</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${relConfig.color}`}
                  >
                    {relConfig.label}
                  </span>
                </div>
              </div>
              {!plan.isPurchased && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(plan)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(plan.giftDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span>
                  预算: <span className="font-semibold text-primary-600">¥{plan.budget}</span>
                  {plan.isPurchased && plan.actualCost !== undefined && (
                    <span className="ml-2 text-green-600">
                      实际: ¥{plan.actualCost}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {plan.notes && (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                💡 {plan.notes}
              </p>
            )}

            {!plan.isPurchased && (
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="w-full gradient-primary text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                标记已购买
              </button>
            )}

            {plan.isPurchased && plan.purchaseDate && (
              <div className="text-center text-sm text-gray-400">
                购买日期: {formatDate(plan.purchaseDate)}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎁 标记已购买</h3>
            <p className="text-gray-600 mb-4">
              为 <span className="font-semibold">{plan.recipientName}</span> 的礼物
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                实际花费 (元)
              </label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="请输入实际花费"
                min="0"
                step="0.01"
              />
              <p className="text-sm text-gray-400 mt-2">
                预算: ¥{plan.budget}
                {parseFloat(actualCost) > plan.budget && (
                  <span className="text-amber-500 ml-2">超出预算 ¥{(parseFloat(actualCost) - plan.budget).toFixed(2)}</span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleMarkPurchased}
                className="flex-1 py-3 px-4 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除送给 <span className="font-semibold text-red-500">{plan.recipientName}</span> 的
              <span className="font-semibold"> {sceneLabel} </span>
              送礼计划吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
