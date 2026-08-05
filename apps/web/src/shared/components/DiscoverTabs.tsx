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

/**
 * Catalog category rail. Shown at every width — on desktop these categories are
 * otherwise only reachable from the navbar dropdown, which leaves the page with no
 * visible way to switch.
 */
export const DiscoverTabs = ({ label, basePath, activeValue, options }: Props) => (
  <nav aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
    {options.map(option => (
      <Link
        key={option.value}
        to={`${basePath}/${option.value}`}
        aria-current={activeValue === option.value ? 'page' : undefined}
        className="shrink-0 rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:border-foreground/30 hover:text-foreground aria-[current=page]:border-primary/40 aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
      >
        {option.name}
      </Link>
    ))}
  </nav>
);
