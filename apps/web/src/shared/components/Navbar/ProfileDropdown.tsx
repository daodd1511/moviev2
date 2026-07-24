import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';

import { useState } from 'react';
import { ListIcon, LogOut, User } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthService } from '@/api/services/authService';
import { isAuthAtom } from '@/stores/atoms/authAtoms';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';

export const ProfileDropdown = () => {
  const [isConfirmLogoutModalOpen, setIsConfirmLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const [, setIsAuth] = useAtom(isAuthAtom);
  const onLogoutButtonClick = () => {
    setIsConfirmLogoutModalOpen(true);
  };
  const onConfirmButtonClick = async() => {
    setIsLoggingOut(true);
    try {
      await AuthService.logout();
      setIsAuth(false);
      navigate('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open profile menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
        >
          <User className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="user/profile">
              <User aria-hidden="true" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="user/lists">
              <ListIcon aria-hidden="true" />
              Lists
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onLogoutButtonClick}>
            <LogOut aria-hidden="true" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={isConfirmLogoutModalOpen}
        onOpenChange={setIsConfirmLogoutModalOpen}
        icon={<LogOut aria-hidden="true" className="size-5" />}
        title="Log out of Flix?"
        description="You will need to sign in again to manage your lists and account."
        confirmLabel="Log out"
        isLoading={isLoggingOut}
        onConfirm={onConfirmButtonClick}
      />
    </>
  );
};
