import { ControlComponentProps } from '@zobi.dev/chart-controls';

export type MapViewConfigs = {
  mode: 'FIT_DATA' | 'CUSTOM';
  zoom: number;
  latitude: number;
  longitude: number;
  fixedZoom: number;
  fixedLatitude: number;
  fixedLongitude: number;
};

export type MapViewConfigsControlProps = ControlComponentProps<MapViewConfigs>;

export interface MapViewPopoverContentProps {
  onClose: () => void;
  onSave: (currentMapViewConf: MapViewConfigs) => void;
  mapViewConf: MapViewConfigs;
}

export interface ExtentTagProps {
  value: MapViewConfigs;
  onClick: () => void;
  className?: string;
}
