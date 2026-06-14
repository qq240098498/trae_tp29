import { useState, useRef } from 'react';
import type { GroupBuy } from '@/types/gift';
import { SCENE_CONFIG, GROUP_BUY_STATUS_CONFIG, RELATIONSHIP_CONFIG } from '@/types/gift';
import { useGiftStore } from '@/store/useGiftStore';
import { formatDate } from '@/utils/dateUtils';
import { X, Users, DollarSign, Check, Clock, Camera, Share2, MessageSquare, Plus, Trash2, Edit, ShoppingBag, Calendar, User, Gift } from 'lucide-react';

interface GroupBuyDetailProps {
  groupBuy: GroupBuy;
  onClose: () => void;
  onEdit: () => void;
}

export function GroupBuyDetail({ groupBuy, onClose, onEdit }: GroupBuyDetailProps) {
  const { updateGroupBuyStatus, markParticipantPaid, addPhoto, deletePhoto, updateThankYouMessage, deleteGroupBuy, addParticipant, deleteParticipant } = useGiftStore();
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantAmount, setNewParticipantAmount] = useState('');
  const [thankYouMessage, setThankYouMessage] = useState(groupBuy.thankYouMessage || '');
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executor = groupBuy.participants.find(p => p.id === groupBuy.purchaseExecutorId);
  const totalPaid = groupBuy.participants.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalAmount = groupBuy.participants.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = totalAmount - totalPaid;
  const paidCount = groupBuy.participants.filter(p => p.isPaid).length;
  const progress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  const sceneConfig = SCENE_CONFIG[groupBuy.scene];
  const statusConfig = GROUP_BUY_STATUS_CONFIG[groupBuy.status];

  const handleMarkPaid = (participantId: string) => {
    const participant = groupBuy.participants.find(p => p.id === participantId);
    if (!participant) return;
    
    const remaining = participant.amount - participant.paidAmount;
    if (remaining <= 0) return;
    
    markParticipantPaid(groupBuy.id, participantId, remaining);
    setShowPaymentModal(null);
    setPaymentAmount('');
  };

  const handleCustomPayment = () => {
    if (!showPaymentModal || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      markParticipantPaid(groupBuy.id, showPaymentModal, amount);
    }
    setShowPaymentModal(null);
    setPaymentAmount('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      addPhoto(groupBuy.id, { url: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveThankYou = () => {
    updateThankYouMessage(groupBuy.id, thankYouMessage);
    setIsEditingMessage(false);
  };

  const handleShare = async () => {
    const shareText = `🎉 拼单分享：${groupBuy.title}\n\n` +
      `🎁 礼物：${groupBuy.giftItem}\n` +
      `👤 收礼人：${groupBuy.recipientName}\n` +
      `📅 日期：${formatDate(groupBuy.giftDate)}\n` +
      `💰 总预算：¥${groupBuy.totalBudget.toFixed(2)}\n` +
      `✅ 已收款：¥${totalPaid.toFixed(2)} / ¥${totalAmount.toFixed(2)}\n` +
      `👥 参与人数：${groupBuy.participants.length}人\n` +
      (groupBuy.thankYouMessage ? `\n💝 感谢语：\n${groupBuy.thankYouMessage}\n` : '') +
      '\n感谢大家的参与！';

    if (navigator.share) {
      try {
        await navigator.share({
          title: groupBuy.title,
          text: shareText,
        });
      } catch (err) {
        console.log('分享取消');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('分享内容已复制到剪贴板！');
    }
  };

  const handleAddParticipant = () => {
    if (!newParticipantName.trim() || !newParticipantAmount) return;
    const amount = parseFloat(newParticipantAmount);
    if (amount <= 0) return;

    addParticipant(groupBuy.id, {
      name: newParticipantName.trim(),
      amount,
      paidAmount: 0,
      isPaid: false,
    });

    setNewParticipantName('');
    setNewParticipantAmount('');
    setShowAddParticipant(false);
  };

  const handleDelete = () => {
    deleteGroupBuy(groupBuy.id);
    onClose();
  };

  const getNextStatus = () => {
    const statusFlow: Record<string, string> = {
      'collecting': 'purchasing',
      'purchasing': 'delivered',
      'delivered': 'completed',
    };
    return statusFlow[groupBuy.status];
  };

  const getNextStatusLabel = () => {
    const next = getNextStatus();
    if (!next) return null;
    const config = GROUP_BUY_STATUS_CONFIG[next as keyof typeof GROUP_BUY_STATUS_CONFIG];
    return { label: `标记为${config.label}`, emoji: config.emoji };
  };

  const nextStatus = getNextStatusLabel();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl">
              {sceneConfig.emoji}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{groupBuy.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.emoji} {statusConfig.label}
                </span>
                <span className="text-xs text-gray-500">{sceneConfig.label}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="编辑"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="删除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-purple-800 font-semibold mb-3">
                <Gift className="w-5 h-5" />
                礼物信息
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">礼物名称</span>
                  <span className="font-medium text-gray-800">{groupBuy.giftItem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">收礼人</span>
                  <span className="font-medium text-gray-800">{groupBuy.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">关系</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${RELATIONSHIP_CONFIG[groupBuy.relationship].color}`}>
                    {RELATIONSHIP_CONFIG[groupBuy.relationship].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600"><Calendar className="w-4 h-4 inline mr-1" />送礼日期</span>
                  <span className="font-medium text-gray-800">{formatDate(groupBuy.giftDate)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold mb-3">
                <DollarSign className="w-5 h-5" />
                收款进度
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">已收款</span>
                  <span className="font-bold text-green-600">¥{totalPaid.toFixed(2)} / ¥{totalAmount.toFixed(2)}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-white rounded-lg p-2">
                  <div className="text-gray-500 text-xs">总预算</div>
                  <div className="font-bold text-gray-800">¥{groupBuy.totalBudget.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-gray-500 text-xs">已交款</div>
                  <div className="font-bold text-green-600">{paidCount}/{groupBuy.participants.length}</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-gray-500 text-xs">待收款</div>
                  <div className="font-bold text-amber-600">¥{totalPending.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {executor && (
            <div className="bg-amber-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
                <ShoppingBag className="w-5 h-5" />
                购买执行人
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{executor.name}</div>
                    <div className="text-xs text-gray-500">负责购买礼物</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">应出</div>
                  <div className="font-bold text-amber-600">¥{executor.amount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <Users className="w-5 h-5 text-purple-500" />
                参与人员
              </div>
              <button
                onClick={() => setShowAddParticipant(true)}
                className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                添加成员
              </button>
            </div>

            {showAddParticipant && (
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    placeholder="姓名"
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    value={newParticipantAmount}
                    onChange={(e) => setNewParticipantAmount(e.target.value)}
                    placeholder="出资额"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddParticipant(false)}
                    className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddParticipant}
                    className="flex-1 py-2 text-sm text-white bg-purple-500 rounded-lg hover:bg-purple-600"
                  >
                    添加
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {groupBuy.participants.map((participant) => {
                const remaining = participant.amount - participant.paidAmount;
                const isExecutor = participant.id === groupBuy.purchaseExecutorId;
                
                return (
                  <div 
                    key={participant.id} 
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      participant.isPaid ? 'bg-green-50 border border-green-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        participant.isPaid ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {participant.isPaid ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{participant.name}</span>
                          {isExecutor && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                              执行人
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          应出 ¥{participant.amount.toFixed(2)}
                          {participant.paidAmount > 0 && (
                            <span className="ml-2">已付 ¥{participant.paidAmount.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {remaining > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-amber-600 font-medium text-sm">
                            还差 ¥{remaining.toFixed(2)}
                          </span>
                          <button
                            onClick={() => {
                              setShowPaymentModal(participant.id);
                              setPaymentAmount(remaining.toString());
                            }}
                            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            标记收款
                          </button>
                        </div>
                      ) : (
                        <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          已付清
                        </span>
                      )}
                      {!isExecutor && (
                        <button
                          onClick={() => deleteParticipant(groupBuy.id, participant.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {groupBuy.status !== 'collecting' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <Camera className="w-5 h-5 text-blue-500" />
                  照片墙
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  上传照片
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {groupBuy.photos.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {groupBuy.photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt="礼物照片" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <button
                          onClick={() => deletePhoto(groupBuy.id, photo.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">还没有照片，点击上方按钮上传吧</p>
                </div>
              )}
            </div>
          )}

          {groupBuy.status === 'delivered' || groupBuy.status === 'completed' ? (
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-pink-800 font-semibold">
                  <MessageSquare className="w-5 h-5" />
                  感谢语
                </div>
                {!isEditingMessage && (
                  <button
                    onClick={() => setIsEditingMessage(true)}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    编辑
                  </button>
                )}
              </div>
              
              {isEditingMessage ? (
                <div>
                  <textarea
                    value={thankYouMessage}
                    onChange={(e) => setThankYouMessage(e.target.value)}
                    placeholder="写下想对参与者说的感谢话语..."
                    rows={4}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setIsEditingMessage(false);
                        setThankYouMessage(groupBuy.thankYouMessage || '');
                      }}
                      className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveThankYou}
                      className="flex-1 py-2 text-sm text-white bg-pink-500 rounded-lg hover:bg-pink-600"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-4">
                  {groupBuy.thankYouMessage ? (
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {groupBuy.thankYouMessage}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      还没有感谢语，点击编辑写下你的感谢吧~
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {nextStatus && (
              <button
                onClick={() => updateGroupBuyStatus(groupBuy.id, getNextStatus() as any)}
                className="flex-1 py-3.5 px-4 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-soft flex items-center justify-center gap-2"
              >
                {nextStatus.emoji} {nextStatus.label}
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex-1 py-3.5 px-4 border-2 border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              分享给参与者
            </button>
          </div>

          {groupBuy.notes && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-600 mb-2">备注</div>
              <p className="text-gray-700">{groupBuy.notes}</p>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4">确认收款</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                收款金额 (元)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(null);
                  setPaymentAmount('');
                }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCustomPayment}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600"
              >
                确认收款
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">确定要删除这个拼单吗？此操作不可恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
