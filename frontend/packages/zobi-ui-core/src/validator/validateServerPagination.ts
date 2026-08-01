import { t } from '@zobi/core-legacy/translation';

export default function validateServerPagination(
  v: unknown,
  serverPagination: boolean,
  maxValueWithoutServerPagination: number,
  maxServer: number,
): string | false {
  if (
    Number(v) > +maxValueWithoutServerPagination &&
    Number(v) <= maxServer &&
    !serverPagination
  ) {
    return t(
      'Server pagination needs to be enabled for values over %s',
      maxValueWithoutServerPagination,
    );
  }
  return false;
}
