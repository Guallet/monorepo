import { useEffect, useMemo, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface DashboardDateRangeOptions {
  daysAgo?: number;
  yearsAgo?: number;
}

/** Keeps dashboard date ranges current while a screen is focused. */
export function useDashboardDateRange({
  daysAgo = 0,
  yearsAgo = 0,
}: DashboardDateRangeOptions = {}) {
  const isFocused = useIsFocused();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!isFocused) return;

    const refresh = () => setNow(new Date());
    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') refresh();
    };

    refresh();
    const subscription = AppState.addEventListener('change', onAppStateChange);
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleNextRefresh = () => {
      const nextDay = new Date();
      nextDay.setHours(24, 0, 0, 0);
      timeout = setTimeout(
        () => {
          refresh();
          scheduleNextRefresh();
        },
        Math.max(nextDay.getTime() - Date.now(), 1000),
      );
    };

    scheduleNextRefresh();

    return () => {
      subscription.remove();
      clearTimeout(timeout);
    };
  }, [isFocused]);

  const startDate = useMemo(() => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date;
  }, [daysAgo, now, yearsAgo]);

  const endDate = useMemo(() => new Date(now), [now]);

  return { startDate, endDate };
}
