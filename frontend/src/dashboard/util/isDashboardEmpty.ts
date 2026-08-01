import { CHART_TYPE, MARKDOWN_TYPE, DYNAMIC_TYPE } from './componentTypes';

const USER_CONTENT_COMPONENT_TYPE: string[] = [
  CHART_TYPE,
  MARKDOWN_TYPE,
  DYNAMIC_TYPE,
];
export default function isDashboardEmpty(layout: any): boolean {
  // has at least one chart or markdown component
  return !Object.values(layout).some(
    ({ type }: { type?: string }) =>
      type && USER_CONTENT_COMPONENT_TYPE.includes(type),
  );
}
