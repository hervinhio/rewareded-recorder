import { cloneDeep } from "lodash";
import { Publisher, PublisherActivityStatus, Report } from "../types";
import { getLastSixMonths } from "../utils";
import { Flags } from "./flags";
import { Reports } from "./reports";
import { Publishers } from "./publishers";

export async function refreshPublisher(publisher: Publisher, shouldSave = true, shouldShowFlags = true): Promise<Publisher> {
    let reports: Report[] = [];
    try {
      reports = await Reports.byPublisherId(publisher.id!);
    } catch (e) {
      Flags.raiseError({
        title: 'Unable to refresh publisher',
        detail: (e as Error).message,
      });
      return publisher;
    }

    const lastSixMonthsReports = getLastSixMonths()
      .map((month) => reports.find((r) => r.monthId === month.getKey()))
      .filter((r) => r);

    const publisherCopy = cloneDeep(publisher);
    if (lastSixMonthsReports.length === 0) {
      publisherCopy.activityStatus = PublisherActivityStatus.Inactive;
    } else if (lastSixMonthsReports.length < 6 && !lastSixMonthsReports.some(r => r!.isFirstReport)) {
      publisherCopy.activityStatus = PublisherActivityStatus.Irregular;
    } else {
      publisherCopy.activityStatus = PublisherActivityStatus.Active;
    }

    if (shouldSave) {
        await Publishers.save(publisherCopy, true, shouldShowFlags);
    }

    return publisherCopy;
  }
