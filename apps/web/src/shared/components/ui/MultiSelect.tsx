import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

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

  /** Currently selected values. */
  readonly selected: readonly string[];

  /** Selection change handler. */
  readonly onChange: (values: string[]) => void;

  /** Placeholder shown when nothing is selected. */
  readonly placeholder?: string;

  /** Accessible label / aria-labelledby target id. */
  readonly labelledBy?: string;
}

export const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = 'Select…',
  labelledBy,
}: Props) => {
  const [open, setOpen] = useState(false);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value) ?
        selected.filter(v => v !== value) :
        [...selected, value],
    );
  };

  const selectedOptions = options.filter(o => selected.includes(o.value));
  const firstSelectedOption = selectedOptions[0];
  const remainingSelectionCount = selectedOptions.length - 1;

  const clearSelection = () => {
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-labelledby={labelledBy}
        className="group flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-foreground/15 bg-foreground/[0.06] px-4 text-left text-sm text-foreground shadow-[inset_0_1px_0_rgba(217,231,238,0.04)] outline-none transition-[border-color,background-color,box-shadow] duration-200 hover:border-foreground/25 hover:bg-foreground/[0.09] focus-visible:border-ring data-[state=open]:border-foreground/30 data-[state=open]:bg-surface-raised"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {firstSelectedOption === undefined ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <>
              <span className="truncate">{firstSelectedOption.label}</span>
              {remainingSelectionCount > 0 && (
                <span className="shrink-0 rounded-full border border-foreground/10 bg-foreground/[0.08] px-2 py-0.5 text-xs text-muted-foreground">
                  +{remainingSelectionCount}
                </span>
              )}
            </>
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
          <CommandInput placeholder="Search genres…" />
          <CommandList className="mt-1 max-h-64 border-t border-foreground/10 px-1.5 py-1">
            <CommandEmpty className="text-muted-foreground">No matching genres.</CommandEmpty>
            <CommandGroup className="p-0">
              {options.map(option => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    className="min-h-9 cursor-pointer rounded-lg px-2.5 text-muted-foreground transition-colors data-[selected=true]:bg-foreground/[0.08] data-[selected=true]:text-foreground"
                    onSelect={() => toggle(option.value)}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-[0.25rem] border border-foreground/30 transition-[border-color,background-color]',
                        isSelected && 'border-primary bg-primary text-primary-foreground shadow-[0_0_0_2px_rgba(245,165,36,0.12)]',
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className={cn(
                      'flex-1',
                      isSelected && 'font-medium text-foreground',
                    )}
                    >
                      {option.label}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {selectedOptions.length > 0 && (
            <div className="mt-1 flex items-center justify-between border-t border-foreground/10 px-2 pb-1 pt-2">
              <span className="text-xs text-muted-foreground">
                {selectedOptions.length} selected
              </span>
              <button
                type="button"
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
                onClick={clearSelection}
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
