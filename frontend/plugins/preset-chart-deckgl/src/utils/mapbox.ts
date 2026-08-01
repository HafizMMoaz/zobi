
export function getMapboxApiKey(): string {
  if (typeof document === 'undefined') {
    return '';
  }
  try {
    const appContainer = document.getElementById('app');
    const dataBootstrap = appContainer?.getAttribute('data-bootstrap');
    if (dataBootstrap) {
      const bootstrapData = JSON.parse(dataBootstrap);
      return bootstrapData?.common?.conf?.MAPBOX_API_KEY || '';
    }
  } catch {
    // If bootstrap data is unavailable or malformed, return empty string
  }
  return '';
}
