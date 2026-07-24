import { ReactNode } from 'react';

interface Props {

  /** Kicker text. */
  readonly children: ReactNode;

  /** Custom class. */
  readonly className?: string;

  /** Heading id, for aria-labelledby wiring. */
  readonly id?: string;
}

export const Kicker = ({ children, className, id }: Props) => (
  <h2
    id={id}
    className={`mb-6 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground before:block before:h-px before:w-8 before:bg-primary before:content-[''] ${className ?? ''}`}
  >
    {children}
  </h2>
);
