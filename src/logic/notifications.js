export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/** Returns 'granted' | 'denied' | 'default' | 'unsupported' */
export function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/** Sends a system notification. Returns true if the notification was created, false otherwise. */
export function sendNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    new Notification(title, { body });
    return true;
  } catch (err) {
    console.error('Failed to show notification:', err);
    return false;
  }
}

/** Plays 3 beeps using Web Audio (works without system notification permission). */
export function playBeep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      const t = ctx.currentTime + i * 0.4;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    }
  } catch (err) {
    console.warn('Beep failed:', err);
  }
}

/** Flashes the tab title so a background tab gets attention. */
export function flashTitle() {
  const original = document.title;
  let flashing = false;
  const interval = setInterval(() => {
    document.title = flashing ? '⏰ 该起来活动一下了！' : original;
    flashing = !flashing;
  }, 800);
  const stop = () => {
    clearInterval(interval);
    document.title = original;
    document.removeEventListener('visibilitychange', stop);
  };
  document.addEventListener('visibilitychange', stop);
  // Safety stop after 30s even if the tab stays hidden
  setTimeout(stop, 30000);
}

/**
 * Full reminder: system notification (if allowed) + beep + title flash.
 * Returns true if the system notification was created.
 */
export function sendReminder(title, body) {
  const ok = sendNotification(title, body);
  playBeep();
  flashTitle();
  return ok;
}
