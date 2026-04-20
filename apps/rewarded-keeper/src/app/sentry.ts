type SentryEvent = {
  message?: string;
  exception?: {
    values?: Array<{
      type?: string;
      value?: string;
    }>;
  };
};

type SentryEventHint = {
  originalException?: unknown;
};

function isNotFoundErrorName(value: unknown): boolean {
  return typeof value === 'string' && value.toLowerCase() === 'notfounderror';
}

function isNotFoundErrorMessage(value: unknown): boolean {
  return typeof value === 'string' && /^NotFoundError\b/.test(value.trim());
}

function getOriginalExceptionName(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const maybeName = (error as { name?: unknown }).name;
  return typeof maybeName === 'string' ? maybeName : undefined;
}

export function isSentryNotFoundError(
  event: SentryEvent,
  hint?: SentryEventHint,
): boolean {
  const exceptionType = event.exception?.values?.[0]?.type;
  if (isNotFoundErrorName(exceptionType)) return true;

  if (isNotFoundErrorMessage(event.message)) {
    return true;
  }

  const originalExceptionName = getOriginalExceptionName(hint?.originalException);
  if (isNotFoundErrorName(originalExceptionName)) return true;

  return false;
}

export function createSentryOptions() {
  return {
    dsn: 'https://4db4e564397075ceb3867a67ecc0f978@o4509269957607424.ingest.us.sentry.io/4509269959573504',
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    beforeSend: (event: SentryEvent, hint?: SentryEventHint) => {
      if (isSentryNotFoundError(event, hint)) {
        return null;
      }
      return event;
    },
  };
}
