import * as amplifyAuth from 'aws-amplify/auth';

import { authErrorMessage } from '../errors';
import { requestPasswordReset, signInWithEmail, signInWithProvider, verifyEmail } from '../flows';
import { useSession } from '../session';

jest.mock('aws-amplify/auth', () => ({
  signIn: jest.fn(),
  signInWithRedirect: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  confirmSignIn: jest.fn(),
  confirmSignUp: jest.fn(),
  autoSignIn: jest.fn(),
  resendSignUpCode: jest.fn(),
  resetPassword: jest.fn(),
  confirmResetPassword: jest.fn(),
  getCurrentUser: jest.fn(),
}));
jest.mock('aws-amplify/utils', () => ({ Hub: { listen: jest.fn() } }));

const auth = jest.mocked(amplifyAuth);
const cognitoError = (name: string, message = name) => Object.assign(new Error(message), { name });
const step = (signInStep: string) => ({ isSignedIn: false, nextStep: { signInStep } }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  useSession.setState({ status: 'signedOut' });
});

describe('signInWithEmail', () => {
  it('signs in when Cognito is done', async () => {
    auth.signIn.mockResolvedValue(step('DONE'));
    await expect(signInWithEmail('a@b.co', 'pw')).resolves.toBe('done');
    expect(auth.signIn).toHaveBeenCalledWith({ username: 'a@b.co', password: 'pw' });
    expect(useSession.getState().status).toBe('signedIn');
  });

  it('resends a code for unverified accounts', async () => {
    auth.signIn.mockResolvedValue(step('CONFIRM_SIGN_UP'));
    await expect(signInWithEmail('a@b.co', 'pw')).resolves.toBe('confirmSignUp');
    expect(auth.resendSignUpCode).toHaveBeenCalledWith({ username: 'a@b.co' });
    expect(useSession.getState().status).toBe('signedOut');
  });

  it.each([
    ['RESET_PASSWORD', 'resetPassword'],
    ['CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED', 'newPasswordRequired'],
    ['CONFIRM_SIGN_IN_WITH_SMS_CODE', 'unsupported'],
  ])('maps %s to %s', async (signInStep, outcome) => {
    auth.signIn.mockResolvedValue(step(signInStep));
    await expect(signInWithEmail('a@b.co', 'pw')).resolves.toBe(outcome);
  });

  it('treats an existing session as signed in', async () => {
    auth.signIn.mockRejectedValue(cognitoError('UserAlreadyAuthenticatedException'));
    await expect(signInWithEmail('a@b.co', 'pw')).resolves.toBe('done');
    expect(useSession.getState().status).toBe('signedIn');
  });

  it('rethrows wrong credentials', async () => {
    auth.signIn.mockRejectedValue(cognitoError('NotAuthorizedException'));
    await expect(signInWithEmail('a@b.co', 'pw')).rejects.toThrow();
  });
});

describe('signInWithProvider', () => {
  it('signs in after the hosted UI completes', async () => {
    auth.signInWithRedirect.mockResolvedValue(undefined);
    await expect(signInWithProvider('Google')).resolves.toBe(true);
    expect(auth.signInWithRedirect).toHaveBeenCalledWith({ provider: 'Google' });
    expect(useSession.getState().status).toBe('signedIn');
  });

  it('stays signed out, without an error, when the browser is closed', async () => {
    auth.signInWithRedirect.mockRejectedValue(cognitoError('OAuthSignInException', 'canceled'));
    await expect(signInWithProvider('Apple')).resolves.toBe(false);
    expect(useSession.getState().status).toBe('signedOut');
  });

  it('rethrows real OAuth failures', async () => {
    auth.signInWithRedirect.mockRejectedValue(
      cognitoError('OAuthSignInException', 'invalid_request'),
    );
    await expect(signInWithProvider('Google')).rejects.toThrow('invalid_request');
  });
});

describe('verifyEmail', () => {
  it('auto signs in after sign-up in this session', async () => {
    auth.confirmSignUp.mockResolvedValue({
      isSignUpComplete: true,
      nextStep: { signUpStep: 'COMPLETE_AUTO_SIGN_IN' },
    } as never);
    auth.autoSignIn.mockResolvedValue(step('DONE'));
    await expect(verifyEmail('a@b.co', '123456')).resolves.toBe(true);
    expect(useSession.getState().status).toBe('signedIn');
  });

  it('asks for a sign-in when auto sign-in is not available', async () => {
    auth.confirmSignUp.mockResolvedValue({
      isSignUpComplete: true,
      nextStep: { signUpStep: 'DONE' },
    } as never);
    await expect(verifyEmail('a@b.co', '123456')).resolves.toBe(false);
    expect(auth.autoSignIn).not.toHaveBeenCalled();
  });
});

describe('requestPasswordReset', () => {
  it("doesn't reveal unknown emails", async () => {
    auth.resetPassword.mockRejectedValue(cognitoError('UserNotFoundException'));
    await expect(requestPasswordReset('nobody@b.co')).resolves.toBeUndefined();
  });

  it('surfaces other failures', async () => {
    auth.resetPassword.mockRejectedValue(cognitoError('LimitExceededException'));
    await expect(requestPasswordReset('a@b.co')).rejects.toThrow();
  });
});

describe('authErrorMessage', () => {
  it.each([
    ['NotAuthorizedException', 'Incorrect username or password.', 'Incorrect email or password.'],
    ['UserNotFoundException', '', 'Incorrect email or password.'],
    [
      'NotAuthorizedException',
      'Password attempts exceeded',
      'Too many attempts. Wait a few minutes and try again.',
    ],
    ['UsernameExistsException', '', 'An account with this email already exists. Sign in instead.'],
    ['CodeMismatchException', '', 'That code is incorrect. Check it and try again.'],
    ['SomethingNew', '', 'Something went wrong. Please try again.'],
  ])('%s (%s)', (name, message, expected) => {
    expect(authErrorMessage(cognitoError(name, message))).toBe(expected);
  });
});
