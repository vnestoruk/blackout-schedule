<template>
  <div 
    v-if="showPrompt" 
    class="fixed bottom-5 left-5 right-5 z-[1000] animate-slideUp"
  >
    <div 
      class="bg-white dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl p-5 
             shadow-2xl max-w-lg mx-auto"
    >
      <div class="text-center mb-2.5 flex justify-center text-power-on dark:text-green-400">
        <Bell :size="40" />
      </div>
      <p class="text-gray-800 dark:text-gray-200 text-base font-medium text-center m-0 mb-5">
        Увімкнути сповіщення про зміни в графіку?
      </p>
      <div class="flex gap-2.5">
        <button 
          @click="allowNotifications"
          class="flex-1 px-3 py-3 text-base font-semibold rounded-lg
                 bg-power-on dark:bg-green-600 text-white
                 hover:bg-power-on-dark dark:hover:bg-green-500 transition-colors"
        >
          Так
        </button>
        <button 
          @click="denyNotifications"
          class="flex-1 px-3 py-3 text-base font-semibold rounded-lg
                 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Ні
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Bell } from "lucide-vue-next";

const emit = defineEmits(["allow", "deny"]);

const showPrompt = ref(false);

onMounted(() => {
  // Show prompt only if notifications are supported and not yet decided
  if ("Notification" in window && Notification.permission === "default") {
    // Wait a bit before showing the prompt
    setTimeout(() => {
      showPrompt.value = true;
    }, 3000);
  }
});

function allowNotifications() {
  showPrompt.value = false;
  emit("allow");
}

function denyNotifications() {
  showPrompt.value = false;
  emit("deny");
}
</script>

<style scoped>
@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
</style>
