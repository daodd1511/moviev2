import { useAtom } from 'jotai';
import { memo, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Film, ListVideo, Tv, UserRound } from 'lucide-react';

import { Search } from '../Search/Search';

import { ProfileDropdown } from './ProfileDropdown';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isAuthAtom } from '@/stores/atoms/authAtoms';

interface NavLink {
  /** Link label. */
  readonly label: string;

  /** Link target. */
  readonly to: string;
}

const MovieLinks: readonly NavLink[] = [
  { label: 'Popular', to: '/movie/discover/popular' },
  { label: 'Top Rated', to: '/movie/discover/top_rated' },
  { label: 'Upcoming', to: '/movie/discover/upcoming' },
];

const TvLinks: readonly NavLink[] = [
  { label: 'Popular', to: '/tv/discover/popular' },
  { label: 'Top Rated', to: '/tv/discover/top_rated' },
  { label: 'On The Air', to: '/tv/discover/on_the_air' },
];

/** Detail routes (`/movie/123`, `/tv/123`) render a full-bleed hero; the nav floats over it. */
const DETAIL_ROUTE_PATTERN = /^\/(movie|tv)\/\d+$/;

interface NavDropdownProps {
  /** Trigger label. */
  readonly label: string;

  /** Links to list. */
  readonly links: readonly NavLink[];
}

const NavDropdown = ({ label, links }: NavDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground data-[state=open]:text-foreground">
      {label}
      <ChevronDown className="h-3.5 w-3.5" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      {links.map(link => (
        <DropdownMenuItem key={link.to} asChild>
          <Link to={link.to}>{link.label}</Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
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
      label="Lists"
      to={isAuth ? '/user/lists' : '/auth/login'}
      active={pathname.startsWith('/user/lists') || pathname.startsWith('/list')}
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
      <Link to="/" className="text-xl font-semibold tracking-wide text-foreground">
        Flix<span className="text-primary">.</span>
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        <NavDropdown label="Movies" links={MovieLinks} />
        <NavDropdown label="TV Shows" links={TvLinks} />
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
          <div className="hidden md:block">
            <ProfileDropdown />
          </div>
        )}
      </div>
      <MobileTabBar isAuth={isAuth} pathname={location.pathname} />
    </NavShell>
  );
};

export const Navbar = memo(NavbarComponent);
