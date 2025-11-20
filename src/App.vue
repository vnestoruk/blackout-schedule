<template>
  <div
    id="app"
    class="min-h-screen flex flex-col transition-colors duration-500 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100"
  >
    <!-- Loading State -->
    <div
      v-if="loading && !scheduleData"
      class="flex flex-col items-center justify-center min-h-screen p-5 text-center"
    >
      <div
        class="w-12 h-12 border-4 border-gray-300 dark:border-white/30 border-t-gray-800 dark:border-t-white rounded-full animate-spin mb-5"
      ></div>
      <p class="text-gray-800 dark:text-gray-200 text-lg my-2.5">
        Завантаження графіка...
      </p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error && !scheduleData"
      class="flex flex-col items-center justify-center min-h-screen p-5 text-center"
    >
      <div class="text-6xl mb-5">⚠️</div>
      <p class="text-gray-800 dark:text-gray-200 text-lg my-2.5">{{ error }}</p>
      <button
        @click="fetch"
        class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg text-base font-semibold mt-5 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-xl transition-all"
      >
        Спробувати знову
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="flex-1 pb-10 sm:pb-15">
      <div class="max-w-5xl mx-auto w-full">
        <!-- Top Bar with Theme Toggle -->
        <TopBar :region="region" :queue="queue" @open-settings="openSettings" />

        <!-- Status Indicator -->
        <StatusIndicator
          :status="status"
          :time-until-change="timeUntilChange"
          :status-text="statusText"
          :status-emoji="statusEmoji"
        />

        <!-- Game Toggle Button (shown when power is OFF) -->
        <div v-if="!status.isOn" class="flex justify-center my-4 sm:my-5 px-4 sm:px-5">
          <button
            @click="toggleGame"
            :class="[
              'bg-white dark:bg-gray-800 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-semibold min-h-[48px]',
              'transition-all duration-300 flex items-center gap-2 shadow-lg active:scale-95',
              'hover:bg-gray-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-xl',
              showGame
                ? 'text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-700',
            ]"
          >
            <X v-if="showGame" :size="18" class="sm:w-5 sm:h-5" />
            <Gamepad2 v-else :size="18" class="sm:w-5 sm:h-5" />
            <span>{{ showGame ? "Закрити гру" : "Грати" }}</span>
          </button>
        </div>

        <!-- TicTacToe Game (optional, shown when power is OFF and user clicks) -->
        <TicTacToe v-if="!status.isOn && showGame" />

        <!-- Schedule View -->
        <ScheduleView :schedule-data="scheduleData" :queue="queue" />

        <!-- Notification Prompt -->
        <NotificationPrompt @allow="requestPermission" @deny="() => {}" />

        <!-- Settings Modal -->
        <SettingsModal
          :is-open="isSettingsOpen"
          :current-region="region"
          :current-queue="queue"
          @close="closeSettings"
          @apply="applySettings"
          @subscription-changed="handleSubscriptionChange"
        />
      </div>
    </div>

    <!-- Footer -->
    <footer class="p-4 sm:p-5 text-center text-xs sm:text-sm opacity-80 mt-auto">
      <!-- Social Links -->
      <div class="flex justify-center items-center mb-3 sm:mb-4 gap-3 sm:gap-4">
        <a
          href="https://x.com/VasylNestoruk"
          target="_blank"
          class="no-underline font-semibold hover:opacity-70 transition-opacity text-gray-800 dark:text-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="100"
            height="100"
            viewBox="0 0 30 30"
            class="w-5 h-5 sm:w-6 sm:h-6"
          >
            <path
              fill="currentColor"
              d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"
            ></path>
          </svg>
        </a>
        <a
          href="https://www.instagram.com/v.nestoruk/"
          target="_blank"
          class="no-underline font-semibold hover:opacity-70 transition-opacity text-gray-800 dark:text-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="100"
            height="100"
            viewBox="0 0 30 30"
            class="w-5 h-5 sm:w-6 sm:h-6"
          >
            <path
              fill="currentColor"
              d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"
            ></path>
          </svg>
        </a>
      </div>
      <div class="flex justify-center items-center mb-3 sm:mb-4">
        <a
          href="https://www.sternenkofund.org/donate"
          target="_blank"
          class="no-underline font-semibold hover:opacity-70 transition-opacity text-gray-800 dark:text-gray-200 min-h-[44px] flex items-center px-3"
        >
          Дай десять гривнів
        </a>
      </div>
      <p class="m-0 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
        2025 💙💛 Зроблено в Україні
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { X, Gamepad2 } from "lucide-vue-next";
import StatusIndicator from "./components/StatusIndicator.vue";
import ScheduleView from "./components/ScheduleView.vue";
import NotificationPrompt from "./components/NotificationPrompt.vue";
import TicTacToe from "./components/TicTacToe.vue";
import TopBar from "./components/TopBar.vue";
import SettingsModal from "./components/SettingsModal.vue";
import { useSchedule } from "./composables/useSchedule";
import { useStatus } from "./composables/useStatus";
import { useNotifications } from "./composables/useNotifications";
import { useUpcomingNotifications } from "./composables/useUpcomingNotifications";
import { useSubscriptionNotifications } from "./composables/useSubscriptionNotifications";
import { useTheme } from "./composables/useTheme";

// Initialize composables
const {
  scheduleData,
  loading,
  error,
  region,
  queue,
  lastFetch,
  fetch,
  setQueue,
  setRegion,
} = useSchedule();

const {
  status,
  timeUntilChange,
  backgroundColor,
  textColor,
  statusText,
  statusEmoji,
  refresh: refreshStatus,
} = useStatus(scheduleData, queue);

const {
  requestPermission,
  notifyScheduleChange,
  notifyUpcomingShutdown,
  notifyUpcomingRestoration,
  notifyNewScheduleDates,
} = useNotifications();

// Initialize theme system
const { initTheme } = useTheme();

// Setup upcoming notifications for current view (15 minutes before changes)
const { checkUpcomingChanges } = useUpcomingNotifications(
  status,
  timeUntilChange,
  notifyUpcomingShutdown,
  notifyUpcomingRestoration
);

// Setup subscription-based notifications (monitors all subscribed queues)
const { refreshSubscriptions } = useSubscriptionNotifications(
  notifyScheduleChange,
  notifyUpcomingShutdown,
  notifyUpcomingRestoration,
  notifyNewScheduleDates
);

// Settings modal state
const isSettingsOpen = ref(false);

// Game visibility state
const showGame = ref(false);

// Toggle game visibility
function toggleGame() {
  showGame.value = !showGame.value;
}

// Open settings modal
function openSettings() {
  isSettingsOpen.value = true;
}

// Close settings modal
function closeSettings() {
  isSettingsOpen.value = false;
}

// Apply settings (change region/queue from modal)
function applySettings(selection) {
  if (selection.region !== region.value) {
    setRegion(selection.region);
  }
  if (selection.queue !== queue.value) {
    setQueue(selection.queue);
  }
}

// Handle subscription changes
function handleSubscriptionChange() {
  refreshSubscriptions();
}

// Refresh status every minute to keep time-based calculations accurate
let statusRefreshInterval = null;

onMounted(() => {
  // Initialize theme
  initTheme();

  // Refresh status every minute
  statusRefreshInterval = setInterval(() => {
    refreshStatus();
    // Also check for upcoming notifications every minute
    checkUpcomingChanges();
  }, 60 * 1000); // Every minute
});

onUnmounted(() => {
  if (statusRefreshInterval) {
    clearInterval(statusRefreshInterval);
  }
});
</script>
