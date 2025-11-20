<template>
  <div class="py-5 px-5">
    <div class="mb-6">
      <h2 class="text-gray-800 dark:text-gray-100 text-3xl font-bold m-0 mb-2">
        Графіки відключень
      </h2>
      <p class="text-gray-600 dark:text-gray-300 text-sm">
        Доступно графіків: {{ allSchedules.length }}
      </p>
    </div>

    <div v-if="allSchedules.length > 0" class="space-y-6">
      <DayScheduleCard
        v-for="(scheduleInfo, index) in allSchedules"
        :key="scheduleInfo.date"
        :schedule-info="scheduleInfo"
        :is-today="index === todayIndex"
        :is-tomorrow="index === tomorrowIndex"
      />
    </div>

    <div
      v-else
      class="text-center p-10 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800/95 rounded-xl shadow-md"
    >
      <p>Немає даних про графік</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import DayScheduleCard from "./DayScheduleCard.vue";

const props = defineProps({
  scheduleData: {
    type: Array,
    default: () => [],
  },
  queue: {
    type: String,
    required: true,
  },
});

// Get today's date in DD.MM.YYYY format
function getTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}.${month}.${year}`;
}

// Get tomorrow's date in DD.MM.YYYY format
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = String(tomorrow.getDate()).padStart(2, "0");
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const year = tomorrow.getFullYear();
  return `${day}.${month}.${year}`;
}

// Parse DD.MM.YYYY to Date object for sorting
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split(".");
  return new Date(year, month - 1, day);
}

// Format schedule data for each day
const allSchedules = computed(() => {
  if (!props.scheduleData || props.scheduleData.length === 0) {
    return [];
  }

  const todayDate = getTodayDate();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return props.scheduleData
    .map((dayData) => {
      const queueSchedule = dayData.queues?.[props.queue];

      if (!queueSchedule || queueSchedule.length === 0) {
        return null;
      }

      // Check if periods are active (only for today)
      const isToday = dayData.eventDate === todayDate;
      const periods = queueSchedule.map((period) => {
        let isActive = false;

        if (isToday) {
          const [fromHours, fromMinutes] = period.from.split(":").map(Number);
          const [toHours, toMinutes] = period.to.split(":").map(Number);
          const fromTotal = fromHours * 60 + fromMinutes;
          let toTotal = toHours * 60 + toMinutes;

          // Handle midnight crossing for active period check
          if (toTotal < fromTotal) {
            toTotal += 24 * 60;
          }

          isActive = currentMinutes >= fromTotal && currentMinutes < toTotal;
        }

        return {
          ...period,
          isActive,
        };
      });

      return {
        date: dayData.eventDate,
        queue: props.queue,
        periods,
        createdAt: dayData.createdAt,
        approvedSince: dayData.scheduleApprovedSince,
      };
    })
    .filter((schedule) => schedule !== null)
    .sort((a, b) => {
      // Sort by date: today first, then chronologically
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA - dateB;
    });
});

// Find index of today's schedule
const todayIndex = computed(() => {
  const todayDate = getTodayDate();
  return allSchedules.value.findIndex((s) => s.date === todayDate);
});

// Find index of tomorrow's schedule
const tomorrowIndex = computed(() => {
  const tomorrowDate = getTomorrowDate();
  return allSchedules.value.findIndex((s) => s.date === tomorrowDate);
});
</script>
