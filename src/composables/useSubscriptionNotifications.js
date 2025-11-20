import { ref, onMounted, onUnmounted } from "vue";
import { storage } from "../utils/storage";
import { fetchSchedule, REGIONS } from "../utils/api";
import { getCurrentStatus, getTimeUntilChange } from "../utils/schedule-parser";

/**
 * Handle notifications for all subscribed queues
 */
export function useSubscriptionNotifications(
  notifyScheduleChange,
  notifyUpcomingShutdown,
  notifyUpcomingRestoration,
  notifyNewScheduleDates
) {
  const WARNING_MINUTES = 15;
  let checkInterval = null;
  let scheduleCheckInterval = null;

  // Cache for schedule data
  const schedulesCache = ref({});

  /**
   * Fetch schedule for a specific subscription
   */
  async function fetchSubscriptionSchedule(region, queue, silent = true) {
    try {
      const data = await fetchSchedule(region, queue);
      const cacheKey = `${region}:${queue}`;
      
      // Store in cache
      schedulesCache.value[cacheKey] = data;
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch schedule for ${region}:${queue}:`, error);
      return null;
    }
  }

  /**
   * Check for upcoming events in a specific subscription
   */
  function checkSubscriptionUpcoming(region, queue, scheduleData) {
    if (!scheduleData) return;

    const status = getCurrentStatus(scheduleData, queue);
    const timeUntilChange = getTimeUntilChange(status);

    if (!timeUntilChange) return;

    const minutesUntil = timeUntilChange.totalMinutes;

    // Only notify if within warning threshold
    if (minutesUntil > WARNING_MINUTES) return;

    const regionName = storage.getRegionName?.(region) || region;

    if (status.isOn && status.nextPeriod) {
      // Power is ON, shutdown approaching
      const eventKey = `shutdown_${region}_${queue}_${status.nextPeriod.from}`;

      if (!storage.isEventNotified(eventKey)) {
        notifyUpcomingShutdown(minutesUntil, regionName, queue);
        storage.markEventNotified(eventKey);
      }
    } else if (!status.isOn && status.currentPeriod) {
      // Power is OFF, restoration approaching
      const eventKey = `restoration_${region}_${queue}_${status.currentPeriod.to}`;

      if (!storage.isEventNotified(eventKey)) {
        notifyUpcomingRestoration(minutesUntil, regionName, queue);
        storage.markEventNotified(eventKey);
      }
    }
  }

  /**
   * Check all subscriptions for upcoming events
   */
  async function checkAllSubscriptions() {
    const subscriptions = storage.getSubscriptions();
    
    if (subscriptions.length === 0) return;

    for (const sub of subscriptions) {
      const cacheKey = `${sub.region}:${sub.queue}`;
      const scheduleData = schedulesCache.value[cacheKey];
      
      if (scheduleData) {
        checkSubscriptionUpcoming(sub.region, sub.queue, scheduleData);
      }
    }
  }

  /**
   * Fetch and check schedules for all subscriptions
   */
  async function fetchAndCheckAllSubscriptions() {
    const subscriptions = storage.getSubscriptions();
    
    if (subscriptions.length === 0) return;

    // Fetch all schedules
    const promises = subscriptions.map((sub) =>
      fetchSubscriptionSchedule(sub.region, sub.queue, true)
    );

    await Promise.allSettled(promises);

    // Check for upcoming events
    await checkAllSubscriptions();
  }

  /**
   * Check for schedule changes in subscriptions
   */
  async function checkScheduleChanges() {
    const subscriptions = storage.getSubscriptions();
    
    if (subscriptions.length === 0) return;

    for (const sub of subscriptions) {
      try {
        const newData = await fetchSchedule(sub.region, sub.queue);
        const cacheKey = `${sub.region}:${sub.queue}`;
        const oldStorageKey = `schedule_${cacheKey}`;
        
        // Check for new dates
        const newDates = storage.getNewDates(newData, sub.region, sub.queue);
        if (newDates.length > 0) {
          const regionName = REGIONS[sub.region]?.name || sub.region;
          notifyNewScheduleDates(newDates, regionName, sub.queue);
        }
        
        // Get old data from localStorage
        const oldData = localStorage.getItem(oldStorageKey);
        const oldDataParsed = oldData ? JSON.parse(oldData) : null;

        // Check if changed
        if (
          oldDataParsed &&
          JSON.stringify(oldDataParsed) !== JSON.stringify(newData)
        ) {
          const regionName = REGIONS[sub.region]?.name || sub.region;
          notifyScheduleChange(regionName, sub.queue);
        }

        // Update stored data
        localStorage.setItem(oldStorageKey, JSON.stringify(newData));
        schedulesCache.value[cacheKey] = newData;
      } catch (error) {
        console.error(
          `Failed to check schedule changes for ${sub.region}:${sub.queue}:`,
          error
        );
      }
    }
  }

  /**
   * Start monitoring subscriptions
   */
  function startMonitoring() {
    // Initial fetch
    fetchAndCheckAllSubscriptions();

    // Check for upcoming events every minute
    checkInterval = setInterval(() => {
      checkAllSubscriptions();
    }, 60 * 1000);

    // Check for schedule changes every 10 minutes
    scheduleCheckInterval = setInterval(() => {
      checkScheduleChanges();
    }, 10 * 60 * 1000);
  }

  /**
   * Stop monitoring subscriptions
   */
  function stopMonitoring() {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    if (scheduleCheckInterval) {
      clearInterval(scheduleCheckInterval);
      scheduleCheckInterval = null;
    }
  }

  /**
   * Refresh subscriptions (call when subscriptions change)
   */
  function refreshSubscriptions() {
    stopMonitoring();
    schedulesCache.value = {};
    startMonitoring();
  }

  onMounted(() => {
    startMonitoring();
  });

  onUnmounted(() => {
    stopMonitoring();
  });

  return {
    refreshSubscriptions,
    checkAllSubscriptions,
    fetchAndCheckAllSubscriptions,
  };
}

