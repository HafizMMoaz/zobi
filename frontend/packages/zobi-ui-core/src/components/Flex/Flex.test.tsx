
import { render } from '@zobi-ui/core/spec';
import { Flex } from '.';

test('should render', () => {
  const { container } = render(
    <Flex>
      <p>Item</p>
    </Flex>,
  );
  expect(container).toBeInTheDocument();
});
