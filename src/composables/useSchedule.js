import { ref, onMounted, onUnmounted } from 'vue'
import { fetchSchedule } from '../utils/api'
import { storage } from '../utils/storage'
import { useNotifications } from './useNotifications'
import { REGIONS } from '../utils/api'

export function useSchedule() {
  const scheduleData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const region = ref(storage.getRegion())
  const queue = ref(storage.getQueue())
  const lastFetch = ref(null)
  
  const { notifyScheduleChange, notifyNewScheduleDates } = useNotifications()
  
  let pollInterval = null

  /**
   * Fetch schedule from API
   */
  async function fetch(silent = false) {
    if (!silent) {
      loading.value = true
    }
    error.value = null

    try {
      const data = await fetchSchedule(region.value, queue.value)
      
      // Check for new dates (only on background fetches, not initial load)
      if (silent && data) {
        const newDates = storage.getNewDates(data, region.value, queue.value)
        if (newDates.length > 0) {
          const regionName = REGIONS[region.value]?.name || region.value
          notifyNewScheduleDates(newDates, regionName, queue.value)
        }
      }
      
      // Check if data changed
      const hasChanged = storage.hasScheduleChanged(data)
      
      // Save to storage
      storage.setSchedule(data)
      scheduleData.value = data
      lastFetch.value = new Date()

      // Notify if changed (but not on first load)
      if (hasChanged && scheduleData.value && silent) {
        const regionName = REGIONS[region.value]?.name || region.value
        notifyScheduleChange(regionName, queue.value)
      }

      return data
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch schedule:', err)
      
      // Try to load from cache if fetch failed
      const cached = storage.getSchedule()
      if (cached) {
        scheduleData.value = cached
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Change queue
   */
  function setQueue(newQueue) {
    queue.value = newQueue
    storage.setQueue(newQueue)
    fetch() // Fetch new queue data
  }

  /**
   * Change region
   */
  function setRegion(newRegion) {
    region.value = newRegion
    storage.setRegion(newRegion)
    fetch() // Fetch new region data
  }

  /**
   * Start background polling (every 10 minutes)
   */
  function startPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
    }

    // Poll every 10 minutes
    pollInterval = setInterval(() => {
      fetch(true) // Silent fetch
    }, 10 * 60 * 1000)
  }

  /**
   * Stop background polling
   */
  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  // Initialize
  onMounted(async () => {
    // Try to load from cache first
    const cached = storage.getSchedule()
    if (cached) {
      scheduleData.value = cached
    }

    // Then fetch fresh data
    await fetch()

    // Start background polling
    startPolling()
  })

  // Cleanup
  onUnmounted(() => {
    stopPolling()
  })

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
    stopPolling
  }
}

