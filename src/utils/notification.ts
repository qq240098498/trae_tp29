import type { GiftPlanWithReminder } from '@/types/gift';

const NOTIFICATION_KEY = 'gift_notification_sent';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

function getSentNotificationIds(): string[] {
  const data = localStorage.getItem(NOTIFICATION_KEY);
  return data ? JSON.parse(data) : [];
}

function saveNotificationId(id: string): void {
  const ids = getSentNotificationIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(ids));
  }
}

function hasSentNotification(planId: string, days: number): boolean {
  const ids = getSentNotificationIds();
  return ids.includes(`${planId}_${days}`);
}

export function checkAndSendReminders(plans: GiftPlanWithReminder[]): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  plans.forEach((plan) => {
    if (plan.isPurchased || plan.isOverdue) return;

    const shouldRemind14 = plan.daysRemaining === 14 && !hasSentNotification(plan.id, 14);
    const shouldRemind7 = plan.daysRemaining === 7 && !hasSentNotification(plan.id, 7);

    if (shouldRemind14) {
      sendNotification(plan, 14);
      saveNotificationId(`${plan.id}_14`);
    }
    if (shouldRemind7) {
      sendNotification(plan, 7);
      saveNotificationId(`${plan.id}_7`);
    }
  });
}

function sendNotification(plan: GiftPlanWithReminder, days: number): void {
  const title = '🎁 该准备礼物了！';
  const body = `距离${plan.recipientName}的送礼日期还有${days}天\n预算: ¥${plan.budget}`;

  new Notification(title, {
    body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎁</text></svg>',
  });
}

export function clearOldNotifications(): void {
  localStorage.removeItem(NOTIFICATION_KEY);
}
