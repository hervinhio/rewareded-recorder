import { Publisher } from '../types';

export const getPublisherName = (publisher: Publisher) => {
  return `${publisher.firstName} ${publisher.name} ${publisher.lastName}`.trim();
};
