import handleScroll from '.';

jest.useFakeTimers();
jest.spyOn(global, 'clearInterval');

const { scroll } = window;

afterAll(() => {
  window.scroll = scroll;
});

test('calling: "NOT_SCROLL_TOP" ,"SCROLL_TOP", "NOT_SCROLL_TOP"', () => {
  window.scroll = jest.fn();
  document.documentElement.scrollTop = 500;

  handleScroll('NOT_SCROLL_TOP');

  expect(clearInterval).not.toHaveBeenCalled();

  handleScroll('SCROLL_TOP');

  handleScroll('NOT_SCROLL_TOP');
  expect(clearInterval).toHaveBeenCalledWith(expect.any(Number));
});
