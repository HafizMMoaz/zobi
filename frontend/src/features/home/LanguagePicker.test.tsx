import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { Menu } from '@zobi.dev/core/components/Menu';
import { useLanguageMenuItems } from './LanguagePicker';

const mockedProps = {
  locale: 'en',
  languages: {
    en: {
      flag: 'us',
      name: 'English',
      url: '/lang/en',
    },
    it: {
      flag: 'it',
      name: 'Italian',
      url: '/lang/it',
    },
  },
};

const TestLanguagePicker = ({ locale, languages }: typeof mockedProps) => {
  const languageMenuItem = useLanguageMenuItems({ locale, languages });

  return (
    <Menu aria-label="Languages" items={[languageMenuItem]} mode="horizontal" />
  );
};

test('should render', async () => {
  const { container } = render(<TestLanguagePicker {...mockedProps} />, {
    useRouter: true,
  });
  expect(await screen.findByRole('menu')).toBeInTheDocument();
  expect(container).toBeInTheDocument();
});

test('should render the language picker', () => {
  render(<TestLanguagePicker {...mockedProps} />, {
    useRouter: true,
  });
  expect(screen.getByRole('menu', { name: 'Languages' })).toBeInTheDocument();
});

test('should render the items', async () => {
  render(<TestLanguagePicker {...mockedProps} />, {
    useRouter: true,
  });
  userEvent.hover(screen.getByRole('menuitem'));
  expect(await screen.findByText('English')).toBeInTheDocument();
  expect(await screen.findByText('Italian')).toBeInTheDocument();
});
