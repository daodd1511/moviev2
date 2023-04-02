/* eslint-disable max-lines-per-function */
import { useAtom } from 'jotai';
import { memo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import { Search } from '../Search/Search';

import { ProfileDropdown } from './ProfileDropdown';

import { isAuthAtom } from '@/stores/atoms/authAtoms';
import { MediaType } from '@/shared/enums/mediaType';

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
  const [isAuth] = useAtom(isAuthAtom);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isMovieLinksOpen, setIsMovieLinksOpen] = useState<boolean>(false);
  const [isTvLinksOpen, setIsTvLinksOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const onMenuButtonClick = (type: string) => {
    if (type === 'movie') {
      setIsMovieLinksOpen(!isMovieLinksOpen);
      setIsTvLinksOpen(false);
    } else {
      setIsTvLinksOpen(!isTvLinksOpen);
      setIsMovieLinksOpen(false);
    }
  };
  useEffect(() => {
    setIsMovieLinksOpen(false);
    setIsTvLinksOpen(false);
    setIsMenuOpen(false);
  }, [navigate]);

  return (
    <nav className="border-gray-200 bg-cPrimary py-2.5 dark:bg-gray-900">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between px-8">
        <Link to="/" className="flex items-center">
          <span className="self-center whitespace-nowrap text-2xl font-semibold text-white">
            Flix
          </span>
        </Link>

        {!isAuth && (
          <div className="md:order-2 flex">
            <div className="order-2 hidden text-white md:block">
              <Search />
            </div>
            <div className="flex items-center text-white md:order-2">
              <Link
                to="/auth/login"
                className=" mr-1 rounded-lg px-4 py-2 text-sm font-medium text-white hover:text-blue-500 md:mr-2 md:px-5 md:py-2.5 "
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="mr-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 md:mr-2 md:px-5 md:py-2.5"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
        <button
          type="button"
          className="ml-1 inline-flex items-center rounded-lg p-2 text-sm text-white md:hidden"
          onClick={toggleMenu}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div
          id="mega-menu"
          className={`${
            isMenuOpen ? '' : 'hidden'
          } w-full items-center justify-between text-sm md:order-1 md:flex md:w-auto md:flex-grow md:pl-32`}
        >
          <ul className="mt-4 flex flex-col font-medium md:mt-0 md:flex-row md:space-x-8">
            <li>
              <button
                id="mega-menu-dropdown-button"
                className="flex w-full items-center justify-between py-2 pl-3 pr-4 font-medium text-white  md:w-auto md:border-0 md:p-0 md:text-lg md:hover:bg-transparent "
                onClick={() => onMenuButtonClick(MediaType.Movie)}
              >
                Movie{' '}
                <svg
                  aria-hidden="true"
                  className="ml-1 h-5 w-5 md:h-4 md:w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <div
                id="mega-menu-dropdown"
                className={`${
                  isMovieLinksOpen ? '' : 'hidden'
                } z-10 w-full grid-cols-2 rounded-lg p-4 text-sm text-white md:absolute md:w-fit md:bg-white md:pb-4 md:shadow-md`}
              >
                <ul
                  className="w-full space-y-4"
                  aria-labelledby="mega-menu-dropdown-button"
                >
                  <li>
                    <Link
                      to={MovieLinks.popular}
                      className="text-gray-300 hover:text-blue-600 md:text-gray-500 "
                    >
                      Popular
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={MovieLinks.topRated}
                      className="text-gray-300 hover:text-blue-600 md:text-gray-500 "
                    >
                      Top Rated
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={MovieLinks.upcoming}
                      className="text-gray-300 hover:text-blue-600 md:text-gray-500 "
                    >
                      Upcoming
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            <li>
              <button
                id="mega-menu-dropdown-button"
                className="flex w-full items-center justify-between py-2 pl-3 pr-4 font-medium text-white  md:w-auto md:border-0 md:p-0 md:text-lg md:hover:bg-transparent"
                onClick={() => onMenuButtonClick(MediaType.Tv)}
              >
                Tv{' '}
                <svg
                  aria-hidden="true"
                  className="ml-1 h-5 w-5 md:h-4 md:w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <div
                id="mega-menu-dropdown"
                className={`${
                  isTvLinksOpen ? '' : 'hidden'
                } z-10 w-full grid-cols-2 rounded-lg text-sm md:absolute md:w-fit md:bg-white md:shadow-md`}
              >
                <div className="p-4 text-white md:pb-4">
                  <ul
                    className="space-y-4"
                    aria-labelledby="mega-menu-dropdown-button"
                  >
                    <li>
                      <Link
                        to={TVLinks.popular}
                        className="text-gray-300 hover:text-blue-600 md:text-gray-500"
                      >
                        Popular
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={TVLinks.topRated}
                        className="text-gray-300 hover:text-blue-600 md:text-gray-500"
                      >
                        Top Rated
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={TVLinks.onTheAir}
                        className="text-gray-300 hover:text-blue-600 md:text-gray-500"
                      >
                        On The Air
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
          {!isAuth && (
            <div className="order-2 text-white md:hidden">
              <Search />
            </div>
          )}
          {isAuth && (
            <div className="flex justify-between text-white">
              <Search />
              <ProfileDropdown />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export const Navbar = memo(NavbarComponent);
