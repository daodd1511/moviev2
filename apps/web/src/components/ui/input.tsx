import * as React from 'react';

import { FIELD_SURFACE } from '@/lib/fieldStyles';
import { cn } from '@/lib/utils';

const Input = ({ className, type, ref, ...props }: React.ComponentProps<'input'>) => (
  <input
    ref={ref}
    type={type}
    data-slot="input"
    className={cn(
      FIELD_SURFACE,
      'h-11 w-full min-w-0 px-4 py-1 text-base file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none md:text-sm',
      className,
    )}
    {...props}
  />
);

export { Input };
