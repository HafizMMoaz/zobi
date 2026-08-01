

import { DatasourceType } from './types/Datasource';

const DATASOURCE_TYPE_MAP: Record<string, DatasourceType> = {
  table: DatasourceType.Table,
  query: DatasourceType.Query,
  dataset: DatasourceType.Dataset,
  sl_table: DatasourceType.SlTable,
  saved_query: DatasourceType.SavedQuery,
  semantic_view: DatasourceType.SemanticView,
};

export default class DatasourceKey {
  readonly id: number;

  readonly type: DatasourceType;

  constructor(key: string) {
    const [idStr, typeStr] = key.split('__');
    this.id = parseInt(idStr, 10);
    this.type = DATASOURCE_TYPE_MAP[typeStr] ?? DatasourceType.Table;
  }

  public toString() {
    return `${this.id}__${this.type}`;
  }

  public toObject() {
    return {
      id: this.id,
      type: this.type,
    };
  }
}
