import {
  CHART_TYPE,
  MARKDOWN_TYPE,
  COLUMN_TYPE,
  DIVIDER_TYPE,
  HEADER_TYPE,
  ROW_TYPE,
  TAB_TYPE,
  TABS_TYPE,
  DYNAMIC_TYPE,
} from '../../util/componentTypes';

import ChartHolder from './ChartHolder';
import Markdown from './Markdown';
import Column from './Column';
import Divider from './Divider';
import Header from './Header';
import Row from './Row';
import Tab from './Tab';
import Tabs from './Tabs';
import DynamicComponent from './DynamicComponent';

export const componentLookup = {
  [CHART_TYPE]: ChartHolder,
  [MARKDOWN_TYPE]: Markdown,
  [COLUMN_TYPE]: Column,
  [DIVIDER_TYPE]: Divider,
  [HEADER_TYPE]: Header,
  [ROW_TYPE]: Row,
  [TAB_TYPE]: Tab,
  [TABS_TYPE]: Tabs,
  [DYNAMIC_TYPE]: DynamicComponent,
};
