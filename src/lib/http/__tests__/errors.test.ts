import { errorMessage, toApiError } from '../errors';

const response = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('API errors', () => {
  it('explains an inactive machine instead of a generic 403', async () => {
    const error = await toApiError(
      response(403, {
        statusCode: 403,
        code: 'machine_inactive',
        message: 'Machine inactive',
        error: 'Forbidden',
      }),
    );
    expect(error.code).toBe('machine_inactive');
    expect(errorMessage(error)).toBe(
      "This machine isn't active. An admin can activate it on the website.",
    );
  });

  it('joins validation messages sent as a list', async () => {
    const error = await toApiError(
      response(400, {
        statusCode: 400,
        message: ['a is required', 'b is too long'],
        error: 'Bad Request',
      }),
    );
    expect(errorMessage(error)).toBe('a is required\nb is too long');
  });
});
