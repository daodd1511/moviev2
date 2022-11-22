import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import { Modal } from '../Modal';

import { AuthService } from '@/api/services/authService';
import { isAuthAtom } from '@/stores/atoms/authAtoms';

export const ProfileDropdown = () => {
  const [isConfirmLogoutModalOpen, setIsConfirmLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const [, setIsAuth] = useAtom(isAuthAtom);
  const onLogoutButtonClick = () => {
    setIsConfirmLogoutModalOpen(true);
  };
  const onConfirmButtonClick = async() => {
    await AuthService.logout();
    setIsAuth(false);
    navigate('/auth/login');
  };
  return (
    <>
      <div className="dropdown dropdown-end text-black">
        <label tabIndex={0} className="btn btn-ghost btn-circle">
          <div className="w-10 text-white text-xl">
            <FontAwesomeIcon icon={faUser} />
          </div>
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box menu-compact mt-3 w-32 bg-base-100 p-2 shadow-2xl"
        >
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <button type="button" onClick={onLogoutButtonClick}>
            Logout
            </button>
          </li>
        </ul>
      </div>
      {isConfirmLogoutModalOpen && (
        <Modal setIsOpen={setIsConfirmLogoutModalOpen}>
          <div className="card w-96 bg-base-100 text-neutral-content">
            <div className="card-body items-center text-center text-black">
              <h2 className="card-title p-6">Do you want to log out?</h2>
              <div className="card-actions">
                <button type="button" className="btn btn-primary" onClick={() => setIsConfirmLogoutModalOpen(false)}>No</button>
                <button type="button" className="btn btn-error" onClick={onConfirmButtonClick}>Yes</button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
