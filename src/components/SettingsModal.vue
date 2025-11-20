<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
        @click="closeModal"
      >
        <div
          class="bg-gradient-to-br from-gray-800/95 to-gray-900/95 dark:from-gray-900/95 dark:to-gray-950/95 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex justify-between items-center p-5 border-b border-white/10 dark:border-gray-700/50"
          >
            <h2
              class="text-white dark:text-gray-100 text-2xl m-0 flex items-center gap-2"
            >
              <Settings :size="24" />
              Налаштування
            </h2>
            <button
              class="bg-white/10 dark:bg-gray-700/50 text-white p-2 rounded-md hover:bg-white/20 dark:hover:bg-gray-600/50 transition-all duration-200 hover:scale-110 flex items-center justify-center"
              @click="closeModal"
              title="Закрити"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Content -->
          <div class="overflow-y-auto p-6 flex-1">
            <!-- Region and Queue Selection -->
            <section class="mb-8">
              <h3 class="text-white dark:text-gray-100 text-lg m-0 mb-4">
                Перегляд
              </h3>

              <div class="grid grid-cols-2 gap-2.5 mb-4">
                <div class="flex flex-col gap-2">
                  <label
                    for="modal-region-select"
                    class="text-white/90 dark:text-gray-300 text-sm font-medium"
                  >
                    Область:
                  </label>
                  <select
                    id="modal-region-select"
                    v-model="selectedRegion"
                    class="bg-white/10 dark:bg-gray-700/50 text-white border-2 border-white/20 dark:border-gray-600/50 px-2.5 py-2.5 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-white/15 dark:hover:bg-gray-600/50 hover:border-white/30 dark:hover:border-gray-500/50 focus:outline-none focus:bg-white/20 dark:focus:bg-gray-600/70 focus:border-white/40 dark:focus:border-gray-500/70"
                  >
                    <option
                      v-for="(regionData, key) in regions"
                      :key="key"
                      :value="key"
                      class="bg-gray-800 dark:bg-gray-900 text-white"
                    >
                      {{ regionData.name }}
                    </option>
                  </select>
                </div>

                <div class="flex flex-col gap-2">
                  <label
                    for="modal-queue-select"
                    class="text-white/90 dark:text-gray-300 text-sm font-medium"
                  >
                    Черга:
                  </label>
                  <select
                    id="modal-queue-select"
                    v-model="selectedQueue"
                    class="bg-white/10 dark:bg-gray-700/50 text-white border-2 border-white/20 dark:border-gray-600/50 px-2.5 py-2.5 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-white/15 dark:hover:bg-gray-600/50 hover:border-white/30 dark:hover:border-gray-500/50 focus:outline-none focus:bg-white/20 dark:focus:bg-gray-600/70 focus:border-white/40 dark:focus:border-gray-500/70"
                  >
                    <option
                      v-for="q in availableQueues"
                      :key="q"
                      :value="q"
                      class="bg-gray-800 dark:bg-gray-900 text-white"
                    >
                      {{ q }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="flex gap-2.5">
                <button
                  class="flex-1 px-5 py-2.5 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 bg-blue-600/80 dark:bg-blue-700/80 text-white border-2 border-blue-500/50 dark:border-blue-600/50 hover:bg-blue-600 dark:hover:bg-blue-700 hover:border-blue-500 dark:hover:border-blue-600"
                  @click="applySelection"
                >
                  Переглянути
                </button>

                <button
                  :class="[
                    'flex-1 px-5 py-2.5 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap',
                    isCurrentlySubscribed
                      ? 'bg-power-off/30 dark:bg-red-900/30 text-white border-2 border-power-off/50 dark:border-red-500/50 hover:bg-power-off/40 dark:hover:bg-red-900/40'
                      : 'bg-power-on/30 dark:bg-green-900/30 text-white border-2 border-power-on/50 dark:border-green-500/50 hover:bg-power-on/40 dark:hover:bg-green-900/40',
                  ]"
                  @click="toggleSubscription"
                >
                  {{
                    isCurrentlySubscribed ? "✓ Відписатися" : "+ Підписатися"
                  }}
                </button>
              </div>
            </section>

            <!-- Subscriptions Section -->
            <section>
              <h3
                class="text-white dark:text-gray-100 text-lg m-0 mb-4 flex items-center gap-2"
              >
                <Bell :size="20" />
                Підписки на сповіщення
              </h3>

              <div
                v-if="subscriptions.length > 0"
                class="flex flex-col gap-2.5"
              >
                <div
                  v-for="sub in subscriptions"
                  :key="`${sub.region}:${sub.queue}`"
                  class="bg-white/10 dark:bg-gray-700/30 rounded-lg p-3 flex justify-between items-center transition-all duration-200 hover:bg-white/15 dark:hover:bg-gray-700/40"
                >
                  <div
                    class="flex items-center gap-2 text-white dark:text-gray-200"
                  >
                    <span class="font-semibold">{{
                      getRegionName(sub.region)
                    }}</span>
                    <span class="opacity-40">•</span>
                    <span
                      class="bg-white/20 dark:bg-gray-600/50 px-2.5 py-0.5 rounded text-sm font-bold"
                    >
                      {{ sub.queue }}
                    </span>
                  </div>
                  <button
                    class="bg-power-off/20 dark:bg-red-900/30 text-white p-1.5 rounded-md hover:bg-power-off/30 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-110"
                    @click="removeSubscription(sub.region, sub.queue)"
                    title="Видалити"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </div>

              <div
                v-else
                class="flex flex-col items-center justify-center py-10 text-center text-white/70 dark:text-gray-400"
              >
                <Inbox :size="48" class="opacity-50 mb-2.5" />
                <p class="text-base font-medium m-0 mb-1">
                  Немає активних підписок
                </p>
                <p class="text-sm m-0">
                  Виберіть область та чергу, потім натисніть "Підписатися"
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Settings, Bell, X, Inbox } from "lucide-vue-next";
import { REGIONS } from "../utils/api";
import { storage } from "../utils/storage";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  currentRegion: {
    type: String,
    required: true,
  },
  currentQueue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close", "apply", "subscription-changed"]);

const regions = REGIONS;
const selectedRegion = ref(props.currentRegion);
const selectedQueue = ref(props.currentQueue);
const subscriptions = ref([]);

const availableQueues = computed(() => {
  return regions[selectedRegion.value]?.queues || [];
});

const isCurrentlySubscribed = computed(() => {
  return storage.isSubscribed(selectedRegion.value, selectedQueue.value);
});

// Load subscriptions
function loadSubscriptions() {
  subscriptions.value = storage.getSubscriptions();
}

// Toggle subscription for selected region/queue
function toggleSubscription() {
  if (isCurrentlySubscribed.value) {
    storage.removeSubscription(selectedRegion.value, selectedQueue.value);
  } else {
    storage.addSubscription(selectedRegion.value, selectedQueue.value);
  }
  loadSubscriptions();
  emit("subscription-changed");
}

// Remove specific subscription
function removeSubscription(region, queue) {
  storage.removeSubscription(region, queue);
  loadSubscriptions();
  emit("subscription-changed");
}

// Get region display name
function getRegionName(regionKey) {
  return regions[regionKey]?.name || regionKey;
}

// Apply selection and close modal
function applySelection() {
  emit("apply", {
    region: selectedRegion.value,
    queue: selectedQueue.value,
  });
  closeModal();
}

// Close modal
function closeModal() {
  emit("close");
}

// Watch for region changes to update queue options
watch(selectedRegion, (newRegion) => {
  const queues = regions[newRegion]?.queues || [];
  if (!queues.includes(selectedQueue.value)) {
    selectedQueue.value = queues[0] || "";
  }
});

// Watch for prop changes
watch(
  () => props.currentRegion,
  (newVal) => {
    selectedRegion.value = newVal;
  }
);

watch(
  () => props.currentQueue,
  (newVal) => {
    selectedQueue.value = newVal;
  }
);

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      loadSubscriptions();
      // Reset to current values when opening
      selectedRegion.value = props.currentRegion;
      selectedQueue.value = props.currentQueue;
    }
  }
);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-gradient-to-br,
.modal-leave-active .bg-gradient-to-br {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-gradient-to-br {
  transform: scale(0.9);
}

.modal-leave-to .bg-gradient-to-br {
  transform: scale(0.9);
}
</style>
