import { useState, useEffect, useMemo } from 'react';
import { useGiftStore, getStats } from '@/store/useGiftStore';
import { requestNotificationPermission } from '@/utils/notification';
import { Bell, BellOff, Gift, History, Sparkles, Users } from 'lucide-react';

interface HeaderProps {
  onOpenPastRecords: () => void;
  onOpenIdeaLibrary: () => void;
  onOpenGroupBuys: () => void;
}

export function Header({ onOpenPastRecords, onOpenIdeaLibrary, onOpenGroupBuys }: HeaderProps) {
  const plans = useGiftStore((state) => state.plans);
  const notificationEnabled = useGiftStore((state) => state.notificationEnabled);
  const setNotificationEnabled = useGiftStore((state) => state.setNotificationEnabled);
  const stats = useMemo(() => getStats(plans), [plans]);
  const [showEnableTip, setShowEnableTip] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationEnabled(true);
    }
  }, [setNotificationEnabled]);

  const handleToggleNotification = async () => {
    if (notificationEnabled) {
      setNotificationEnabled(false);
      return;
    }

    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationEnabled(true);
      setShowEnableTip(true);
      setTimeout(() => setShowEnableTip(false), 3000);
    }
  };

  return (
    <header className="gradient-primary text-white py-6 px-4 md:px-8 rounded-b-3xl shadow-soft mb-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display tracking-wide">
                我的礼物清单
              </h1>
              <p className="text-white/80 text-sm">
                用心准备每一份心意 💝
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenIdeaLibrary}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300"
              title="礼物灵感库"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenGroupBuys}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300"
              title="拼单管理"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenPastRecords}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300"
              title="往年送礼记录"
            >
              <History className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={handleToggleNotification}
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  notificationEnabled
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title={notificationEnabled ? '关闭通知' : '开启通知提醒'}
              >
                {notificationEnabled ? (
                  <div className="relative">
                    <Bell className="w-5 h-5" />
                    {stats.urgentCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary-500 rounded-full text-xs font-bold flex items-center justify-center animate-breathe">
                        {stats.urgentCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <BellOff className="w-5 h-5" />
                )}
              </button>

              {showEnableTip && (
                <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg text-sm whitespace-nowrap animate-fade-in-up z-50">
                  ✅ 通知已开启，提前14天和7天会提醒您
                </div>
              )}
            </div>
          </div>
        </div>

        {stats.urgentCount > 0 && (
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 animate-breathe">
            <p className="text-sm">
              ⚠️ <span className="font-semibold">{stats.urgentCount}</span> 个礼物需要紧急准备！
              还有不到7天就到送礼日期了
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
