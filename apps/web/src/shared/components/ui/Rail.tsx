import { ReactNode, useId } from 'react';
import { Link } from 'react-router-dom';

import { Kicker } from './Kicker';

interface Props {

  /** Section title. */
  readonly title: string;

  /** Optional "view all" link target. */
  readonly viewAllTo?: string;

  /** Rail content. */
  readonly children: ReactNode;

  /** Custom class for the section element. */
  readonly className?: string;
}

export const Rail = ({ title, viewAllTo, children, className }: Props) => {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={`pt-12 md:pt-[4.5rem] ${className ?? ''}`}>
      <div className="mb-4 flex items-baseline justify-between md:mb-[1.4rem]">
        <Kicker id={headingId} className="mb-0">{title}</Kicker>
        {viewAllTo !== undefined && (
          <Link to={viewAllTo} className="text-sm text-primary no-underline hover:underline">
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
};
