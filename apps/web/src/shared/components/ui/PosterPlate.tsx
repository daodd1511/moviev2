import { ImgHTMLAttributes, ReactNode } from 'react';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  /** Image source. */
  readonly src: string;

  /** Alt text — required, no empty default. */
  readonly alt: string;

  /** Optional overlay content (e.g. A gradient caption), absolutely positioned over the image. */
  readonly children?: ReactNode;
}

export const PosterPlate = ({ src, alt, className, children, ...rest }: Props) => (
  <div
    className={`relative overflow-hidden rounded-md shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)] outline outline-1 outline-white/[0.14] ${className ?? ''}`}
  >
    <img src={src} alt={alt} className="block w-full" {...rest} />
    {children}
  </div>
);
