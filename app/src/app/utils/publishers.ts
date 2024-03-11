import { Publisher, PublisherActivityStatus } from "../types";

export function filterNonInactiveAndNonPioneersOut(
    publisher: Publisher,
    groupId: string
  ): boolean {
    if (groupId === 'pioneers') {
      return !!publisher.isRegularPioneer;
    } else if(groupId === 'inactives') {
      return publisher.activityStatus === PublisherActivityStatus.Inactive;
    } else if (groupId !== 'pioneers' && groupId !== 'inactives') {
      return !publisher.isRegularPioneer && publisher.activityStatus !== PublisherActivityStatus.Inactive; 
    }
  
    return publisher.groupId === groupId;
  }
  