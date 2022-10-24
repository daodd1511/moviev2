import { ReactNode } from 'react';

/* eslint-disable max-len */
interface Props {

  /** Content. */
  readonly children: ReactNode;

  /** Set modal open status. */
  readonly setIsOpen: (open: boolean) => void;
}

export const Modal = ({ children, setIsOpen }: Props) => (
  <div aria-hidden="true" className="overflow-y-auto bg-black/60 overflow-x-hidden fixed top-0 right-0 left-0 z-30 w-full md:inset-0 h-modal h-full" onClick={() => setIsOpen(false)}>
    <div className="p-4 w-full md:h-auto flex justify-center items-center z-50 h-screen">
      {/* Modal content */}
      {children}
    </div>
  </div>
);
