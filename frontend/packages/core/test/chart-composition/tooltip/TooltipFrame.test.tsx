import '@testing-library/jest-dom';
import { TooltipFrame } from '@zobi.dev/core';
import { render, screen } from '@testing-library/react';

describe('TooltipFrame', () => {
  test('sets className', () => {
    const { container } = render(
      <TooltipFrame className="test-class">
        <span>Hi!</span>
      </TooltipFrame>,
    );
    expect(screen.getByText('Hi!')).toBeInTheDocument();
    expect(container.querySelector('.test-class')).toBeInTheDocument();
  });

  test('renders', () => {
    const { container } = render(
      <TooltipFrame>
        <span>Hi!</span>
      </TooltipFrame>,
    );
    expect(container.querySelectorAll('span')).toHaveLength(1);
    expect(container.querySelector('span')).toHaveTextContent('Hi!');
  });
});
