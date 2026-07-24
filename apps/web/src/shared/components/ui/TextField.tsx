import { ComponentProps, forwardRef, useId } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props extends ComponentProps<typeof Input> {
  /** Field label, always rendered and associated to the input via a generated id. */
  readonly label: string;

  /** Error message, if any. */
  readonly error?: string;
}

// forwardRef so react-hook-form's register() ref (spread via {...register('x')})
// reaches the real <input> node instead of being dropped at this wrapper.
export const TextField = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div>
        <Label htmlFor={inputId} className="mb-1.5">
          {label}
        </Label>
        <Input
          ref={ref}
          id={inputId}
          className={className}
          aria-invalid={error !== undefined}
          {...rest}
        />
        {error !== undefined && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  },
);
TextField.displayName = 'TextField';
