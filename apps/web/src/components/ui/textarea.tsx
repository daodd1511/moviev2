import * as React from 'react';

import { FIELD_SURFACE } from '@/lib/fieldStyles';
import { cn } from '@/lib/utils';

const Textarea = ({ className, ref, ...props }: React.ComponentProps<'textarea'>) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      FIELD_SURFACE,
      'flex field-sizing-content min-h-20 w-full px-4 py-3 text-base placeholder:text-muted-foreground md:text-sm',
      className,
    )}
    {...props}
  />
);

export { Textarea };
