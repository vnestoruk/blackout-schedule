/**
 * Simple localStorage wrapper for schedule data
 */

const STORAGE_KEYS = {
  SCHEDULE: "blackout_schedule",
  QUEUE: "blackout_queue",
  REGION: "blackout_region",
  LAST_UPDATE: "blackout_last_update",
  NOTIFIED_EVENTS: "blackout_notified_events",
  SUBSCRIPTIONS: "blackout_subscriptions",
  SEEN_DATES: "blackout_seen_dates",
};

export const storage = {
  /**
   * Get schedule data from localStorage for a specific region/queue
   * @param {string} region - Region code (optional, gets from current if not provided)
   * @param {string} queue - Queue number (optional, gets from current if not provided)
   */
  getSchedule(region = null, queue = null) {
    try {
      // If region/queue provided, get specific schedule
      if (region && queue) {
        const key = `${STORAGE_KEYS.SCHEDULE}_${region}_${queue}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }

      // Otherwise get the current region/queue schedule
      const currentRegion = this.getRegion();
      const currentQueue = this.getQueue();
      const key = `${STORAGE_KEYS.SCHEDULE}_${currentRegion}_${currentQueue}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get schedule from storage:", error);
      return null;
    }
  },

  /**
   * Save schedule data to localStorage for a specific region/queue
   * @param {Object} data - Schedule data
   * @param {string} region - Region code (optional, uses current if not provided)
   * @param {string} queue - Queue number (optional, uses current if not provided)
   */
  setSchedule(data, region = null, queue = null) {
    try {
      // If region/queue provided, save for that specific combination
      if (region && queue) {
        const key = `${STORAGE_KEYS.SCHEDULE}_${region}_${queue}`;
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(
          `${STORAGE_KEYS.LAST_UPDATE}_${region}_${queue}`,
          new Date().toISOString()
        );
        return true;
      }

      // Otherwise save for current region/queue
      const currentRegion = this.getRegion();
      const currentQueue = this.getQueue();
      const key = `${STORAGE_KEYS.SCHEDULE}_${currentRegion}_${currentQueue}`;
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(
        `${STORAGE_KEYS.LAST_UPDATE}_${currentRegion}_${currentQueue}`,
        new Date().toISOString()
      );
      return true;
    } catch (error) {
      console.error("Failed to save schedule to storage:", error);
      return false;
    }
  },

  /**
   * Get saved queue preference
   */
  getQueue() {
    return localStorage.getItem(STORAGE_KEYS.QUEUE) || "4.1";
  },

  /**
   * Save queue preference
   */
  setQueue(queue) {
    localStorage.setItem(STORAGE_KEYS.QUEUE, queue);
  },

  /**
   * Get saved region preference
   */
  getRegion() {
    return localStorage.getItem(STORAGE_KEYS.REGION) || "IF";
  },

  /**
   * Save region preference
   */
  setRegion(region) {
    localStorage.setItem(STORAGE_KEYS.REGION, region);
  },

  /**
   * Get last update timestamp
   */
  getLastUpdate() {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    return timestamp ? new Date(timestamp) : null;
  },

  /**
   * Check if schedules are different (for change detection)
   * @param {Object} newData - New schedule data
   * @param {string} region - Region code (optional)
   * @param {string} queue - Queue number (optional)
   */
  hasScheduleChanged(newData, region = null, queue = null) {
    const oldData = this.getSchedule(region, queue);
    if (!oldData) return true;

    return JSON.stringify(oldData) !== JSON.stringify(newData);
  },

  /**
   * Get notified events (to prevent duplicate notifications)
   */
  getNotifiedEvents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFIED_EVENTS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Failed to get notified events:", error);
      return {};
    }
  },

  /**
   * Mark an event as notified
   * @param {string} eventKey - Unique key for the event (e.g., "shutdown_12:00")
   */
  markEventNotified(eventKey) {
    try {
      const events = this.getNotifiedEvents();
      const today = new Date().toDateString();

      // Clean up old entries (older than today)
      const cleanedEvents = {};
      Object.keys(events).forEach((key) => {
        if (events[key] === today) {
          cleanedEvents[key] = events[key];
        }
      });

      cleanedEvents[eventKey] = today;
      localStorage.setItem(
        STORAGE_KEYS.NOTIFIED_EVENTS,
        JSON.stringify(cleanedEvents)
      );
    } catch (error) {
      console.error("Failed to mark event as notified:", error);
    }
  },

  /**
   * Check if an event has been notified today
   * @param {string} eventKey - Unique key for the event
   */
  isEventNotified(eventKey) {
    const events = this.getNotifiedEvents();
    const today = new Date().toDateString();
    return events[eventKey] === today;
  },

  /**
   * Get all subscriptions
   * @returns {Array} Array of subscription objects { region, queue }
   */
  getSubscriptions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get subscriptions:", error);
      return [];
    }
  },

  /**
   * Add a subscription
   * @param {string} region - Region code
   * @param {string} queue - Queue number
   */
  addSubscription(region, queue) {
    try {
      const subscriptions = this.getSubscriptions();
      const key = `${region}:${queue}`;

      // Check if already subscribed
      if (!subscriptions.find((s) => `${s.region}:${s.queue}` === key)) {
        subscriptions.push({ region, queue });
        localStorage.setItem(
          STORAGE_KEYS.SUBSCRIPTIONS,
          JSON.stringify(subscriptions)
        );
      }
    } catch (error) {
      console.error("Failed to add subscription:", error);
    }
  },

  /**
   * Remove a subscription
   * @param {string} region - Region code
   * @param {string} queue - Queue number
   */
  removeSubscription(region, queue) {
    try {
      const subscriptions = this.getSubscriptions();
      const key = `${region}:${queue}`;
      const filtered = subscriptions.filter(
        (s) => `${s.region}:${s.queue}` !== key
      );
      localStorage.setItem(
        STORAGE_KEYS.SUBSCRIPTIONS,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Failed to remove subscription:", error);
    }
  },

  /**
   * Check if subscribed to a specific queue
   * @param {string} region - Region code
   * @param {string} queue - Queue number
   * @returns {boolean}
   */
  isSubscribed(region, queue) {
    const subscriptions = this.getSubscriptions();
    const key = `${region}:${queue}`;
    return subscriptions.some((s) => `${s.region}:${s.queue}` === key);
  },

  /**
   * Get region display name (helper for notifications)
   * @param {string} regionKey - Region code
   * @returns {string}
   */
  getRegionName(regionKey) {
    // This will be dynamically imported from api.js
    return regionKey;
  },

  /**
   * Get seen schedule dates
   * @param {string} region - Region code
   * @param {string} queue - Queue number
   * @returns {Array} Array of dates in DD.MM.YYYY format
   */
  getSeenDates(region, queue) {
    try {
      const key = `${region}:${queue}`;
      const data = localStorage.getItem(STORAGE_KEYS.SEEN_DATES);
      const allDates = data ? JSON.parse(data) : {};
      return allDates[key] || [];
    } catch (error) {
      console.error("Failed to get seen dates:", error);
      return [];
    }
  },

  /**
   * Save seen schedule dates
   * @param {string} region - Region code
   * @param {string} queue - Queue number
   * @param {Array} dates - Array of dates
   */
  setSeenDates(region, queue, dates) {
    try {
      const key = `${region}:${queue}`;
      const data = localStorage.getItem(STORAGE_KEYS.SEEN_DATES);
      const allDates = data ? JSON.parse(data) : {};
      allDates[key] = dates;
      localStorage.setItem(STORAGE_KEYS.SEEN_DATES, JSON.stringify(allDates));
    } catch (error) {
      console.error("Failed to save seen dates:", error);
    }
  },

  /**
   * Check for new dates in schedule data and return them
   * @param {Array} scheduleData - Schedule array from API
   * @param {string} region - Region code
   * @param {string} queue - Queue number
   * @returns {Array} Array of new dates
   */
  getNewDates(scheduleData, region, queue) {
    if (!scheduleData || scheduleData.length === 0) {
      return [];
    }

    const seenDates = this.getSeenDates(region, queue);
    const currentDates = scheduleData.map((item) => item.eventDate);

    // Find dates that weren't seen before
    const newDates = currentDates.filter((date) => !seenDates.includes(date));

    // Update seen dates
    if (newDates.length > 0) {
      this.setSeenDates(region, queue, currentDates);
    }

    return newDates;
  },

  /**
   * Clear all stored data
   */
  clear() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
