import { Publisher } from '../types';

export const getPublisherName = (publisher?: Publisher, optimizeNameDisplay = false) => {
  if (!publisher || publisher.id === 'unassociated') {
    return 'Non associé ou invalide';
  }

  if (optimizeNameDisplay && window.innerWidth <= 600 ) {
    return `${publisher.name} ${publisher.firstName}`.trim()
  }

  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`.trim();
};
