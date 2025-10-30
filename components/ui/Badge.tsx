import * as React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = {
    variant: {
      default: 'border-transparent bg-secondary text-secondary-foreground dark:bg-dark-secondary dark:text-dark-textPrimary',
      ativo: 'border-transparent bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
      inativo: 'border-transparent bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
      secondary: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300',
    }
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants.variant;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          badgeVariants.variant[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };