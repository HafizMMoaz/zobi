import Owner from 'src/types/Owner';

export type TemplateObject = {
  id?: number;
  changed_on_delta_humanized?: string;
  created_on?: string;
  changed_by?: Owner;
  created_by?: Owner;
  css?: string;
  template_name: string;
};
