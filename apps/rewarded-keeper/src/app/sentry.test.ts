import { createSentryOptions, isSentryNotFoundError } from './sentry';

describe('sentry filters', () => {
  it('identifies NotFoundError from event exception type', () => {
    expect(
      isSentryNotFoundError({
        exception: { values: [{ type: 'NotFoundError' }] },
      }),
    ).toBe(true);
  });

  it('identifies NotFoundError from original exception name', () => {
    const originalException = { name: 'NotFoundError' };
    expect(
      isSentryNotFoundError(
        {
          message: 'Something happened',
        },
        { originalException },
      ),
    ).toBe(true);
  });

  it('identifies NotFoundError from message prefix', () => {
    expect(
      isSentryNotFoundError({
        message: "NotFoundError: Failed to execute 'removeChild' on 'Node'",
      }),
    ).toBe(true);
  });

  it('does not filter unrelated errors', () => {
    expect(
      isSentryNotFoundError(
        {
          message: 'TypeError: Cannot read properties of undefined',
          exception: { values: [{ type: 'TypeError' }] },
        },
        { originalException: { name: 'TypeError' } },
      ),
    ).toBe(false);
  });

  it('beforeSend drops NotFoundError events', () => {
    const options = createSentryOptions();
    const result = options.beforeSend(
      { exception: { values: [{ type: 'NotFoundError' }] } },
      undefined,
    );
    expect(result).toBeNull();
  });

  it('beforeSend keeps non-NotFoundError events', () => {
    const options = createSentryOptions();
    const event = { exception: { values: [{ type: 'TypeError' }] } };
    const result = options.beforeSend(event, undefined);
    expect(result).toBe(event);
  });
});
