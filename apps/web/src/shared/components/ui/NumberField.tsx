import { MinusIcon, PlusIcon } from 'lucide-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

interface Props {
  /** Input id, for label association. */
  readonly id?: string;

  /** Raw field value; `''` represents empty/unset. */
  readonly value: string;

  /** Called with the new raw value on typing or stepper clicks. */
  readonly onChange: (value: string) => void;

  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly placeholder?: string;
}

const clamp = (value: number, min?: number, max?: number): number => {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
};

/** Number input with decrement/increment stepper buttons, clamped to `min`/`max`. */
export const NumberField = ({ id, value, onChange, min, max, step = 1, placeholder }: Props) => {
  const numeric = value === '' ? null : Number(value);
  const canDecrement = numeric === null || min === undefined || numeric > min;
  const canIncrement = numeric === null || max === undefined || numeric < max;

  const bump = (delta: number) => {
    const base = numeric ?? (min ?? 0) - delta;
    onChange(String(clamp(base + delta, min, max)));
  };

  return (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupButton
          size="icon-sm"
          aria-label="Decrease"
          disabled={!canDecrement}
          onClick={() => bump(-step)}
        >
          <MinusIcon aria-hidden="true" />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="[appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          aria-label="Increase"
          disabled={!canIncrement}
          onClick={() => bump(step)}
        >
          <PlusIcon aria-hidden="true" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};
