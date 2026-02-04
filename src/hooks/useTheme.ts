import { useState, useEffect } from "react";

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Recuperar del localStorage o del sistema
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    
    // Si no hay guardado, usar preferencia del sistema
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Aplicar el tema al cargar
    applyTheme(isDarkMode);
  }, []);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      applyTheme(newValue);
      return newValue;
    });
  };

  return {
    isDarkMode,
    toggleTheme,
    setTheme: (dark: boolean) => {
      setIsDarkMode(dark);
      applyTheme(dark);
    },
  };
}
