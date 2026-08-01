import Owner from 'src/types/Owner';

export type ThemeObject = {
  id?: number;
  uuid?: string;
  is_system?: boolean;
  is_system_default?: boolean;
  is_system_dark?: boolean;
  changed_on_delta_humanized?: string;
  created_on?: string;
  changed_by?: Owner;
  created_by?: Owner;
  json_data?: string;
  theme_name: string;
};
