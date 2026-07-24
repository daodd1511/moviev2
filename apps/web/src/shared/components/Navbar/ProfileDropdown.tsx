import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';

import { useState } from 'react';
import { User } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open profile menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
        >
          <User className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="user/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="user/lists">Lists</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogoutButtonClick}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isConfirmLogoutModalOpen} onOpenChange={setIsConfirmLogoutModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="text-center">Do you want to log out?</DialogTitle>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setIsConfirmLogoutModalOpen(false)}>No</Button>
            <Button variant="destructive" onClick={onConfirmButtonClick}>Yes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
