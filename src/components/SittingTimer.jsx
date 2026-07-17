import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { getSetting } from '../db';

export default function SittingTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const notifiedRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    getSetting('sitReminderInterval').then((v) => {
      if (v) setIntervalMinutes(v);
    });
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          const newS = s + 1;
          if (newS >= intervalMinutes * 60 && !notifiedRef.current) {
            notifiedRef.current = true;
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('该起来活动一下了！', {
                body: '做几个伸展动作，活动一下腰部',
              });
            }
          }
          return newS;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, intervalMinutes]);

  const reset = () => {
    setSeconds(0);
    setRunning(false);
    notifiedRef.current = false;
  };

  const toggle = () => setRunning((r) => !r);

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.max(0, intervalMinutes - minutes);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Timer size={18} />
          <span>久坐提醒</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {remaining > 0 ? `${remaining} 分钟后提醒` : '已到提醒时间'}
          </span>
          <button onClick={toggle} className="rounded-full p-1 text-blue-600 hover:bg-blue-50">
            {running ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={reset} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
