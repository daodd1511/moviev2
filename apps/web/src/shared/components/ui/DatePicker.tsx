import { useState } from 'react';
import { format, parse } from 'date-fns';
import { CalendarIcon, XIcon } from 'lucide-react';

import { FIELD_TRIGGER_SURFACE } from '@/lib/fieldStyles';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  /** Trigger element id, for label association. */
  readonly id?: string;

  /** Selected date as a `yyyy-MM-dd` string, or `''` when unset. */
  readonly value: string;

  /** Called with a `yyyy-MM-dd` string, or `''` when cleared. */
  readonly onChange: (value: string) => void;

  /** Text shown when no date is selected. */
  readonly placeholder?: string;
}

const DATE_FORMAT = 'yyyy-MM-dd';

/** Shadcn-style date picker: a trigger button opening a popover calendar. */
export const DatePicker = ({ id, value, onChange, placeholder = 'Pick a date' }: Props) => {
  const [open, setOpen] = useState(false);
  const selected = value === '' ? undefined : parse(value, DATE_FORMAT, new Date());

  const clear = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    onChange('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative flex items-center">
        <PopoverTrigger
          id={id}
          type="button"
          className={cn(FIELD_TRIGGER_SURFACE, 'group flex h-11 w-full min-w-0 items-center gap-3 px-4 text-left text-sm')}
        >
          <CalendarIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span
            className={cn('flex-1 truncate', selected === undefined && 'text-muted-foreground')}
          >
            {selected === undefined ? placeholder : format(selected, 'PPP')}
          </span>
        </PopoverTrigger>
        {selected !== undefined && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={clear}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                clear(event);
              }
            }}
            className="absolute right-3 flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
          >
            <XIcon aria-hidden="true" className="size-3.5" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={date => {
            onChange(date === undefined ? '' : format(date, DATE_FORMAT));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
