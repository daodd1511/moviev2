export const formatToYear = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.getFullYear().toString();
};

export const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
};
