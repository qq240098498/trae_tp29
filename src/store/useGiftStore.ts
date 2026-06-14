import { create } from 'zustand';
import type { GiftPlan, FilterOptions, GiftPlanWithReminder } from '@/types/gift';
import { addReminderInfo, sortByDateRemaining, generateId, getTodayStr } from '@/utils/dateUtils';
import { checkAndSendReminders } from '@/utils/notification';

const STORAGE_KEY = 'gift_manager_plans';

interface GiftState {
  plans: GiftPlan[];
  filters: FilterOptions;
  notificationEnabled: boolean;
  init: () => void;
  addPlan: (plan: Omit<GiftPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlan: (id: string, updates: Partial<GiftPlan>) => void;
  deletePlan: (id: string) => void;
  markAsPurchased: (id: string, actualCost: number) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setNotificationEnabled: (enabled: boolean) => void;
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
  filters: {
    status: 'all',
    relationship: 'all',
  },
  notificationEnabled: false,

  init: () => {
    const plans = loadFromStorage();
    set({ plans });
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

  markAsPurchased: (id, actualCost) => {
    const plans = get().plans.map((plan) =>
      plan.id === id
        ? {
            ...plan,
            isPurchased: true,
            actualCost,
            purchaseDate: getTodayStr(),
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
}));
