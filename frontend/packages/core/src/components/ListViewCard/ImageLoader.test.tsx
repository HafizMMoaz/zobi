import fetchMock from 'fetch-mock';

import { render, screen } from '@zobi.dev/core/spec';
import { ImageLoader, type BackgroundPosition } from './ImageLoader';

global.URL.createObjectURL = jest.fn(() => '/local_url');
const blob = new Blob([], { type: 'image/png' });

beforeAll(() => {
  fetchMock.mockGlobal();
});

afterAll(() => {
  fetchMock.hardReset();
});

fetchMock.get(
  'glob:*/thumbnail',
  { body: blob, headers: { 'Content-Type': 'image/png' } },
  { name: 'thumbnail' },
);

describe('ImageLoader', () => {
  const defaultProps = {
    src: '/thumbnail',
    fallback: '/fallback',
    position: 'top' as BackgroundPosition,
  };

  const setup = (extraProps = {}) => {
    const props = { ...defaultProps, ...extraProps };
    return render(<ImageLoader {...props} />);
  };

  afterEach(() => fetchMock.clearHistory());

  test('is a valid element', async () => {
    setup();
    expect(await screen.findByTestId('image-loader')).toBeVisible();
  });

  test('fetches loads the image in the background', async () => {
    setup();
    expect(screen.getByTestId('image-loader')).toHaveAttribute(
      'src',
      '/fallback',
    );
    expect(fetchMock.callHistory.calls(/thumbnail/)).toHaveLength(1);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(await screen.findByTestId('image-loader')).toHaveAttribute(
      'src',
      '/local_url',
    );
  });

  test('displays fallback image when response is not an image', async () => {
    fetchMock.once('glob:*/thumbnail2', {}, { name: 'thumbnail2' });

    setup({ src: 'glob:*/thumbnail2' });
    expect(screen.getByTestId('image-loader')).toHaveAttribute(
      'src',
      '/fallback',
    );
    expect(fetchMock.callHistory.calls(/thumbnail2/)).toHaveLength(1);
    expect(await screen.findByTestId('image-loader')).toHaveAttribute(
      'src',
      '/fallback',
    );
  });
});
