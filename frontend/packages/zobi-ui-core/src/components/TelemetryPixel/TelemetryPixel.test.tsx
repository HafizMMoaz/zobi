import { render } from '@zobi-ui/core/spec';
import { TelemetryPixel } from '.';

const OLD_ENV = process.env;

// restor the process after messing with it!
afterAll(() => {
  process.env = OLD_ENV;
});

test('should render', () => {
  const { container } = render(<TelemetryPixel />);
  expect(container).toBeInTheDocument();
});

test('should render the pixel link when FF is on', () => {
  process.env.SCARF_ANALYTICS = 'true';
  render(<TelemetryPixel />);

  const image = document.querySelector('img[src*="scarf.sh"]');
  expect(image).toBeInTheDocument();
});

test('should NOT render the pixel link when FF is off', () => {
  process.env.SCARF_ANALYTICS = 'false';
  render(<TelemetryPixel />);

  const image = document.querySelector('img[src*="scarf.sh"]');
  expect(image).not.toBeInTheDocument();
});
