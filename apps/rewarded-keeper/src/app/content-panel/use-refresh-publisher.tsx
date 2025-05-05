import { cloneDeep } from 'lodash';
import { Publishers, Reports } from '../data';
import { Flags } from '../data/flags';
import { Publisher, PublisherActivityStatus, Report } from '../types';
import { getLastSixMonths } from '../utils';
import { useMemo } from 'react';

export function useRefreshPublisher(publisher: Publisher) {
  return useMemo(
    () => async () => {
      let reports: Report[] = [];
      try {
        reports = await Reports.byPublisherId(publisher.id!);
      } catch (e) {
        Flags.raiseError({
          title: 'Unable to refresh publisher',
          detail: (e as Error).message,
        });
        return;
      }

      const lastSixMonthsReports = getLastSixMonths()
        .map((month) => reports.find((r) => r.monthId === month.getKey()))
        .filter((r) => r);

      const publisherCopy = cloneDeep(publisher);
      if (lastSixMonthsReports.length === 0) {
        publisherCopy.activityStatus = PublisherActivityStatus.Inactive;
      } else if (lastSixMonthsReports.length < 6) {
        publisherCopy.activityStatus = PublisherActivityStatus.Irregular;
      } else {
        publisherCopy.activityStatus = PublisherActivityStatus.Active;
      }

      Publishers.save(publisherCopy);
    },
    [publisher?.id],
  );
}
