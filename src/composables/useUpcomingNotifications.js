import { watch } from "vue";
import { storage } from "../utils/storage";

/**
 * Handle notifications for upcoming shutdowns and restorations
 * @param {Object} status - Status object from useStatus
 * @param {Object} timeUntilChange - Time until change from useStatus
 * @param {Function} notifyUpcomingShutdown - Notification function
 * @param {Function} notifyUpcomingRestoration - Notification function
 */
export function useUpcomingNotifications(
  status,
  timeUntilChange,
  notifyUpcomingShutdown,
  notifyUpcomingRestoration
) {
  // Warning threshold in minutes
  const WARNING_MINUTES = 15;

  /**
   * Check and trigger notifications if needed
   */
  function checkUpcomingChanges() {
    if (!timeUntilChange.value) return;

    const minutesUntil = timeUntilChange.value.totalMinutes;

    // Only notify if within warning threshold
    if (minutesUntil > WARNING_MINUTES) return;

    if (status.value.isOn && status.value.nextPeriod) {
      // Power is ON, shutdown approaching
      const eventKey = `shutdown_${status.value.nextPeriod.from}`;

      if (!storage.isEventNotified(eventKey)) {
        notifyUpcomingShutdown(minutesUntil);
        storage.markEventNotified(eventKey);
      }
    } else if (!status.value.isOn && status.value.currentPeriod) {
      // Power is OFF, restoration approaching
      const eventKey = `restoration_${status.value.currentPeriod.to}`;

      if (!storage.isEventNotified(eventKey)) {
        notifyUpcomingRestoration(minutesUntil);
        storage.markEventNotified(eventKey);
      }
    }
  }

  // Watch for changes in time until change
  watch(
    () => timeUntilChange.value,
    () => {
      checkUpcomingChanges();
    },
    { deep: true }
  );

  return {
    checkUpcomingChanges,
  };
}

