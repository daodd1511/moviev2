import { Link } from 'react-router-dom';

import { useState } from 'react';
import { ListIcon, LogOut, User } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useLogout } from '@/shared/hooks';

export const ProfileDropdown = () => {
  const [isConfirmLogoutModalOpen, setIsConfirmLogoutModalOpen] = useState(false);
  const { isLoggingOut, logout } = useLogout();
  const onLogoutButtonClick = () => {
    setIsConfirmLogoutModalOpen(true);
  };
  const onConfirmButtonClick = async () => {
    await logout();
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
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={isConfirmLogoutModalOpen}
        onOpenChange={setIsConfirmLogoutModalOpen}
        icon={<LogOut aria-hidden="true" className="size-5" />}
        title="Sign out of Flix?"
        description="You will need to sign in again to manage your lists and account."
        confirmLabel="Sign out"
        isLoading={isLoggingOut}
        onConfirm={onConfirmButtonClick}
      />
    </>
  );
};
