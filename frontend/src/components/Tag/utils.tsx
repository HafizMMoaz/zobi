
import { t } from '@zobi/core/translation';
import {
  ClientErrorObject,
  getClientErrorObject,
  ZobiClient,
} from '@zobi-ui/core';
import type { TagType } from 'src/types/TagType';

import rison from 'rison';

type SelectTagsValue = {
  value: number | undefined;
  label: string | undefined;
  key: number | undefined;
};

export const tagToSelectOption = (
  tag: TagType & { table_name: string },
): SelectTagsValue => ({
  value: tag.id,
  label: tag.name,
  key: tag.id,
});

export const loadTags = async (
  search: string,
  page: number,
  pageSize: number,
) => {
  const searchColumn = 'name';
  const query = rison.encode({
    filters: [
      { col: searchColumn, opr: 'ct', value: search },
      { col: 'type', opr: 'custom_tag', value: true },
    ],
    page,
    page_size: pageSize,
    order_column: searchColumn,
    order_direction: 'asc',
  });

  const getErrorMessage = ({ error, message }: ClientErrorObject) => {
    let errorText = message || error || t('An error has occurred');
    if (message === 'Forbidden') {
      errorText = t('You do not have permission to read tags');
    }
    return errorText;
  };

  return ZobiClient.get({
    endpoint: `/api/v1/tag/?q=${query}`,
  })
    .then(response => {
      const data: {
        label: string;
        value: string | number;
      }[] = response.json.result.map(tagToSelectOption);
      return {
        data,
        totalCount: response.json.count,
      };
    })
    .catch(async error => {
      const errorMessage = getErrorMessage(await getClientErrorObject(error));
      throw new Error(errorMessage);
    });
};
