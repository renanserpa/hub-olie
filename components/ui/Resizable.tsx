import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

type Direction = 'horizontal' | 'vertical';

interface ResizablePanelGroupContextValue {
  direction: Direction;
  startResize: (index: number, event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  sizes: number[];
  setSizes: React.Dispatch<React.SetStateAction<number[]>>;
  minSizes: number[];
  isResizing: boolean;
}

const ResizableContext = createContext<ResizablePanelGroupContextValue | null>(null);

function sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
}

function normalize(arr: number[]): number[] {
    const total = sum(arr);
    if (total === 0) return arr;
    return arr.map((v) => (v / total) * 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export const ResizablePanelGroup: React.FC<{
  direction?: Direction;
  children: React.ReactNode;
  className?: string;
}> = ({ direction = 'horizontal', children, className }) => {
  const panels = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === ResizablePanel
  ) as React.ReactElement<ResizablePanelProps>[];

  const initialSizes = useMemo(() => normalize(panels.map(p => p.props.initialSize ?? 1)), [panels]);
  const minSizes = useMemo(() => panels.map(p => p.props.minSize ?? 0), [panels]);

  const [sizes, setSizes] = useState<number[]>(initialSizes);
  const isResizingRef = useRef(false);
  const resizeIndexRef = useRef(-1);
  const startPosRef = useRef(0);
  const startSizesRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = useCallback((index: number, event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    isResizingRef.current = true;
    resizeIndexRef.current = index;
    startSizesRef.current = [...sizes];

    const clientPos = 'touches' in event ? event.touches[0] : event;
    startPosRef.current = direction === 'horizontal' ? clientPos.clientX : clientPos.clientY;
    
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [sizes, direction]);

  useEffect(() => {
    const handleMove = (event: MouseEvent | TouchEvent) => {
      if (!isResizingRef.current) return;
      
      const clientPos = 'touches' in event ? event.touches[0] : event;
      const currentPos = direction === 'horizontal' ? clientPos.clientX : clientPos.clientY;
      const delta = currentPos - startPosRef.current;

      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const containerSize = direction === 'horizontal' ? rect.width : rect.height;

      if (containerSize === 0) return;

      const deltaPercent = (delta / containerSize) * 100;

      const i = resizeIndexRef.current;
      const startLeft = startSizesRef.current[i];
      const startRight = startSizesRef.current[i + 1];

      let newLeft = startLeft + deltaPercent;
      let newRight = startRight - deltaPercent;
      
      const minLeft = minSizes[i];
      const minRight = minSizes[i + 1];

      newLeft = Math.max(newLeft, minLeft);
      newRight = Math.max(newRight, minRight);

      const overflow = sum([newLeft, newRight]) - sum([startLeft, startRight]);
      if (overflow > 0) {
        if (newLeft > startLeft) newLeft -= overflow;
        else newRight -= overflow;
      }

      setSizes(prev => {
        const next = [...prev];
        next[i] = newLeft;
        next[i+1] = newRight;
        return normalize(next);
      });
    };

    const handleStop = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleStop);
    window.addEventListener('touchend', handleStop);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleStop);
      window.removeEventListener('touchend', handleStop);
    };
  }, [direction, minSizes, sizes]);

  const contextValue = useMemo(() => ({
    direction,
    startResize,
    sizes,
    setSizes,
    minSizes,
    isResizing: isResizingRef.current,
  }), [direction, startResize, sizes, minSizes]);

  return (
    <ResizableContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn('flex w-full h-full', direction === 'horizontal' ? 'flex-row' : 'flex-col', className)}
      >
        {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return child;
            
            const isPanel = child.type === ResizablePanel;
            if (isPanel) {
                // Find panel index among other panels
                const panelIndex = panels.findIndex(p => p.key === child.key);
                // FIX: Cast props to `any` to allow adding internal `_index` prop.
                return React.cloneElement(child, { _index: panelIndex } as any);
            }

            const isHandle = child.type === ResizableHandle;
            if (isHandle) {
                // Handle is between panels, so its index is based on previous panel
                const panelIndex = panels.findIndex(p => p.key === (children as any[])[index-1]?.key);
                // FIX: Cast props to `any` to allow adding internal `_index` prop.
                return React.cloneElement(child, { _index: panelIndex } as any);
            }
            return child;
        })}
      </div>
    </ResizableContext.Provider>
  );
};

interface ResizablePanelProps {
  children: React.ReactNode;
  initialSize?: number;
  minSize?: number;
  className?: string;
  // Note: _index is an internal prop injected by ResizablePanelGroup and is not part of the public API.
}
export const ResizablePanel: React.FC<ResizablePanelProps & { _index?: number }> = ({ children, className, _index = 0 }) => {
  const context = useContext(ResizableContext);
  if (!context) throw new Error("ResizablePanel must be used within a ResizablePanelGroup");
  
  const size = context.sizes[_index] ?? 0;

  return (
    <div
      className={cn("overflow-hidden flex flex-col", className)}
      style={{ flexBasis: `${size}%`, flexGrow: 0, flexShrink: 0 }}
    >
      {children}
    </div>
  );
};

interface ResizableHandleProps {
  className?: string;
  // Note: _index is an internal prop injected by ResizablePanelGroup and is not part of the public API.
}
export const ResizableHandle: React.FC<ResizableHandleProps & { _index?: number }> = ({ className, _index = 0 }) => {
  const context = useContext(ResizableContext);
  if (!context) throw new Error("ResizableHandle must be used within a ResizablePanelGroup");
  
  return (
    <div
      onMouseDown={(e) => context.startResize(_index, e)}
      onTouchStart={(e) => context.startResize(_index, e)}
      className={cn(
        "flex-shrink-0 bg-border flex items-center justify-center transition-colors hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        context.direction === 'horizontal' ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize',
        className
      )}
    >
        <div className={cn(
            "bg-background/80 rounded-full",
            context.direction === 'horizontal' ? "w-1 h-8" : "h-1 w-8"
        )} />
    </div>
  );
};
