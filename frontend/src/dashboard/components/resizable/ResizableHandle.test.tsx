import { render } from 'spec/helpers/testing-library';

import ResizableHandle from 'src/dashboard/components/resizable/ResizableHandle';

/* eslint-disable react/jsx-pascal-case */
// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ResizableHandle', () => {
  test('should render a right resize handle', () => {
    const rendered = render(<ResizableHandle.right />);
    expect(
      rendered.container.querySelector('.resize-handle.resize-handle--right'),
    ).toBeVisible();
  });

  test('should render a bottom resize handle', () => {
    const rendered = render(<ResizableHandle.bottom />);
    expect(
      rendered.container.querySelector('.resize-handle.resize-handle--bottom'),
    ).toBeVisible();
  });

  test('should render a bottomRight resize handle', () => {
    const rendered = render(<ResizableHandle.bottomRight />);
    expect(
      rendered.container.querySelector(
        '.resize-handle.resize-handle--bottom-right',
      ),
    ).toBeVisible();
  });
});
/* eslint-enable react/jsx-pascal-case */
