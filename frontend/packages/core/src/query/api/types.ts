import {
  RequestConfig,
  ZobiClientInterface,
  ZobiClientClass,
} from '../../connection';

export interface BaseParams {
  client?: ZobiClientInterface | ZobiClientClass;
  requestConfig?: RequestConfig;
}
