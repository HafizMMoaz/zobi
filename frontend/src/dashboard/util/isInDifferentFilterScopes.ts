// Dashboard filter structure based on the actual usage pattern
interface DashboardFilterColumn {
  scope: string[];
}

interface DashboardFilter {
  chartId: number;
  scopes: Record<string, DashboardFilterColumn>;
}

interface DashboardFilters {
  [filterId: string]: DashboardFilter;
}

interface IsInDifferentFilterScopesProps {
  dashboardFilters?: DashboardFilters;
  source?: string[];
  destination?: string[];
}

export default function isInDifferentFilterScopes({
  dashboardFilters = {},
  source = [],
  destination = [],
}: IsInDifferentFilterScopesProps): boolean {
  const sourceSet = new Set(source);
  const destinationSet = new Set(destination);

  const allScopes = ([] as string[]).concat(
    ...Object.values(dashboardFilters).map(({ scopes }) =>
      ([] as string[]).concat(
        ...Object.values(scopes).map(({ scope }) => scope),
      ),
    ),
  );
  return allScopes.some(tab => destinationSet.has(tab) !== sourceSet.has(tab));
}
