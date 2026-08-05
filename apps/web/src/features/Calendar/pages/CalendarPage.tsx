import { useState } from 'react';
import { CalendarQueries } from '@/stores/queries/calendarQueries';
const range = () => {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
};
export const CalendarPage = () => {
  const [view, setView] = useState<'month' | 'agenda'>('month');
  const { from, to } = range();
  const { data = [], isPending, isError, refetch } = CalendarQueries.useList(from, to);
  return (
    <main className="page-shell">
      <h1 className="text-2xl font-semibold">Release calendar</h1>
      <div className="mt-4" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'month'}
          onClick={() => setView('month')}
        >
          Month
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'agenda'}
          onClick={() => setView('agenda')}
        >
          Agenda
        </button>
      </div>
      {isPending && <p>Loading calendar…</p>}
      {isError && (
        <button type="button" onClick={() => void refetch()}>
          Retry calendar
        </button>
      )}
      {!isPending && !isError && (
        <ul className={view === 'month' ? 'mt-6 grid grid-cols-2 gap-3' : 'mt-6 space-y-3'}>
          {data.map(item => (
            <li key={`${item.mediaType}:${item.tmdbId}`} className="rounded border p-3">
              <strong>{item.title}</strong>
              <p>{item.releaseDate ?? 'Release date unknown'}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};
