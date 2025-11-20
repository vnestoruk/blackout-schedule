import { ref, onMounted, onUnmounted } from "vue";
import { fetchSchedule } from "../utils/api";
import { storage } from "../utils/storage";
import { useNotifications } from "./useNotifications";
import { REGIONS } from "../utils/api";

export function useSchedule() {
  const scheduleData = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const region = ref(storage.getRegion());
  const queue = ref(storage.getQueue());
  const lastFetch = ref(null);

  const { notifyScheduleChange, notifyNewScheduleDates } = useNotifications();

  let pollInterval = null;

  /**
   * Fetch schedule from API
   */
  async function fetch(silent = false) {
    if (!silent) {
      loading.value = true;
    }
    error.value = null;

    try {
      const currentRegion = region.value;
      const currentQueue = queue.value;

      const data = await fetchSchedule(currentRegion, currentQueue);

      // Check for new dates (only on background fetches, not initial load)
      if (silent && data) {
        const newDates = storage.getNewDates(data, currentRegion, currentQueue);
        if (newDates.length > 0) {
          const regionName = REGIONS[currentRegion]?.name || currentRegion;
          notifyNewScheduleDates(newDates, regionName, currentQueue);
        }
      }

      // Check if data changed (pass region/queue for proper comparison)
      const hasChanged = storage.hasScheduleChanged(
        data,
        currentRegion,
        currentQueue
      );

      // Save to storage with region/queue
      storage.setSchedule(data, currentRegion, currentQueue);

      // Update reactive ref to trigger UI updates
      scheduleData.value = data;
      lastFetch.value = new Date();

      // Log for debugging
      if (silent) {
        console.log(
          `[useSchedule] Background fetch completed for ${currentRegion}:${currentQueue}`,
          {
            hasChanged,
            dataLength: data?.length || 0,
            timestamp: new Date().toISOString(),
          }
        );
      }

      // Notify if changed (but not on first load)
      if (hasChanged && scheduleData.value && silent) {
        const regionName = REGIONS[currentRegion]?.name || currentRegion;
        notifyScheduleChange(regionName, currentQueue);
      }

      return data;
    } catch (err) {
      error.value = err.message;
      console.error("[useSchedule] Failed to fetch schedule:", err);

      // Try to load from cache if fetch failed (with region/queue)
      const cached = storage.getSchedule(region.value, queue.value);
      if (cached) {
        scheduleData.value = cached;
      }

      // Don't re-throw on silent fetches to avoid breaking polling
      if (!silent) {
        throw err;
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * Change queue
   */
  function setQueue(newQueue) {
    queue.value = newQueue;
    storage.setQueue(newQueue);
    fetch(); // Fetch new queue data
  }

  /**
   * Change region
   */
  function setRegion(newRegion) {
    region.value = newRegion;
    storage.setRegion(newRegion);
    fetch(); // Fetch new region data
  }

  /**
   * Start background polling (every 10 minutes)
   */
  function startPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    // Poll every 10 minutes
    pollInterval = setInterval(() => {
      fetch(true); // Silent fetch
    }, 10 * 60 * 1000);
  }

  /**
   * Stop background polling
   */
  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Initialize
  onMounted(async () => {
    // Try to load from cache first (with current region/queue)
    const cached = storage.getSchedule(region.value, queue.value);
    if (cached) {
      scheduleData.value = cached;
      console.log(
        `[useSchedule] Loaded cached schedule for ${region.value}:${queue.value}`
      );
    }

    // Then fetch fresh data
    await fetch();

    // Start background polling
    startPolling();
    console.log("[useSchedule] Background polling started (every 10 minutes)");
  });

  // Cleanup
  onUnmounted(() => {
    stopPolling();
  });

  return {
    scheduleData,
    loading,
    error,
    region,
    queue,
    lastFetch,
    fetch,
    setQueue,
    setRegion,
    startPolling,
    stopPolling,
  };
}
