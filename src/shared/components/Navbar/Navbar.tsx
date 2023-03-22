/* eslint-disable max-lines-per-function */
import { useAtom } from 'jotai';
import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import { Search } from '../Search/Search';

import { ProfileDropdown } from './ProfileDropdown';

import { isAuthAtom } from '@/stores/atoms/authAtoms';

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
  const onLoginButtonClick = () => {
    navigate('/auth/login');
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="border-gray-200 bg-cPrimary px-2 py-2.5 dark:bg-gray-900 md:px-4">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Flix
          </span>
        </Link>
        <div className="flex items-center md:order-2">
          <a
            href="#"
            className=" mr-1 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 md:mr-2 md:px-5 md:py-2.5 "
          >
            Login
          </a>
          <a
            href="#"
            className="mr-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 md:mr-2 md:px-5 md:py-2.5"
          >
            Sign up
          </a>
          <button
            type="button"
            className="ml-1 inline-flex items-center rounded-lg p-2 text-sm text-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden"
            onClick={toggleMenu}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <div
          id="mega-menu"
          className={`${
            isMenuOpen ? '' : 'hidden'
          } w-full items-center justify-between text-sm md:order-1 md:flex md:w-auto`}
        >
          <ul className="mt-4 flex flex-col font-medium md:mt-0 md:flex-row md:space-x-8">
            <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-white hover:bg-gray-50 md:border-0 md:p-0 md:hover:bg-transparent "
                aria-current="page"
              >
                Movie
              </a>
            </li>
            <li>
              <button
                id="mega-menu-dropdown-button"
                className="flex w-full items-center justify-between py-2 pl-3 pr-4 font-medium text-white hover:bg-gray-50 md:w-auto md:border-0 md:p-0 md:hover:bg-transparent "
                onClick={() => setIsTvLinksOpen(!isTvLinksOpen)}
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
                  isTvLinksOpen ? 'grid' : 'hidden'
                } absolute z-10 w-full grid-cols-2 rounded-lg bg-white text-sm shadow-md`}
              >
                <div className="p-4 text-white md:pb-4">
                  <ul
                    className="space-y-4"
                    aria-labelledby="mega-menu-dropdown-button"
                  >
                    <li>
                      <a
                        href="#"
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
                      >
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
                      >
                        Library
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
                      >
                        Resources
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
                      >
                        Pro Version
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export const Navbar = memo(NavbarComponent);
