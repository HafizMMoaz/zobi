import { JsonObject, ZobiClient } from '@zobi-ui/core';
import rison from 'rison';
import { TagType } from 'src/components';
import { TagTypeEnum } from 'src/components/Tag/TagType';

export const OBJECT_TYPES_VALUES = Object.freeze([
  'dashboard',
  'chart',
  'saved_query',
]);

export const OBJECT_TYPES = Object.freeze({
  DASHBOARD: 'dashboard',
  CHART: 'chart',
  QUERY: 'saved_query',
});

const OBJECT_TYPE_ID_MAP = {
  saved_query: 1,
  chart: 2,
  dashboard: 3,
};

const map_object_type_to_id = (objectType: string) => {
  if (!OBJECT_TYPES_VALUES.includes(objectType)) {
    const msg = `objectType ${objectType} is invalid`;
    throw new Error(msg);
  }
  return OBJECT_TYPE_ID_MAP[objectType as keyof typeof OBJECT_TYPE_ID_MAP];
};

export function fetchAllTags(
  // fetch all tags (excluding system tags)
  callback: (json: JsonObject) => void,
  error: (response: Response) => void,
) {
  ZobiClient.get({
    endpoint: `/api/v1/tag/?q=${rison.encode({
      filters: [{ col: 'type', opr: 'custom_tag', value: true }],
    })}`,
  })
    .then(({ json }) => callback(json))
    .catch(response => error(response));
}

export function fetchSingleTag(
  id: number,
  callback: (json: JsonObject) => void,
  error: (response: Response) => void,
) {
  ZobiClient.get({ endpoint: `/api/v1/tag/${id}` })
    .then(({ json }) => callback(json.result))
    .catch(response => error(response));
}

export function fetchTags(
  {
    objectType,
    objectId,
  }: {
    objectType: string;
    objectId: number;
    includeTypes?: boolean;
  },
  callback: (json: JsonObject) => void,
  error: (response: Response) => void,
) {
  if (objectType === undefined || objectId === undefined) {
    throw new Error('Need to specify objectType and objectId');
  }
  if (!OBJECT_TYPES_VALUES.includes(objectType)) {
    const msg = `objectType ${objectType} is invalid`;
    throw new Error(msg);
  }
  ZobiClient.get({
    endpoint: `/api/v1/${objectType}/${objectId}`,
  })
    .then(({ json }) =>
      callback(
        json.result.tags.filter(
          (tag: TagType) => tag.type === TagTypeEnum.Custom,
        ),
      ),
    )
    .catch(response => error(response));
}
export function deleteTaggedObjects(
  { objectType, objectId }: { objectType: string; objectId: number },
  tag: TagType,
  callback: (text: string) => void,
  error: (response: string) => void,
) {
  if (objectType === undefined || objectId === undefined) {
    throw new Error('Need to specify objectType and objectId');
  }
  if (!OBJECT_TYPES_VALUES.includes(objectType)) {
    const msg = `objectType ${objectType} is invalid`;
    throw new Error(msg);
  }
  ZobiClient.delete({
    endpoint: `/api/v1/tag/${map_object_type_to_id(objectType)}/${objectId}/${
      tag.name
    }`,
  })
    .then(({ json }) =>
      json
        ? callback(JSON.stringify(json))
        : callback('Successfully Deleted Tagged Objects'),
    )
    .catch(response => {
      const err_str = response.message;
      return err_str ? error(err_str) : error('Error Deleting Tagged Objects');
    });
}

export function deleteTags(
  tags: TagType[],
  callback: (text: string) => void,
  error: (response: string) => void,
) {
  const tag_names = tags.map(tag => tag.name) as string[];
  ZobiClient.delete({
    endpoint: `/api/v1/tag/?q=${rison.encode(tag_names)}`,
  })
    .then(({ json }) =>
      json.message
        ? callback(json.message)
        : callback('Successfully Deleted Tag'),
    )
    .catch(response => {
      const err_str = response.message;
      return err_str ? error(err_str) : error('Error Deleting Tag');
    });
}

export function addTag(
  {
    objectType,
    objectId,
  }: {
    objectType: string;
    objectId: number;
    includeTypes?: boolean;
  },
  tag: string,
  callback: (text: string) => void,
  error: (response: Response) => void,
) {
  if (objectType === undefined || objectId === undefined) {
    throw new Error('Need to specify objectType and objectId');
  }
  const objectTypeId = map_object_type_to_id(objectType);
  ZobiClient.post({
    endpoint: `/api/v1/tag/${objectTypeId}/${objectId}/`,
    body: JSON.stringify({
      properties: {
        tags: [tag],
      },
    }),
    parseMethod: 'json',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(({ json }) => callback(JSON.stringify(json)))
    .catch(response => error(response));
}

export function fetchObjectsByTagIds(
  { tagIds = [], types }: { tagIds: number[] | string; types: string | null },
  callback: (json: JsonObject) => void,
  error: (response: Response) => void,
) {
  let url = `/api/v1/tag/get_objects/?tagIds=${tagIds}`;
  if (types) {
    url += `&types=${types}`;
  }
  ZobiClient.get({ endpoint: url })
    .then(({ json }) => callback(json.result))
    .catch(response => error(response));
}
