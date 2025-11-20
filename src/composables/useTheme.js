import { ref, watch, onMounted } from "vue";

const STORAGE_KEY = "app-theme";
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

// Reactive theme state (shared across all components)
const currentTheme = ref(THEMES.AUTO);
let mediaQueryList = null;

export function useTheme() {
  // Get system preference
  function getSystemPreference() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Handle system preference changes
  function handleSystemChange(e) {
    if (currentTheme.value === THEMES.AUTO) {
      applyTheme();
    }
  }

  // Initialize theme from localStorage or default to auto
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      currentTheme.value = savedTheme;
    } else {
      currentTheme.value = THEMES.AUTO;
    }
    
    // Listen for system theme changes
    mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryList.addEventListener("change", handleSystemChange);
    
    applyTheme();
  }

  // Apply theme to document
  function applyTheme() {
    const html = document.documentElement;
    
    if (currentTheme.value === THEMES.AUTO) {
      // Follow system preference
      const prefersDark = getSystemPreference();
      if (prefersDark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    } else if (currentTheme.value === THEMES.DARK) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    
    localStorage.setItem(STORAGE_KEY, currentTheme.value);
  }

  // Toggle between light, dark, and auto
  function toggleTheme() {
    if (currentTheme.value === THEMES.LIGHT) {
      currentTheme.value = THEMES.DARK;
    } else if (currentTheme.value === THEMES.DARK) {
      currentTheme.value = THEMES.AUTO;
    } else {
      currentTheme.value = THEMES.LIGHT;
    }
    applyTheme();
  }

  // Set specific theme
  function setTheme(theme) {
    if (Object.values(THEMES).includes(theme)) {
      currentTheme.value = theme;
      applyTheme();
    }
  }

  // Check if currently displaying dark (considering auto mode)
  function isCurrentlyDark() {
    if (currentTheme.value === THEMES.AUTO) {
      return getSystemPreference();
    }
    return currentTheme.value === THEMES.DARK;
  }

  // Watch for changes
  watch(currentTheme, applyTheme);

  return {
    currentTheme,
    isDark: () => currentTheme.value === THEMES.DARK,
    isLight: () => currentTheme.value === THEMES.LIGHT,
    isAuto: () => currentTheme.value === THEMES.AUTO,
    isCurrentlyDark,
    toggleTheme,
    setTheme,
    initTheme,
    THEMES,
  };
}

