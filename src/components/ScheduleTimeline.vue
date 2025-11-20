<template>
  <div class="py-3 sm:py-5">
    <div class="bg-white dark:bg-gray-800/95 rounded-xl p-3 sm:p-5 shadow-xl">
      <!-- Timeline bar -->
      <div class="relative h-8 sm:h-10 rounded-lg overflow-visible mb-3 sm:mb-4">
        <!-- Background (green - power ON) -->
        <div
          class="absolute w-full h-full rounded-md opacity-60 bg-gradient-to-r from-power-on-light to-power-on border-2 border-power-on"
        ></div>

        <!-- Blackout periods (red) -->
        <div
          v-for="(period, index) in periods"
          :key="index"
          :style="getSegmentStyle(period)"
          :class="[
            'absolute h-full scale-95 scale-y-90 rounded-md transition-all duration-300 z-10 group',
            'bg-gradient-to-r from-power-off-light to-power-off ',
          ]"
        >
          <div
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
          >
            {{ period.from }} - {{ period.to }}
          </div>
        </div>

        <!-- Current time indicator (only show for today) -->
        <div
          v-if="showCurrentTime"
          :style="getCurrentTimeStyle()"
          class="absolute -top-2.5 h-[calc(100%+1.25rem)] z-20 pointer-events-none"
        >
          <div
            class="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-blue-600 dark:bg-blue-400 shadow-lg shadow-blue-600/60"
          ></div>
          <div
            class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600 dark:border-t-blue-400"
          ></div>
          <div
            class="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 dark:bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap shadow-md"
          >
            {{ currentTime }}
          </div>
        </div>
      </div>

      <!-- Hour scale -->
      <div class="flex justify-between relative h-7 sm:h-8 mb-2 sm:mb-2.5 -mx-2 sm:-mx-3">
        <div
          v-for="hour in 25"
          :key="hour - 1"
          class="flex-1 relative flex flex-col items-center"
        >
          <div
            :class="[
              'absolute top-0 bg-gray-800/20 dark:bg-gray-600/30',
              (hour - 1) % 6 === 0 ? 'w-0.5 h-2.5 sm:h-3' : 'w-px h-1.5 sm:h-2',
            ]"
          ></div>
          <span
            v-if="(hour - 1) % 3 === 0"
            class="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mt-2.5 sm:mt-3.5 font-semibold"
          >
            {{ String(hour - 1).padStart(2, "0") }}
          </span>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex justify-center gap-3 sm:gap-5 mt-3 sm:mt-4">
        <div
          class="flex items-center gap-1.5 sm:gap-2 text-gray-800 dark:text-gray-200 text-[10px] sm:text-xs font-medium"
        >
          <div
            class="w-4 sm:w-6 h-2.5 sm:h-3 rounded opacity-60 border-2 border-gray-800/20 dark:border-gray-600/30 bg-gradient-to-r from-power-on-light to-power-on"
          ></div>
          <span>Світло є</span>
        </div>
        <div
          class="flex items-center gap-1.5 sm:gap-2 text-gray-800 dark:text-gray-200 text-[10px] sm:text-xs font-medium"
        >
          <div
            class="w-4 sm:w-6 h-2.5 sm:h-3 rounded opacity-85 border-2 border-gray-800/20 dark:border-gray-600/30 bg-gradient-to-r from-power-off-light to-power-off"
          ></div>
          <span>Відключення</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  periods: {
    type: Array,
    default: () => [],
  },
  showCurrentTime: {
    type: Boolean,
    default: true,
  },
});

const currentTime = ref("");

function updateCurrentTime() {
  const now = new Date();
  currentTime.value = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
}

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function getCurrentTimeStyle() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const percentage = (currentMinutes / (24 * 60)) * 100;

  return {
    left: `${percentage}%`,
  };
}

function getSegmentStyle(period) {
  const fromMinutes = timeToMinutes(period.from);
  let toMinutes = timeToMinutes(period.to);

  // If toMinutes is 00:00, it means midnight (24:00 of the same day)
  if (toMinutes === 0) {
    toMinutes = 24 * 60;
  }

  const startPercentage = (fromMinutes / (24 * 60)) * 100;
  const duration = toMinutes - fromMinutes;
  const widthPercentage = (duration / (24 * 60)) * 100;

  return {
    left: `${startPercentage}%`,
    width: `${widthPercentage}%`,
  };
}

let timeInterval = null;

onMounted(() => {
  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 60000); // Update every minute
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>
