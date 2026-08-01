export const getColorControlsProps = (state: Record<string, any>) => {
  const dashboardId = state?.form_data?.dashboardId;
  return {
    chartId: state?.slice?.slice_id,
    dashboardId,
    hasDashboardColorScheme:
      !!dashboardId && !!state?.form_data?.dashboard_color_scheme,
    hasCustomLabelsColor:
      Object.keys(state?.form_data?.label_colors || {}).length > 0,
    colorNamespace: state?.form_data?.color_namespace,
    mapLabelsColors: state?.form_data?.map_label_colors || {},
    sharedLabelsColors: state?.form_data?.shared_label_colors || [],
  };
};
