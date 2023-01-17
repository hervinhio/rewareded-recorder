import { Publisher } from '../types';

export const getPublisherName = (publisher?: Publisher) => {
  if (!publisher) {
    return '';
  }

  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`.trim();
};
