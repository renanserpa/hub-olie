import React from 'react';
import { cn } from '../../lib/utils';
import { Button, ButtonProps } from './Button';


const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8 text-textSecondary hover:text-textPrimary', className)}
        {...props}
      />
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton };
