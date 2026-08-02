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

/** Sends a notification. Returns true if the notification was created, false otherwise. */
export function sendNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    new Notification(title, { body, icon: '/icons/icon-192.png' });
    return true;
  } catch (err) {
    console.error('Failed to show notification:', err);
    return false;
  }
}
