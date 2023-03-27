import { SortBy, SortOrder } from '../enums/sort';

export const SORT_OPTIONS = [
  {
    display: 'Popularity Descending',
    value: {
      sortBy: SortBy.Popularity,
      sortOrder: SortOrder.Desc,
    },
  },
  {
    display: 'Release Date Descending',
    value: {
      sortBy: SortBy.ReleaseDate,
      sortOrder: SortOrder.Desc,
    },
  },
  {
    display: 'Revenue Descending',
    value: {
      sortBy: SortBy.Revenue,
      sortOrder: SortOrder.Desc,
    },
  },
  {
    display: 'Primary Release Date Descending',
    value: {
      sortBy: SortBy.PrimaryReleaseDate,
      sortOrder: SortOrder.Desc,
    },
  },
  {
    display: 'Original Title Ascending',
    value: {
      sortBy: SortBy.OriginalTitle,
      sortOrder: SortOrder.Asc,
    },
  },
  {
    display: 'Vote Average Descending',
    value: {
      sortBy: SortBy.VoteAverage,
      sortOrder: SortOrder.Desc,
    },
  },
  {
    display: 'Vote Count Descending',
    value: {
      sortBy: SortBy.VoteCount,
      sortOrder: SortOrder.Desc,
    },
  },
  {
    display: 'Rating Ascending',
    value: {
      sortBy: SortBy.Rating,
      sortOrder: SortOrder.Asc,
    },
  },
];
