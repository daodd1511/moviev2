import { SortBy, SortOrder } from '../enums/sort';

export const SORT_OPTIONS = [
  {
    display: 'Popularity Descending',
    value: `${SortBy.Popularity}.${SortOrder.Desc}`,
  },
  {
    display: 'Release Date Descending',
    value: `${SortBy.ReleaseDate}.${SortOrder.Desc}`,
  },
  {
    display: 'Revenue Descending',
    value: `${SortBy.Revenue}.${SortOrder.Desc}`,
  },
  {
    display: 'Primary Release Date Descending',
    value: `${SortBy.PrimaryReleaseDate}.${SortOrder.Desc}`,
  },
  {
    display: 'Original Title Ascending',
    value: `${SortBy.OriginalTitle}.${SortOrder.Asc}`,
  },
  {
    display: 'Vote Average Descending',
    value: `${SortBy.VoteAverage}.${SortOrder.Desc}`,
  },
  {
    display: 'Vote Count Descending',
    value: `${SortBy.VoteCount}.${SortOrder.Desc}`,
  },
  {
    display: 'Rating Ascending',
    value: `${SortBy.Rating}.${SortOrder.Asc}`,
  },
];
