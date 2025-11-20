import { ref, onMounted } from 'vue'

export function useNotifications() {
  const permission = ref('default')
  const isSupported = ref(false)

  onMounted(() => {
    // Check if notifications are supported
    isSupported.value = 'Notification' in window
    
    if (isSupported.value) {
      permission.value = Notification.permission
    }
  })

  /**
   * Request notification permission
   */
  async function requestPermission() {
    if (!isSupported.value) {
      console.warn('Notifications are not supported in this browser')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      return result === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  /**
   * Show a notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   */
  function notify(title, options = {}) {
    if (!isSupported.value || permission.value !== 'granted') {
      console.warn('Cannot show notification: not supported or permission not granted')
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        ...options
      })

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000)

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  /**
   * Notify about schedule changes
   * @param {string} region - Region name (optional)
   * @param {string} queue - Queue number (optional)
   */
  function notifyScheduleChange(region = null, queue = null) {
    const location = region && queue ? ` (${region}, черга ${queue})` : '';
    notify('Графік змінився! 🔄', {
      body: `Графік відключень був оновлений${location}. Перевірте нові дані.`,
      tag: `schedule-update-${region}-${queue}`
    })
  }

  /**
   * Notify about upcoming shutdown
   * @param {number} minutes - Minutes until shutdown
   * @param {string} region - Region name (optional)
   * @param {string} queue - Queue number (optional)
   */
  function notifyUpcomingShutdown(minutes, region = null, queue = null) {
    const location = region && queue ? ` (${region}, черга ${queue})` : '';
    notify('Скоро відключення ⚠️', {
      body: `Електроенергію буде відключено через ${minutes} хв${location}`,
      tag: `upcoming-shutdown-${region}-${queue}`
    })
  }

  /**
   * Notify about power restoration
   * @param {number} minutes - Minutes until restoration
   * @param {string} region - Region name (optional)
   * @param {string} queue - Queue number (optional)
   */
  function notifyUpcomingRestoration(minutes, region = null, queue = null) {
    const location = region && queue ? ` (${region}, черга ${queue})` : '';
    notify('Скоро увімкнуть! ✅', {
      body: `Електроенергію буде відновлено через ${minutes} хв${location}`,
      tag: `upcoming-restoration-${region}-${queue}`
    })
  }

  /**
   * Notify about new schedule dates added
   * @param {Array} newDates - Array of new dates in DD.MM.YYYY format
   * @param {string} region - Region name (optional)
   * @param {string} queue - Queue number (optional)
   */
  function notifyNewScheduleDates(newDates, region = null, queue = null) {
    if (!newDates || newDates.length === 0) return;
    
    const location = region && queue ? ` (${region}, черга ${queue})` : '';
    const datesList = newDates.join(', ');
    const title = newDates.length === 1 ? 'Новий графік! 📅' : 'Нові графіки! 📅';
    const body = newDates.length === 1 
      ? `Додано графік на ${datesList}${location}`
      : `Додано графіки на ${datesList}${location}`;
    
    notify(title, {
      body,
      tag: `new-schedule-${region}-${queue}-${newDates[0]}`
    })
  }

  return {
    permission,
    isSupported,
    requestPermission,
    notify,
    notifyScheduleChange,
    notifyUpcomingShutdown,
    notifyUpcomingRestoration,
    notifyNewScheduleDates
  }
}

