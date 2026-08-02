import { createContext, useContext, FC, ReactNode } from 'react';

import { useLocation } from 'react-router-dom';

export type LocationState = {
  requestedQuery?: Record<string, any>;
  isDataset?: boolean;
};

export const locationContext = createContext<LocationState>({});
const { Provider } = locationContext;

const EMPTY_STATE: LocationState = {};

export const LocationProvider: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const location = useLocation<LocationState>();
  if (location.state) {
    return <Provider value={location.state}>{children}</Provider>;
  }
  const queryParams = new URLSearchParams(location.search);
  const permalink = location.pathname.match(/\/p\/\w+/)?.[0].slice(3);
  if (queryParams.size > 0 || permalink) {
    const autorun = queryParams.get('autorun') === 'true';
    const isDataset = queryParams.get('isDataset') === 'true';
    const queryParamsState = {
      requestedQuery: {
        ...Object.fromEntries(queryParams),
        autorun,
        permalink,
      },
      isDataset,
    } as LocationState;
    return <Provider value={queryParamsState}>{children}</Provider>;
  }

  return <Provider value={EMPTY_STATE}>{children}</Provider>;
};
export const useLocationState = () => useContext(locationContext);
