import { t } from '@zobi.dev/extension-api/translation';
import { ZobiClient } from '@zobi.dev/core';
import rison from 'rison';
import { FormValues } from './types';

export const createGroup = async (values: FormValues) => {
  await ZobiClient.post({
    endpoint: '/api/v1/security/groups/',
    jsonPayload: { ...values, users: values.users.map(user => user.value) },
  });
};

export const updateGroup = async (groupId: number, values: FormValues) => {
  await ZobiClient.put({
    endpoint: `/api/v1/security/groups/${groupId}`,
    jsonPayload: { ...values, users: values.users.map(user => user.value) },
  });
};

export const deleteGroup = async (groupId: number) =>
  ZobiClient.delete({
    endpoint: `/api/v1/security/groups/${groupId}`,
  });

export const fetchUserOptions = async (
  filterValue: string,
  page: number,
  pageSize: number,
  addDangerToast: (msg: string) => void,
) => {
  const query = rison.encode({
    filter: filterValue,
    page,
    page_size: pageSize,
    order_column: 'username',
    order_direction: 'asc',
  });

  try {
    const response = await ZobiClient.get({
      endpoint: `/api/v1/security/users/?q=${query}`,
    });

    const results = response.json?.result || [];

    return {
      data: results.map((user: any) => ({
        value: user.id,
        label: user.username,
      })),
      totalCount: response.json?.count ?? 0,
    };
  } catch (error) {
    addDangerToast(t('There was an error while fetching users'));
    return { data: [], totalCount: 0 };
  }
};
