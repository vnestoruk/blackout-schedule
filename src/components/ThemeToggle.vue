<template>
  <button
    @click="toggleTheme"
    class="flex justify-center items-center p-2.5 sm:p-2.5 text-gray-700 rounded-lg transition-all duration-200 bg-gray-800/8 dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-800/12 dark:hover:bg-gray-600/50 active:scale-95 min-w-[44px] min-h-[44px]"
    :title="getThemeTitle()"
  >
    <Sun v-if="isLight()" :size="22" class="sm:w-7 sm:h-7" />
    <Moon v-else-if="isDark()" :size="22" class="sm:w-7 sm:h-7" />
    <Monitor v-else :size="22" class="sm:w-7 sm:h-7" />
  </button>
</template>

<script setup>
import { Sun, Moon, Monitor } from "lucide-vue-next";
import { useTheme } from "../composables/useTheme";

const { toggleTheme, isDark, isLight, isAuto } = useTheme();

function getThemeTitle() {
  if (isLight()) {
    return "Світла тема (натисніть для темної)";
  } else if (isDark()) {
    return "Темна тема (натисніть для авто)";
  } else {
    return "Авто тема (натисніть для світлої)";
  }
}
</script>
