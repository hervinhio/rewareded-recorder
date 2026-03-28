import { cloneDeep } from "lodash";
import { Publisher, PublisherActivityStatus, Report } from "../types";
import { getLastSixMonths } from "../utils";
import { Flags } from "./flags";
import { Reports } from "./reports";
import { Publishers } from "./publishers";

export async function refreshPublisher(publisher: Publisher, shouldSave = true, shouldShowFlags = true): Promise<Publisher> {
    let legacyReports: Report[] = [];
    try {
      legacyReports = await Reports.byPublisherId(publisher.id!);
    } catch (e) {
      Flags.raiseError({
        title: 'Unable to refresh publisher',
        detail: (e as Error).message,
      });
      return publisher;
    }

    // Combine legacy Repports collection with the new publisher-embedded reports,
    // deduplicating by id. Embedded (new) reports take precedence on collision.
    const reportsById = new Map<string, Report>();
    for (const report of legacyReports) {
      reportsById.set(report.id, report);
    }
    for (const report of (publisher.reports ?? [])) {
      reportsById.set(report.id, report);
    }
    const reports = Array.from(reportsById.values());

    const lastSixMonthsReports = getLastSixMonths()
      .map((month) => reports.find((r) => r.monthId === month.getKey()))
      .filter((r) => r?.active || (r?.hours ?? 0) >= 1);

    const publisherCopy = cloneDeep(publisher);
    publisherCopy.reports = reports;
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
