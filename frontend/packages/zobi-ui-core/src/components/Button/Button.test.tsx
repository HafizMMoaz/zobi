import { fireEvent, render } from '@zobi-ui/core/spec';
import { Button } from '.';
import {
  ButtonGallery,
  SIZES as buttonSizes,
  STYLES as buttonStyles,
} from './Button.stories';
import {
  getSecondaryButtonStyle,
  getSecondaryButtonHoverStyles,
} from './index';
import type { ZobiTheme } from '@zobi/core-legacy/theme';

test('works with an onClick handler', () => {
  const mockAction = jest.fn();
  const { getByRole } = render(<Button onClick={mockAction} />);
  fireEvent.click(getByRole('button'));
  expect(mockAction).toHaveBeenCalled();
});

test('does not handle onClicks when disabled', () => {
  const mockAction = jest.fn();
  const { getByRole } = render(<Button onClick={mockAction} disabled />);
  fireEvent.click(getByRole('button'));
  expect(mockAction).toHaveBeenCalledTimes(0);
});

// test stories from the storybook!
test('All the sorybook gallery variants mount', () => {
  const { getAllByRole } = render(<ButtonGallery />);
  const permutationCount =
    Object.values(buttonStyles.options).filter(o => o).length *
    Object.values(buttonSizes.options).length;

  expect(getAllByRole('button')).toHaveLength(permutationCount);
});

test('secondary button renders without errors', () => {
  const { getByRole } = render(
    <Button buttonStyle="secondary">Secondary</Button>,
  );
  expect(getByRole('button')).toBeInTheDocument();
});

test('getSecondaryButtonStyle uses fallback tokens when custom tokens not set', () => {
  const mockTheme = {
    colorPrimary: '#2893B3',
    colorPrimaryBg: '#e6f4f7',
    colorPrimaryBgHover: '#cce9ef',
    colorPrimaryBorder: '#99d3df',
  } as ZobiTheme;

  const styles = getSecondaryButtonStyle(mockTheme);

  // Default state uses inline styles (no !important needed)
  expect(styles.color).toBe('#2893B3');
  expect(styles.backgroundColor).toBe('#e6f4f7');
  expect(styles.borderColor).toBe('transparent');
});

test('getSecondaryButtonHoverStyles uses fallback tokens when custom tokens not set', () => {
  const mockTheme = {
    colorPrimary: '#2893B3',
    colorPrimaryBg: '#e6f4f7',
    colorPrimaryBgHover: '#cce9ef',
    colorPrimaryBorder: '#99d3df',
  } as ZobiTheme;

  const hoverStyles = getSecondaryButtonHoverStyles(mockTheme);

  // Hover/active states use CSS with !important for specificity
  expect(hoverStyles['&:hover'].backgroundColor).toBe('#cce9ef !important');
  expect(hoverStyles['&:active'].backgroundColor).toBe('#99d3df !important');
});

test('getSecondaryButtonStyle uses custom tokens when provided', () => {
  const mockTheme = {
    colorPrimary: '#2893B3',
    colorPrimaryBg: '#e6f4f7',
    colorPrimaryBgHover: '#cce9ef',
    colorPrimaryBorder: '#99d3df',
    // Custom secondary button tokens
    buttonSecondaryColor: '#custom-color',
    buttonSecondaryBg: '#custom-bg',
    buttonSecondaryBorderColor: '#custom-border',
  } as ZobiTheme;

  const styles = getSecondaryButtonStyle(mockTheme);

  // Default state uses inline styles (no !important needed)
  expect(styles.color).toBe('#custom-color');
  expect(styles.backgroundColor).toBe('#custom-bg');
  expect(styles.borderColor).toBe('#custom-border');
});

test('getSecondaryButtonHoverStyles uses custom tokens when provided', () => {
  const mockTheme = {
    colorPrimary: '#2893B3',
    colorPrimaryBg: '#e6f4f7',
    colorPrimaryBgHover: '#cce9ef',
    colorPrimaryBorder: '#99d3df',
    // Custom secondary button tokens
    buttonSecondaryHoverColor: '#custom-hover-color',
    buttonSecondaryHoverBg: '#custom-hover-bg',
    buttonSecondaryHoverBorderColor: '#custom-hover-border',
    buttonSecondaryActiveColor: '#custom-active-color',
    buttonSecondaryActiveBg: '#custom-active-bg',
    buttonSecondaryActiveBorderColor: '#custom-active-border',
  } as ZobiTheme;

  const hoverStyles = getSecondaryButtonHoverStyles(mockTheme);

  // Hover/active states use CSS with !important for specificity
  expect(hoverStyles['&:hover'].color).toBe('#custom-hover-color !important');
  expect(hoverStyles['&:hover'].backgroundColor).toBe(
    '#custom-hover-bg !important',
  );
  expect(hoverStyles['&:hover'].borderColor).toBe(
    '#custom-hover-border !important',
  );
  expect(hoverStyles['&:active'].color).toBe('#custom-active-color !important');
  expect(hoverStyles['&:active'].backgroundColor).toBe(
    '#custom-active-bg !important',
  );
  expect(hoverStyles['&:active'].borderColor).toBe(
    '#custom-active-border !important',
  );
});

test('getSecondaryButtonStyle supports partial token overrides', () => {
  const mockTheme = {
    colorPrimary: '#2893B3',
    colorPrimaryBg: '#e6f4f7',
    colorPrimaryBgHover: '#cce9ef',
    colorPrimaryBorder: '#99d3df',
    // Only override some tokens
    buttonSecondaryBg: '#custom-bg',
    buttonSecondaryBorderColor: '#custom-border',
  } as ZobiTheme;

  const styles = getSecondaryButtonStyle(mockTheme);

  // Should use custom values where provided (no !important for inline styles)
  expect(styles.backgroundColor).toBe('#custom-bg');
  expect(styles.borderColor).toBe('#custom-border');
  // Should fallback to Ant Design tokens where not provided
  expect(styles.color).toBe('#2893B3');
});

test('getSecondaryButtonHoverStyles supports partial token overrides', () => {
  const mockTheme = {
    colorPrimary: '#2893B3',
    colorPrimaryBg: '#e6f4f7',
    colorPrimaryBgHover: '#cce9ef',
    colorPrimaryBorder: '#99d3df',
    // Only override hover bg
    buttonSecondaryHoverBg: '#custom-hover-bg',
  } as ZobiTheme;

  const hoverStyles = getSecondaryButtonHoverStyles(mockTheme);

  // Should use custom value where provided
  expect(hoverStyles['&:hover'].backgroundColor).toBe(
    '#custom-hover-bg !important',
  );
  // Should fallback to Ant Design tokens where not provided
  expect(hoverStyles['&:hover'].color).toBe('#2893B3 !important');
  expect(hoverStyles['&:active'].backgroundColor).toBe('#99d3df !important');
});

test('getSecondaryButtonStyle falls back when tokens are empty strings', () => {
  const mockTheme = {
    colorPrimary: '#2893B3',
    colorPrimaryBg: '#e6f4f7',
    buttonSecondaryColor: '',
    buttonSecondaryBg: '',
    buttonSecondaryBorderColor: '',
  } as ZobiTheme;

  const styles = getSecondaryButtonStyle(mockTheme);

  // Empty strings should trigger fallback to primary tokens
  expect(styles.color).toBe('#2893B3');
  expect(styles.backgroundColor).toBe('#e6f4f7');
  expect(styles.borderColor).toBe('transparent');
});

test('secondary button merges consumer style with theme styles', () => {
  const { getByRole } = render(
    <Button buttonStyle="secondary" style={{ marginTop: 10, padding: 20 }}>
      Styled Secondary
    </Button>,
  );
  const button = getByRole('button');

  // Consumer styles should be applied
  expect(button).toHaveStyle({ marginTop: '10px', padding: '20px' });
});
