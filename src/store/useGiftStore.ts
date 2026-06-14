import { create } from 'zustand';
import type { GiftPlan, FilterOptions, GiftPlanWithReminder, PastGiftRecord, RecipientReaction, GiftIdea, RecipientType, BudgetRange, GroupBuy, GroupBuyParticipant, GroupBuyStats, GroupBuyStatus, GroupBuyPhoto } from '@/types/gift';
import { PRESET_GIFT_IDEAS } from '@/types/gift';
import { addReminderInfo, sortByDateRemaining, generateId, getTodayStr } from '@/utils/dateUtils';
import { checkAndSendReminders } from '@/utils/notification';

const STORAGE_KEY = 'gift_manager_plans';
const STORAGE_KEY_PAST = 'gift_manager_past_records';
const STORAGE_KEY_CUSTOM_IDEAS = 'gift_manager_custom_ideas';
const STORAGE_KEY_GROUP_BUYS = 'gift_manager_group_buys';

interface GiftState {
  plans: GiftPlan[];
  pastRecords: PastGiftRecord[];
  giftIdeas: GiftIdea[];
  groupBuys: GroupBuy[];
  filters: FilterOptions;
  notificationEnabled: boolean;
  init: () => void;
  addPlan: (plan: Omit<GiftPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlan: (id: string, updates: Partial<GiftPlan>) => void;
  deletePlan: (id: string) => void;
  markAsPurchased: (id: string, actualCost: number, giftItem?: string, recipientReaction?: RecipientReaction) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  addPastRecord: (record: Omit<PastGiftRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePastRecord: (id: string, updates: Partial<PastGiftRecord>) => void;
  deletePastRecord: (id: string) => void;
  archivePlanToPast: (planId: string, giftItem: string, recipientReaction?: RecipientReaction) => void;
  getPastRecordsByRecipient: (recipientName: string) => PastGiftRecord[];
  addGiftIdea: (idea: Omit<GiftIdea, 'id' | 'isCustom' | 'createdAt'>) => void;
  deleteGiftIdea: (id: string) => void;
  getGiftIdeas: (recipientType: RecipientType | 'all', budgetRange: BudgetRange | 'all') => GiftIdea[];
  addGroupBuy: (groupBuy: Omit<GroupBuy, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'photos'>) => void;
  updateGroupBuy: (id: string, updates: Partial<GroupBuy>) => void;
  deleteGroupBuy: (id: string) => void;
  updateGroupBuyStatus: (id: string, status: GroupBuyStatus) => void;
  addParticipant: (groupId: string, participant: Omit<GroupBuyParticipant, 'id'>) => void;
  updateParticipant: (groupId: string, participantId: string, updates: Partial<GroupBuyParticipant>) => void;
  deleteParticipant: (groupId: string, participantId: string) => void;
  markParticipantPaid: (groupId: string, participantId: string, paidAmount: number) => void;
  addPhoto: (groupId: string, photo: Omit<GroupBuyPhoto, 'id' | 'uploadedAt'>) => void;
  deletePhoto: (groupId: string, photoId: string) => void;
  updateThankYouMessage: (groupId: string, message: string) => void;
  getGroupBuyStats: () => GroupBuyStats;
}

function loadFromStorage(): GiftPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(plans: GiftPlan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function loadPastFromStorage(): PastGiftRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PAST);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePastToStorage(records: PastGiftRecord[]): void {
  localStorage.setItem(STORAGE_KEY_PAST, JSON.stringify(records));
}

function loadCustomIdeasFromStorage(): GiftIdea[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CUSTOM_IDEAS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCustomIdeasToStorage(ideas: GiftIdea[]): void {
  localStorage.setItem(STORAGE_KEY_CUSTOM_IDEAS, JSON.stringify(ideas));
}

function buildAllIdeas(customIdeas: GiftIdea[]): GiftIdea[] {
  const presetIdeas: GiftIdea[] = PRESET_GIFT_IDEAS.map((idea, index) => ({
    ...idea,
    id: `preset-${index}`,
    isCustom: false,
    createdAt: new Date(0).toISOString(),
  }));
  return [...presetIdeas, ...customIdeas];
}

function loadGroupBuysFromStorage(): GroupBuy[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_GROUP_BUYS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveGroupBuysToStorage(groupBuys: GroupBuy[]): void {
  localStorage.setItem(STORAGE_KEY_GROUP_BUYS, JSON.stringify(groupBuys));
}

export function getGroupBuyStats(groupBuys: GroupBuy[]): GroupBuyStats {
  const collecting = groupBuys.filter(g => g.status === 'collecting');
  const purchasing = groupBuys.filter(g => g.status === 'purchasing');
  const completed = groupBuys.filter(g => g.status === 'completed');
  
  let totalCollected = 0;
  let totalPending = 0;
  
  groupBuys.forEach(gb => {
    gb.participants.forEach(p => {
      totalCollected += p.paidAmount;
      totalPending += (p.amount - p.paidAmount);
    });
  });
  
  return {
    totalGroupBuys: groupBuys.length,
    collectingCount: collecting.length,
    purchasingCount: purchasing.length,
    completedCount: completed.length,
    totalAmountCollected: totalCollected,
    totalAmountPending: totalPending,
  };
}

export function calculateYearsAgo(giftDate: string): number {
  const today = new Date();
  const gift = new Date(giftDate);
  let years = today.getFullYear() - gift.getFullYear();
  const monthDiff = today.getMonth() - gift.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < gift.getDate())) {
    years--;
  }
  return years;
}

export function getFilteredPlans(plans: GiftPlan[], filters: FilterOptions): GiftPlanWithReminder[] {
  let plansWithReminder = plans.map(addReminderInfo);

  if (filters.status === 'pending') {
    plansWithReminder = plansWithReminder.filter((p) => !p.isPurchased);
  } else if (filters.status === 'purchased') {
    plansWithReminder = plansWithReminder.filter((p) => p.isPurchased);
  }

  if (filters.relationship !== 'all') {
    plansWithReminder = plansWithReminder.filter(
      (p) => p.relationship === filters.relationship
    );
  }

  return sortByDateRemaining(plansWithReminder);
}

export function getStats(plans: GiftPlan[]): {
  upcomingCount: number;
  totalBudget: number;
  purchasedCount: number;
  totalActualCost: number;
  urgentCount: number;
} {
  const plansWithReminder = plans.map(addReminderInfo);
  const notPurchased = plansWithReminder.filter((p) => !p.isPurchased && !p.isOverdue);
  const purchased = plansWithReminder.filter((p) => p.isPurchased);
  const urgent = plansWithReminder.filter(
    (p) => !p.isPurchased && !p.isOverdue && p.reminderLevel === 'urgent'
  );

  return {
    upcomingCount: notPurchased.length,
    totalBudget: notPurchased.reduce((sum, p) => sum + p.budget, 0),
    purchasedCount: purchased.length,
    totalActualCost: purchased.reduce((sum, p) => sum + (p.actualCost || 0), 0),
    urgentCount: urgent.length,
  };
}

export const useGiftStore = create<GiftState>((set, get) => ({
  plans: [],
  pastRecords: [],
  giftIdeas: [],
  groupBuys: [],
  filters: {
    status: 'all',
    relationship: 'all',
  },
  notificationEnabled: false,

  init: () => {
    const plans = loadFromStorage();
    const pastRecords = loadPastFromStorage();
    const customIdeas = loadCustomIdeasFromStorage();
    const giftIdeas = buildAllIdeas(customIdeas);
    const groupBuys = loadGroupBuysFromStorage();
    set({ plans, pastRecords, giftIdeas, groupBuys });
    const plansWithReminder = plans.map(addReminderInfo);
    checkAndSendReminders(plansWithReminder);
  },

  addPlan: (planData) => {
    const newPlan: GiftPlan = {
      ...planData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const plans = [...get().plans, newPlan];
    set({ plans });
    saveToStorage(plans);
    const plansWithReminder = plans.map(addReminderInfo);
    checkAndSendReminders(plansWithReminder);
  },

  updatePlan: (id, updates) => {
    const plans = get().plans.map((plan) =>
      plan.id === id
        ? { ...plan, ...updates, updatedAt: new Date().toISOString() }
        : plan
    );
    set({ plans });
    saveToStorage(plans);
  },

  deletePlan: (id) => {
    const plans = get().plans.filter((plan) => plan.id !== id);
    set({ plans });
    saveToStorage(plans);
  },

  markAsPurchased: (id, actualCost, giftItem, recipientReaction) => {
    const plans = get().plans.map((plan) =>
      plan.id === id
        ? {
            ...plan,
            isPurchased: true,
            actualCost,
            purchaseDate: getTodayStr(),
            giftItem: giftItem || plan.giftItem,
            recipientReaction: recipientReaction || plan.recipientReaction,
            updatedAt: new Date().toISOString(),
          }
        : plan
    );
    set({ plans });
    saveToStorage(plans);
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setNotificationEnabled: (enabled) => {
    set({ notificationEnabled: enabled });
  },

  addPastRecord: (recordData) => {
    const newRecord: PastGiftRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const pastRecords = [...get().pastRecords, newRecord];
    set({ pastRecords });
    savePastToStorage(pastRecords);
  },

  updatePastRecord: (id, updates) => {
    const pastRecords = get().pastRecords.map((record) =>
      record.id === id
        ? { ...record, ...updates, updatedAt: new Date().toISOString() }
        : record
    );
    set({ pastRecords });
    savePastToStorage(pastRecords);
  },

  deletePastRecord: (id) => {
    const pastRecords = get().pastRecords.filter((record) => record.id !== id);
    set({ pastRecords });
    savePastToStorage(pastRecords);
  },

  archivePlanToPast: (planId, giftItem, recipientReaction) => {
    const plan = get().plans.find((p) => p.id === planId);
    if (!plan) return;

    const newRecord: PastGiftRecord = {
      id: generateId(),
      recipientName: plan.recipientName,
      relationship: plan.relationship,
      giftItem,
      giftDate: plan.giftDate,
      actualCost: plan.actualCost,
      recipientReaction,
      scene: plan.scene,
      customScene: plan.customScene,
      notes: plan.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const pastRecords = [...get().pastRecords, newRecord];
    const plans = get().plans.filter((p) => p.id !== planId);
    set({ pastRecords, plans });
    savePastToStorage(pastRecords);
    saveToStorage(plans);
  },

  getPastRecordsByRecipient: (recipientName) => {
    return get()
      .pastRecords.filter((r) => r.recipientName === recipientName)
      .sort((a, b) => new Date(b.giftDate).getTime() - new Date(a.giftDate).getTime());
  },

  addGiftIdea: (ideaData) => {
    const newIdea: GiftIdea = {
      ...ideaData,
      id: generateId(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    const currentIdeas = get().giftIdeas.filter((i) => i.isCustom);
    const customIdeas = [...currentIdeas, newIdea];
    const giftIdeas = buildAllIdeas(customIdeas);
    set({ giftIdeas });
    saveCustomIdeasToStorage(customIdeas);
  },

  deleteGiftIdea: (id) => {
    const currentIdeas = get().giftIdeas.filter((i) => i.isCustom && i.id !== id);
    const giftIdeas = buildAllIdeas(currentIdeas);
    set({ giftIdeas });
    saveCustomIdeasToStorage(currentIdeas);
  },

  getGiftIdeas: (recipientType, budgetRange) => {
    let ideas = get().giftIdeas;
    if (recipientType !== 'all') {
      ideas = ideas.filter((i) => i.recipientType === recipientType);
    }
    if (budgetRange !== 'all') {
      ideas = ideas.filter((i) => i.budgetRange === budgetRange);
    }
    return ideas.sort((a, b) => {
      if (a.isCustom !== b.isCustom) return a.isCustom ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  addGroupBuy: (groupBuyData) => {
    const newGroupBuy: GroupBuy = {
      ...groupBuyData,
      id: generateId(),
      status: 'collecting',
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const groupBuys = [...get().groupBuys, newGroupBuy];
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  updateGroupBuy: (id, updates) => {
    const groupBuys = get().groupBuys.map((gb) =>
      gb.id === id
        ? { ...gb, ...updates, updatedAt: new Date().toISOString() }
        : gb
    );
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  deleteGroupBuy: (id) => {
    const groupBuys = get().groupBuys.filter((gb) => gb.id !== id);
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  updateGroupBuyStatus: (id, status) => {
    const groupBuys = get().groupBuys.map((gb) => {
      if (gb.id === id) {
        const updates: Partial<GroupBuy> = {
          status,
          updatedAt: new Date().toISOString(),
        };
        if (status === 'delivered') {
          updates.deliveredAt = new Date().toISOString();
        }
        if (status === 'completed') {
          updates.completedAt = new Date().toISOString();
        }
        return { ...gb, ...updates };
      }
      return gb;
    });
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  addParticipant: (groupId, participantData) => {
    const groupBuys = get().groupBuys.map((gb) => {
      if (gb.id === groupId) {
        const newParticipant: GroupBuyParticipant = {
          ...participantData,
          id: generateId(),
        };
        return {
          ...gb,
          participants: [...gb.participants, newParticipant],
          updatedAt: new Date().toISOString(),
        };
      }
      return gb;
    });
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  updateParticipant: (groupId, participantId, updates) => {
    const groupBuys = get().groupBuys.map((gb) => {
      if (gb.id === groupId) {
        return {
          ...gb,
          participants: gb.participants.map((p) =>
            p.id === participantId ? { ...p, ...updates } : p
          ),
          updatedAt: new Date().toISOString(),
        };
      }
      return gb;
    });
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  deleteParticipant: (groupId, participantId) => {
    const groupBuys = get().groupBuys.map((gb) => {
      if (gb.id === groupId) {
        return {
          ...gb,
          participants: gb.participants.filter((p) => p.id !== participantId),
          updatedAt: new Date().toISOString(),
        };
      }
      return gb;
    });
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  markParticipantPaid: (groupId, participantId, paidAmount) => {
    const groupBuys = get().groupBuys.map((gb) => {
      if (gb.id === groupId) {
        return {
          ...gb,
          participants: gb.participants.map((p) => {
            if (p.id === participantId) {
              const newPaidAmount = p.paidAmount + paidAmount;
              return {
                ...p,
                paidAmount: newPaidAmount,
                isPaid: newPaidAmount >= p.amount,
                paidAt: newPaidAmount >= p.amount ? new Date().toISOString() : p.paidAt,
              };
            }
            return p;
          }),
          updatedAt: new Date().toISOString(),
        };
      }
      return gb;
    });
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  addPhoto: (groupId, photoData) => {
    const groupBuys = get().groupBuys.map((gb) => {
      if (gb.id === groupId) {
        const newPhoto: GroupBuyPhoto = {
          ...photoData,
          id: generateId(),
          uploadedAt: new Date().toISOString(),
        };
        return {
          ...gb,
          photos: [...gb.photos, newPhoto],
          updatedAt: new Date().toISOString(),
        };
      }
      return gb;
    });
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  deletePhoto: (groupId, photoId) => {
    const groupBuys = get().groupBuys.map((gb) => {
      if (gb.id === groupId) {
        return {
          ...gb,
          photos: gb.photos.filter((p) => p.id !== photoId),
          updatedAt: new Date().toISOString(),
        };
      }
      return gb;
    });
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  updateThankYouMessage: (groupId, message) => {
    const groupBuys = get().groupBuys.map((gb) =>
      gb.id === groupId
        ? { ...gb, thankYouMessage: message, updatedAt: new Date().toISOString() }
        : gb
    );
    set({ groupBuys });
    saveGroupBuysToStorage(groupBuys);
  },

  getGroupBuyStats: () => {
    return getGroupBuyStats(get().groupBuys);
  },
}));
