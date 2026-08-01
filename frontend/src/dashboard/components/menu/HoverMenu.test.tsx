import { render, screen, userEvent } from 'spec/helpers/testing-library';

import HoverMenu from 'src/dashboard/components/menu/HoverMenu';

test('should render a div.hover-menu', () => {
  const { container } = render(<HoverMenu />);
  expect(container.querySelector('.hover-menu')).toBeInTheDocument();
});

test('should call onHover when mouse enters and leaves', () => {
  const onHover = jest.fn();
  render(<HoverMenu onHover={onHover} />);

  const hoverMenu = screen.getByTestId('hover-menu');

  userEvent.hover(hoverMenu);
  expect(onHover).toHaveBeenCalledWith({ isHovered: true });

  userEvent.unhover(hoverMenu);
  expect(onHover).toHaveBeenCalledWith({ isHovered: false });
});
