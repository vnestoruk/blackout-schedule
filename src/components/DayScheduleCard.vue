<template>
  <div
    class="bg-white dark:bg-gray-800/95 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
  >
    <!-- Header -->
    <div
      class="px-6 py-4 border-b-4"
      :class="[
        isToday
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 border-emerald-600 dark:border-emerald-500'
          : 'bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900 border-gray-800 dark:border-gray-700',
      ]"
    >
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-white text-2xl font-bold m-0">{{ dayLabel }}</h3>
          <p class="text-white/80 text-sm mt-1">{{ formattedDate }}</p>
        </div>
        <div
          v-if="isToday"
          class="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg"
        >
          Сьогодні
        </div>
        <div
          v-else-if="isTomorrow"
          class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-bold"
        >
          Завтра
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- View Mode Toggle -->
      <div class="flex justify-end mb-4">
        <div
          class="flex gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg shadow-sm"
        >
          <button
            :class="[
              'bg-transparent px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-center',
              viewMode === 'timeline'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600/30',
            ]"
            @click="viewMode = 'timeline'"
            title="Візуальний графік"
          >
            <BarChart3 :size="18" />
          </button>
          <button
            :class="[
              'bg-transparent px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-center',
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600/30',
            ]"
            @click="viewMode = 'list'"
            title="Список періодів"
          >
            <List :size="18" />
          </button>
        </div>
      </div>

      <!-- Timeline View -->
      <ScheduleTimeline
        v-if="viewMode === 'timeline'"
        :periods="scheduleInfo.periods"
        :show-current-time="isToday"
      />

      <!-- List View -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="(period, index) in displayPeriods"
          :key="index"
          :class="[
            'bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 transition-all duration-300 relative',
            period.isActive
              ? 'border-2 border-power-off dark:border-red-500 shadow-lg shadow-power-off/20'
              : 'border-2 border-gray-200 dark:border-gray-600/50',
          ]"
        >
          <div class="flex items-center justify-center gap-2.5 mb-2 flex-wrap">
            <span
              class="bg-power-off text-white px-4 py-2 rounded-lg text-lg font-bold shadow-md"
            >
              {{ period.from }}
            </span>
            <span class="text-xl text-gray-400 dark:text-gray-500">→</span>
            <span
              class="bg-power-off text-white px-4 py-2 rounded-lg text-lg font-bold shadow-md"
            >
              {{ period.to }}
            </span>
          </div>
          <div
            class="text-center text-gray-700 dark:text-gray-300 text-sm font-semibold"
          >
            {{ calculateDuration(period) }}
          </div>
          <div
            v-if="period.isActive"
            class="absolute top-2 right-3 bg-power-off text-white px-3 py-1 rounded-full text-xs font-bold animate-blink"
          >
            Зараз
          </div>
        </div>

        <div
          v-if="hasPastPeriods"
          class="text-center p-2.5 mt-2 bg-gray-100 dark:bg-gray-700/30 rounded-lg text-gray-600 dark:text-gray-400 text-xs italic"
        >
          {{ pastPeriodsCount }} минулих періодів приховано
        </div>
      </div>

      <!-- Analytics -->
      <div class="mt-6 space-y-3">
        <div
          class="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-700/20 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-2 gap-4">
            <!-- Periods count -->
            <div class="text-center">
              <div
                class="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1"
              >
                Періодів
              </div>
              <div class="text-gray-800 dark:text-gray-100 text-2xl font-bold">
                {{ scheduleInfo.periods.length }}
              </div>
            </div>

            <!-- Off time proportion -->
            <div class="text-center">
              <div
                class="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1"
              >
                Без світла
              </div>
              <div class="text-gray-800 dark:text-gray-100 text-2xl font-bold">
                {{ offPercentage }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Time details -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Off time -->
          <div
            class="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl p-4 border border-red-200/50 dark:border-red-700/30"
          >
            <div
              class="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium mb-2"
            >
              <Zap :size="14" />
              <span>Відключення</span>
            </div>
            <div class="text-gray-800 dark:text-gray-100 text-xl font-bold">
              {{ formatTime(totalOffMinutes) }}
            </div>
          </div>

          <!-- On time -->
          <div
            class="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-4 border border-green-200/50 dark:border-green-700/30"
          >
            <div
              class="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium mb-2"
            >
              <Lightbulb :size="14" />
              <span>Світло є</span>
            </div>
            <div class="text-gray-800 dark:text-gray-100 text-xl font-bold">
              {{ formatTime(totalOnMinutes) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer info -->
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div
          class="flex justify-between text-xs text-gray-500 dark:text-gray-400"
        >
          <span>Оновлено: {{ scheduleInfo.createdAt }}</span>
          <span>Затверджено: {{ scheduleInfo.approvedSince }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { BarChart3, List, Zap, Lightbulb } from "lucide-vue-next";
import ScheduleTimeline from "./ScheduleTimeline.vue";

const props = defineProps({
  scheduleInfo: {
    type: Object,
    required: true,
  },
  isToday: {
    type: Boolean,
    default: false,
  },
  isTomorrow: {
    type: Boolean,
    default: false,
  },
});

const viewMode = ref("timeline");

// Parse date from DD.MM.YYYY
const parsedDate = computed(() => {
  const [day, month, year] = props.scheduleInfo.date.split(".");
  return new Date(year, month - 1, day);
});

const dayLabel = computed(() => {
  const days = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четвер",
    "П'ятниця",
    "Субота",
  ];
  return days[parsedDate.value.getDay()];
});

const formattedDate = computed(() => {
  return props.scheduleInfo.date;
});

// Calculate total off time in minutes
const totalOffMinutes = computed(() => {
  return props.scheduleInfo.periods.reduce((total, period) => {
    const [fromHours, fromMinutes] = period.from.split(":").map(Number);
    const [toHours, toMinutes] = period.to.split(":").map(Number);
    let fromTotal = fromHours * 60 + fromMinutes;
    let toTotal = toHours * 60 + toMinutes;

    // If toTotal is 00:00, it means midnight (24:00 of the same day)
    if (toTotal === 0) {
      toTotal = 24 * 60; // Treat as end of day
    }

    return total + (toTotal - fromTotal);
  }, 0);
});

// Total on time is 24 hours minus off time
const totalOnMinutes = computed(() => {
  return 24 * 60 - totalOffMinutes.value;
});

const offPercentage = computed(() => {
  return ((totalOffMinutes.value / (24 * 60)) * 100).toFixed(1);
});

const onPercentage = computed(() => {
  return ((totalOnMinutes.value / (24 * 60)) * 100).toFixed(1);
});

// Filter to show only current and future periods (only for today)
const displayPeriods = computed(() => {
  if (!props.isToday) {
    return props.scheduleInfo.periods;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return props.scheduleInfo.periods.filter((period) => {
    const [toHours, toMinutes] = period.to.split(":").map(Number);
    const toTotal = toHours * 60 + toMinutes;
    return toTotal > currentMinutes;
  });
});

const pastPeriodsCount = computed(() => {
  if (!props.isToday) return 0;
  return props.scheduleInfo.periods.length - displayPeriods.value.length;
});

const hasPastPeriods = computed(() => {
  return pastPeriodsCount.value > 0;
});

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} год`;
  }
  return `${hours} год ${mins} хв`;
}

function calculateDuration(period) {
  const [fromHours, fromMinutes] = period.from.split(":").map(Number);
  const [toHours, toMinutes] = period.to.split(":").map(Number);

  let fromTotal = fromHours * 60 + fromMinutes;
  let toTotal = toHours * 60 + toMinutes;

  // If toTotal is 00:00, it means midnight (end of the same day)
  if (toTotal === 0) {
    toTotal = 24 * 60;
  }

  const durationMinutes = toTotal - fromTotal;
  return formatTime(durationMinutes);
}
</script>
