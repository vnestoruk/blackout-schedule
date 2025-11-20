<template>
  <button
    @click="toggleTheme"
    class="bg-gray-800/8 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center hover:bg-gray-800/12 dark:hover:bg-gray-600/50"
    :title="getThemeTitle()"
  >
    <Sun v-if="isLight()" :size="22" />
    <Moon v-else-if="isDark()" :size="22" />
    <Monitor v-else :size="22" />
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
