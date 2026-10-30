import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DeleteAccount, type DeleteAccountProps } from '../DeleteAccount';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function setup(props: Partial<DeleteAccountProps> = {}) {
  const all: DeleteAccountProps = {
    eligibility: { canDelete: true, blockedReason: null },
    onRetryLoad: jest.fn(),
    pendingChanges: 0,
    deleting: false,
    onDelete: jest.fn(),
    ...props,
  };
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <DeleteAccount {...all} />
    </SafeAreaProvider>,
  );
  return all;
}

describe('Delete account', () => {
  it('only deletes once DELETE is typed', async () => {
    const props = await setup();
    expect(screen.getByText(/permanently removes your profile, sign-in and AI/)).toBeTruthy();
    const button = screen.getByRole('button', { name: 'Delete account' });
    expect(button).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('Type DELETE to confirm'), 'delet');
    expect(button).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('Type DELETE to confirm'), 'DELETE');
    await fireEvent.press(button);
    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });

  it("explains why the organisation's last Owner can't", async () => {
    await setup({
      eligibility: {
        canDelete: false,
        blockedReason: "You're the only Owner of your organisation. Make another user an Owner.",
      },
    });
    expect(screen.getByText(/only Owner of your organisation/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Delete account' })).toBeNull();
  });

  it('warns about changes that would be lost, and shows a failed attempt', async () => {
    await setup({
      pendingChanges: 2,
      error: "We couldn't remove your sign-in right now. Nothing was deleted — please try again.",
    });
    expect(screen.getByText(/2 changes on this phone haven't uploaded yet/)).toBeTruthy();
    expect(screen.getByText(/Nothing was deleted/)).toBeTruthy();
  });
});
