<template>
  <div
    class="flex justify-between items-center p-4 bg-white dark:bg-gray-800/95 rounded-xl mx-4 my-4 shadow-lg"
  >
    <div class="flex-1">
      <!-- Settings Button -->
      <button
        class="bg-gray-800/8 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center hover:bg-gray-800/12 dark:hover:bg-gray-600/50"
        @click="$emit('open-settings')"
        title="Налаштування"
      >
        <div
          class="flex items-center gap-2.5 text-gray-800 dark:text-gray-200 text-lg font-semibold"
        >
          <MapPin :size="22" />
          <span class="text-lg">{{ regionName }}</span>
          <span class="opacity-40 font-light">•</span>
          <span> Черга {{ queue }} </span>
        </div>
      </button>
    </div>

    <div class="flex items-center gap-2">
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
