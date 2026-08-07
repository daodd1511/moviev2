import { useAtom } from 'jotai';
import { memo, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, ListVideo, Tv, UserRound } from 'lucide-react';

import { Logo } from '../Logo';
import { Search } from '../Search/Search';

import { ProfileDropdown } from './ProfileDropdown';

import { NotificationCenter } from '@/features/Notifications/components/NotificationCenter';
import { Button } from '@/components/ui/button';
import { isAuthAtom } from '@/stores/atoms/authAtoms';

interface NavLink {
  /** Link label. */
  readonly label: string;

  /** Link target. */
  readonly to: string;

  /** Route prefix that marks this section as current. */
  readonly section: string;
}

/**
 * Top-level sections. Each lands on the section's default category — the catalog page's
 * own rail switches categories from there, so the nav does not repeat them.
 */
const SectionLinks: readonly NavLink[] = [
  { label: 'Movies', to: '/movie/discover/popular', section: '/movie' },
  { label: 'TV Shows', to: '/tv/discover/popular', section: '/tv' },
];

/** Detail routes (`/movie/123`, `/tv/123`) render a full-bleed hero; the nav floats over it. */
const DETAIL_ROUTE_PATTERN = /^\/(movie|tv)\/\d+$/;

const SectionLink = ({ link, pathname }: { link: NavLink; pathname: string }) => (
  <Link
    to={link.to}
    aria-current={pathname.startsWith(link.section) ? 'page' : undefined}
    className="text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-primary"
  >
    {link.label}
  </Link>
);

interface MobileTabLinkProps {
  /** Tab icon. */
  readonly icon: ReactNode;

  /** Tab label. */
  readonly label: string;

  /** Link target. */
  readonly to: string;

  /** Whether the tab matches the current route. */
  readonly active: boolean;
}

const MobileTabLink = ({ icon, label, to, active }: MobileTabLinkProps) => (
  <Link
    to={to}
    aria-current={active ? 'page' : undefined}
    className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.65rem] font-medium text-muted-foreground transition-colors aria-[current=page]:text-primary"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileTabBar = ({
  isAuth,
  pathname,
}: {
  readonly isAuth: boolean;
  readonly pathname: string;
}) => (
  <div
    role="group"
    aria-label="Mobile navigation"
    className="fixed inset-x-0 bottom-0 z-40 flex border-t border-foreground/10 bg-background/92 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
  >
    <MobileTabLink
      icon={<Film className="size-5" aria-hidden="true" />}
      label="Movies"
      to="/movie/discover/popular"
      active={pathname.startsWith('/movie')}
    />
    <MobileTabLink
      icon={<Tv className="size-5" aria-hidden="true" />}
      label="TV"
      to="/tv/discover/popular"
      active={pathname.startsWith('/tv')}
    />
    <MobileTabLink
      icon={<ListVideo className="size-5" aria-hidden="true" />}
      label="Collections"
      to={isAuth ? '/user/collections' : '/auth/login'}
      active={pathname.startsWith('/user/collections') || pathname.startsWith('/collections')}
    />
    <Search mobileTab />
    <MobileTabLink
      icon={<UserRound className="size-5" aria-hidden="true" />}
      label="Profile"
      to={isAuth ? '/user/profile' : '/auth/login'}
      active={pathname.startsWith('/user/profile')}
    />
  </div>
);

const NavShell = ({ isOverlay, children }: { isOverlay: boolean; children: ReactNode }) => (
  <nav
    className={
      isOverlay
        ? 'fixed inset-x-0 top-0 z-20 bg-gradient-to-b from-background/85 to-transparent'
        : 'relative z-20 border-b border-border bg-background'
    }
  >
    <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-8 px-4 md:h-auto md:px-8 md:py-4">
      {children}
    </div>
  </nav>
);

const NavbarComponent = () => {
  const [isAuth] = useAtom(isAuthAtom);
  const location = useLocation();
  const isOverlay = DETAIL_ROUTE_PATTERN.test(location.pathname);

  return (
    <NavShell isOverlay={isOverlay}>
      <Link to="/" className="text-foreground">
        <Logo />
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        {SectionLinks.map(link => (
          <SectionLink key={link.to} link={link} pathname={location.pathname} />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:block">
          <Search />
        </div>
        {!isAuth && (
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <Button asChild size="sm">
              <Link to="/auth/register">Sign up</Link>
            </Button>
          </div>
        )}
        {isAuth && (
          <div className="hidden items-center md:flex">
            <NotificationCenter />
            <ProfileDropdown />
          </div>
        )}
      </div>
      <MobileTabBar isAuth={isAuth} pathname={location.pathname} />
    </NavShell>
  );
};

export const Navbar = memo(NavbarComponent);
