type CreatedByUser = {
  id: number;
  first_name: string;
  last_name: string;
};

export type AnnotationLayerObject = {
  id?: number;
  changed_on_delta_humanized?: string;
  created_on?: string;
  created_by?: CreatedByUser;
  changed_by?: CreatedByUser;
  name: string;
  descr: string;
};
