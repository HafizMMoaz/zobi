import URI from 'urijs';
import { JsonObject } from '@zobi-ui/core';
import { safeStringify } from './safeStringify';

const MAX_URL_LENGTH = 8000;

export function getURIDirectory(endpointType = 'base') {
  // Building the directory part of the URI
  let directory = '/explore/';
  if (['json', 'csv', 'query', 'results', 'samples'].includes(endpointType)) {
    directory = '/zobi/explore_json/';
  }

  return directory;
}

export function getExploreLongUrl(
  formData: JsonObject,
  endpointType: string,
  allowOverflow = true,
  extraSearch: Record<string, any> = {},
): string | undefined {
  if (!formData.datasource) {
    return undefined;
  }

  const uri = new URI('/');
  const directory = getURIDirectory(endpointType);
  const search = uri.search(true);
  Object.keys(extraSearch).forEach(key => {
    search[key] = extraSearch[key];
  });
  search.form_data = safeStringify(formData);
  if (endpointType === 'standalone') {
    search.standalone = 'true';
  }
  const url = uri.directory(directory).search(search).toString();
  if (!allowOverflow && url.length > MAX_URL_LENGTH) {
    const minimalFormData = {
      datasource: formData.datasource,
      viz_type: formData.viz_type,
    };

    return getExploreLongUrl(minimalFormData, endpointType, false, {
      URL_IS_TOO_LONG_TO_SHARE: null,
    });
  }

  return url;
}
