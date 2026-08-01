import { common as coreType } from '@zobi/core';

export class Table implements coreType.Table {
  name: string;

  columns: coreType.Column[];

  constructor(name: string, columns: coreType.Column[]) {
    this.name = name;
    this.columns = columns;
  }

  addColumn(column: coreType.Column): void {
    this.columns.push(column);
  }
}

export class Catalog implements coreType.Catalog {
  name: string;

  description?: string;

  constructor(name: string, description?: string) {
    this.name = name;
    this.description = description;
  }
}

export class Schema implements coreType.Schema {
  tables: Table[];

  constructor(tables: Table[]) {
    this.tables = tables;
  }

  addTable(table: Table): void {
    this.tables.push(table);
  }
}

export class Database implements coreType.Database {
  id: number;

  name: string;

  catalogs: Catalog[];

  schemas: Schema[];

  constructor(
    id: number,
    name: string,
    catalogs: Catalog[],
    schemas: Schema[],
  ) {
    this.id = id;
    this.name = name;
    this.catalogs = catalogs;
    this.schemas = schemas;
  }

  addCatalog(catalog: Catalog): void {
    this.catalogs.push(catalog);
  }

  addSchema(schema: Schema): void {
    this.schemas.push(schema);
  }
}

export class Disposable implements coreType.Disposable {
  static from(
    ...disposableLikes: {
      dispose: () => any;
    }[]
  ): Disposable {
    return new Disposable(() => {
      disposableLikes.forEach(disposable => {
        disposable.dispose();
      });
    });
  }

  constructor(callOnDispose: () => any) {
    this.dispose = callOnDispose;
  }

  dispose(): any {
    this.dispose();
  }
}
