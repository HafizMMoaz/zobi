import { render } from 'spec/helpers/testing-library';

import ResizableContainer, {
  ResizableContainerProps,
} from 'src/dashboard/components/resizable/ResizableContainer';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ResizableContainer', () => {
  const props = {
    editMode: false,
    id: 'id',
    heightMultiple: 0,
    widthMultiple: 0,
  };

  const setup = (overrides?: ResizableContainerProps) => (
    <ResizableContainer {...props} {...overrides} />
  );

  test('should render a Resizable container', () => {
    const rendered = render(setup());
    const resizableContainer = rendered.container.querySelector(
      '.resizable-container',
    );
    expect(resizableContainer).toBeVisible();
  });
});
