<template>
  <div
    class="bg-white dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 my-5 mx-auto max-w-md shadow-xl"
  >
    <div class="text-center mb-5">
      <h3 class="text-gray-800 dark:text-gray-100 text-2xl font-bold m-0 mb-1">
        🎮 Хрестики-нулики
      </h3>
      <p class="text-gray-600 dark:text-gray-300 text-sm m-0">
        Два гравці • Офлайн гра
      </p>
    </div>

    <div class="mb-5 text-center">
      <div
        v-if="winner"
        class="bg-power-on/20 dark:bg-green-900/30 text-power-on dark:text-white px-5 py-3 rounded-xl text-lg font-semibold border-2 border-power-on/50 dark:border-green-500/50"
      >
        🎉 Переміг: <strong>{{ winner }}</strong
        >!
      </div>
      <div
        v-else-if="isDraw"
        class="bg-blue-600/20 dark:bg-blue-900/30 text-blue-700 dark:text-white px-5 py-3 rounded-xl text-lg font-semibold border-2 border-blue-500/50 dark:border-blue-600/50"
      >
        🤝 Нічия!
      </div>
      <div
        v-else
        class="bg-gray-200 dark:bg-gray-700/30 text-gray-800 dark:text-white px-5 py-3 rounded-xl text-lg font-semibold"
      >
        Хід гравця: <strong>{{ currentPlayer }}</strong>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2.5 mb-5 w-full">
      <button
        v-for="(cell, index) in board"
        :key="index"
        :class="[
          'bg-white dark:bg-gray-800/90 border-4 rounded-xl text-5xl font-bold transition-all duration-200 cursor-pointer',
          'hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95',
          'flex items-center justify-center aspect-square',
          cell !== null ? 'cursor-not-allowed' : '',
          cell === 'X'
            ? 'text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-400/30'
            : '',
          cell === 'O'
            ? 'text-power-off dark:text-red-400 border-power-off/30 dark:border-red-400/30'
            : 'border-gray-300 dark:border-gray-700/50',
          winningLine.includes(index)
            ? 'bg-yellow-300 dark:bg-yellow-600/50 animate-pulse'
            : '',
        ]"
        @click="makeMove(index)"
        :disabled="cell !== null || winner !== null || isDraw"
      >
        <span class="min-h-[1em]">{{ cell || "\u00A0" }}</span>
      </button>
    </div>

    <div class="flex justify-center mb-5">
      <button
        class="bg-white dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 shadow-lg"
        @click="resetGame"
      >
        🔄 Нова гра
      </button>
    </div>

    <div
      class="bg-gray-200 dark:bg-gray-700/30 rounded-xl p-4 flex justify-center items-center gap-5"
    >
      <div class="flex items-center gap-2.5">
        <span class="text-blue-600 dark:text-blue-300 text-2xl font-bold"
          >X</span
        >
        <span class="text-gray-800 dark:text-gray-200 text-3xl font-bold">{{
          scores.X
        }}</span>
      </div>
      <div class="text-gray-500 dark:text-gray-500 text-3xl font-light">:</div>
      <div class="flex items-center gap-2.5">
        <span class="text-power-off dark:text-red-400 text-2xl font-bold"
          >O</span
        >
        <span class="text-gray-800 dark:text-gray-200 text-3xl font-bold">{{
          scores.O
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const board = ref(Array(9).fill(null));
const currentPlayer = ref("X");
const winner = ref(null);
const winningLine = ref([]);
const scores = ref({ X: 0, O: 0 });

const winningCombinations = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal \
  [2, 4, 6], // Diagonal /
];

const isDraw = computed(() => {
  return board.value.every((cell) => cell !== null) && winner.value === null;
});

function checkWinner() {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      board.value[a] &&
      board.value[a] === board.value[b] &&
      board.value[a] === board.value[c]
    ) {
      winner.value = board.value[a];
      winningLine.value = combination;
      scores.value[winner.value]++;
      return;
    }
  }
}

function makeMove(index) {
  if (board.value[index] !== null || winner.value) return;

  board.value[index] = currentPlayer.value;
  checkWinner();

  if (!winner.value) {
    currentPlayer.value = currentPlayer.value === "X" ? "O" : "X";
  }
}

function resetGame() {
  board.value = Array(9).fill(null);
  currentPlayer.value = "X";
  winner.value = null;
  winningLine.value = [];
}
</script>
