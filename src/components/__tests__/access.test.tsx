import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { useAccess } from '@/auth/access';
import { ApiError } from '@/lib/http';
import { Text } from '../Text/Text';
import { ErrorState } from '../ErrorState/ErrorState';
import { OtpInput } from '../Input/OtpInput';
import { RoleGate } from '../RoleGate/RoleGate';

jest.mock('@/auth/access', () => {
  const { create } = jest.requireActual('zustand');
  return { useAccess: create(() => ({ roles: [], permissions: [], loaded: true })) };
});

const signInAs = (roles: string[], permissions: string[]) =>
  act(() => useAccess.setState({ roles, permissions, loaded: true }));

describe('RoleGate', () => {
  const ui = (
    <>
      <RoleGate can="machines.edit">
        <Text>Edit machine</Text>
      </RoleGate>
      <RoleGate can={['billing.read', 'billing.manage']} fallback={<Text>Read-only plan</Text>}>
        <Text>Manage billing</Text>
      </RoleGate>
      <RoleGate allow={['admin']}>
        <Text>Admin KPIs</Text>
      </RoleGate>
      <RoleGate deny={['admin']}>
        <Text>My open cases</Text>
      </RoleGate>
    </>
  );

  it('hides admin-only parts from a technician', async () => {
    await signInAs(['technician'], ['billing.read']);
    await render(ui);
    expect(screen.queryByText('Edit machine')).toBeNull();
    expect(screen.getByText('Read-only plan')).toBeTruthy();
    expect(screen.queryByText('Admin KPIs')).toBeNull();
    expect(screen.getByText('My open cases')).toBeTruthy();
  });

  it('shows them for an admin, matching role names case-insensitively', async () => {
    await signInAs(['Admin'], ['machines.edit', 'billing.read', 'billing.manage']);
    await render(ui);
    expect(screen.getByText('Edit machine')).toBeTruthy();
    expect(screen.getByText('Manage billing')).toBeTruthy();
    expect(screen.getByText('Admin KPIs')).toBeTruthy();
    expect(screen.queryByText('My open cases')).toBeNull();
  });

  it('gates a custom tenant role by permission, not by name', async () => {
    await signInAs(['site-lead'], ['machines.edit']);
    await render(ui);
    expect(screen.getByText('Edit machine')).toBeTruthy();
    expect(screen.queryByText('Admin KPIs')).toBeNull();
  });
});

describe('ErrorState', () => {
  it('shows No access for a 403 without naming the item', async () => {
    const onPress = jest.fn();
    await render(
      <ErrorState
        error={new ApiError(403, 'Forbidden')}
        noAccessAction={{ label: 'Go to Knowledge', onPress }}
      />,
    );
    expect(screen.getByText('You do not have access to this content')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Go to Knowledge' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('offers Retry for other errors', async () => {
    const onRetry = jest.fn();
    await render(<ErrorState error={new ApiError(500, 'Boom')} onRetry={onRetry} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('OtpInput', () => {
  it('fills every box from a pasted code and reports completion', async () => {
    const onChange = jest.fn();
    const onComplete = jest.fn();
    await render(<OtpInput value="" onChange={onChange} onComplete={onComplete} />);
    await fireEvent.changeText(screen.getByLabelText('6-digit code'), '48 21-07');
    expect(onChange).toHaveBeenCalledWith('482107');
    expect(onComplete).toHaveBeenCalledWith('482107');
  });
});
