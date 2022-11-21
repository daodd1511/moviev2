/* eslint-disable max-lines-per-function */
import { useAtom } from 'jotai';
import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Search } from '../Search/Search';

import { isAuthAtom } from '@/stores/authStore';
import { AuthService } from '@/api/services/authService';

const MovieLinks = {
  popular: '/movie/discover/popular',
  topRated: '/movie/discover/top_rated',
  upcoming: '/movie/discover/upcoming',
};

const TVLinks = {
  popular: '/tv/discover/popular',
  topRated: '/tv/discover/top_rated',
  onTheAir: '/tv/discover/on_the_air',
};

const NavbarComponent = () => {
  const [isAuth, setIsAuth] = useAtom(isAuthAtom);
  const navigate = useNavigate();
  const onLoginButtonClick = () => {
    navigate('/auth/login');
  };
  const onLogoutButtonClick = async() => {
    await AuthService.logout();
    setIsAuth(false);
    navigate('/auth/login');
  };
  return (
    <nav className="navbar flex bg-[#023246] text-white">
      <div className="m-auto flex w-full max-w-screen-2xl justify-between">
        <div>
          <Link
            to="/"
            className="px-6 text-xl normal-case hover:bg-transparent"
          >
            Flix
          </Link>
          <ul className="menu menu-horizontal p-0">
            <li tabIndex={0}>
              <a>
                Movies
                <svg
                  className="fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </a>
              <ul className="z-30 border border-gray-300 bg-white p-2 text-black">
                <li>
                  <Link to={MovieLinks.popular}>Popular</Link>
                </li>
                <li>
                  <Link to={MovieLinks.topRated}>Top Rated</Link>
                </li>
                <li>
                  <Link to={MovieLinks.upcoming}>Upcoming</Link>
                </li>
              </ul>
            </li>
            <li tabIndex={0}>
              <a>
                TV Shows
                <svg
                  className="fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </a>
              <ul className="z-30 border border-gray-300 bg-white p-2 text-black">
                <li>
                  <Link to={TVLinks.popular}>Popular</Link>
                </li>
                <li>
                  <Link to={TVLinks.topRated}>Top Rated</Link>
                </li>
                <li>
                  <Link to={TVLinks.onTheAir}>On Air</Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div className="flex gap-5">
          <Search />
          {isAuth ?
            (
              <button type="button" onClick={onLogoutButtonClick}>Logout</button>
            ) :
            (
              <button type="button" onClick={onLoginButtonClick}>Login</button>
            )}
        </div>
      </div>
    </nav>
  );
};

export const Navbar = memo(NavbarComponent);
