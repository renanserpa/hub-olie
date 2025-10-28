import React, { Children, cloneElement, useCallback, useEffect, useMemo, useRef, useState, isValidElement } from "react";
import { cn } from '../../lib/utils';

type Direction = "horizontal" | "vertical";

// Helper to normalize sizes to add up to 100
const normalizeSizes = (sizes: number[]): number[] => {
    const total = sizes.reduce((a, b) => a + b, 0);
    if (total === 0 || Math.abs(total - 100) < 0.001) {
        return sizes;
    }
    return sizes.map(s => (s / total) * 100);
};

// --- Child Components ---

// FIX: Define prop types for ResizablePanel to help TypeScript with cloneElement.
interface ResizablePanelProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function ResizablePanel({ children, className, style }: ResizablePanelProps) {
    // This component is a wrapper. The parent Resizable injects style and className.
    return <div className={className} style={style}>{children}</div>;
}

// FIX: Define prop types for ResizableHandle to help TypeScript with cloneElement.
interface ResizableHandleProps {
    className?: string;
    onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
    direction?: Direction;
}

export function ResizableHandle({ className, onMouseDown, direction }: ResizableHandleProps) {
    // This component is the drag handle. The parent Resizable injects onMouseDown.
    return (
        <div
            role="separator"
            onMouseDown={onMouseDown}
            className={cn(
                'flex-shrink-0 bg-border transition-colors hover:bg-primary',
                direction === 'horizontal' ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize',
                className
            )}
        />
    );
}

// --- Main Container ---

export function Resizable({
  direction = "horizontal",
  children,
  initialSizes,
  minSizes = [],
  className,
}: {
  direction?: Direction;
  children: React.ReactNode;
  initialSizes: number[];
  minSizes?: number[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const activeHandleIndex = useRef<number | null>(null);
  const startSizes = useRef<number[]>([]);
  const startPosition = useRef(0);

  const panelCount = Children.toArray(children).filter(child => isValidElement(child) && child.type === ResizablePanel).length;

  const [sizes, setSizes] = useState(() => normalizeSizes(initialSizes));
  const safeMinSizes = useMemo(() => Array.from({ length: panelCount }, (_, i) => minSizes[i] ?? 0), [minSizes, panelCount]);

  const startResize = useCallback((index: number, event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      isResizing.current = true;
      activeHandleIndex.current = index;
      startSizes.current = [...sizes];
      startPosition.current = direction === 'horizontal' ? event.clientX : event.clientY;
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
  }, [direction, sizes]);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
        if (!isResizing.current || activeHandleIndex.current === null) return;
        
        const container = containerRef.current;
        if (!container) return;

        const currentIndex = activeHandleIndex.current;
        const nextIndex = currentIndex + 1;
        
        const delta = (direction === 'horizontal' ? event.clientX : event.clientY) - startPosition.current;
        const totalSize = direction === 'horizontal' ? container.offsetWidth : container.offsetHeight;
        if (totalSize === 0) return;
        const deltaPercent = (delta / totalSize) * 100;
        
        let newSizeA = startSizes.current[currentIndex] + deltaPercent;
        let newSizeB = startSizes.current[nextIndex] - deltaPercent;

        if (newSizeA < safeMinSizes[currentIndex]) {
            const diff = safeMinSizes[currentIndex] - newSizeA;
            newSizeA = safeMinSizes[currentIndex];
            newSizeB -= diff;
        }
        if (newSizeB < safeMinSizes[nextIndex]) {
            const diff = safeMinSizes[nextIndex] - newSizeB;
            newSizeB = safeMinSizes[nextIndex];
            newSizeA -= diff;
        }

        const newSizes = [...startSizes.current];
        newSizes[currentIndex] = newSizeA;
        newSizes[nextIndex] = newSizeB;

        setSizes(normalizeSizes(newSizes));
    };

    const handleMouseUp = () => {
        if (!isResizing.current) return;
        isResizing.current = false;
        activeHandleIndex.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [direction, safeMinSizes]);

  let panelIndex = 0;
  
  return (
      <div ref={containerRef} className={cn('flex w-full h-full', direction === 'vertical' && 'flex-col', className)}>
          {Children.map(children, (child) => {
              if (!isValidElement(child)) return null;

              if (child.type === ResizablePanel) {
                  const index = panelIndex++;
                  // FIX: Cast `child.props` to `ResizablePanelProps` to safely access `className`,
                  // as TypeScript doesn't infer it from the `child.type` check.
                  return cloneElement(child as React.ReactElement<ResizablePanelProps>, {
                      style: { flexBasis: `${sizes[index]}%` },
                      className: cn((child.props as ResizablePanelProps).className, "overflow-hidden flex flex-col min-w-0 min-h-0"),
                  });
              }

              if (child.type === ResizableHandle) {
                  const index = panelIndex - 1; // The handle is associated with the panel before it
                  // FIX: Cast the child to a specifically typed ReactElement to fix type errors.
                  // This allows passing the 'onMouseDown' prop.
                  return cloneElement(child as React.ReactElement<ResizableHandleProps>, {
                      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => startResize(index, e),
                      direction,
                  });
              }

              // Render other children as is, though they won't be part of the resizing logic
              return child;
          })}
      </div>
  );
}