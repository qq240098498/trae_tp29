import type { ReminderLevel, GiftPlan, GiftPlanWithReminder } from '@/types/gift';

export function calculateDaysRemaining(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getReminderLevel(daysRemaining: number): ReminderLevel {
  if (daysRemaining <= 7) return 'urgent';
  if (daysRemaining <= 14) return 'normal';
  return 'none';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function addReminderInfo(plan: GiftPlan): GiftPlanWithReminder {
  const daysRemaining = calculateDaysRemaining(plan.giftDate);
  const reminderLevel = getReminderLevel(daysRemaining);
  const isOverdue = daysRemaining < 0;
  return { ...plan, daysRemaining, reminderLevel, isOverdue };
}

export function sortByDateRemaining(plans: GiftPlanWithReminder[]): GiftPlanWithReminder[] {
  return [...plans].sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return 1;
    if (!a.isOverdue && b.isOverdue) return -1;
    if (a.isOverdue && b.isOverdue) return b.daysRemaining - a.daysRemaining;
    return a.daysRemaining - b.daysRemaining;
  });
}

export function getTodayStr(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function generateId(): string {
  return `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
