import { TreeProps, TreeDataNode } from '@zobi-ui/core/components/Tree';
import { ControlComponentProps } from '@zobi-ui/chart-controls';
import { Style } from 'geostyler-style';
import { Data } from 'geostyler-data';

export interface BaseLayerConf {
  title: string;
  url: string;
  type: string;
  attribution?: string;
}

export interface WfsLayerConf extends BaseLayerConf {
  type: 'WFS';
  typeName: string;
  version: string;
  maxFeatures?: number;
  style?: Style;
}

export interface XyzLayerConf extends BaseLayerConf {
  type: 'XYZ';
}

export interface WmsLayerConf extends BaseLayerConf {
  type: 'WMS';
  version: string;
  layersParam: string;
}

export interface FlatLayerDataNode extends TreeDataNode {
  layerConf: LayerConf;
}

export interface FlatLayerTreeProps {
  layerConfigs: LayerConf[];
  onAddLayer?: () => void;
  onRemoveLayer?: (idx: number) => void;
  onEditLayer?: (layerConf: LayerConf, idx: number) => void;
  onMoveLayer?: (layerConfigs: LayerConf[]) => void;
  draggable?: boolean;
  className?: string;
}

export type LayerConf = WmsLayerConf | WfsLayerConf | XyzLayerConf;

export type DropInfoType<T extends TreeProps['onDrop']> = T extends Function
  ? Parameters<T>[0]
  : undefined;

export interface EditItem {
  layerConf: LayerConf;
  idx: number;
}

export type LayerConfigsControlProps = ControlComponentProps<LayerConf[]>;

export interface LayerConfigsPopoverContentProps {
  onClose?: () => void;
  onSave?: (layerConf: LayerConf) => void;
  layerConf: LayerConf;
}

export interface GeoStylerWrapperProps {
  style?: Style;
  className?: string;
  onStyleChange?: (newStyle: Style) => void;
  data?: Data;
}

export interface LayerTreeItemProps {
  layerConf: LayerConf;
  onEditClick?: () => void;
  onRemoveClick?: () => void;
  className?: string;
}
