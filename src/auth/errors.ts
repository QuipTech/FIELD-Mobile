const TOO_MANY = 'Too many attempts. Wait a few minutes and try again.';
const WRONG_CREDENTIALS = 'Incorrect email or password.';

/**
 * Maps Cognito/Amplify errors to user-facing copy. Unknown-user and wrong-password read the
 * same so the form doesn't reveal which emails have accounts.
 */
export function authErrorMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message : '';

  switch (name) {
    case 'NotAuthorizedException':
      return /attempts exceeded/i.test(message) ? TOO_MANY : WRONG_CREDENTIALS;
    case 'UserNotFoundException':
      return WRONG_CREDENTIALS;
    case 'UsernameExistsException':
      return 'An account with this email already exists. Sign in instead.';
    case 'CodeMismatchException':
      return 'That code is incorrect. Check it and try again.';
    case 'ExpiredCodeException':
      return 'That code has expired. Request a new one.';
    case 'InvalidPasswordException':
      return "That password doesn't meet the requirements.";
    case 'LimitExceededException':
    case 'TooManyRequestsException':
    case 'TooManyFailedAttemptsException':
      return TOO_MANY;
    case 'OAuthSignInException':
      return "Couldn't finish signing in with that account. Please try again.";
    case 'NetworkError':
      return 'No connection. Check your network and try again.';
    case 'InvalidParameterException':
      return /phone/i.test(message)
        ? 'Enter your phone number with its country code, e.g. +61 400 123 456.'
        : 'Some details are invalid. Check them and try again.';
    case 'ApiError':
      // FIELD API (NestJS) messages are written for people, e.g. a phone format rule.
      return message || 'Something went wrong. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export const isAuthError = (error: unknown, name: string) =>
  error instanceof Error && error.name === name;
