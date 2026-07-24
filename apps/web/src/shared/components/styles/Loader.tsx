/* eslint-disable max-len */
import { cn } from '@/lib/utils';

interface Props {

  /** Custom class. */
  readonly className?: string;
}

export const Loader = ({ className }: Props) => (
  <div className={cn('flex h-full w-full items-center justify-center text-center', className)}>
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-none"
      role="status">
      <span
        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
      >Loading...</span
      >
    </div>
  </div>
);
