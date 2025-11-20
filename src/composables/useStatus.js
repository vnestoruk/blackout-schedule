import { ref, computed, watch } from "vue";
import { getCurrentStatus, getTimeUntilChange } from "../utils/schedule-parser";

export function useStatus(scheduleData, queue) {
  const lastUpdate = ref(new Date());
  
  // Watch for schedule data changes and force refresh
  watch([scheduleData, queue], ([newSchedule, newQueue]) => {
    if (newSchedule) {
      console.log(`[useStatus] Schedule data updated for queue ${newQueue}, refreshing status`)
      lastUpdate.value = new Date();
    }
  }, { deep: true });

  // Calculate current status
  const status = computed(() => {
    // Trigger reactivity on lastUpdate changes
    lastUpdate.value;

    if (!scheduleData.value || !queue.value) {
      return {
        isOn: true,
        currentPeriod: null,
        nextPeriod: null,
      };
    }

    return getCurrentStatus(scheduleData.value, queue.value);
  });

  // Time until next change
  const timeUntilChange = computed(() => {
    // Trigger reactivity on lastUpdate changes
    lastUpdate.value;

    return getTimeUntilChange(status.value);
  });

  // Background color based on status
  const backgroundColor = computed(() => {
    return status.value.isOn
      ? "#10b981" // Green - power ON
      : "#ef4444"; // Red - power OFF
  });

  // Text color for contrast
  const textColor = computed(() => {
    return "#ffffff"; // White text on colored background
  });

  // Status text
  const statusText = computed(() => {
    return status.value.isOn ? "Світло Є" : "Відключено";
  });

  // Status emoji (deprecated - now using Lucide icons)
  const statusEmoji = computed(() => {
    return status.value.isOn ? "💡" : "🕯️";
  });

  /**
   * Force status recalculation (call every minute)
   */
  function refresh() {
    lastUpdate.value = new Date();
  }

  return {
    status,
    timeUntilChange,
    backgroundColor,
    textColor,
    statusText,
    statusEmoji,
    refresh,
  };
}
