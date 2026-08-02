import { ConfigType } from 'dayjs';
import { TagType } from 'src/components';
import Owner from './Owner';

export interface TaggedObject {
  id: number;
  type: string;
  name: string;
  url: string;
  changed_on: ConfigType;
  created_by: number | undefined;
  creator: string;
  owners: Owner[];
  tags: TagType[];
}

export interface TaggedObjects {
  dashboard: TaggedObject[];
  chart: TaggedObject[];
  query: TaggedObject[];
}
