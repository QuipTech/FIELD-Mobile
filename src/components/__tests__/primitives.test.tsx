import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../Button/Button';
import { Segmented } from '../Segmented/Segmented';

describe('Button', () => {
  it('fires onPress and exposes an accessible label', async () => {
    const onPress = jest.fn();
    await render(<Button label="Scan asset" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Scan asset' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled or loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} loading />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Segmented', () => {
  it('marks the selected option and reports changes', async () => {
    const onChange = jest.fn();
    const options = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ] as const;
    await render(
      <Segmented options={options} value="a" onChange={onChange} accessibilityLabel="Pick" />,
    );
    expect(screen.getByRole('tab', { name: 'Alpha' })).toBeSelected();
    await fireEvent.press(screen.getByRole('tab', { name: 'Beta' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
