import { Publisher, PublisherActivityStatus } from "../types";

export function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (char) => char.toUpperCase());
}

export function filterNonInactiveAndNonPioneersOut(
    publisher: Publisher,
    groupId: string
  ): boolean {
    if (groupId === 'pioneers') {
      return !!publisher.isRegularPioneer;
    } else if(groupId === 'inactives') {
      return publisher.activityStatus === PublisherActivityStatus.Inactive;
    } else if (groupId === 'elders') {
      return !!publisher.isElder;
    } else if (groupId === 'ministerial-servants') {
      return !!publisher.isMinisterialServant;
    } else if (groupId !== 'pioneers' && groupId !== 'inactives' && groupId !== 'elders' && groupId !== 'ministerial-servants') {
      return !publisher.isRegularPioneer && publisher.activityStatus !== PublisherActivityStatus.Inactive; 
    }
  
    return publisher.groupId === groupId;
  }
  