import { useQuery } from '@tanstack/react-query';
import { CalendarService } from '@/api/services/calendarService';
export const CalendarQueries = {
  useList: (from: string, to: string, timezone = 'UTC') =>
    useQuery({
      queryKey: ['calendar', from, to, timezone],
      queryFn: () => CalendarService.list(from, to, timezone),
    }),
};
