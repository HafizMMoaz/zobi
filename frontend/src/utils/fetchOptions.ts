
import { t } from '@zobi.dev/extension-api/translation';
import { ZobiClient } from '@zobi.dev/core';
import rison from 'rison';
import { Dispatch, SetStateAction } from 'react';

interface FetchPaginatedOptions {
  endpoint: string;
  pageSize?: number;
  setData: (data: any[]) => void;
  setLoadingState: Dispatch<SetStateAction<any>>;
  filters?: ZobiFilter[];
  orderBy?: { column: string; direction: 'asc' | 'desc' };
  loadingKey: string;
  addDangerToast: (message: string) => void;
  errorMessage?: string;
  mapResult?: (item: any) => any;
}

interface QueryObj {
  page_size: number;
  page: number;
  filters?: ZobiFilter[];
  order_column?: string;
  order_direction?: 'asc' | 'desc';
}

interface ZobiFilter {
  col: string;
  opr: string;
  value: string | number | (string | number)[];
}

export const fetchPaginatedData = async ({
  endpoint,
  pageSize = 100,
  setData,
  filters,
  orderBy,
  setLoadingState,
  loadingKey,
  addDangerToast,
  errorMessage = 'Error while fetching data',
  mapResult = (item: any) => item,
}: FetchPaginatedOptions) => {
  try {
    const fetchPage = async (pageIndex: number) => {
      const queryObj: QueryObj = {
        page_size: pageSize,
        page: pageIndex,
      };
      if (filters) {
        queryObj.filters = filters;
      }
      if (orderBy) {
        queryObj.order_column = orderBy.column;
        queryObj.order_direction = orderBy.direction;
      }
      const encodedQuery = rison.encode(queryObj);

      const response = await ZobiClient.get({
        endpoint: `${endpoint}?q=${encodedQuery}`,
      });

      return {
        count: response.json.count,
        results: response.json.result.map(mapResult),
      };
    };

    const initialResponse = await fetchPage(0);
    const totalItems = initialResponse.count;
    const firstPageResults = initialResponse.results;

    if (pageSize >= totalItems) {
      setData(firstPageResults);
      return;
    }

    const totalPages = Math.ceil(totalItems / pageSize);

    const requests = Array.from({ length: totalPages - 1 }, (_, i) =>
      fetchPage(i + 1),
    );
    const remainingResults = await Promise.all(requests);

    setData([
      ...firstPageResults,
      ...remainingResults.flatMap(res => res.results),
    ]);
  } catch (err) {
    addDangerToast(t(errorMessage));
  } finally {
    setLoadingState((prev: boolean | Record<string, boolean>) => {
      if (typeof prev === 'boolean') {
        return false;
      }
      return {
        ...prev,
        [loadingKey]: false,
      };
    });
  }
};
