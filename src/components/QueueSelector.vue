<template>
  <div class="queue-selector">
    <div class="compact-selector">
      <div class="selector-group">
        <label class="queue-label">Перегляд:</label>
        
        <select 
          id="region-select"
          class="region-dropdown"
          :value="region"
          @change="$emit('region-change', $event.target.value)"
        >
          <option v-for="(regionData, key) in regions" :key="key" :value="key">
            {{ regionData.name }}
          </option>
        </select>

        <span class="separator">→</span>

        <select 
          id="queue-select"
          class="queue-dropdown"
          :value="selectedQueue"
          @change="$emit('change', $event.target.value)"
        >
          <option v-for="q in queues" :key="q" :value="q">
            {{ q }}
          </option>
        </select>
      </div>

      <button 
        class="refresh-button"
        @click="$emit('refresh')"
        :disabled="loading"
        :class="{ spinning: loading }"
        :title="lastUpdate ? `Оновлено: ${formatTime(lastUpdate)}` : 'Оновити'"
      >
        🔄
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { REGIONS } from '../utils/api'

const props = defineProps({
  selectedQueue: {
    type: String,
    required: true
  },
  region: {
    type: String,
    default: 'IF'
  },
  lastUpdate: {
    type: Date,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['change', 'refresh', 'region-change'])

const regions = REGIONS

const queues = computed(() => {
  return REGIONS[props.region]?.queues || []
})

function formatTime(date) {
  if (!date) return ''
  return date.toLocaleTimeString('uk-UA', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.queue-selector {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  margin: 15px 20px;
}

.compact-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.selector-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.queue-label {
  color: white;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
}

.separator {
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  font-weight: 300;
  margin: 0 5px;
}

.region-dropdown,
.queue-dropdown {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.region-dropdown {
  min-width: 140px;
}

.queue-dropdown {
  min-width: 80px;
}

.region-dropdown:hover,
.queue-dropdown:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.region-dropdown:focus,
.queue-dropdown:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.region-dropdown option,
.queue-dropdown option {
  background: #1e293b;
  color: white;
}

.refresh-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 20px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.refresh-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(180deg);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-button.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .selector-group {
    flex-wrap: wrap;
  }

  .separator {
    display: none;
  }

  .region-dropdown,
  .queue-dropdown {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 600px) {
  .queue-selector {
    margin: 10px 15px;
    padding: 10px 15px;
  }

  .queue-label {
    font-size: 14px;
    width: 100%;
    margin-bottom: 5px;
  }

  .selector-group {
    gap: 8px;
  }

  .region-dropdown,
  .queue-dropdown {
    font-size: 14px;
    padding: 8px 10px;
    flex: 1;
  }

  .refresh-button {
    font-size: 18px;
    padding: 6px 10px;
  }
}
</style>

