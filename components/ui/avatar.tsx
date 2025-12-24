import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-full',
  {
    variants: {
      size: {
        default: 'h-10 w-10 text-sm',
        sm: 'h-8 w-8 text-xs',
        lg: 'h-12 w-12 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        {...props}
      />
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar, avatarVariants };
