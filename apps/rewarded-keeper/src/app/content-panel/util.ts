import { Publisher } from '../types';
import { toTitleCase } from '../utils/publishers';

export const getPublisherName = (publisher?: Publisher, optimizeNameDisplay = false) => {
  if (!publisher || publisher.id === 'unassociated') {
    return 'Non associé ou invalide';
  }

  if (optimizeNameDisplay && window.innerWidth <= 600) {
    return toTitleCase([publisher.name, publisher.firstName].filter(Boolean).join(' '));
  }

  return toTitleCase(
    [publisher.name, publisher.lastName, publisher.firstName].filter(Boolean).join(' ')
  );
};
