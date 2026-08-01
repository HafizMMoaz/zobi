type user = {
  id: number;
  first_name: string;
  last_name: string;
};

export type AnnotationObject = {
  changed_by?: user;
  changed_on_delta_humanized?: string;
  created_by?: user;
  end_dttm: string;
  id?: number;
  json_metadata?: string;
  long_descr?: string;
  short_descr: string;
  start_dttm: string;
  layer?: {
    id: number;
  };
};
