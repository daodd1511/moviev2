import { memo } from 'react';

const FooterComponent = () => (
  <footer className="text-slate-800 text-center text-sm">
    <p>
            Made with{' '}
      <span role="img" aria-label="heart" className="text-red-500">
            ❤️
      </span>{' '}
            by{' '} ducdao
    </p>
  </footer>
);

export const Footer = memo(FooterComponent);
