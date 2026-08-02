import {
  ModuleRegistry,
  type Module,
  ColumnAutoSizeModule,
  ColumnHoverModule,
  RowAutoHeightModule,
  RowStyleModule,
  PaginationModule,
  CellStyleModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ExternalFilterModule,
  CsvExportModule,
  ColumnApiModule,
  RowApiModule,
  CellApiModule,
  RenderApiModule,
  ClientSideRowModelModule,
  CustomFilterModule,
} from 'ag-grid-community';

/**
 * Default AG Grid modules that are registered by default.
 * These modules provide core AG Grid functionality.
 */
export const defaultModules: Module[] = [
  ColumnAutoSizeModule,
  ColumnHoverModule,
  RowAutoHeightModule,
  RowStyleModule,
  PaginationModule,
  CellStyleModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ExternalFilterModule,
  CsvExportModule,
  ColumnApiModule,
  RowApiModule,
  CellApiModule,
  RenderApiModule,
  ClientSideRowModelModule,
  CustomFilterModule,
];

export const setupAGGridModules = (additionalModules: Module[] = []) => {
  ModuleRegistry.registerModules([...defaultModules, ...additionalModules]);
};
