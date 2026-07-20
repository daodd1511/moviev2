import { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

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
  >
    <div className="z-50 h-screen w-full p-4" onClick={() => setIsOpen(false)}>
      {/* Modal content */}
      <div
        className="absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 transform"

        // Prevent click from bubbling up to the background
        onClick={e => e.stopPropagation()}
      >
        {children}
        {/* Close button */}
      </div>
      <button
        type="button"
        className="absolute top-4 right-12 h-10 w-10 rounded-full text-2xl text-white"
        onClick={() => setIsOpen(false)}
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  </div>
);
