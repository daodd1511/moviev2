import { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Chip label. */
  readonly children: ReactNode;

  /** Internal route to navigate to; renders a router Link instead of a plain anchor. */
  readonly to?: string;
}

const CHIP_CLASSES =
  'inline-block rounded-full border border-white/[0.22] px-[1.1rem] py-[0.45rem] text-xs text-muted-foreground no-underline transition-colors duration-200 hover:border-primary hover:bg-primary/[0.08] hover:text-foreground';

export const Chip = ({ children, to, href, className, ...rest }: Props) => {
  if (to !== undefined) {
    return (
      <Link to={to} className={`${CHIP_CLASSES} ${className ?? ''}`}>
        {children}
      </Link>
    );
  }
  if (href !== undefined) {
    return (
      <a href={href} className={`${CHIP_CLASSES} ${className ?? ''}`} {...rest}>
        {children}
      </a>
    );
  }

  // Non-interactive tag — no link target given.
  const spanProps = rest as HTMLAttributes<HTMLSpanElement>;
  return (
    <span className={`${CHIP_CLASSES} ${className ?? ''}`} {...spanProps}>
      {children}
    </span>
  );
};
