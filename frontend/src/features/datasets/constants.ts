import { t } from '@zobi.dev/extension-api/translation';

export const PAGE_SIZE = 25;
export const SORT_BY = [{ id: 'changed_on_delta_humanized', desc: true }];
export const PASSWORDS_NEEDED_MESSAGE = t(
  'The passwords for the databases below are needed in order to ' +
    'import them together with the datasets. Please note that the ' +
    '"Secure Extra" and "Certificate" sections of ' +
    'the database configuration are not present in export files, and ' +
    'should be added manually after the import if they are needed.',
);
export const CONFIRM_OVERWRITE_MESSAGE = t(
  'You are importing one or more datasets that already exist. ' +
    'Overwriting might cause you to lose some of your work. Are you ' +
    'sure you want to overwrite?',
);
