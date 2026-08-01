import { sharedControlComponents } from '@zobi.dev/chart-controls';
import { getExtensionsRegistry } from '@zobi.dev/core';
import AnnotationLayerControl from './AnnotationLayerControl';
import BoundsControl from './BoundsControl';
import CheckboxControl from './CheckboxControl';
import CollectionControl from './CollectionControl';
import ColorPickerControl from './ColorPickerControl';
import ColorSchemeControl from './ColorSchemeControl';
import DatasourceControl from './DatasourceControl';
import DateFilterControl from './DateFilterControl';
import FixedOrMetricControl from './FixedOrMetricControl';
import HiddenControl from './HiddenControl';
import SelectAsyncControl from './SelectAsyncControl';
import SelectControl from './SelectControl';
import SliderControl from './SliderControl';
import SpatialControl from './SpatialControl';
import TextAreaControl from './TextAreaControl';
import TextControl from './TextControl';
import TimeSeriesColumnControl from './TimeSeriesColumnControl';
import TimeOffsetControl from './TimeOffsetControl';
import ViewportControl from './ViewportControl';
import VizTypeControl from './VizTypeControl';
import MetricsControl from './MetricControl/MetricsControl';
import AdhocFilterControl from './FilterControl/AdhocFilterControl';
import ConditionalFormattingControl from './ConditionalFormattingControl';
import ContourControl from './ContourControl';
import DndColumnSelectControl, {
  DndColumnSelect,
  DndFilterSelect,
  DndMetricSelect,
  DndColumnMetricSelect,
} from './DndColumnSelectControl';
import XAxisSortControl from './XAxisSortControl';
import CurrencyControl from './CurrencyControl';
import ColumnConfigControl from './ColumnConfigControl';
import { ComparisonRangeLabel } from './ComparisonRangeLabel';
import LayerConfigsControl from './LayerConfigsControl/LayerConfigsControl';
import MapViewControl from './MapViewControl/MapViewControl';
import ZoomConfigControl from './ZoomConfigControl/ZoomConfigControl';
import NumberControl from './NumberControl';
import TimeRangeControl from './TimeRangeControl';
import ColorBreakpointsControl from './ColorBreakpointsControl';
import MatrixifyDimensionControl from './MatrixifyDimensionControl';
import JSEditorControl from './JSEditorControl';
import SwitchControl from './SwitchControl';
import VerticalRadioControl from './VerticalRadioControl';

const extensionsRegistry = getExtensionsRegistry();
const DateFilterControlExtension = extensionsRegistry.get(
  'filter.dateFilterControl',
);
const DateFilterComponent = DateFilterControlExtension ?? DateFilterControl;

const controlMap = {
  AnnotationLayerControl,
  BoundsControl,
  CheckboxControl,
  CollectionControl,
  ColorPickerControl,
  ColorSchemeControl,
  ColumnConfigControl,
  CurrencyControl,
  DatasourceControl,
  DateFilterControl: DateFilterComponent,
  DndColumnSelectControl,
  DndColumnSelect,
  DndFilterSelect,
  DndMetricSelect,
  DndColumnMetricSelect,
  FixedOrMetricControl,
  ColorBreakpointsControl,
  HiddenControl,
  JSEditorControl,
  LayerConfigsControl,
  MapViewControl,
  SelectAsyncControl,
  SelectControl,
  SliderControl,
  SpatialControl,
  TextAreaControl,
  TextControl,
  TimeSeriesColumnControl,
  ViewportControl,
  VizTypeControl,
  MetricsControl,
  AdhocFilterControl,
  ConditionalFormattingControl,
  XAxisSortControl,
  ContourControl,
  ComparisonRangeLabel,
  TimeOffsetControl,
  ZoomConfigControl,
  NumberControl,
  TimeRangeControl,
  MatrixifyDimensionControl,
  SwitchControl,
  VerticalRadioControl,
  ...sharedControlComponents,
};
export default controlMap;
