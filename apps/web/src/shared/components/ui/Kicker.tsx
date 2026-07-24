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
    className={`mb-[1.2rem] text-[0.82rem] font-medium uppercase tracking-[0.2em] text-muted-foreground ${className ?? ''}`}
  >
    {children}
  </h2>
);
