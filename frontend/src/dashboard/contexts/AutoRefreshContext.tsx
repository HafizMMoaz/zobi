import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  FC,
} from 'react';

export interface AutoRefreshContextValue {
  isAutoRefreshing: boolean;
  isRefreshInFlight: boolean;
  setIsAutoRefreshing: (value: boolean) => void;
  setRefreshInFlight: (value: boolean) => void;
  startAutoRefresh: () => void;
  endAutoRefresh: () => void;
}

const AutoRefreshContext = createContext<AutoRefreshContextValue>({
  isAutoRefreshing: false,
  isRefreshInFlight: false,
  setIsAutoRefreshing: () => {},
  setRefreshInFlight: () => {},
  startAutoRefresh: () => {},
  endAutoRefresh: () => {},
});

export interface AutoRefreshProviderProps {
  children: ReactNode;
}

/**
 * Provider that tracks whether an auto-refresh cycle is in progress.
 * Charts can use this context to suppress loading spinners during auto-refresh.
 */
export const AutoRefreshProvider: FC<AutoRefreshProviderProps> = ({
  children,
}) => {
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [isRefreshInFlight, setRefreshInFlight] = useState(false);

  const startAutoRefresh = useCallback(() => {
    setIsAutoRefreshing(true);
  }, []);

  const endAutoRefresh = useCallback(() => {
    setIsAutoRefreshing(false);
  }, []);

  const value = useMemo(
    () => ({
      isAutoRefreshing,
      isRefreshInFlight,
      setIsAutoRefreshing,
      setRefreshInFlight,
      startAutoRefresh,
      endAutoRefresh,
    }),
    [isAutoRefreshing, isRefreshInFlight, startAutoRefresh, endAutoRefresh],
  );

  return (
    <AutoRefreshContext.Provider value={value}>
      {children}
    </AutoRefreshContext.Provider>
  );
};

export const useAutoRefreshContext = (): AutoRefreshContextValue =>
  useContext(AutoRefreshContext);

export const useIsAutoRefreshing = (): boolean => {
  const { isAutoRefreshing } = useContext(AutoRefreshContext);
  return isAutoRefreshing;
};

export const useIsRefreshInFlight = (): boolean => {
  const { isRefreshInFlight } = useContext(AutoRefreshContext);
  return isRefreshInFlight;
};

export default AutoRefreshContext;
