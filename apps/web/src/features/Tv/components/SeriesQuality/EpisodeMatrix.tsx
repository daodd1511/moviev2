import type { CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';

import { QUALITY_BAND_STYLES } from './QualityLegend';

import { EpisodeMatrixCell, EpisodeMatrixRow, getQualityBand } from '../../utils/seriesQuality';

import { Episode, Season, SeasonDetail } from '@/models';

/** A requested season column and its independent query state. */
export type QualitySeasonColumn =
  | {
      readonly detail: SeasonDetail;
      readonly kind: 'loaded';
      readonly season: Season;
    }
  | {
      readonly kind: 'loading';
      readonly season: Season;
    }
  | {
      readonly kind: 'error';
      readonly retry: () => void;
      readonly season: Season;
    };

/** Rated cell selection passed to the in-page inspector. */
export interface EpisodeSelection {
  readonly detail: SeasonDetail;
  readonly episode: Episode;
  readonly season: Season;
  readonly voteAverage: number;
}

interface Props {
  /** Requested season columns, including loading and failed columns. */
  readonly columns: readonly QualitySeasonColumn[];

  /** Matrix rows built from loaded season details. */
  readonly rows: readonly EpisodeMatrixRow[];

  /** Currently inspected rated cell. */
  readonly selection: EpisodeSelection | null;

  /** Selects a rated episode without leaving the matrix. */
  readonly onSelect: (selection: EpisodeSelection) => void;
}

const seasonLabel = (season: Season): string =>
  season.seasonNumber === 0 ? 'Specials' : `S${season.seasonNumber}`;

const getEpisodeRowHeight = (rowCount: number): string => {
  if (rowCount <= 10) {
    return '4rem';
  }

  const viewportShare = (72 / rowCount).toFixed(3);
  const chromeShare = (6 + (rowCount - 1) * 0.25) / rowCount;

  return `clamp(1.75rem, calc(${viewportShare}dvh - ${chromeShare.toFixed(3)}rem), 4rem)`;
};

const Cell = ({
  cell,
  column,
  episodeNumber,
  isSelected,
  isCompact,
  onSelect,
}: {
  readonly cell: EpisodeMatrixCell;
  readonly column: Extract<QualitySeasonColumn, { readonly kind: 'loaded' }>;
  readonly episodeNumber: number;
  readonly isSelected: boolean;
  readonly isCompact: boolean;
  readonly onSelect: (selection: EpisodeSelection) => void;
}) => {
  const valueSize = isCompact ? 'text-sm' : 'text-lg';

  if (cell.kind === 'nonexistent') {
    return (
      <span
        aria-label={`${seasonLabel(column.season)}, episode ${episodeNumber}, no episode at this position`}
        className={`flex h-full min-h-0 items-center justify-center rounded-md bg-[#173442] font-medium text-muted-foreground ${valueSize}`}
      >
        —
      </span>
    );
  }

  if (cell.kind === 'notRated') {
    return (
      <span
        aria-label={`${seasonLabel(column.season)}, episode ${episodeNumber}, not rated`}
        className={`flex h-full min-h-0 items-center justify-center rounded-md bg-[#173442] font-medium text-muted-foreground ${valueSize}`}
      >
        ?
      </span>
    );
  }

  const band = getQualityBand(cell.voteAverage);
  const cellStyle = band === 'notRated' ? '' : QUALITY_BAND_STYLES[band].cell;

  return (
    <button
      type="button"
      aria-label={`${seasonLabel(column.season)}, episode ${episodeNumber}, rated ${cell.voteAverage.toFixed(1)}`}
      aria-pressed={isSelected}
      className={`h-full min-h-0 rounded-md font-semibold tabular-nums transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-offset-2 aria-pressed:outline-2 aria-pressed:outline-foreground ${valueSize} ${cellStyle}`}
      onClick={() =>
        onSelect({
          detail: column.detail,
          episode: cell.episode,
          season: column.season,
          voteAverage: cell.voteAverage,
        })
      }
    >
      {cell.voteAverage.toFixed(1)}
    </button>
  );
};

/** Responsive cross-season episode-rating matrix. */
export const EpisodeMatrix = ({ columns, rows, selection, onSelect }: Props) => {
  if (columns.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center px-5 text-center text-sm text-muted-foreground">
        No numbered seasons are available for comparison.
      </div>
    );
  }

  const loadedColumns = columns.filter(
    (column): column is Extract<QualitySeasonColumn, { readonly kind: 'loaded' }> =>
      column.kind === 'loaded',
  );
  const loadedIndex = new Map(
    loadedColumns.map((column, index) => [column.season.seasonNumber, index]),
  );
  const isCompact = rows.length > 10;
  const matrixStyle: CSSProperties = {
    gridTemplateColumns: `3.25rem repeat(${columns.length}, minmax(6rem, 1fr))`,
    gridTemplateRows: `3rem repeat(${rows.length}, ${getEpisodeRowHeight(rows.length)})`,
    minWidth: `${3.25 + columns.length * 6.6}rem`,
  };

  return (
    <div className="overflow-x-auto" aria-label="Episode rating matrix">
      <div
        className={`grid gap-x-2 p-4 min-[590px]:p-6 ${isCompact ? 'gap-y-1' : 'gap-y-2'}`}
        data-density={isCompact ? 'compact' : 'standard'}
        style={matrixStyle}
      >
        <span
          aria-hidden="true"
          className="sticky top-0 left-0 z-30 bg-surface/95 backdrop-blur-md"
        />
        {columns.map(column => (
          <div
            key={column.season.id}
            className="sticky top-0 z-20 flex min-h-12 flex-col items-center justify-center bg-surface/95 px-1 text-center text-micro font-medium tracking-[0.13em] text-foreground uppercase backdrop-blur-md"
          >
            <span>{seasonLabel(column.season)}</span>
            {column.kind === 'error' ? (
              <button
                type="button"
                onClick={column.retry}
                className="mt-1 inline-flex items-center gap-1 text-[0.58rem] tracking-normal text-primary normal-case hover:underline"
              >
                <RotateCcw aria-hidden="true" className="size-2.5" />
                Retry
              </button>
            ) : null}
            {column.kind === 'loading' ? (
              <span className="mt-1 text-[0.58rem] tracking-normal text-muted-foreground normal-case">
                Loading
              </span>
            ) : null}
          </div>
        ))}

        {rows.map(row => (
          <div key={row.episodeNumber} className="contents">
            <span className="sticky left-0 z-10 flex h-full min-h-0 items-center bg-surface/95 text-xs font-medium tracking-[0.08em] text-muted-foreground backdrop-blur-md">
              E{String(row.episodeNumber).padStart(2, '0')}
            </span>
            {columns.map(column => {
              if (column.kind === 'loading') {
                return (
                  <span
                    key={column.season.id}
                    aria-label={`${seasonLabel(column.season)} loading`}
                    className={`flex h-full min-h-0 items-center justify-center rounded-md bg-[#173442] text-muted-foreground ${
                      isCompact ? 'text-sm' : 'text-lg'
                    }`}
                  >
                    …
                  </span>
                );
              }

              if (column.kind === 'error') {
                return (
                  <span
                    key={column.season.id}
                    aria-label={`${seasonLabel(column.season)} unavailable`}
                    className="flex h-full min-h-0 items-center justify-center rounded-md border border-danger/25 bg-danger/10 px-1 text-center text-micro font-medium text-danger"
                  >
                    Unavailable
                  </span>
                );
              }

              const cellIndex = loadedIndex.get(column.season.seasonNumber);
              const cell = cellIndex === undefined ? undefined : row.cells[cellIndex];
              if (cell === undefined) {
                return null;
              }

              return (
                <Cell
                  key={column.season.id}
                  cell={cell}
                  column={column}
                  episodeNumber={row.episodeNumber}
                  isSelected={
                    selection?.season.seasonNumber === column.season.seasonNumber &&
                    selection.episode.episodeNumber === row.episodeNumber
                  }
                  isCompact={isCompact}
                  onSelect={onSelect}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
