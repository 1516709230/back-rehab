import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { getSetting } from '../db';
import { sendNotification } from '../logic/notifications';

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
  const tickRef = useRef(null);
  const reRemindRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(30);
  const notifEnabledRef = useRef(false);
  const runningRef = useRef(false);

  // Keep refs in sync so effect closures always read the latest value
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { intervalRef.current = intervalMinutes; }, [intervalMinutes]);
  useEffect(() => { notifEnabledRef.current = notifEnabled; }, [notifEnabled]);

  // --- Send a notification when the user has opted in ---
  const fireIfEnabled = useCallback(() => {
    if (!notifEnabledRef.current) return;
    sendNotification('该起来活动一下了！', '做几个伸展动作，活动一下腰部');
  }, []);

  // --- Re-reminder: every 5 minutes after the initial notification ---
  const clearReReminder = useCallback(() => {
    if (reRemindRef.current) {
      clearTimeout(reRemindRef.current);
      reRemindRef.current = null;
    }
  }, []);

  const scheduleReReminder = useCallback(() => {
    clearReReminder();
    reRemindRef.current = setTimeout(() => {
      fireIfEnabled();
      scheduleReReminder();
    }, 5 * 60 * 1000);
  }, [clearReReminder, fireIfEnabled]);

  // --- Initialize: load settings from DB, then restore persisted timer ---
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Load settings from the database
      const [savedInterval, savedNotifEnabled] = await Promise.all([
        getSetting('sitReminderInterval'),
        getSetting('notificationsEnabled'),
      ]);
      if (cancelled) return;

      const dbInterval = savedInterval || 30;
      const dbNotifEnabled = !!savedNotifEnabled;

      setIntervalMinutes(dbInterval);
      setNotifEnabled(dbNotifEnabled);

      // 2. Restore persisted timer state
      const persisted = loadPersisted();
      if (persisted.startTime && persisted.running) {
        const effectiveInterval = persisted.storedInterval || dbInterval;
        const totalSeconds = effectiveInterval * 60;
        const elapsed = Math.floor((Date.now() - persisted.startTime) / 1000);

        startTimeRef.current = persisted.startTime;
        setSeconds(Math.min(elapsed, totalSeconds));
        notifiedRef.current = persisted.notified;

        // Fire notification on mount if the threshold was crossed while away
        // Use dbNotifEnabled directly because notifEnabledRef hasn't synced yet
        if (elapsed >= totalSeconds && !persisted.notified) {
          notifiedRef.current = true;
          if (dbNotifEnabled) {
            sendNotification('该起来活动一下了！', '做几个伸展动作，活动一下腰部');
          }
          persist({ startTime: persisted.startTime, running: true, notified: true, intervalMinutes: effectiveInterval });
        }

        setRunning(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // --- Start / stop re-reminder when running + notified state changes ---
  useEffect(() => {
    if (running && notifiedRef.current) {
      scheduleReReminder();
    } else {
      clearReReminder();
    }
    return () => clearReReminder();
  }, [running, scheduleReReminder, clearReReminder]);

  // --- 1-second ticking ---
  useEffect(() => {
    if (!running) return;

    tickRef.current = setInterval(() => {
      setSeconds((s) => {
        const newS = s + 1;
        if (newS >= intervalRef.current * 60 && !notifiedRef.current) {
          notifiedRef.current = true;
          fireIfEnabled();
          scheduleReReminder();
          if (startTimeRef.current) {
            persist({ startTime: startTimeRef.current, running: true, notified: true, intervalMinutes: intervalRef.current });
          }
        }
        return newS;
      });
    }, 1000);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running, fireIfEnabled, scheduleReReminder]);

  // --- Visibility change: catch up when user returns to the tab ---
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || !runningRef.current) return;
      const totalSeconds = intervalRef.current * 60;

      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const clamped = Math.min(elapsed, totalSeconds);
        setSeconds(clamped);

        if (!notifiedRef.current && elapsed >= totalSeconds) {
          notifiedRef.current = true;
          fireIfEnabled();
          scheduleReReminder();
          persist({ startTime: startTimeRef.current, running: true, notified: true, intervalMinutes: intervalRef.current });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fireIfEnabled, scheduleReReminder]);

  // --- Controls ---
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
