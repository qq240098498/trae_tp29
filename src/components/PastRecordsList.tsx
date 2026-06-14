import { useState, useMemo } from 'react';
import type { PastGiftRecord } from '@/types/gift';
import { SCENE_CONFIG, RELATIONSHIP_CONFIG, REACTION_CONFIG } from '@/types/gift';
import { useGiftStore, calculateYearsAgo } from '@/store/useGiftStore';
import { formatDate } from '@/utils/dateUtils';
import { PastRecordFormModal } from './PastRecordFormModal';
import { Edit2, Trash2, Plus, History, User, Calendar, DollarSign, Search, X } from 'lucide-react';

interface PastRecordsListProps {
  onClose: () => void;
  onAddRecord?: () => void;
}

export function PastRecordsList({ onClose }: PastRecordsListProps) {
  const { pastRecords, deletePastRecord } = useGiftStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PastGiftRecord | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [filterRelationship, setFilterRelationship] = useState<'all' | 'relative' | 'friend' | 'colleague'>('all');

  const filteredRecords = useMemo(() => {
    let records = [...pastRecords];
    if (searchName.trim()) {
      records = records.filter((r) => r.recipientName.includes(searchName.trim()));
    }
    if (filterRelationship !== 'all') {
      records = records.filter((r) => r.relationship === filterRelationship);
    }
    return records.sort((a, b) => new Date(b.giftDate).getTime() - new Date(a.giftDate).getTime());
  }, [pastRecords, searchName, filterRelationship]);

  const groupedByRecipient = useMemo(() => {
    const groups: Record<string, PastGiftRecord[]> = {};
    filteredRecords.forEach((r) => {
      if (!groups[r.recipientName]) groups[r.recipientName] = [];
      groups[r.recipientName].push(r);
    });
    return groups;
  }, [filteredRecords]);

  const handleAdd = () => {
    setEditingRecord(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (record: PastGiftRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRecord(undefined);
  };

  const handleDelete = (id: string) => {
    deletePastRecord(id);
    setShowDeleteConfirm(null);
  };

  const stats = useMemo(() => {
    const totalRecords = pastRecords.length;
    const totalCost = pastRecords.reduce((sum, r) => sum + (r.actualCost || 0), 0);
    const lovedCount = pastRecords.filter((r) => r.recipientReaction === 'loved').length;
    const uniqueRecipients = new Set(pastRecords.map((r) => r.recipientName)).size;
    return { totalRecords, totalCost, lovedCount, uniqueRecipients };
  }, [pastRecords]);

  return (
    <div className="fixed inset-0 bg-gray-50 z-40 overflow-y-auto animate-fade-in-up">
      <header className="gradient-amber text-white py-6 px-4 md:px-8 rounded-b-3xl shadow-soft sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <History className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-display tracking-wide">
                    往年送礼记录
                  </h1>
                  <p className="text-white/80 text-sm">
                    回顾历史，避免重复 💡
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">添加记录</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <div className="text-white/80 text-xs mb-1">总记录数</div>
              <div className="text-xl font-bold">{stats.totalRecords}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <div className="text-white/80 text-xs mb-1">收礼人数</div>
              <div className="text-xl font-bold">{stats.uniqueRecipients}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <div className="text-white/80 text-xs mb-1">累计花费</div>
              <div className="text-xl font-bold">¥{stats.totalCost.toFixed(0)}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <div className="text-white/80 text-xs mb-1">喜欢的礼物</div>
              <div className="text-xl font-bold">{stats.lovedCount} 🎉</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {pastRecords.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-4 mb-6 space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="搜索收礼人姓名..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: '全部' },
                { value: 'relative', label: '亲戚' },
                { value: 'friend', label: '朋友' },
                { value: 'colleague', label: '同事' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterRelationship(opt.value as typeof filterRelationship)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterRelationship === opt.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
              <History className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {pastRecords.length === 0 ? '还没有往年记录' : '没有找到匹配的记录'}
            </h3>
            <p className="text-gray-500 mb-6">
              {pastRecords.length === 0
                ? '添加第一条往年送礼记录，帮助你做更好的送礼决策！'
                : '试试调整搜索条件或筛选选项'}
            </p>
            {pastRecords.length === 0 && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-soft"
              >
                <Plus className="w-5 h-5" />
                添加往年记录
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByRecipient).map(([name, records]) => {
              const latest = records[0];
              const relConfig = RELATIONSHIP_CONFIG[latest.relationship];
              return (
                <div key={name} className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in-up">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <User className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${relConfig.color} mt-0.5`}>
                            {relConfig.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">送礼次数</div>
                        <div className="text-2xl font-bold text-amber-600">{records.length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {records.map((record) => {
                      const sceneConfig = SCENE_CONFIG[record.scene];
                      const sceneLabel = record.scene === 'other' ? record.customScene || '其他' : sceneConfig.label;
                      const yearsAgo = calculateYearsAgo(record.giftDate);
                      return (
                        <div key={record.id} className="p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{sceneConfig.emoji}</span>
                                <span className="font-semibold text-gray-800">{record.giftItem}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {sceneLabel}
                                </span>
                                {yearsAgo > 0 && (
                                  <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                    {yearsAgo}年前
                                  </span>
                                )}
                                {yearsAgo === 0 && (
                                  <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                    今年
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(record.giftDate)}</span>
                                </div>
                                {record.actualCost !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span>¥{record.actualCost}</span>
                                  </div>
                                )}
                                {record.recipientReaction && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${REACTION_CONFIG[record.recipientReaction].color}`}>
                                    {REACTION_CONFIG[record.recipientReaction].emoji} 反应{REACTION_CONFIG[record.recipientReaction].label}
                                  </span>
                                )}
                              </div>
                              {record.notes && (
                                <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                                  💭 {record.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="编辑"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(record.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {record.recipientReaction === 'disliked' && (
                            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-2">
                              ⚠️ 对方不太喜欢这个礼物，下次注意避免送类似类型！
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <button
        onClick={handleAdd}
        className="fixed bottom-6 right-6 w-16 h-16 gradient-amber text-white rounded-full shadow-soft flex items-center justify-center hover:scale-110 transition-transform duration-300 z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      <PastRecordFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editRecord={editingRecord}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除这条往年记录吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
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
