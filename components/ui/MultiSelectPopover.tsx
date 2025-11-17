import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectPopoverProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelectPopover: React.FC<MultiSelectPopoverProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const toggleOption = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const selectedLabels = options
    .filter(opt => selected.includes(opt.value))
    .map(opt => opt.label)
    .join(', ');

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between font-normal text-textSecondary bg-background"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedLabels || placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </Button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer text-sm"
            >
              <label htmlFor={`option-${option.value}`} className="flex items-center gap-2 cursor-pointer flex-grow">
                 <input
                    type="checkbox"
                    id={`option-${option.value}`}
                    checked={selected.includes(option.value)}
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                 />
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};