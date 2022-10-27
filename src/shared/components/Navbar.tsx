/* eslint-disable max-lines-per-function */
import { memo } from 'react';
import { Link } from 'react-router-dom';

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

const NavbarComponent = () => (
  <nav className="navbar bg-[#023246] text-white">
    <div className="m-auto w-full flex max-w-screen-2xl ">
      <div>
        <Link to="/" className="px-6 text-xl normal-case hover:bg-transparent">
          daoMovies
        </Link>
      </div>
      <div>
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
            <ul className="z-30 bg-white border border-gray-300 p-2 text-black">
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
            <ul className="z-30 bg-white border border-gray-300 p-2 text-black">
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
    </div>
  </nav>
);

export const Navbar = memo(NavbarComponent);