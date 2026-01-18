import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("sociahub-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("sociahub-theme", theme);
    set({ theme });
  },
}));
