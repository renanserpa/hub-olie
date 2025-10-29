import React, {
  createContext,
  useContext,
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from '../../lib/utils';

type Direction = "horizontal" | "vertical";

// 1. Context Definition
interface ResizableContextType {
  direction: Direction;
  sizes: number[];
  startResize: (index: number, event: React.MouseEvent<HTMLDivElement>) => void;
}

const ResizableContext = createContext<ResizableContextType | null>(null);

const useResizable = () => {
  const context = useContext(ResizableContext);
  if (!context) {
    throw new Error("Resizable components must be used within a Resizable provider.");
  }
  return context;
};

// --- Child Components ---

interface ResizablePanelProps {
  // FIX: Made children optional to resolve incorrect TypeScript error in OmnichannelPage.
  children?: React.ReactNode;
  className?: string;
  index?: number; // Injected by Resizable parent
}

export function ResizablePanel({ children, className, index }: ResizablePanelProps) {
  const { sizes } = useResizable();
  // Ensure index is valid before accessing sizes array
  const size = (index !== undefined && sizes[index]) ? sizes[index] : 0;

  return (
    <div
      className={cn("overflow-hidden flex flex-col min-w-0 min-h-0", className)}
      style={{ flexBasis: `${size}%` }}
    >
      {children}
    </div>
  );
}
ResizablePanel.displayName = "ResizablePanel";

interface ResizableHandleProps {
  className?: string;
  index?: number; // Injected by Resizable parent
}

export function ResizableHandle({ className, index }: ResizableHandleProps) {
  const { direction, startResize } = useResizable();

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (index !== undefined) {
      startResize(index, event);
    }
  };

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
ResizableHandle.displayName = "ResizableHandle";

// --- Main Container and Provider ---

export function Resizable({
  direction = "horizontal",
  children,
  initialSizes,
  minSizes = [],
  className,
}: {
  direction?: Direction;
  // FIX: Made children optional to resolve incorrect TypeScript error in OmnichannelPage.
  children?: React.ReactNode;
  initialSizes: number[];
  minSizes?: number[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const activeHandleIndex = useRef<number | null>(null);
  const startSizes = useRef<number[]>([]);
  const startPosition = useRef(0);

  const panelCount = Children.toArray(children).filter(
    (child) => isValidElement(child) && (child.type as any).displayName === "ResizablePanel"
  ).length;

  const normalizeSizes = useCallback((sizesToNormalize: number[]): number[] => {
    const total = sizesToNormalize.reduce((a, b) => a + b, 0);
    if (total === 0 || Math.abs(total - 100) < 0.001) return sizesToNormalize;
    return sizesToNormalize.map((s) => (s / total) * 100);
  }, []);

  const [sizes, setSizes] = useState(() => normalizeSizes(initialSizes));
  const safeMinSizes = useMemo(() => Array.from({ length: panelCount }, (_, i) => minSizes[i] ?? 0), [minSizes, panelCount]);

  const startResize = useCallback((index: number, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
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
  }, [direction, safeMinSizes, normalizeSizes]);

  const contextValue = useMemo(() => ({
    direction,
    sizes,
    startResize,
  }), [direction, sizes, startResize]);

  let panelIndex = 0;

  return (
    <ResizableContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn('flex w-full h-full', direction === 'vertical' && 'flex-col', className)}>
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child;

          const childType = child.type as any;

          if (childType.displayName === 'ResizablePanel') {
            return cloneElement(child as React.ReactElement<ResizablePanelProps>, { index: panelIndex++ });
          }

          if (childType.displayName === 'ResizableHandle') {
            // The handle resizes the panel before it and the panel after it.
            // Its index corresponds to the panel before it.
            const handleIndex = panelIndex - 1;
            return cloneElement(child as React.ReactElement<ResizableHandleProps>, { index: handleIndex });
          }

          return child;
        })}
      </div>
    </ResizableContext.Provider>
  );
}
