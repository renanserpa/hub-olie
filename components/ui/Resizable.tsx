import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { cn } from '../../lib/utils';

type Direction = 'horizontal' | 'vertical';

interface ResizablePanelGroupContextProps {
  direction: Direction;
  startResize: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, panelIndex: number) => void;
}

const ResizablePanelGroupContext = createContext<ResizablePanelGroupContextProps | null>(null);

interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction: Direction;
}

export const ResizablePanelGroup: React.FC<ResizablePanelGroupProps> = ({ direction, children, className, ...props }) => {
  const [sizes, setSizes] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeHandleIndex = useRef<number | null>(null);

  const startResize = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, panelIndex: number) => {
    event.preventDefault();
    activeHandleIndex.current = panelIndex;

    const initialSizes = React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === ResizablePanel) {
        return child.props.defaultSize || 0;
      }
      return 0;
    }).filter(size => size > 0);
    
    if (sizes.length === 0) {
        setSizes(initialSizes);
    }
  };

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (activeHandleIndex.current === null || !containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const pos = direction === 'horizontal' ? event.clientX - left : event.clientY - top;
    const containerSize = direction === 'horizontal' ? width : height;
    
    setSizes(prevSizes => {
        const newSizes = [...prevSizes];
        const index = activeHandleIndex.current!;
        
        let delta = (pos / containerSize) * 100 - newSizes.slice(0, index + 1).reduce((a, b) => a + b, 0);

        const firstPanel = newSizes[index];
        const secondPanel = newSizes[index + 1];

        const firstPanelMin = React.Children.toArray(children)[index * 2].props.minSize || 0;
        const secondPanelMin = React.Children.toArray(children)[(index + 1) * 2].props.minSize || 0;
        
        if (firstPanel + delta < firstPanelMin) {
            delta = firstPanelMin - firstPanel;
        }
        if (secondPanel - delta < secondPanelMin) {
            delta = secondPanel - secondPanelMin;
        }

        newSizes[index] += delta;
        newSizes[index + 1] -= delta;

        return newSizes;
    });
  }, [direction, children]);

  const onMouseUp = useCallback(() => {
    activeHandleIndex.current = null;
  }, []);

  React.useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);
  
  const childrenWithProps = React.Children.toArray(children).map((child, index) => {
    if (React.isValidElement(child)) {
      if (child.type === ResizablePanel) {
        const panelIndex = Math.floor(index / 2);
        return React.cloneElement(child as React.ReactElement<ResizablePanelProps>, {
          style: { flexBasis: sizes.length > 0 ? `${sizes[panelIndex]}%` : undefined },
        });
      }
      if (child.type === ResizableHandle) {
        const panelIndex = Math.floor((index -1) / 2);
        return React.cloneElement(child as React.ReactElement<ResizableHandleProps>, {
          onMouseDown: (e) => startResize(e, panelIndex)
        });
      }
    }
    return child;
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex w-full h-full',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
      {...props}
    >
      {childrenWithProps}
    </div>
  );
};

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({ children, className, style, defaultSize, ...props }) => {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ flexGrow: defaultSize, flexShrink: 1, flexBasis: `${defaultSize}%`, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ResizableHandle: React.FC<ResizableHandleProps> = ({ className, ...props }) => {
  const groupContext = useContext(ResizablePanelGroupContext);
  return (
    <div
      className={cn(
        'bg-border relative outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring',
        groupContext?.direction === 'horizontal'
          ? 'w-px cursor-col-resize hover:bg-primary'
          : 'h-px cursor-row-resize hover:bg-primary',
        className
      )}
      {...props}
    >
        <div className={cn(
            'absolute z-10 bg-transparent',
             groupContext?.direction === 'horizontal' ? 'w-2 h-full -translate-x-1/2' : 'h-2 w-full -translate-y-1/2'
        )}></div>
    </div>
  );
};