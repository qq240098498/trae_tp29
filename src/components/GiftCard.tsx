import { useState } from 'react';
import type { GiftPlanWithReminder, RecipientReaction } from '@/types/gift';
import { SCENE_CONFIG, RELATIONSHIP_CONFIG, REACTION_CONFIG } from '@/types/gift';
import { formatDate, formatShortDate } from '@/utils/dateUtils';
import { useGiftStore } from '@/store/useGiftStore';
import { Edit2, Trash2, Check, Calendar, DollarSign, User, Archive } from 'lucide-react';

interface GiftCardProps {
  plan: GiftPlanWithReminder;
  index: number;
  onEdit: (plan: GiftPlanWithReminder) => void;
}

export function GiftCard({ plan, index, onEdit }: GiftCardProps) {
  const { markAsPurchased, deletePlan, archivePlanToPast } = useGiftStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [actualCost, setActualCost] = useState(plan.budget.toString());
  const [giftItem, setGiftItem] = useState(plan.giftItem || '');
  const [recipientReaction, setRecipientReaction] = useState<RecipientReaction | undefined>(plan.recipientReaction);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveGiftItem, setArchiveGiftItem] = useState(plan.giftItem || '');
  const [archiveReaction, setArchiveReaction] = useState<RecipientReaction | undefined>(plan.recipientReaction);

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
    markAsPurchased(plan.id, cost, giftItem.trim() || undefined, recipientReaction);
    setShowPurchaseModal(false);
  };

  const handleArchive = () => {
    if (!archiveGiftItem.trim()) return;
    archivePlanToPast(plan.id, archiveGiftItem.trim(), archiveReaction);
    setShowArchiveModal(false);
    setShowArchiveConfirm(false);
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

            {plan.isPurchased && plan.giftItem && (
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg px-3 py-2">
                <span>🎁 礼物: <span className="font-medium">{plan.giftItem}</span></span>
                {plan.recipientReaction && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${REACTION_CONFIG[plan.recipientReaction].color}`}>
                    {REACTION_CONFIG[plan.recipientReaction].emoji} {REACTION_CONFIG[plan.recipientReaction].label}
                  </span>
                )}
              </div>
            )}

            {plan.isPurchased && (
              <button
                onClick={() => setShowArchiveConfirm(true)}
                className="w-full mt-3 border border-amber-200 text-amber-700 bg-amber-50 py-2 rounded-xl font-medium hover:bg-amber-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <Archive className="w-4 h-4" />
                归档到往年记录
              </button>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  礼物名称
                </label>
                <input
                  type="text"
                  value={giftItem}
                  onChange={(e) => setGiftItem(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入礼物名称，如：保温杯、围巾等"
                />
              </div>
              <div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  收礼人反应
                </label>
                <div className="flex gap-2">
                  {(Object.keys(REACTION_CONFIG) as RecipientReaction[]).map((key) => {
                    const cfg = REACTION_CONFIG[key];
                    const isSelected = recipientReaction === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRecipientReaction(isSelected ? undefined : key)}
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
            </div>
            <div className="flex gap-3 mt-6">
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

      {showArchiveConfirm && !showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 mb-2">📦 归档到往年记录</h3>
            <p className="text-gray-600 mb-6">
              将此计划归档后，它会从当前计划列表移除，保存到往年记录中供日后参考。
              确定要归档送给 <span className="font-semibold text-amber-600">{plan.recipientName}</span> 的
              <span className="font-semibold"> {sceneLabel} </span>计划吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowArchiveModal(true)}
                className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
              >
                继续填写
              </button>
            </div>
          </div>
        </div>
      )}

      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📦 归档往年记录</h3>
            <p className="text-gray-600 mb-4">
              请补充送给 <span className="font-semibold">{plan.recipientName}</span> 的礼物信息
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> 礼物名称
                </label>
                <input
                  type="text"
                  value={archiveGiftItem}
                  onChange={(e) => setArchiveGiftItem(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入礼物名称"
                />
                {!archiveGiftItem.trim() && (
                  <p className="text-red-500 text-sm mt-1">请输入礼物名称</p>
                )}
              </div>
              {plan.actualCost !== undefined && (
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <div className="text-sm text-gray-500">实际花费</div>
                  <div className="text-lg font-semibold text-gray-800">¥{plan.actualCost}</div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  收礼人反应
                </label>
                <div className="flex gap-2">
                  {(Object.keys(REACTION_CONFIG) as RecipientReaction[]).map((key) => {
                    const cfg = REACTION_CONFIG[key];
                    const isSelected = archiveReaction === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setArchiveReaction(isSelected ? undefined : key)}
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
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  setShowArchiveConfirm(false);
                }}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleArchive}
                disabled={!archiveGiftItem.trim()}
                className="flex-1 py-3 px-4 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认归档
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
