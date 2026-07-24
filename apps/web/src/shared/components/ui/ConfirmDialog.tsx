import { ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {

  /** Dialog visibility. */
  readonly open: boolean;

  /** Visibility change handler. */
  readonly onOpenChange: (open: boolean) => void;

  /** Dialog icon. */
  readonly icon: ReactNode;

  /** Confirmation heading. */
  readonly title: string;

  /** Consequence or supporting context. */
  readonly description: string;

  /** Confirmation action label. */
  readonly confirmLabel: string;

  /** Confirmation handler. */
  readonly onConfirm: () => void | Promise<void>;

  /** Whether the action is destructive and irreversible. */
  readonly destructive?: boolean;

  /** Whether the confirmation action is running. */
  readonly isLoading?: boolean;
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  icon,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive = false,
  isLoading = false,
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      showCloseButton={false}
      className="w-[min(92vw,28rem)] max-w-none gap-0 overflow-hidden border border-foreground/10 bg-popover p-0 shadow-[0_28px_80px_-24px_rgba(0,0,0,0.9)] sm:max-w-none"
    >
      <div className="px-6 pb-7 pt-8 text-center sm:px-8">
        <span
          className={cn(
            'mx-auto mb-5 flex size-12 items-center justify-center rounded-full border',
            destructive ?
              'border-destructive/25 bg-destructive/10 text-destructive' :
              'border-foreground/10 bg-foreground/[0.06] text-foreground',
          )}
        >
          {icon}
        </span>
        <DialogTitle className="text-xl font-medium leading-tight text-foreground">
          {title}
        </DialogTitle>
        <DialogDescription className="mx-auto mt-2 max-w-sm leading-relaxed">
          {description}
        </DialogDescription>
      </div>

      <div className="flex gap-3 border-t border-foreground/10 bg-surface/55 p-4 sm:px-6">
        <Button
          variant="outline"
          className="h-11 flex-1 rounded-full"
          disabled={isLoading}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'default'}
          className={cn(
            'h-11 flex-1 rounded-full font-semibold',
            destructive && 'bg-destructive text-background hover:bg-destructive/90',
          )}
          disabled={isLoading}
          onClick={onConfirm}
        >
          {isLoading ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
