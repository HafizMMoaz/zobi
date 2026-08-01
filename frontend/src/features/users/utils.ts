import { t } from '@zobi.dev/extension-api/translation';
import { ZobiClient } from '@zobi.dev/core';
import { SelectOption } from 'src/components/ListView';
import { FormValues } from './types';

export const createUser = async (values: FormValues) => {
  const { confirmPassword, ...payload } = values;
  if (payload.active == null) {
    payload.active = false;
  }
  await ZobiClient.post({
    endpoint: '/api/v1/security/users/',
    jsonPayload: { ...payload },
  });
};

export const updateUser = async (user_Id: number, values: FormValues) => {
  await ZobiClient.put({
    endpoint: `/api/v1/security/users/${user_Id}`,
    jsonPayload: { ...values },
  });
};

export const deleteUser = async (userId: number) =>
  ZobiClient.delete({
    endpoint: `/api/v1/security/users/${userId}`,
  });

export const atLeastOneRoleOrGroup =
  (fieldToCheck: 'roles' | 'groups') =>
  ({
    getFieldValue,
  }: {
    getFieldValue: (field: string) => Array<SelectOption>;
  }) => ({
    validator(_: object, value: Array<SelectOption>) {
      const current = value || [];
      const other = getFieldValue(fieldToCheck) || [];
      if (current.length === 0 && other.length === 0) {
        return Promise.reject(
          new Error(t('Please select at least one role or group')),
        );
      }
      return Promise.resolve();
    },
  });
