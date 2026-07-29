import { ComponentProps, useId } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props extends ComponentProps<typeof Input> {
  /** Field label, always rendered and associated to the input via a generated id. */
  readonly label: string;

  /** Error message, if any. */
  readonly error?: string;
}

export const TextField = ({ label, error, id, className, ref, ...rest }: Props) => {
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
};
