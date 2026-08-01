
import { useSelector } from 'react-redux';
import { ViewState } from 'src/views/types';

export function useCommonConf() {
  return useSelector((state: ViewState) => state?.common?.conf);
}
