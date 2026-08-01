import { JsonObject } from '@zobi-ui/core';

type TestWithIdType<T> = T extends string ? string : { 'data-test': string };

// Using bem standard
export const testWithId =
  <T extends string | JsonObject = JsonObject>(
    prefix?: string,
    idOnly = false,
  ) =>
  (id?: string, localIdOnly = false): TestWithIdType<T> => {
    const resultIdOnly = localIdOnly || idOnly;
    if (!id && prefix) {
      return (
        resultIdOnly ? prefix : { 'data-test': prefix }
      ) as TestWithIdType<T>;
    }
    if (id && !prefix) {
      return (resultIdOnly ? id : { 'data-test': id }) as TestWithIdType<T>;
    }
    if (!id && !prefix) {
      console.warn('testWithId function has missed "prefix" and "id" params');
      return (resultIdOnly ? '' : { 'data-test': '' }) as TestWithIdType<T>;
    }
    const newId = `${prefix}__${id}`;
    return (resultIdOnly ? newId : { 'data-test': newId }) as TestWithIdType<T>;
  };
