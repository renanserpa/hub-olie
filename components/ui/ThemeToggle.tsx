import React from 'react';
import { Moon, Sun } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { IconButton } from "./IconButton";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();

  return (
    <IconButton
      onClick={toggleTheme}
      aria-label="Alternar tema"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </IconButton>
  );
}
