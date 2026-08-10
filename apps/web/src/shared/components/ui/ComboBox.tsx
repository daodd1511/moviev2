import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

import { FIELD_TRIGGER_SURFACE } from '@/lib/fieldStyles';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface Option {
  /** Option value. */
  readonly value: string;

  /** Option label. */
  readonly label: string;
}

interface Props {
  /** Available options. */
  readonly options: readonly Option[];

  /** Selected value, or `null` when nothing is chosen. */
  readonly value: string | null;

  /** Selection change handler; receives `null` when the selection is cleared. */
  readonly onChange: (value: string | null) => void;

  /** Placeholder shown on the trigger when nothing is selected. */
  readonly placeholder?: string;

  /** Placeholder for the filter input inside the popover. */
  readonly searchPlaceholder?: string;

  /** Message shown when the filter matches nothing. */
  readonly emptyMessage?: string;

  /** Accessible label / aria-labelledby target id. */
  readonly labelledBy?: string;
}

/**
 * Single-select counterpart to {@link MultiSelect}: a searchable popover list, for
 * option sets too long to scan in a plain Select. Same trigger and popover treatment,
 * so the two read as one control family.
 */
export const ComboBox = ({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No matches.',
  labelledBy,
}: Props) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-labelledby={labelledBy}
        className={cn(FIELD_TRIGGER_SURFACE, 'group flex h-11 w-full min-w-0 items-center justify-between gap-3 px-4 text-left text-sm')}
      >
        <span className="min-w-0 flex-1 truncate">
          {selectedOption === undefined ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedOption.label
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) gap-0 overflow-hidden border border-foreground/10 bg-popover p-0 shadow-[0_20px_48px_-16px_rgba(0,0,0,0.75)]"
        align="start"
        sideOffset={6}
      >
        <Command className="rounded-lg! p-0">
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="mt-1 max-h-64 border-t border-foreground/10 px-1.5 py-1">
            <CommandEmpty className="text-muted-foreground">{emptyMessage}</CommandEmpty>
            <CommandGroup className="p-0">
              {options.map(option => {
                const isSelected = option.value === value;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    className="min-h-9 cursor-pointer rounded-lg px-2.5 text-muted-foreground transition-colors data-[selected=true]:bg-foreground/[0.08] data-[selected=true]:text-foreground"
                    onSelect={() => select(option.value)}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-full border border-foreground/30 transition-[border-color,background-color]',
                        isSelected &&
                          'border-primary bg-primary text-primary-foreground shadow-[0_0_0_2px_rgba(245,165,36,0.12)]',
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className={cn('flex-1', isSelected && 'font-medium text-foreground')}>
                      {option.label}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {selectedOption !== undefined && (
            <div className="mt-1 flex items-center justify-between border-t border-foreground/10 px-2 pt-2 pb-1">
              <span className="text-xs text-muted-foreground">{selectedOption.label} selected</span>
              <button
                type="button"
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
                onClick={clear}
              >
                <X aria-hidden="true" className="size-3.5" />
                Clear
              </button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
