import { useAtom } from 'jotai';
import { memo, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu as MenuIcon } from 'lucide-react';

import { Search } from '../Search/Search';

import { ProfileDropdown } from './ProfileDropdown';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
    <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground data-[state=open]:text-foreground">
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

const MobileLinkGroup = ({ title, links }: { title: string; links: readonly NavLink[] }) => (
  <div>
    <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
    <div className="mt-1 flex flex-col">
      {links.map(link => (
        <SheetClose asChild key={link.to}>
          <Link to={link.to} className="rounded-md px-2 py-2 text-sm hover:bg-accent">
            {link.label}
          </Link>
        </SheetClose>
      ))}
    </div>
  </div>
);

const MobileMenu = ({ isAuth }: { isAuth: boolean }) => (
  <Sheet>
    <SheetTrigger
      aria-label="Open menu"
      className="flex h-12 w-12 items-center justify-center text-foreground md:hidden"
    >
      <MenuIcon className="h-5 w-5" />
    </SheetTrigger>
    <SheetContent side="right" className="w-72">
      <SheetTitle>Menu</SheetTitle>
      <nav className="mt-6 flex flex-col gap-4">
        <MobileLinkGroup title="Movies" links={MovieLinks} />
        <MobileLinkGroup title="TV Shows" links={TvLinks} />
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          {!isAuth && (
            <>
              <SheetClose asChild>
                <Link to="/auth/login" className="rounded-md px-2 py-2 text-sm hover:bg-accent">
                  Login
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  to="/auth/register"
                  className="rounded-full bg-primary px-2 py-2 text-center text-sm font-medium text-primary-foreground"
                >
                  Sign up
                </Link>
              </SheetClose>
            </>
          )}
          {isAuth && (
            <>
              <SheetClose asChild>
                <Link to="user/profile" className="rounded-md px-2 py-2 text-sm hover:bg-accent">
                  Profile
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="user/lists" className="rounded-md px-2 py-2 text-sm hover:bg-accent">
                  Lists
                </Link>
              </SheetClose>
            </>
          )}
        </div>
      </nav>
    </SheetContent>
  </Sheet>
);

const NavShell = ({ isOverlay, children }: { isOverlay: boolean; children: ReactNode }) => (
  <nav
    className={
      isOverlay ?
        'fixed inset-x-0 top-0 z-20 bg-gradient-to-b from-background/85 to-transparent' :
        'relative z-20 border-b border-border bg-background'
    }
  >
    <div className="mx-auto flex max-w-screen-2xl items-center gap-8 px-4 py-4 md:px-8">
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
        <Search />
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
        <MobileMenu isAuth={isAuth} />
      </div>
    </NavShell>
  );
};

export const Navbar = memo(NavbarComponent);
