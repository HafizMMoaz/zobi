
import { isValidElement } from 'react';
import { render, screen } from '@zobi.dev/core/spec';
import { CachedLabel } from '.';
import type { CacheLabelProps } from './types';

const defaultProps = {
  onClick: () => {},
  cachedTimestamp: '2017-01-01',
};

const setup = (props: CacheLabelProps) => <CachedLabel {...props} />;

describe('CachedLabel', () => {
  test('is valid', () => {
    expect(isValidElement(<CachedLabel {...defaultProps} />)).toBe(true);
  });

  test('renders', () => {
    render(setup(defaultProps));

    const label = screen.getByText(/cached/i);
    expect(label).toBeVisible();
  });
});
