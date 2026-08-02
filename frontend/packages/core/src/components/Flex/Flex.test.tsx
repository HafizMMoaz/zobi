import { render } from '@zobi.dev/core/spec';
import { Flex } from '.';

test('should render', () => {
  const { container } = render(
    <Flex>
      <p>Item</p>
    </Flex>,
  );
  expect(container).toBeInTheDocument();
});
