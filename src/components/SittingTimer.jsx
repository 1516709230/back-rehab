import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { getSetting } from '../db';

const STORAGE_KEY_START = 'sitTimerStartTime';
const STORAGE_KEY_RUNNING = 'sitTimerRunning';
const STORAGE_KEY_NOTIFIED = 'sitTimerNotified';
const STORAGE_KEY_INTERVAL = 'sitTimerInterval';

function loadPersisted() {
  try {
    const startTime = localStorage.getItem(STORAGE_KEY_START);
    const running = localStorage.getItem(STORAGE_KEY_RUNNING) === 'true';
    const notified = localStorage.getItem(STORAGE_KEY_NOTIFIED) === 'true';
    const storedInterval = localStorage.getItem(STORAGE_KEY_INTERVAL);
    return { startTime: startTime ? parseInt(startTime, 10) : null, running, notified, storedInterval: storedInterval ? parseInt(storedInterval, 10) : null };
  } catch {
    return { startTime: null, running: false, notified: false, storedInterval: null };
  }
}

function persist({ startTime, running, notified, intervalMinutes }) {
  try {
    if (startTime != null) localStorage.setItem(STORAGE_KEY_START, String(startTime));
    else localStorage.removeItem(STORAGE_KEY_START);
    localStorage.setItem(STORAGE_KEY_RUNNING, String(running));
    localStorage.setItem(STORAGE_KEY_NOTIFIED, String(notified));
    if (intervalMinutes != null) localStorage.setItem(STORAGE_KEY_INTERVAL, String(intervalMinutes));
  } catch { /* ignore quota errors */ }
}

export default function SittingTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const notifiedRef = useRef(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef2 = useRef(intervalMinutes);
  const notifEnabledRef = useRef(false);
  const runningRef = useRef(false);

  // keep running ref in sync so effect closures see the latest value
  useEffect(() => { runningRef.current = running; }, [running]);

  // keep a ref in sync so the interval closure sees the latest value
  useEffect(() => { intervalRef2.current = intervalMinutes; }, [intervalMinutes]);

  // keep notifEnabled ref in sync so effect closures see the latest value
  useEffect(() => { notifEnabledRef.current = notifEnabled; }, [notifEnabled]);

  // load settings on mount
  useEffect(() => {
    getSetting('sitReminderInterval').then((v) => { if (v) setIntervalMinutes(v); });
    getSetting('notificationsEnabled').then((v) => { if (v) setNotifEnabled(v); });
  }, []);

  // restore persisted timer state on mount
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted.startTime && persisted.running) {
      startTimeRef.current = persisted.startTime;
      const interval = persisted.storedInterval || intervalMinutes;
      const totalSeconds = Math.min(persisted.storedInterval || intervalMinutes, intervalMinutes) * 60;
      const elapsed = Math.floor((Date.now() - persisted.startTime) / 1000);
      const clamped = Math.min(elapsed, totalSeconds);
      setSeconds(clamped);
      setRunning(true);
      notifiedRef.current = persisted.notified;
      // fire notification on mount if threshold crossed while user was away
      if (!persisted.notified && elapsed >= totalSeconds) {
        notifiedRef.current = true;
        fireIfAllowed(notifEnabledRef.current);
        persist({ startTime: persisted.startTime, running: true, notified: true, intervalMinutes });
      }
    }
  }, []);

  // ticking interval
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        const newS = s + 1;
        if (newS >= intervalRef2.current * 60 && !notifiedRef.current) {
          notifiedRef.current = true;
          fireIfAllowed(notifEnabledRef.current);
          if (startTimeRef.current) {
            persist({ startTime: startTimeRef.current, running: true, notified: true, intervalMinutes: intervalRef2.current });
          }
        }
        return newS;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // visibility change: catch up when user returns to tab (deps stable: no per-second re-registration)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || !runningRef.current) return;
      const totalSeconds = intervalRef2.current * 60;
      // recalc from stored start time
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const clamped = Math.min(elapsed, totalSeconds);
        setSeconds(clamped);
        if (!notifiedRef.current && elapsed >= totalSeconds) {
          notifiedRef.current = true;
          fireIfAllowed(notifEnabledRef.current);
          persist({ startTime: startTimeRef.current, running: true, notified: true, intervalMinutes: intervalRef2.current });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const start = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    setSeconds(0);
    notifiedRef.current = false;
    setRunning(true);
    persist({ startTime: now, running: true, notified: false, intervalMinutes });
  }, [intervalMinutes]);

  const pause = () => {
    setRunning(false);
    if (startTimeRef.current) {
      persist({ startTime: startTimeRef.current, running: false, notified: notifiedRef.current, intervalMinutes });
    }
  };

  const reset = () => {
    setRunning(false);
    setSeconds(0);
    notifiedRef.current = false;
    startTimeRef.current = null;
    persist({ startTime: null, running: false, notified: false, intervalMinutes: null });
  };

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
          <button onClick={running ? pause : start} className="rounded-full p-1 text-blue-600 hover:bg-blue-50">
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

function fireIfAllowed(enabled) {
  if (!enabled) return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification('该起来活动一下了！', {
    body: '做几个伸展动作，活动一下腰部',
  });
}