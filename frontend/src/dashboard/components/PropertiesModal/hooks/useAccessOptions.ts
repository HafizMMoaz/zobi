import { useCallback } from 'react';
import { ZobiClient } from '@zobi.dev/core';
import rison from 'rison';
import {
  OwnerSelectLabel,
  OWNER_TEXT_LABEL_PROP,
  OWNER_EMAIL_PROP,
} from 'src/features/owners/OwnerSelectLabel';

/**
 * Hook for loading dashboard access options (owners and roles)
 */
export const useAccessOptions = () => {
  const loadAccessOptions = useCallback(
    (accessType = 'owners', input = '', page: number, pageSize: number) => {
      const query = rison.encode({
        filter: input,
        page,
        page_size: pageSize,
      });
      return ZobiClient.get({
        endpoint: `/api/v1/dashboard/related/${accessType}?q=${query}`,
      }).then(response => ({
        data: response.json.result
          .filter((item: { extra: { active: boolean } }) =>
            item.extra.active !== undefined ? item.extra.active : true,
          )
          .map(
            (item: {
              value: number;
              text: string;
              extra: { email?: string };
            }) => {
              if (accessType === 'owners') {
                return {
                  value: item.value,
                  label: OwnerSelectLabel({
                    name: item.text,
                    email: item.extra?.email,
                  }),
                  [OWNER_TEXT_LABEL_PROP]: item.text,
                  [OWNER_EMAIL_PROP]: item.extra?.email ?? '',
                };
              }
              return {
                value: item.value,
                label: item.text,
              };
            },
          ),
        totalCount: response.json.count,
      }));
    },
    [],
  );

  return { loadAccessOptions };
};
