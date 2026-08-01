import { initFeatureFlags } from '@zobi-ui/core';
import getBootstrapData from './getBootstrapData';

function getDomainsConfig(): string[] {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    return [];
  }

  const availableDomains = new Set([window.location.hostname]);

  // don't do domain sharding if a certain query param is set
  const disableDomainSharding =
    new URLSearchParams(window.location.search).get('disableDomainSharding') ===
    '1';
  if (disableDomainSharding) {
    return Array.from(availableDomains);
  }

  const bootstrapData = getBootstrapData();
  // this module is a little special, it may be loaded before index.jsx,
  // where window.featureFlags get initialized
  // eslint-disable-next-line camelcase
  initFeatureFlags(bootstrapData.common.feature_flags);

  if (bootstrapData?.common?.conf?.ZOBI_WEBSERVER_DOMAINS) {
    const domains = bootstrapData.common.conf
      .ZOBI_WEBSERVER_DOMAINS as string[];
    domains.forEach((hostName: string) => {
      availableDomains.add(hostName);
    });
  }
  return Array.from(availableDomains);
}

export const availableDomains: string[] = getDomainsConfig();

export const allowCrossDomain: boolean = availableDomains.length > 1;
