<template>
  <div class="subscription-manager">
    <div class="subscription-header" @click="toggleCollapse">
      <h3>📍 Підписки на сповіщення</h3>
      <button class="collapse-button" :class="{ collapsed: isCollapsed }">
        {{ isCollapsed ? '▼' : '▲' }}
      </button>
    </div>

    <div v-if="!isCollapsed" class="subscription-content">
      <!-- Selection Controls -->
      <div class="selection-controls">
      <div class="control-group">
        <label for="region-select">Регіон:</label>
        <select 
          id="region-select"
          v-model="selectedRegion"
          class="select-input"
        >
          <option v-for="(region, key) in regions" :key="key" :value="key">
            {{ region.name }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label for="queue-select">Черга:</label>
        <select 
          id="queue-select"
          v-model="selectedQueue"
          class="select-input"
        >
          <option v-for="q in availableQueues" :key="q" :value="q">
            {{ q }}
          </option>
        </select>
      </div>

      <button 
        class="subscribe-button"
        :class="{ subscribed: isCurrentlySubscribed }"
        @click="toggleSubscription"
      >
        {{ isCurrentlySubscribed ? '✓ Відписатися' : '+ Підписатися' }}
      </button>
    </div>

    <!-- Current Subscriptions -->
    <div v-if="subscriptions.length > 0" class="subscriptions-list">
      <h4>Активні підписки:</h4>
      <div class="subscription-items">
        <div 
          v-for="sub in subscriptions" 
          :key="`${sub.region}:${sub.queue}`"
          class="subscription-item"
          :class="{ active: sub.region === currentRegion && sub.queue === currentQueue }"
        >
          <div class="subscription-info">
            <span class="subscription-region">{{ getRegionName(sub.region) }}</span>
            <span class="subscription-separator">•</span>
            <span class="subscription-queue">{{ sub.queue }}</span>
          </div>
          <button 
            class="remove-button"
            @click="removeSubscription(sub.region, sub.queue)"
            title="Видалити підписку"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>📭 Немає активних підписок</p>
        <p class="empty-hint">Виберіть регіон та чергу, щоб отримувати сповіщення</p>
      </div>
    </div>

    <!-- Collapsed Summary -->
    <div v-else class="collapsed-summary">
      <span v-if="subscriptions.length > 0">
        {{ subscriptions.length }} активних {{ subscriptions.length === 1 ? 'підписка' : subscriptions.length < 5 ? 'підписки' : 'підписок' }}
      </span>
      <span v-else class="no-subscriptions">
        Немає підписок
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { REGIONS } from '../utils/api'
import { storage } from '../utils/storage'

const props = defineProps({
  currentRegion: {
    type: String,
    required: true
  },
  currentQueue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['subscription-changed'])

const regions = ref(REGIONS)
const selectedRegion = ref(props.currentRegion)
const selectedQueue = ref(props.currentQueue)
const subscriptions = ref([])
const isCollapsed = ref(false)

const availableQueues = computed(() => {
  return regions.value[selectedRegion.value]?.queues || []
})

const isCurrentlySubscribed = computed(() => {
  return storage.isSubscribed(selectedRegion.value, selectedQueue.value)
})

// Toggle collapse state
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

// Load subscriptions
function loadSubscriptions() {
  subscriptions.value = storage.getSubscriptions()
}

// Toggle subscription
function toggleSubscription() {
  if (isCurrentlySubscribed.value) {
    storage.removeSubscription(selectedRegion.value, selectedQueue.value)
  } else {
    storage.addSubscription(selectedRegion.value, selectedQueue.value)
  }
  loadSubscriptions()
  emit('subscription-changed')
}

// Remove specific subscription
function removeSubscription(region, queue) {
  storage.removeSubscription(region, queue)
  loadSubscriptions()
  emit('subscription-changed')
}

// Get region display name
function getRegionName(regionKey) {
  return regions.value[regionKey]?.name || regionKey
}

// Watch for region changes to update queue options
watch(selectedRegion, (newRegion) => {
  const queues = regions.value[newRegion]?.queues || []
  if (!queues.includes(selectedQueue.value)) {
    selectedQueue.value = queues[0] || ''
  }
})

// Watch for prop changes
watch(() => props.currentRegion, (newVal) => {
  selectedRegion.value = newVal
})

watch(() => props.currentQueue, (newVal) => {
  selectedQueue.value = newVal
})

onMounted(() => {
  loadSubscriptions()
})
</script>

<style scoped>
.subscription-manager {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin: 15px 20px;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin-bottom: 15px;
  transition: opacity 0.2s ease;
}

.subscription-header:hover {
  opacity: 0.9;
}

.subscription-header h3 {
  color: white;
  font-size: 20px;
  margin: 0;
}

.collapse-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.subscription-content {
  animation: slideDown 0.3s ease-out;
}

.collapsed-summary {
  padding: 10px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  animation: fadeIn 0.2s ease-out;
}

.collapsed-summary .no-subscriptions {
  opacity: 0.6;
  font-style: italic;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.selection-controls {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 120px;
}

.control-group label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
}

.select-input {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-input:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.select-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.select-input option {
  background: #1e293b;
  color: white;
}

.subscribe-button {
  background: rgba(16, 185, 129, 0.3);
  color: white;
  border: 2px solid rgba(16, 185, 129, 0.5);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.subscribe-button:hover {
  background: rgba(16, 185, 129, 0.4);
  border-color: rgba(16, 185, 129, 0.7);
  transform: translateY(-2px);
}

.subscribe-button.subscribed {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.subscribe-button.subscribed:hover {
  background: rgba(239, 68, 68, 0.4);
  border-color: rgba(239, 68, 68, 0.7);
}

.subscriptions-list {
  margin-top: 20px;
}

.subscriptions-list h4 {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin: 0 0 10px 0;
}

.subscription-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subscription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.subscription-item:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.2);
}

.subscription-item.active {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.subscription-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
}

.subscription-region {
  font-size: 15px;
}

.subscription-separator {
  opacity: 0.5;
}

.subscription-queue {
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.remove-button {
  background: rgba(239, 68, 68, 0.3);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-button:hover {
  background: rgba(239, 68, 68, 0.5);
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 30px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state p {
  margin: 5px 0;
}

.empty-state p:first-child {
  font-size: 18px;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  font-style: italic;
}

@media (max-width: 600px) {
  .subscription-manager {
    margin: 10px 15px;
    padding: 15px;
  }

  .selection-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    min-width: 100%;
  }

  .subscribe-button {
    width: 100%;
  }

  .subscription-info {
    font-size: 14px;
  }
}
</style>

