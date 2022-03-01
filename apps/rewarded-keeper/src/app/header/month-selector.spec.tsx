import { render } from '@testing-library/react';
import { MonthSelector } from './month-selector';

const onMonthSelected = jest.fn();

describe('MonthSelector', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MonthSelector onMonthSelected={onMonthSelected} />
    );

    expect(baseElement).toBeTruthy();
  });
});
