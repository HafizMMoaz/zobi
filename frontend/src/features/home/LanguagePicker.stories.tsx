import { Menu } from '@zobi.dev/core/components/Menu';
import { useLanguageMenuItems } from './LanguagePicker';
import type { Languages } from './LanguagePicker';

// Component to demonstrate the hook usage
const LanguagePicker = ({
  locale,
  languages,
}: {
  locale: string;
  languages: Languages;
}) => {
  const languageMenuItem = useLanguageMenuItems({ locale, languages });

  return (
    <Menu aria-label="Languages" items={[languageMenuItem]} mode="horizontal" />
  );
};

export default {
  title: 'Components/LanguagePicker',
  component: LanguagePicker,
  parameters: {
    docs: {
      description: {
        component:
          'The LanguagePicker component allows users to select a language from a dropdown.',
      },
    },
  },
};

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

const Template = (args: any) => <LanguagePicker {...args} />;

export const Default = Template.bind({});
Default.args = mockedProps;
