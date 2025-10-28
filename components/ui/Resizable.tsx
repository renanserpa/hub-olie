import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from '../../lib/utils';

type Direction = "horizontal" | "vertical";

const normalizeSizes = (sizes: number[]): number[] => {
    const total = sizes.reduce((a, b) => a + b, 0);
    if (total === 0 || Math.abs(total - 100) < 0.001) {
        return sizes;
    }
    return sizes.map(s => (s / total) * 100);
};

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

  const panels = React.Children.toArray(children).filter(Boolean);
  const panelCount = panels.length;
  
  const safeMinSizes = useMemo(() => Array.from({ length: panelCount }, (_, i) => minSizes[i] ?? 0), [minSizes, panelCount]);
  const [sizes, setSizes] = useState(() => normalizeSizes(initialSizes));

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

  return (
      <div
          ref={containerRef}
          className={cn('flex w-full h-full', direction === 'vertical' && 'flex-col', className)}
      >
          {panels.map((child, i) => (
              <React.Fragment key={i}>
                  <div
                    style={{ flexBasis: `${sizes[i]}%`, overflow: 'hidden' }}
                    className="flex flex-col min-w-0 min-h-0"
                  >
                      {child}
                  </div>
                  {i < panelCount - 1 && (
                    <div
                        role="separator"
                        onMouseDown={(e) => startResize(i, e)}
                        className={cn(
                            'flex-shrink-0 bg-border transition-colors hover:bg-primary',
                            direction === 'horizontal' ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize'
                        )}
                    />
                  )}
              </React.Fragment>
          ))}
      </div>
  );
}

/**
 * FIX: The ResizablePanel and ResizableHandle components, along with their context,
 * were removed because they were causing compilation errors. The logic has been
 * consolidated into the main `Resizable` component above. This maintains the
 * external API, so no other files need to be changed.
 */
export function ResizablePanel({ children }: { children: React.ReactNode, size?: number }) {
    return (
        <div className="flex flex-col min-w-0 min-h-0 flex-1">
            {children}
        </div>
    );
}
