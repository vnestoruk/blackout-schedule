/**
 * Parse and analyze schedule data
 */

/**
 * Get today's date in DD.MM.YYYY format
 * @returns {string} Today's date
 */
function getTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Find schedule for a specific date
 * @param {Array} scheduleData - Schedule array from API
 * @param {string} targetDate - Date in DD.MM.YYYY format (optional, defaults to today)
 * @returns {Object|null} Schedule for the date or null
 */
function findScheduleByDate(scheduleData, targetDate = null) {
  if (!scheduleData || scheduleData.length === 0) {
    return null;
  }

  const dateToFind = targetDate || getTodayDate();
  
  // Find exact match for the date
  const schedule = scheduleData.find((item) => item.eventDate === dateToFind);
  
  // If today's schedule not found, return the first available (fallback)
  return schedule || scheduleData[0];
}

/**
 * Parse time string to minutes since midnight
 * @param {string} timeStr - Time in format "HH:MM"
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Get current time in minutes since midnight
 * @returns {number} Current minutes since midnight
 */
function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Check if current time is within a shutdown period
 * @param {Object} period - Shutdown period with from/to times
 * @returns {boolean} True if currently in shutdown
 */
function isInPeriod(period) {
  const currentMinutes = getCurrentMinutes();
  const fromMinutes = timeToMinutes(period.from);
  let toMinutes = timeToMinutes(period.to);

  // Special case: if period ends at 00:00, treat it as end of day (24:00)
  if (toMinutes === 0) {
    toMinutes = 24 * 60; // 1440 minutes (midnight = end of day)
  }

  // Handle midnight crossing: if toMinutes is less than fromMinutes,
  // the period crosses midnight (e.g., 23:00 to 01:00)
  if (toMinutes < fromMinutes) {
    // Period crosses midnight into next day
    // Current time is in the period if it's either:
    // 1. After the start time (today), OR
    // 2. Before the end time (early morning of next day)
    return currentMinutes >= fromMinutes || currentMinutes < toMinutes;
  }

  // Normal case: period within the same day
  return currentMinutes >= fromMinutes && currentMinutes < toMinutes;
}

/**
 * Get current status based on schedule
 * @param {Array} scheduleData - Schedule array from API
 * @param {string} queue - Queue number
 * @returns {Object} { isOn: boolean, currentPeriod: Object|null, nextPeriod: Object|null, nextPeriodDate: string|null }
 */
export function getCurrentStatus(scheduleData, queue) {
  if (!scheduleData || scheduleData.length === 0) {
    return { isOn: true, currentPeriod: null, nextPeriod: null, nextPeriodDate: null };
  }

  const today = findScheduleByDate(scheduleData);
  
  if (!today) {
    return { isOn: true, currentPeriod: null, nextPeriod: null, nextPeriodDate: null };
  }

  const queueSchedule = today.queues?.[queue];

  if (!queueSchedule || queueSchedule.length === 0) {
    return { isOn: true, currentPeriod: null, nextPeriod: null, nextPeriodDate: null };
  }

  // Check if we're currently in a shutdown period
  const currentPeriod = queueSchedule.find((period) => isInPeriod(period));

  if (currentPeriod) {
    // Currently OFF - find next period after this one
    const currentIndex = queueSchedule.indexOf(currentPeriod);
    const nextPeriod = queueSchedule[currentIndex + 1] || null;

    return {
      isOn: false,
      currentPeriod,
      nextPeriod,
      nextPeriodDate: today.eventDate,
    };
  }

  // Currently ON - find next shutdown period in today's schedule
  const currentMinutes = getCurrentMinutes();
  const nextPeriod = queueSchedule.find((period) => {
    const fromMinutes = timeToMinutes(period.from);
    return fromMinutes > currentMinutes;
  });

  // If no more periods today, look for tomorrow's first period
  if (!nextPeriod) {
    // Get tomorrow's date
    const todayDateObj = parseDateString(today.eventDate);
    const tomorrow = new Date(todayDateObj);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = formatDateString(tomorrow);
    
    // Find tomorrow's schedule
    const tomorrowSchedule = scheduleData.find(
      (item) => item.eventDate === tomorrowDateStr
    );
    
    if (tomorrowSchedule) {
      const tomorrowQueue = tomorrowSchedule.queues?.[queue];
      if (tomorrowQueue && tomorrowQueue.length > 0) {
        // Return first period of tomorrow
        return {
          isOn: true,
          currentPeriod: null,
          nextPeriod: tomorrowQueue[0],
          nextPeriodDate: tomorrowDateStr,
        };
      }
    }
  }

  return {
    isOn: true,
    currentPeriod: null,
    nextPeriod,
    nextPeriodDate: today.eventDate,
  };
}

/**
 * Parse DD.MM.YYYY to Date object
 */
function parseDateString(dateStr) {
  const [day, month, year] = dateStr.split(".");
  return new Date(year, month - 1, day);
}

/**
 * Format Date object to DD.MM.YYYY
 */
function formatDateString(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format schedule data for display
 * @param {Array} scheduleData - Schedule array from API
 * @param {string} queue - Queue number
 * @returns {Object} Formatted schedule with metadata
 */
export function formatSchedule(scheduleData, queue) {
  if (!scheduleData || scheduleData.length === 0) {
    return null;
  }

  const today = findScheduleByDate(scheduleData);
  
  if (!today) {
    return null;
  }

  const queueSchedule = today.queues?.[queue];

  if (!queueSchedule) {
    return null;
  }

  return {
    date: today.eventDate,
    queue,
    periods: queueSchedule.map((period) => ({
      ...period,
      isActive: isInPeriod(period),
    })),
    createdAt: today.createdAt,
    approvedSince: today.scheduleApprovedSince,
  };
}

/**
 * Calculate total shutdown hours for the day
 * @param {Array} scheduleData - Schedule array from API
 * @param {string} queue - Queue number
 * @returns {number} Total hours of shutdown
 */
export function calculateTotalShutdownHours(scheduleData, queue) {
  const formatted = formatSchedule(scheduleData, queue);

  if (!formatted || !formatted.periods) {
    return 0;
  }

  return formatted.periods.reduce((total, period) => {
    let fromMinutes = timeToMinutes(period.from);
    let toMinutes = timeToMinutes(period.to);
    
    // If toMinutes is 00:00, it means midnight (24:00 of the same day)
    if (toMinutes === 0) {
      toMinutes = 24 * 60;
    }
    
    const durationHours = (toMinutes - fromMinutes) / 60;
    return total + durationHours;
  }, 0);
}

/**
 * Get time until next status change
 * @param {Object} status - Current status from getCurrentStatus
 * @returns {Object|null} { hours, minutes, totalMinutes } or null
 */
export function getTimeUntilChange(status) {
  const currentMinutes = getCurrentMinutes();
  let targetMinutes;
  let isTomorrow = false;

  if (status.isOn && status.nextPeriod) {
    // ON -> will turn OFF
    targetMinutes = timeToMinutes(status.nextPeriod.from);
    
    // Check if next period is tomorrow
    const today = getTodayDate();
    if (status.nextPeriodDate && status.nextPeriodDate !== today) {
      isTomorrow = true;
    }
  } else if (!status.isOn && status.currentPeriod) {
    // OFF -> will turn ON
    targetMinutes = timeToMinutes(status.currentPeriod.to);
    // If period ends at 00:00, treat as midnight
    if (targetMinutes === 0) {
      targetMinutes = 24 * 60;
    }
  } else {
    return null;
  }

  let diffMinutes = targetMinutes - currentMinutes;

  // If next period is tomorrow, add remaining time today + time until target tomorrow
  if (isTomorrow) {
    // Time until midnight + time from midnight to target
    diffMinutes = (24 * 60 - currentMinutes) + targetMinutes;
  }

  if (diffMinutes < 0) {
    return null; // Already passed
  }

  return {
    hours: Math.floor(diffMinutes / 60),
    minutes: diffMinutes % 60,
    totalMinutes: diffMinutes,
  };
}
