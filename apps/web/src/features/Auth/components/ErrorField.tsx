interface Props {

  /** Error value. */
  readonly error: string;
}

export const ErrorField = ({ error }: Props) => <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{error}</span>;
