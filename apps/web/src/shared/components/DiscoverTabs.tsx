import { Link } from 'react-router-dom';

interface DiscoverOption {

  /** Display label. */
  readonly name: string;

  /** Route value. */
  readonly value: string;
}

interface Props {

  /** Accessible group label. */
  readonly label: string;

  /** Base discover route. */
  readonly basePath: string;

  /** Currently selected route value. */
  readonly activeValue: string;

  /** Discover categories. */
  readonly options: readonly DiscoverOption[];
}

export const DiscoverTabs = ({
  label,
  basePath,
  activeValue,
  options,
}: Props) => (
  <nav
    aria-label={label}
    className="-mx-4 mb-7 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden"
  >
    {options.map(option => (
      <Link
        key={option.value}
        to={`${basePath}/${option.value}`}
        aria-current={activeValue === option.value ? 'page' : undefined}
        className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition-colors aria-[current=page]:border-primary/50 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
      >
        {option.name}
      </Link>
    ))}
  </nav>
);
