import { create } from 'zustand';
import type { GiftPlan, FilterOptions, GiftPlanWithReminder, PastGiftRecord, RecipientReaction, GiftIdea, RecipientType, BudgetRange } from '@/types/gift';
import { PRESET_GIFT_IDEAS } from '@/types/gift';
import { addReminderInfo, sortByDateRemaining, generateId, getTodayStr } from '@/utils/dateUtils';
import { checkAndSendReminders } from '@/utils/notification';

const STORAGE_KEY = 'gift_manager_plans';
const STORAGE_KEY_PAST = 'gift_manager_past_records';
const STORAGE_KEY_CUSTOM_IDEAS = 'gift_manager_custom_ideas';

interface GiftState {
  plans: GiftPlan[];
  pastRecords: PastGiftRecord[];
  giftIdeas: GiftIdea[];
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
    set({ plans, pastRecords, giftIdeas });
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
}));
