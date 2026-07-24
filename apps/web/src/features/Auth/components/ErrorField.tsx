interface Props {

  /** Error value. */
  readonly error: string;
}

export const ErrorField = ({ error }: Props) => (
  <span className="mt-1 ml-1 flex items-center text-xs font-medium tracking-wide text-destructive">{error}</span>
);
