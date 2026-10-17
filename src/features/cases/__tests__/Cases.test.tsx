import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CaseDetail } from '../CaseDetail';
import { CasesList } from '../CasesList';
import { SAMPLE_CASES } from '../data';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

describe('CasesList', () => {
  const setup = async () => {
    const props = { onNewCase: jest.fn(), onOpenCase: jest.fn() };
    await renderScreen(<CasesList cases={SAMPLE_CASES} {...props} />);
    return props;
  };

  it('shows open cases first and opens one', async () => {
    const props = await setup();
    expect(screen.getByText("Brake pressure alarm won't clear")).toBeTruthy();
    expect(screen.getByText('Request: torque spec sheet')).toBeTruthy();
    expect(screen.queryByText('Cab A/C not cooling')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: /^P1, case 1042/ }));
    expect(props.onOpenCase).toHaveBeenCalledWith('1042');
    await fireEvent.press(screen.getByRole('button', { name: 'New' }));
    expect(props.onNewCase).toHaveBeenCalledTimes(1);
  });

  it('filters by status and machine', async () => {
    await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Status: Open' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Resolved' }));
    expect(screen.getByText('Cab A/C not cooling')).toBeTruthy();
    expect(screen.queryByText("Brake pressure alarm won't clear")).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Status: Resolved' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'All cases' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Machine: All machines' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'LD-0904' }));
    expect(screen.getByText('Hydraulic whine on lift')).toBeTruthy();
    expect(screen.queryByText('Cab A/C not cooling')).toBeNull();
  });
});

describe('CaseDetail', () => {
  it('shows the report and sends a trimmed reply', async () => {
    const onReply = jest.fn();
    const onOpenMachine = jest.fn();
    await renderScreen(
      <CaseDetail
        supportCase={SAMPLE_CASES[0]!}
        myInitials="JO"
        onReply={onReply}
        onOpenAttachment={jest.fn()}
        onOpenMachine={onOpenMachine}
      />,
    );
    await fireEvent.press(screen.getByRole('link', { name: 'HT-2201 · CAT 793F. View machine' }));
    expect(onOpenMachine).toHaveBeenCalledWith('HT-2201');
    expect(screen.getByText(/^E-2204 on every cold start/)).toBeTruthy();
    expect(screen.getByText('T. Meyer')).toBeTruthy();
    expect(screen.getByText('JO')).toBeTruthy(); // the user's own activity

    const send = screen.getByRole('button', { name: 'Send reply' });
    expect(send).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('Reply'), '  Parts arrive Thursday.  ');
    await fireEvent.press(send);
    await waitFor(() => expect(onReply).toHaveBeenCalledWith('Parts arrive Thursday.'));
    expect(screen.getByLabelText('Reply')).toHaveDisplayValue('');
  });
});
