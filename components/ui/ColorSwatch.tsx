import React, { useState, useEffect } from "react";
import { toast } from "../../hooks/use-toast";
import { Button } from "./Button";

export function ColorSwatch({ color, onChange }: { color: string; onChange: (v: string) => void }) {
  const [value, setValue] = useState(color);

  useEffect(() => {
    setValue(color);
  }, [color]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Código copiado!", description: value });
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange(newValue);
  }
  
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
  }

  const handleTextBlur = () => {
      onChange(value);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        <label htmlFor={`swatch-picker-${color}`} className="absolute inset-0 rounded-lg cursor-pointer border border-border dark:border-dark-border" style={{ backgroundColor: value || '#ffffff' }}></label>
        <input
            id={`swatch-picker-${color}`}
            type="color"
            value={value || '#ffffff'}
            onChange={handleColorInputChange}
            className="w-full h-full cursor-pointer opacity-0"
        />
      </div>
      <input
        type="text"
        value={value ? value.toUpperCase() : ''}
        onChange={handleTextInputChange}
        onBlur={handleTextBlur}
        placeholder="#RRGGBB"
        className="w-24 p-2 font-mono text-sm border border-border dark:border-dark-border bg-background dark:bg-dark-background text-textPrimary dark:text-dark-textPrimary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="text-textSecondary dark:text-dark-textSecondary"
      >
        Copiar
      </Button>
    </div>
  );
}
