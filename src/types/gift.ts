export type GiftScene = 'birthday' | 'wedding' | 'baby' | 'springFestival' | 'housewarming' | 'anniversary' | 'graduation' | 'other';

export type Relationship = 'relative' | 'friend' | 'colleague';

export type ReminderLevel = 'none' | 'normal' | 'urgent';

export interface GiftPlan {
  id: string;
  scene: GiftScene;
  customScene?: string;
  recipientName: string;
  relationship: Relationship;
  giftDate: string;
  budget: number;
  actualCost?: number;
  isPurchased: boolean;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftPlanWithReminder extends GiftPlan {
  daysRemaining: number;
  reminderLevel: ReminderLevel;
  isOverdue: boolean;
}

export interface FilterOptions {
  status: 'all' | 'pending' | 'purchased';
  relationship: 'all' | Relationship;
}

export const SCENE_CONFIG: Record<GiftScene, { label: string; emoji: string }> = {
  birthday: { label: '生日', emoji: '🎂' },
  wedding: { label: '婚礼', emoji: '💒' },
  baby: { label: '满月酒', emoji: '👶' },
  springFestival: { label: '春节', emoji: '🧧' },
  housewarming: { label: '乔迁', emoji: '🏠' },
  anniversary: { label: '纪念日', emoji: '💝' },
  graduation: { label: '毕业', emoji: '🎓' },
  other: { label: '其他', emoji: '🎁' },
};

export const RELATIONSHIP_CONFIG: Record<Relationship, { label: string; color: string }> = {
  relative: { label: '亲戚', color: 'bg-pink-100 text-pink-700' },
  friend: { label: '朋友', color: 'bg-blue-100 text-blue-700' },
  colleague: { label: '同事', color: 'bg-purple-100 text-purple-700' },
};
