import { useMemo } from 'react';
import { refreshPublisher } from '../data/refresh-publisher';

export function useRefreshPublisher() {
  return useMemo(() => refreshPublisher, []);
}
