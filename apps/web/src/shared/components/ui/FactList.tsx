import { ReactNode } from 'react';

interface Fact {
  /** Fact key/label. */
  readonly key: string;

  /** Fact label text. */
  readonly label: string;

  /** Fact value content. */
  readonly value: ReactNode;
}

interface Props {
  /** Facts to render as rows. */
  readonly facts: readonly Fact[];

  /** Custom class. */
  readonly className?: string;
}

export const FactList = ({ facts, className }: Props) => (
  <ul className={`grid gap-[0.9rem] text-sm ${className ?? ''}`}>
    {facts.map(fact => (
      <li key={fact.key} className="flex justify-between gap-4 border-b border-border pb-[0.9rem]">
        <span className="text-muted-foreground">{fact.label}</span>
        <span className="text-right font-normal text-foreground">{fact.value}</span>
      </li>
    ))}
  </ul>
);
