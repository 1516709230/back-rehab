import { useState, useEffect } from 'react';
import { saveSetting, getSetting, getAssessments, getPainRecords, getLogsInRange } from '../db';
import { requestNotificationPermission, sendReminder, getNotificationStatus } from '../logic/notifications';
import { Bell, Timer, Download, Info } from 'lucide-react';
import { format } from 'date-fns';

export default function Settings() {
  const [sitInterval, setSitInterval] = useState(30);
  const [dailyReminder, setDailyReminder] = useState('20:00');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState(null); // { type: 'success' | 'error', text }
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    // Sync with actual browser permission state first
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifEnabled(true);
    }
    getSetting('sitReminderInterval').then((v) => { if (v) setSitInterval(v); });
    getSetting('dailyReminderTime').then((v) => { if (v) setDailyReminder(v); });
    getSetting('notificationsEnabled').then((v) => { if (v) setNotifEnabled(v); });
  }, []);

  const handleIntervalChange = (val) => {
    setSitInterval(val);
    saveSetting('sitReminderInterval', val);
  };

  const handleTimeChange = (val) => {
    setDailyReminder(val);
    saveSetting('dailyReminderTime', val);
  };

  const handleNotifToggle = async () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Permission already granted — nothing more to request
      return;
    }
    if ('Notification' in window && Notification.permission === 'denied') {
      alert('通知已被浏览器阻止，请在浏览器设置中允许通知后再试。');
      return;
    }
    const granted = await requestNotificationPermission();
    setNotifEnabled(granted);
    saveSetting('notificationsEnabled', granted);
  };

  const handleTestNotification = async () => {
    const status = getNotificationStatus();

    if (status === 'unsupported') {
      setNotifFeedback({ type: 'error', text: '当前浏览器不支持通知功能（需要 HTTPS 或 localhost）' });
      return;
    }
    if (status === 'denied') {
      setNotifFeedback({ type: 'error', text: '通知权限已被阻止，请点击浏览器地址栏左侧的 🔔 图标，改为“允许”后重试' });
      return;
    }
    if (status === 'default') {
      // Permission never requested — request it now (user gesture allows the prompt)
      const granted = await requestNotificationPermission();
      if (!granted) {
        setNotifFeedback({ type: 'error', text: '未获得通知权限，无法发送测试通知' });
        return;
      }
      setNotifEnabled(true);
      saveSetting('notificationsEnabled', true);
    }

    const ok = sendReminder('测试通知', '如果你看到这条通知，说明推送功能正常');
    // Always show the in-app modal so the full reminder experience is visible
    setShowTestModal(true);
    if (ok) {
      setNotifFeedback({ type: 'success', text: '测试提醒已触发 ✓ 若没看到系统通知，请检查浏览器地址栏 🔔 是否为“允许”（而非“静默”）' });
    } else {
      setNotifFeedback({ type: 'error', text: '系统通知创建失败，但应用内提醒已弹出，请检查浏览器通知设置' });
    }
  };

  const handleExport = async () => {
    const [assessments, painRecords, logs] = await Promise.all([
      getAssessments(),
      getPainRecords(),
      getLogsInRange('2026-01-01', format(new Date(), 'yyyy-MM-dd')),
    ]);
    const data = JSON.stringify({ assessments, painRecords, logs }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `back-rehab-export-${format(new Date(), 'yyyyMMdd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-4 pb-8">
      <h1 className="text-xl font-bold">设置</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-blue-600" />
            <span className="font-medium">推送通知</span>
          </div>
          <button
            onClick={handleNotifToggle}
            className={`rounded-lg px-3 py-1 text-sm ${
              notifEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {notifEnabled ? '已开启' : (('Notification' in window && Notification.permission === 'denied') ? '已阻止' : '开启通知')}
          </button>
        </div>
        <button
          onClick={handleTestNotification}
          className="mt-3 w-full rounded-lg border border-blue-200 bg-blue-50 py-2 text-sm text-blue-700"
        >
          测试通知
        </button>
        {notifFeedback && (
          <p className={`mt-2 text-xs ${notifFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {notifFeedback.text}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Timer size={20} className="text-blue-600" />
          <span className="font-medium">久坐提醒间隔</span>
        </div>
        <div className="mt-3 flex gap-2">
          {[20, 30, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => handleIntervalChange(m)}
              className={`flex-1 rounded-lg py-2 text-sm ${
                sitInterval === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {m} 分钟
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          <span className="font-medium">每日康复提醒</span>
        </div>
        <input
          type="time"
          value={dailyReminder}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="mt-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={20} className="text-blue-600" />
            <span className="font-medium">导出数据</span>
          </div>
          <button onClick={handleExport} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
            导出 JSON
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Info size={20} className="text-gray-400" />
          <span className="font-medium">关于</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          本工具不构成医疗诊断，不可替代专业医师。如有红旗指征（发热、大小便困难、进行性肢体无力），请立即就医。
        </p>
        <p className="mt-1 text-xs text-gray-400">版本 0.1.0</p>
      </div>

      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="text-5xl">⏰</div>
            <h2 className="mt-3 text-lg font-bold text-gray-800">该起来活动一下了！</h2>
            <p className="mt-2 text-sm text-gray-500">做几个伸展动作，活动一下腰部</p>
            <button
              onClick={() => setShowTestModal(false)}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-medium text-white"
            >
              我去活动一下
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
