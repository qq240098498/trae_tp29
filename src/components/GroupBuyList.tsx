import { useState, useMemo } from 'react';
import type { GroupBuy, GroupBuyStatus } from '@/types/gift';
import { SCENE_CONFIG, GROUP_BUY_STATUS_CONFIG, RELATIONSHIP_CONFIG } from '@/types/gift';
import { useGiftStore, getGroupBuyStats } from '@/store/useGiftStore';
import { formatDate } from '@/utils/dateUtils';
import { X, Users, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { GroupBuyFormModal } from './GroupBuyFormModal';
import { GroupBuyDetail } from './GroupBuyDetail';

interface GroupBuyListProps {
  onClose: () => void;
}

const STATUS_FILTERS: { value: GroupBuyStatus | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: '全部', emoji: '📋' },
  { value: 'collecting', label: '收款中', emoji: '💰' },
  { value: 'purchasing', label: '采购中', emoji: '🛒' },
  { value: 'delivered', label: '已送出', emoji: '🎁' },
  { value: 'completed', label: '已完成', emoji: '✅' },
];

export function GroupBuyList({ onClose }: GroupBuyListProps) {
  const groupBuys = useGiftStore((state) => state.groupBuys);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroupBuy, setEditingGroupBuy] = useState<GroupBuy | undefined>();
  const [selectedGroupBuy, setSelectedGroupBuy] = useState<GroupBuy | undefined>();
  const [statusFilter, setStatusFilter] = useState<GroupBuyStatus | 'all'>('all');

  const stats = useMemo(() => getGroupBuyStats(groupBuys), [groupBuys]);

  const filteredGroupBuys = useMemo(() => {
    let filtered = [...groupBuys];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(gb => gb.status === statusFilter);
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [groupBuys, statusFilter]);

  const handleEdit = (groupBuy: GroupBuy) => {
    setEditingGroupBuy(groupBuy);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGroupBuy(undefined);
  };

  const handleViewDetail = (groupBuy: GroupBuy) => {
    setSelectedGroupBuy(groupBuy);
  };

  const handleCloseDetail = () => {
    setSelectedGroupBuy(undefined);
  };

  const handleEditFromDetail = () => {
    if (selectedGroupBuy) {
      setEditingGroupBuy(selectedGroupBuy);
      setIsFormOpen(true);
      setSelectedGroupBuy(undefined);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'from-green-400 to-emerald-500';
    if (progress >= 50) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-rose-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="gradient-primary text-white py-6 px-4 md:px-8 rounded-b-3xl shadow-soft mb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">👥 拼单管理</h1>
                <p className="text-white/80 text-sm">多人合买，心意加倍 💝</p>
              </div>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500">总拼单</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalGroupBuys}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-gray-500">收款中</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">{stats.collectingCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">已收款</span>
            </div>
            <div className="text-2xl font-bold text-green-600">¥{stats.totalAmountCollected.toFixed(0)}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-gray-500">已完成</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.completedCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-2 mb-6 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === filter.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-soft'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{filter.emoji}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredGroupBuys.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {statusFilter === 'all' ? '还没有拼单' : '没有符合条件的拼单'}
            </h3>
            <p className="text-gray-400 mb-6">
              {statusFilter === 'all' ? '点击右上角 + 号创建第一个拼单吧' : '试试切换其他筛选条件'}
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-soft"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                创建拼单
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroupBuys.map((groupBuy) => {
              const sceneConfig = SCENE_CONFIG[groupBuy.scene];
              const statusConfig = GROUP_BUY_STATUS_CONFIG[groupBuy.status];
              const totalPaid = groupBuy.participants.reduce((sum, p) => sum + p.paidAmount, 0);
              const totalAmount = groupBuy.participants.reduce((sum, p) => sum + p.amount, 0);
              const progress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
              const paidCount = groupBuy.participants.filter(p => p.isPaid).length;

              return (
                <div
                  key={groupBuy.id}
                  onClick={() => handleViewDetail(groupBuy)}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                        {sceneConfig.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{groupBuy.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.emoji} {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {RELATIONSHIP_CONFIG[groupBuy.relationship].label} · {groupBuy.recipientName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">¥{groupBuy.totalBudget.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{formatDate(groupBuy.giftDate)}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">收款进度</span>
                      <span className="font-medium">
                        ¥{totalPaid.toFixed(2)} / ¥{totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(progress)} rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{groupBuy.participants.length}人参与</span>
                    </div>
                    <div className="text-gray-500">
                      {paidCount}/{groupBuy.participants.length}人已交款
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <GroupBuyFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editGroupBuy={editingGroupBuy}
      />

      {selectedGroupBuy && (
        <GroupBuyDetail
          groupBuy={selectedGroupBuy}
          onClose={handleCloseDetail}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
}
