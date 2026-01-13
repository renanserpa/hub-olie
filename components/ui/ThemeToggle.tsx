import React from 'react';
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { IconButton } from "./IconButton";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

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