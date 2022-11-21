import { ReactNode } from 'react';

/* eslint-disable max-len */
interface Props {

  /** Content. */
  readonly children: ReactNode;

  /** Set modal open status. */
  readonly setIsOpen: (open: boolean) => void;
}

export const Modal = ({ children, setIsOpen }: Props) => (
  <div
    aria-hidden="true"
    className="h-modal fixed top-0 right-0 left-0 z-30 h-full w-full overflow-y-auto overflow-x-hidden bg-black/60 md:inset-0"
    onClick={() => setIsOpen(false)}
  >
    <div className="z-50 flex h-screen w-full items-center justify-center p-4">
      {/* Modal content */}
      {children}
    </div>
  </div>
);
