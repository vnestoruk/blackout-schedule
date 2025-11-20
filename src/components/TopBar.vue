<template>
  <div
    class="p-3 sm:p-4 bg-white dark:bg-gray-800/95 rounded-xl mx-3 sm:mx-4 my-3 sm:my-4 shadow-lg"
  >
    <div class="flex justify-between items-center gap-3">
      <!-- Settings Button -->
      <button
        class="flex-1 bg-gray-800/8 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 p-3 sm:p-2.5 rounded-lg transition-all duration-200 hover:bg-gray-800/12 dark:hover:bg-gray-600/50 active:scale-95 min-h-[48px]"
        @click="$emit('open-settings')"
        title="Налаштування"
      >
        <div class="flex items-center justify-center gap-2 sm:gap-2.5">
          <MapPin :size="20" class="flex-shrink-0" />
          <div
            class="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 text-gray-800 dark:text-gray-200 font-semibold text-left sm:text-center"
          >
            <span class="text-sm sm:text-lg leading-tight">{{ regionName }}</span>
            <span class="opacity-40 font-light hidden sm:inline">•</span>
            <span class="text-xs sm:text-base opacity-80 sm:opacity-100"
              >Черга {{ queue }}</span
            >
          </div>
        </div>
      </button>

      <!-- Theme Toggle -->
      <ThemeToggle />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { MapPin } from "lucide-vue-next";
import ThemeToggle from "./ThemeToggle.vue";
import { REGIONS } from "../utils/api";

const props = defineProps({
  region: {
    type: String,
    required: true,
  },
  queue: {
    type: String,
    required: true,
  },
});

defineEmits(["open-settings"]);

const regionName = computed(() => {
  return REGIONS[props.region]?.name || props.region;
});
</script>
