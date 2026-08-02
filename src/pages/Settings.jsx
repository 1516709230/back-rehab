import { useState, useEffect } from 'react';
import { saveSetting, getSetting, getAssessments, getPainRecords, getLogsInRange } from '../db';
import { requestNotificationPermission, sendNotification, getNotificationStatus } from '../logic/notifications';
import { Bell, Timer, Download, Info } from 'lucide-react';
import { format } from 'date-fns';

export default function Settings() {
  const [sitInterval, setSitInterval] = useState(30);
  const [dailyReminder, setDailyReminder] = useState('20:00');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState(null); // { type: 'success' | 'error', text }

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

    const ok = sendNotification('测试通知', '如果你看到这条通知，说明推送功能正常');
    if (ok) {
      setNotifFeedback({ type: 'success', text: '测试通知已发送 ✓ 请查看屏幕右上角/系统通知中心' });
    } else {
      setNotifFeedback({ type: 'error', text: '通知创建失败，请查看浏览器控制台错误' });
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
    </div>
  );
}
