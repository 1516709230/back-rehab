import { useState, useEffect } from 'react';
import { saveSetting, getSetting, getAssessments, getPainRecords, getLogsInRange } from '../db';
import { requestNotificationPermission } from '../logic/notifications';
import { Bell, Timer, Download, Info } from 'lucide-react';
import { format } from 'date-fns';

export default function Settings() {
  const [sitInterval, setSitInterval] = useState(30);
  const [dailyReminder, setDailyReminder] = useState('20:00');
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    getSetting('sitReminderInterval').then((v) => { if (v) setSitInterval(v); });
    getSetting('dailyReminderTime').then((v) => { if (v) setDailyReminder(v); });
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
    const granted = await requestNotificationPermission();
    setNotifEnabled(granted);
    saveSetting('notificationsEnabled', granted);
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
            {notifEnabled ? '已开启' : '开启通知'}
          </button>
        </div>
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
