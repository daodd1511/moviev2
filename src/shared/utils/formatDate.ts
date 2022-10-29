export const formatToYear = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.getFullYear();
};
