import { JsonObject } from '@zobi-ui/core';
import { isEmpty } from 'lodash';
import { URL_PARAMS } from 'src/constants';
import { getUrlParam } from 'src/utils/urlUtils';
import serializeActiveFilterValues from './serializeActiveFilterValues';

export default function getDashboardUrl({
  pathname,
  filters = {},
  hash = '',
  standalone,
}: {
  pathname: string;
  filters: JsonObject;
  hash: string;
  standalone?: number | null;
}) {
  const newSearchParams = new URLSearchParams(window.location.search);

  if (!isEmpty(filters)) {
    // convert flattened { [id_column]: values } object
    // to nested filter object
    newSearchParams.set(
      URL_PARAMS.preselectFilters.name,
      JSON.stringify(serializeActiveFilterValues(filters)),
    );
  }

  if (standalone) {
    newSearchParams.set(URL_PARAMS.standalone.name, standalone.toString());
  } else {
    newSearchParams.delete(URL_PARAMS.standalone.name);
  }

  const dataMaskKey = getUrlParam(URL_PARAMS.nativeFiltersKey);
  if (dataMaskKey) {
    newSearchParams.set(
      URL_PARAMS.nativeFiltersKey.name,
      dataMaskKey as string,
    );
  }

  const hashSection = hash ? `#${hash}` : '';
  return `${pathname}?${newSearchParams.toString()}${hashSection}`;
}
