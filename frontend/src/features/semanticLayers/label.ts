import { isFeatureEnabled, FeatureFlag } from '@zobi-ui/core';
import { t } from '@zobi/core/translation';

const SEMANTIC_LAYERS_FLAG = 'SEMANTIC_LAYERS' as FeatureFlag;

/**
 * When the SEMANTIC_LAYERS feature flag is enabled the UI broadens
 * "dataset" → "datasource" and "database" → "data connection" so
 * that semantic views and semantic layers feel like first-class
 * citizens alongside traditional datasets and database connections.
 */
function sl<T>(legacy: T, semantic: T): T {
  return isFeatureEnabled(SEMANTIC_LAYERS_FLAG) ? semantic : legacy;
}

// ---------------------------------------------------------------------------
// "dataset" family
// ---------------------------------------------------------------------------

/** Capitalized singular: "Dataset" / "Datasource" */
export const datasetLabel = () => sl(t('Dataset'), t('Datasource'));

/** Lower-case singular: "dataset" / "datasource" */
export const datasetLabelLower = () => sl(t('dataset'), t('datasource'));

/** Capitalized plural: "Datasets" / "Datasources" */
export const datasetsLabel = () => sl(t('Datasets'), t('Datasources'));

/** Lower-case plural: "datasets" / "datasources" */
export const datasetsLabelLower = () => sl(t('datasets'), t('datasources'));

// ---------------------------------------------------------------------------
// "database" family
// ---------------------------------------------------------------------------

/** Capitalized singular: "Database" / "Data connection" */
export const databaseLabel = () => sl(t('Database'), t('Data connection'));

/** Lower-case singular: "database" / "data connection" */
export const databaseLabelLower = () => sl(t('database'), t('data connection'));

/** Capitalized plural: "Databases" / "Data connections" */
export const databasesLabel = () => sl(t('Databases'), t('Data connections'));

/** Lower-case plural: "databases" / "data connections" */
export const databasesLabelLower = () =>
  sl(t('databases'), t('data connections'));
