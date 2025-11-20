<template>
  <div class="py-10 px-5 text-center">
    <div class="mb-8">
      <div
        class="mb-2.5 animate-pulse-slow flex justify-center"
        :class="status.isOn ? 'text-power-on' : 'text-power-off'"
      >
        <Lightbulb v-if="status.isOn" :size="80" :stroke-width="2" />
        <Flame v-else :size="80" :stroke-width="2" />
      </div>
      <h1
        class="text-5xl font-bold m-0 drop-shadow-md"
        :class="
          status.isOn
            ? 'text-power-on dark:text-power-on-light'
            : 'text-power-off dark:text-power-off-light'
        "
      >
        {{ statusText }}
      </h1>
    </div>

    <div
      v-if="timeUntilChange"
      class="bg-white dark:bg-gray-800/95 text-gray-800 dark:text-gray-200 rounded-2xl p-5 my-5 mx-auto max-w-md shadow-xl border-2"
      :class="status.isOn ? 'border-power-on/30' : 'border-power-off/30'"
    >
      <p class="text-base m-0 mb-2.5 opacity-90 font-medium">
        {{ changeLabel }}
      </p>
      <p class="text-3xl font-bold m-0">
        <span v-if="timeUntilChange.hours > 0"
          >{{ timeUntilChange.hours }} год
        </span>
        <span>{{ timeUntilChange.minutes }} хв</span>
      </p>
    </div>

    <div
      v-if="currentPeriod"
      class="mt-5 text-lg opacity-90 text-gray-800 dark:text-gray-200"
    >
      <p class="my-1.5">
        Відключено: {{ currentPeriod.from }} - {{ currentPeriod.to }}
      </p>
    </div>

    <div
      v-if="nextPeriod && !currentPeriod"
      class="mt-5 text-lg opacity-90 text-gray-800 dark:text-gray-200"
    >
      <p class="my-1.5">
        Наступне відключення:
        <span v-if="isNextPeriodTomorrow" class="font-semibold">завтра о</span>
        {{ nextPeriod.from }}
        <span v-if="!isNextPeriodTomorrow">- {{ nextPeriod.to }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Lightbulb, Flame } from "lucide-vue-next";

const props = defineProps({
  status: {
    type: Object,
    required: true,
  },
  timeUntilChange: {
    type: Object,
    default: null,
  },
  statusText: {
    type: String,
    required: true,
  },
  statusEmoji: {
    type: String,
    required: true,
  },
});

const changeLabel = computed(() => {
  return props.status.isOn
    ? "Електроенергія буде ще:"
    : "Електроенергія відновиться через:";
});

const currentPeriod = computed(() => props.status.currentPeriod);
const nextPeriod = computed(() => props.status.nextPeriod);

// Check if next period is tomorrow
const isNextPeriodTomorrow = computed(() => {
  if (!props.status.nextPeriodDate) return false;

  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const todayStr = `${day}.${month}.${year}`;

  return props.status.nextPeriodDate !== todayStr;
});
</script>
