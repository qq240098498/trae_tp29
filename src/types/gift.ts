export type GiftScene = 'birthday' | 'wedding' | 'baby' | 'springFestival' | 'housewarming' | 'anniversary' | 'graduation' | 'other';

export type Relationship = 'relative' | 'friend' | 'colleague';

export type ReminderLevel = 'none' | 'normal' | 'urgent';

export type RecipientReaction = 'loved' | 'neutral' | 'disliked';

export type RecipientType = 'student' | 'worker' | 'elder' | 'baby';

export type BudgetRange = '0-100' | '100-200' | '200-300' | '300-500' | '500-1000' | '1000+';

export interface GiftIdea {
  id: string;
  recipientType: RecipientType;
  budgetRange: BudgetRange;
  recipientLabel?: string;
  title: string;
  gifts: string[];
  isCustom: boolean;
  createdAt: string;
}

export const RECIPIENT_TYPE_CONFIG: Record<RecipientType, { label: string; emoji: string }> = {
  student: { label: '学生', emoji: '🎒' },
  worker: { label: '上班族', emoji: '💼' },
  elder: { label: '老人', emoji: '👴' },
  baby: { label: '婴儿', emoji: '🍼' },
};

export const BUDGET_RANGE_CONFIG: Record<BudgetRange, { label: string; min: number; max: number | null }> = {
  '0-100': { label: '100元以下', min: 0, max: 100 },
  '100-200': { label: '100-200元', min: 100, max: 200 },
  '200-300': { label: '200-300元', min: 200, max: 300 },
  '300-500': { label: '300-500元', min: 300, max: 500 },
  '500-1000': { label: '500-1000元', min: 500, max: 1000 },
  '1000+': { label: '1000元以上', min: 1000, max: null },
};

export const PRESET_GIFT_IDEAS: Omit<GiftIdea, 'id' | 'isCustom' | 'createdAt'>[] = [
  { recipientType: 'student', budgetRange: '0-100', recipientLabel: '学生', title: '0-100元送学生', gifts: ['精美笔记本', '签字笔套装', '书签礼盒', '便利贴组合', '卡通钥匙扣'] },
  { recipientType: 'student', budgetRange: '100-200', recipientLabel: '学生', title: '100-200元送学生', gifts: ['保温杯', '台灯', '书立', '手账套装', '蓝牙耳机入门款'] },
  { recipientType: 'student', budgetRange: '200-300', recipientLabel: '学生', title: '200-300元送学生', gifts: ['运动水杯', '充电宝', '精品钢笔', '书包挂饰套装', '课外书籍套装'] },
  { recipientType: 'student', budgetRange: '300-500', recipientLabel: '学生', title: '300-500元送学生', gifts: ['机械键盘入门款', '智能手表', '护眼台灯', '双肩背包', '平板支架'] },
  { recipientType: 'student', budgetRange: '500-1000', recipientLabel: '学生', title: '500-1000元送学生', gifts: ['品牌双肩包', '降噪耳机', 'Kindle电子书', '滑板', '微单相机入门款'] },
  { recipientType: 'student', budgetRange: '1000+', recipientLabel: '学生', title: '1000元以上送学生', gifts: ['笔记本电脑', 'iPad', '专业相机镜头', '山地自行车', '高端降噪耳机'] },

  { recipientType: 'worker', budgetRange: '0-100', recipientLabel: '同事', title: '0-100元送同事', gifts: ['创意便签本', '咖啡杯', '手机支架', '护手霜套装', '小盆栽'] },
  { recipientType: 'worker', budgetRange: '100-200', recipientLabel: '同事', title: '100-200元送同事', gifts: ['办公腰靠', '加湿器', '书籍', '护眼仪', '咖啡礼盒'] },
  { recipientType: 'worker', budgetRange: '200-300', recipientLabel: '同事', title: '200-300元送同事', gifts: ['办公腰靠', '加湿器', '书', '人体工学鼠标', '颈椎按摩仪'] },
  { recipientType: 'worker', budgetRange: '300-500', recipientLabel: '上班族', title: '300-500元送上班族', gifts: ['无线充电器套装', '品牌钢笔', '高端咖啡礼盒', '办公收纳盒套装', '空气净化器迷你款'] },
  { recipientType: 'worker', budgetRange: '500-1000', recipientLabel: '上班族', title: '500-1000元送上班族', gifts: ['机械键盘', '智能手表', '降噪耳机', '高端双肩包', '电动牙刷套装'] },
  { recipientType: 'worker', budgetRange: '1000+', recipientLabel: '上班族', title: '1000元以上送上班族', gifts: ['iPad', '高端笔记本电脑包', '智能眼镜', '咖啡机', '人体工学椅'] },

  { recipientType: 'elder', budgetRange: '0-100', recipientLabel: '长辈', title: '0-100元送长辈', gifts: ['保暖袜套装', '蜂蜜礼盒', '枸杞礼盒', '老花镜', '按摩锤'] },
  { recipientType: 'elder', budgetRange: '100-200', recipientLabel: '长辈', title: '100-200元送长辈', gifts: ['保温杯', '保健品礼盒', '足浴包套装', '护膝', '围巾'] },
  { recipientType: 'elder', budgetRange: '200-300', recipientLabel: '长辈', title: '200-300元送长辈', gifts: ['茶叶礼盒', '坚果礼盒', '保暖内衣套装', '电子血压计基础款', '收音机'] },
  { recipientType: 'elder', budgetRange: '300-500', recipientLabel: '长辈', title: '300-500元送长辈', gifts: ['足浴盆', '按摩枕', '高端茶叶礼盒', '燕窝礼盒', '智能手环'] },
  { recipientType: 'elder', budgetRange: '500-1000', recipientLabel: '长辈', title: '500-1000元送长辈', gifts: ['电动按摩椅垫', '空气净化器', '高端保健品礼盒', '智能手机老人款', '血糖仪套装'] },
  { recipientType: 'elder', budgetRange: '1000+', recipientLabel: '长辈', title: '1000元以上送长辈', gifts: ['全自动按摩椅', '高端智能手机', '家庭体检套餐', '黄金饰品', '旅行套餐'] },

  { recipientType: 'baby', budgetRange: '0-100', recipientLabel: '宝宝', title: '0-100元送宝宝', gifts: ['婴儿袜子套装', '口水巾礼盒', '安抚奶嘴', '婴儿玩具摇铃', '婴儿洗发沐浴小样'] },
  { recipientType: 'baby', budgetRange: '100-200', recipientLabel: '宝宝', title: '100-200元送宝宝', gifts: ['婴儿连体衣礼盒', '婴儿浴巾', '早教绘本套装', '安抚巾', '宝宝湿巾大包装'] },
  { recipientType: 'baby', budgetRange: '200-300', recipientLabel: '宝宝', title: '200-300元送宝宝', gifts: ['奶粉', '纸尿裤大包装', '婴儿健身架', '婴儿推车配件', '宝宝餐椅基础款'] },
  { recipientType: 'baby', budgetRange: '300-500', recipientLabel: '宝宝', title: '300-500元送宝宝', gifts: ['高端婴儿服装礼盒', '婴儿安全座椅配件', '早教机', '婴儿床品套装', '宝宝摄影套餐券'] },
  { recipientType: 'baby', budgetRange: '500-1000', recipientLabel: '宝宝', title: '500-1000元送宝宝', gifts: ['婴儿推车轻便款', '安全座椅', '婴儿床', '宝宝餐椅高端款', '黄金长命锁'] },
  { recipientType: 'baby', budgetRange: '1000+', recipientLabel: '宝宝', title: '1000元以上送宝宝', gifts: ['高端婴儿推车', '进口安全座椅', '婴儿监控套装', '实木婴儿床', '金条/金银饰品套装'] },
];

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
  giftItem?: string;
  recipientReaction?: RecipientReaction;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PastGiftRecord {
  id: string;
  recipientName: string;
  relationship: Relationship;
  giftItem: string;
  giftDate: string;
  actualCost?: number;
  recipientReaction?: RecipientReaction;
  scene: GiftScene;
  customScene?: string;
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

export const REACTION_CONFIG: Record<RecipientReaction, { label: string; emoji: string; color: string }> = {
  loved: { label: '喜欢', emoji: '😍', color: 'text-green-600 bg-green-50' },
  neutral: { label: '一般', emoji: '😐', color: 'text-amber-600 bg-amber-50' },
  disliked: { label: '不喜欢', emoji: '😕', color: 'text-red-600 bg-red-50' },
};
