/* eslint-disable max-len */
interface Props {

  /** Custom class. */
  readonly className?: string;
}

export const Loader = ({ className }: Props) => (
  <div className={`text-center flex h-full w-full items-center justify-center ${className ?? ''}`}>
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status">
      <span
        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
      >Loading...</span
      >
    </div>
  </div>
);
