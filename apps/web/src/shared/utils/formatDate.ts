export const formatToYear = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.getFullYear().toString();
};

export const formatDate = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
};

/** Formats a date as `Aug 3, 2026`. */
export const formatMediumDate = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
