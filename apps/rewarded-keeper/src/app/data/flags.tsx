import { FirebaseError } from 'firebase/app';
import { Events } from '../types';

export class Flags {
  static raiseError(error: unknown): void {
    const title = getErrorTitle(error);
    const description = getErrorMessage(error);

    Events.emit('message', { title, message: description, severity: 'error' });
  }

  static raiseSuccess(data: { title: string; description?: string }): void {
    Events.emit('message', {
      title: data.title,
      message: data.description,
      severity: 'success',
    });
  }

  static raiseLoading(data: { title: string; id: string }): void {
    Events.emit('loading_start', data);
  }

  static dismissLoading(id: string): void {
    Events.emit('loading_end', { id });
  }
}

function getErrorTitle(error: unknown): string {
  const defaultTitle = 'An error has occured';

  if (error instanceof FirebaseError) {
    return `${error.name} ${error.code}`;
  }

  if (error instanceof Error) {
    return error.name || defaultTitle;
  }

  return defaultTitle;
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof FirebaseError) {
    return error.message || error.stack;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') return error;

  return undefined;
}
