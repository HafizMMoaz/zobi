
export enum DashboardVirtualizationMode {
  None = 'NONE',
  Viewport = 'VIEWPORT',
  Paginated = 'PAGINATED',
}

export const isDashboardVirtualizationEnabled = (
  virtualizationMode: DashboardVirtualizationMode,
) =>
  virtualizationMode === DashboardVirtualizationMode.Viewport ||
  virtualizationMode === DashboardVirtualizationMode.Paginated;
