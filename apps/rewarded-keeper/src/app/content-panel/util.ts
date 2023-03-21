import { Publisher } from '../types';

export const getPublisherName = (publisher?: Publisher) => {
  if (!publisher || publisher.id === 'unassociated') {
    return 'Non associé ou invalide';
  }

  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`.trim();
};
