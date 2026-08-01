# Database engine specifications

Zobi uses [SQLAlchemy](https://www.sqlalchemy.org/) as an abstraction layer for running queries and fetching metadata from tables (like column names and types). Unfortunately, while SQLAlchemy offers enough functionality to allow connecting Zobi to dozens of databases, there are still implementation details that differ across them. Because of this, Zobi has an additional abstraction on top of SQLAlchemy, called a "database engine specification" or, simply, "DB engine spec".

DB engine specs were created initially because there's no SQL standard for computing aggregations at different time grains. For example, to compute a daily metric in Trino or Postgres we could run a query like this:

```sql
SELECT
  date_trunc('day', CAST(time_column) AS TIMESTAMP) AS day,
  COUNT(*) AS metric
FROM
  some_table
GROUP BY
  1
```

For MySQL, instead of using the `date_trunc` function, we would need to write:

```sql
SELECT
  DATE(time_column) AS day,
  COUNT(*) AS metric
FROM
  some_table
GROUP BY
  1
```

Over time, more and more functionality was added to DB engine specs, including validating SQL, estimating the cost of queries before they are run, and understanding the semantics of error messages. These are all described in detail in this document, and in the table below you can see a summary of what features are supported by each database.

Note that DB engine specs are completely optional. Zobi can connect to any database supported by SQLAlchemy (or 3rd party dialects) even if there's no DB engine spec associated with it. But DB engine specs greatly improve the experience of working with a database in Zobi.

## Features

The tables below (generated via `python zobi/db_engine_specs/lib.py`) summarize the status of all DB engine specs in Zobi, organized by feature category for easier navigation (note that this excludes 3rd party DB engine specs).

### Quick Navigation

- [Feature Overview](#feature-overview) - High-level summary of support across all databases
- [Database Information](#database-information) - Module paths and core metadata
- [SQL Capabilities](#sql-capabilities) - SQL language features and capabilities
- [Time Grains – Common](#time-grains--common) - Standard time granularity support
- [Time Grains – Extended](#time-grains--extended) - Sub-hour and week variant time grains
- [Core Platform & Metadata Features](#core-platform--metadata-features) - Platform integration and metadata capabilities
- [Operational & Advanced Features](#operational--advanced-features) - Advanced operational capabilities

### Feature Overview

| Database | Score | SQL Basics | Advanced SQL | Common Time Grains | Extended Time Grains | Integrations | Advanced Features |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Presto | 159 | Supported | Partial | Supported | Partial | Partial | Supported |
| Trino | 149 | Supported | Partial | Supported | Partial | Partial | Partial |
| Hive | 140 | Supported | Not supported | Supported | Partial | Partial | Partial |
| Spark SQL | 140 | Supported | Not supported | Supported | Partial | Partial | Partial |
| Databricks Interactive Cluster | 140 | Supported | Not supported | Supported | Partial | Partial | Partial |
| base | 109 | Supported | Partial | Supported | Partial | Partial | Partial |
| Aurora PostgreSQL (Data API) | 104 | Supported | Partial | Supported | Partial | Partial | Partial |
| CockroachDB | 94 | Supported | Partial | Supported | Partial | Partial | Partial |
| RisingWave | 94 | Supported | Partial | Supported | Partial | Partial | Partial |
| Google BigQuery | 83 | Supported | Partial | Supported | Partial | Partial | Partial |
| Doris | 79 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Snowflake | 72 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Databricks | 70 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Databricks (legacy) | 70 | Supported | Partial | Supported | Partial | Partial | Not supported |
| StarRocks | 69 | Supported | Partial | Supported | Partial | Partial | Partial |
| SingleStore | 68 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| ClickHouse Connect (Zobi) | 61 | Supported | Partial | Partial | Partial | Partial | Not supported |
| Google Sheets | 61 | Supported | Partial | Supported | Supported | Partial | Partial |
| Aurora MySQL (Data API) | 59 | Supported | Partial | Supported | Partial | Partial | Not supported |
| MariaDB | 59 | Supported | Partial | Supported | Partial | Partial | Not supported |
| MySQL | 59 | Supported | Partial | Supported | Partial | Partial | Not supported |
| OceanBase | 59 | Supported | Partial | Supported | Partial | Partial | Not supported |
| MotherDuck | 58 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| KustoSQL | 54 | Supported | Partial | Supported | Partial | Partial | Not supported |
| ClickHouse | 51 | Supported | Partial | Partial | Partial | Partial | Not supported |
| Databend | 51 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Drill | 50 | Supported | Partial | Supported | Partial | Partial | Partial |
| Druid | 47 | Partial | Partial | Supported | Partial | Partial | Not supported |
| Amazon Redshift | 44 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Azure Synapse | 44 | Partial | Partial | Supported | Partial | Partial | Not supported |
| Microsoft SQL Server | 44 | Partial | Partial | Supported | Partial | Partial | Not supported |
| SQLite | 41 | Supported | Partial | Supported | Supported | Not supported | Not supported |
| Shillelagh | 41 | Supported | Partial | Supported | Supported | Not supported | Not supported |
| KustoKQL | 40 | Supported | Partial | Partial | Partial | Partial | Not supported |
| Ascend | 38 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| DuckDB | 38 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| IBM Db2 | 38 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| IBM Db2 for i | 38 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| Ocient | 38 | Partial | Partial | Partial | Partial | Partial | Not supported |
| Impala | 37 | Supported | Partial | Partial | Not supported | Partial | Not supported |
| ElasticSearch (SQL API) | 37 | Partial | Partial | Partial | Not supported | Partial | Not supported |
| PostgreSQL | 34 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Vertica | 34 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Amazon DynamoDB | 32 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Pinot | 32 | Partial | Partial | Supported | Partial | Partial | Not supported |
| Zobi meta database | 31 | Supported | Partial | Supported | Supported | Not supported | Not supported |
| Databricks SQL Endpoint | 30 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Kylin | 28 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| CrateDB | 28 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| Dremio | 28 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| Exasol | 28 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| Firebolt | 28 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| IBM Netezza Performance Server | 28 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| Oracle | 28 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| Parseable | 28 | Supported | Partial | Supported | Not supported | Partial | Not supported |
| Couchbase | 27 | Partial | Partial | Partial | Not supported | Partial | Not supported |
| Denodo | 27 | Supported | Partial | Partial | Not supported | Partial | Not supported |
| SAP HANA | 27 | Supported | Partial | Partial | Not supported | Partial | Not supported |
| Teradata | 27 | Supported | Partial | Partial | Not supported | Partial | Not supported |
| ElasticSearch (OpenDistro SQL) | 26 | Partial | Partial | Partial | Not supported | Partial | Not supported |
| Firebird | 26 | Supported | Partial | Partial | Not supported | Partial | Not supported |
| TDengine | 25 | Supported | Partial | Partial | Not supported | Partial | Not supported |
| YDB | 23 | Supported | Partial | Supported | Partial | Partial | Not supported |
| Amazon Athena | 20 | Supported | Partial | Supported | Partial | Not supported | Not supported |
| Solr | 20 | Partial | Partial | Not supported | Not supported | Partial | Not supported |

### Database Information

| Database | Module | Limit Method | Limit Clause | Max Column Name |
| --- | --- | --- | --- | --- |
| Amazon Athena | zobi.db_engine_specs.athena | FORCE_LIMIT | True | None |
| Amazon DynamoDB | zobi.db_engine_specs.dynamodb | FORCE_LIMIT | True | None |
| Amazon Redshift | zobi.db_engine_specs.redshift | FORCE_LIMIT | True | 127 |
| Doris | zobi.db_engine_specs.doris | FORCE_LIMIT | True | 64 |
| Drill | zobi.db_engine_specs.drill | FORCE_LIMIT | True | None |
| Druid | zobi.db_engine_specs.druid | FORCE_LIMIT | True | None |
| Hive | zobi.db_engine_specs.hive | FORCE_LIMIT | True | 767 |
| Impala | zobi.db_engine_specs.impala | FORCE_LIMIT | True | None |
| Kylin | zobi.db_engine_specs.kylin | FORCE_LIMIT | True | None |
| Pinot | zobi.db_engine_specs.pinot | FORCE_LIMIT | True | None |
| Solr | zobi.db_engine_specs.solr | FORCE_LIMIT | True | None |
| Spark SQL | zobi.db_engine_specs.spark | FORCE_LIMIT | True | 767 |
| Ascend | zobi.db_engine_specs.ascend | FORCE_LIMIT | True | None |
| Aurora MySQL (Data API) | zobi.db_engine_specs.aurora | FORCE_LIMIT | True | 64 |
| Aurora PostgreSQL (Data API) | zobi.db_engine_specs.aurora | FORCE_LIMIT | True | 63 |
| Azure Synapse | zobi.db_engine_specs.mssql | FORCE_LIMIT | True | 128 |
| ClickHouse | zobi.db_engine_specs.clickhouse | FORCE_LIMIT | True | None |
| ClickHouse Connect (Zobi) | zobi.db_engine_specs.clickhouse | FORCE_LIMIT | True | None |
| CockroachDB | zobi.db_engine_specs.cockroachdb | FORCE_LIMIT | True | 63 |
| Couchbase | zobi.db_engine_specs.couchbase | FORCE_LIMIT | True | None |
| CrateDB | zobi.db_engine_specs.crate | FORCE_LIMIT | True | None |
| Databend | zobi.db_engine_specs.databend | FORCE_LIMIT | True | None |
| Databricks | zobi.db_engine_specs.databricks | FORCE_LIMIT | True | None |
| Databricks (legacy) | zobi.db_engine_specs.databricks | FORCE_LIMIT | True | None |
| Databricks Interactive Cluster | zobi.db_engine_specs.databricks | FORCE_LIMIT | True | 767 |
| Databricks SQL Endpoint | zobi.db_engine_specs.databricks | FORCE_LIMIT | True | None |
| Denodo | zobi.db_engine_specs.denodo | FORCE_LIMIT | True | None |
| Dremio | zobi.db_engine_specs.dremio | FORCE_LIMIT | True | None |
| DuckDB | zobi.db_engine_specs.duckdb | FORCE_LIMIT | True | None |
| ElasticSearch (OpenDistro SQL) | zobi.db_engine_specs.elasticsearch | FORCE_LIMIT | True | None |
| ElasticSearch (SQL API) | zobi.db_engine_specs.elasticsearch | FORCE_LIMIT | True | None |
| Exasol | zobi.db_engine_specs.exasol | FORCE_LIMIT | True | 128 |
| Firebird | zobi.db_engine_specs.firebird | FETCH_MANY | True | None |
| Firebolt | zobi.db_engine_specs.firebolt | FORCE_LIMIT | True | None |
| Google BigQuery | zobi.db_engine_specs.bigquery | FORCE_LIMIT | True | 128 |
| Google Sheets | zobi.db_engine_specs.gsheets | FORCE_LIMIT | True | None |
| IBM Db2 | zobi.db_engine_specs.db2 | WRAP_SQL | True | 30 |
| IBM Db2 for i | zobi.db_engine_specs.ibmi | WRAP_SQL | True | 128 |
| IBM Netezza Performance Server | zobi.db_engine_specs.netezza | FORCE_LIMIT | True | None |
| KustoKQL | zobi.db_engine_specs.kusto | FORCE_LIMIT | True | None |
| KustoSQL | zobi.db_engine_specs.kusto | WRAP_SQL | True | None |
| MariaDB | zobi.db_engine_specs.mariadb | FORCE_LIMIT | True | 64 |
| Microsoft SQL Server | zobi.db_engine_specs.mssql | FORCE_LIMIT | True | 128 |
| MotherDuck | zobi.db_engine_specs.duckdb | FORCE_LIMIT | True | None |
| MySQL | zobi.db_engine_specs.mysql | FORCE_LIMIT | True | 64 |
| OceanBase | zobi.db_engine_specs.oceanbase | FORCE_LIMIT | True | 128 |
| Ocient | zobi.db_engine_specs.ocient | FORCE_LIMIT | True | 30 |
| Oracle | zobi.db_engine_specs.oracle | FORCE_LIMIT | True | 128 |
| Parseable | zobi.db_engine_specs.parseable | FORCE_LIMIT | True | None |
| PostgreSQL | zobi.db_engine_specs.postgres | FORCE_LIMIT | True | None |
| Presto | zobi.db_engine_specs.presto | FORCE_LIMIT | True | None |
| RisingWave | zobi.db_engine_specs.risingwave | FORCE_LIMIT | True | 63 |
| SAP HANA | zobi.db_engine_specs.hana | WRAP_SQL | True | 30 |
| SQLite | zobi.db_engine_specs.sqlite | FORCE_LIMIT | True | None |
| Shillelagh | zobi.db_engine_specs.shillelagh | FORCE_LIMIT | True | None |
| SingleStore | zobi.db_engine_specs.singlestore | FORCE_LIMIT | True | 256 |
| Snowflake | zobi.db_engine_specs.snowflake | FORCE_LIMIT | True | 256 |
| StarRocks | zobi.db_engine_specs.starrocks | FORCE_LIMIT | True | 64 |
| Zobi meta database | zobi.db_engine_specs.zobi | FORCE_LIMIT | True | None |
| TDengine | zobi.db_engine_specs.tdengine | FORCE_LIMIT | True | 64 |
| Teradata | zobi.db_engine_specs.teradata | FORCE_LIMIT | True | 30 |
| Trino | zobi.db_engine_specs.trino | FORCE_LIMIT | True | None |
| Vertica | zobi.db_engine_specs.vertica | FORCE_LIMIT | True | None |
| YDB | zobi.db_engine_specs.ydb | FORCE_LIMIT | True | None |
| base | zobi.db_engine_specs.presto | FORCE_LIMIT | True | None |

### SQL Capabilities

| Database | JOINs | Subqueries | Aliases in SELECT | Aliases in ORDER BY | CTEs | Comments | Escaped Colons | Inline Time Groupby | Source Column When Aliased | Aggregations in ORDER BY | Expressions in ORDER BY |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Amazon Athena | True | True | True | True | True | True | False | False | False | True | False |
| Amazon DynamoDB | True | True | True | True | True | True | True | False | False | True | False |
| Amazon Redshift | True | True | True | True | True | True | True | False | False | True | False |
| Doris | True | True | True | True | True | True | True | False | False | True | False |
| Drill | True | True | True | True | True | True | True | False | False | True | False |
| Druid | False | True | True | True | True | True | True | False | False | True | False |
| Hive | True | True | True | True | True | True | True | False | False | False | False |
| Impala | True | True | True | True | True | True | True | False | False | True | False |
| Kylin | True | True | True | True | True | True | True | False | False | True | False |
| Pinot | False | False | False | False | True | True | True | False | False | True | False |
| Solr | False | False | True | True | True | True | True | False | False | True | False |
| Spark SQL | True | True | True | True | True | True | True | False | False | False | False |
| Ascend | True | True | True | True | True | True | True | False | False | True | False |
| Aurora MySQL (Data API) | True | True | True | True | True | True | True | False | False | True | False |
| Aurora PostgreSQL (Data API) | True | True | True | True | True | True | True | False | False | True | False |
| Azure Synapse | True | True | True | True | False | True | True | False | False | True | False |
| ClickHouse | True | True | True | True | True | True | True | True | False | True | False |
| ClickHouse Connect (Zobi) | True | True | True | True | True | True | True | True | False | True | False |
| CockroachDB | True | True | True | True | True | True | True | False | False | True | False |
| Couchbase | False | False | True | True | True | True | True | False | False | True | False |
| CrateDB | True | True | True | True | True | True | True | False | False | True | False |
| Databend | True | True | True | True | True | True | True | True | False | True | False |
| Databricks | True | True | True | True | True | True | True | False | False | True | False |
| Databricks (legacy) | True | True | True | True | True | True | True | False | False | True | False |
| Databricks Interactive Cluster | True | True | True | True | True | True | True | False | False | False | False |
| Databricks SQL Endpoint | True | True | True | True | True | True | True | False | False | True | False |
| Denodo | True | True | True | True | True | True | True | False | False | True | False |
| Dremio | True | True | True | True | True | True | True | False | False | True | False |
| DuckDB | True | True | True | True | True | True | True | False | False | True | False |
| ElasticSearch (OpenDistro SQL) | False | True | True | True | True | False | True | True | False | True | False |
| ElasticSearch (SQL API) | False | True | True | True | True | False | True | True | False | True | False |
| Exasol | True | True | True | True | True | True | True | False | False | True | False |
| Firebird | True | True | True | True | True | True | True | False | False | True | False |
| Firebolt | True | True | True | True | True | True | True | False | False | True | False |
| Google BigQuery | True | True | True | True | True | True | True | False | False | True | True |
| Google Sheets | True | True | True | True | True | True | True | False | False | True | False |
| IBM Db2 | True | True | True | True | True | True | True | False | False | True | False |
| IBM Db2 for i | True | True | True | True | True | True | True | False | False | True | False |
| IBM Netezza Performance Server | True | True | True | True | True | True | True | False | False | True | False |
| KustoKQL | True | True | True | True | True | False | True | True | False | True | False |
| KustoSQL | True | True | True | True | True | False | True | True | False | True | False |
| MariaDB | True | True | True | True | True | True | True | False | False | True | False |
| Microsoft SQL Server | True | True | True | True | False | True | True | False | False | True | False |
| MotherDuck | True | True | True | True | True | True | True | False | False | True | False |
| MySQL | True | True | True | True | True | True | True | False | False | True | False |
| OceanBase | True | True | True | True | True | True | True | False | False | True | False |
| Ocient | True | True | True | True | False | True | True | False | False | True | False |
| Oracle | True | True | True | True | True | True | True | False | False | True | False |
| Parseable | True | True | True | True | True | True | True | False | False | True | False |
| PostgreSQL | True | True | True | True | True | True | True | False | False | True | False |
| Presto | True | True | True | True | True | True | True | False | True | True | False |
| RisingWave | True | True | True | True | True | True | True | False | False | True | False |
| SAP HANA | True | True | True | True | True | True | True | False | False | True | False |
| SQLite | True | True | True | True | True | True | True | False | False | True | False |
| Shillelagh | True | True | True | True | True | True | True | False | False | True | False |
| SingleStore | True | True | True | True | True | True | True | False | False | True | False |
| Snowflake | True | True | True | True | True | True | True | False | False | True | False |
| StarRocks | True | True | True | True | True | True | True | False | False | True | False |
| Zobi meta database | True | True | True | True | True | True | True | False | False | True | False |
| TDengine | True | True | True | True | True | True | True | False | False | True | False |
| Teradata | True | True | True | True | True | True | True | False | False | True | False |
| Trino | True | True | True | True | True | True | True | False | True | True | False |
| Vertica | True | True | True | True | True | True | True | False | False | True | False |
| YDB | True | True | True | True | True | True | True | False | False | True | False |
| base | True | True | True | True | True | True | True | False | False | True | False |

### Time Grains – Common

| Database | SECOND | MINUTE | HOUR | DAY | WEEK | MONTH | QUARTER | YEAR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Amazon Athena | True | True | True | True | True | True | True | True |
| Amazon DynamoDB | True | True | True | True | True | True | True | True |
| Amazon Redshift | True | True | True | True | True | True | True | True |
| Doris | True | True | True | True | True | True | True | True |
| Drill | True | True | True | True | True | True | True | True |
| Druid | True | True | True | True | True | True | True | True |
| Hive | True | True | True | True | True | True | True | True |
| Impala | False | True | True | True | True | True | True | True |
| Kylin | True | True | True | True | True | True | True | True |
| Pinot | True | True | True | True | True | True | True | True |
| Solr | False | False | False | False | False | False | False | False |
| Spark SQL | True | True | True | True | True | True | True | True |
| Ascend | True | True | True | True | True | True | True | True |
| Aurora MySQL (Data API) | True | True | True | True | True | True | True | True |
| Aurora PostgreSQL (Data API) | True | True | True | True | True | True | True | True |
| Azure Synapse | True | True | True | True | True | True | True | True |
| ClickHouse | False | True | True | True | True | True | True | True |
| ClickHouse Connect (Zobi) | False | True | True | True | True | True | True | True |
| CockroachDB | True | True | True | True | True | True | True | True |
| Couchbase | True | True | True | True | False | True | True | True |
| CrateDB | True | True | True | True | True | True | True | True |
| Databend | True | True | True | True | True | True | True | True |
| Databricks | True | True | True | True | True | True | True | True |
| Databricks (legacy) | True | True | True | True | True | True | True | True |
| Databricks Interactive Cluster | True | True | True | True | True | True | True | True |
| Databricks SQL Endpoint | True | True | True | True | True | True | True | True |
| Denodo | False | True | True | True | True | True | True | True |
| Dremio | True | True | True | True | True | True | True | True |
| DuckDB | True | True | True | True | True | True | True | True |
| ElasticSearch (OpenDistro SQL) | True | True | True | True | False | True | False | True |
| ElasticSearch (SQL API) | True | True | True | True | True | True | False | True |
| Exasol | True | True | True | True | True | True | True | True |
| Firebird | True | True | True | True | False | True | False | True |
| Firebolt | True | True | True | True | True | True | True | True |
| Google BigQuery | True | True | True | True | True | True | True | True |
| Google Sheets | True | True | True | True | True | True | True | True |
| IBM Db2 | True | True | True | True | True | True | True | True |
| IBM Db2 for i | True | True | True | True | True | True | True | True |
| IBM Netezza Performance Server | True | True | True | True | True | True | True | True |
| KustoKQL | True | True | True | True | True | True | False | True |
| KustoSQL | True | True | True | True | True | True | True | True |
| MariaDB | True | True | True | True | True | True | True | True |
| Microsoft SQL Server | True | True | True | True | True | True | True | True |
| MotherDuck | True | True | True | True | True | True | True | True |
| MySQL | True | True | True | True | True | True | True | True |
| OceanBase | True | True | True | True | True | True | True | True |
| Ocient | True | True | True | True | True | True | False | True |
| Oracle | True | True | True | True | True | True | True | True |
| Parseable | True | True | True | True | True | True | True | True |
| PostgreSQL | True | True | True | True | True | True | True | True |
| Presto | True | True | True | True | True | True | True | True |
| RisingWave | True | True | True | True | True | True | True | True |
| SAP HANA | True | True | True | True | False | True | True | True |
| SQLite | True | True | True | True | True | True | True | True |
| Shillelagh | True | True | True | True | True | True | True | True |
| SingleStore | True | True | True | True | True | True | True | True |
| Snowflake | True | True | True | True | True | True | True | True |
| StarRocks | True | True | True | True | True | True | True | True |
| Zobi meta database | True | True | True | True | True | True | True | True |
| TDengine | True | True | True | True | True | False | False | False |
| Teradata | False | True | True | True | True | True | True | True |
| Trino | True | True | True | True | True | True | True | True |
| Vertica | True | True | True | True | True | True | True | True |
| YDB | True | True | True | True | True | True | True | True |
| base | True | True | True | True | True | True | True | True |

### Time Grains – Extended

| Database | FIVE_SECONDS | THIRTY_SECONDS | FIVE_MINUTES | TEN_MINUTES | FIFTEEN_MINUTES | THIRTY_MINUTES | HALF_HOUR | SIX_HOURS | WEEK_STARTING_SUNDAY | WEEK_STARTING_MONDAY | WEEK_ENDING_SATURDAY | WEEK_ENDING_SUNDAY | QUARTER_YEAR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Amazon Athena | False | False | False | False | False | False | False | False | True | False | True | False | False |
| Amazon DynamoDB | False | False | False | False | False | False | False | False | True | True | True | True | False |
| Amazon Redshift | True | True | True | True | True | True | False | False | False | False | False | False | False |
| Doris | False | False | False | False | False | False | False | False | False | True | False | False | False |
| Drill | False | False | False | False | True | True | False | False | False | False | False | False | False |
| Druid | True | True | True | True | True | True | False | True | True | False | True | False | False |
| Hive | False | False | False | False | False | False | False | False | True | False | True | False | False |
| Impala | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Kylin | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Pinot | False | False | True | True | True | True | False | False | False | False | False | False | False |
| Solr | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Spark SQL | False | False | False | False | False | False | False | False | True | False | True | False | False |
| Ascend | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Aurora MySQL (Data API) | False | False | False | False | False | False | False | False | False | True | False | False | False |
| Aurora PostgreSQL (Data API) | True | True | True | True | True | True | False | False | False | False | False | False | False |
| Azure Synapse | False | False | True | True | True | True | False | False | True | True | False | False | False |
| ClickHouse | False | False | True | True | True | True | False | False | False | False | False | False | False |
| ClickHouse Connect (Zobi) | False | False | True | True | True | True | False | False | False | False | False | False | False |
| CockroachDB | True | True | True | True | True | True | False | False | False | False | False | False | False |
| Couchbase | False | False | False | False | False | False | False | False | False | False | False | False | False |
| CrateDB | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Databend | False | False | True | True | True | False | False | False | False | False | False | False | False |
| Databricks | False | False | False | False | False | False | False | False | True | False | True | False | False |
| Databricks (legacy) | False | False | False | False | False | False | False | False | True | False | True | False | False |
| Databricks Interactive Cluster | False | False | False | False | False | False | False | False | True | False | True | False | False |
| Databricks SQL Endpoint | False | False | False | False | False | False | False | False | True | False | True | False | False |
| Denodo | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Dremio | False | False | False | False | False | False | False | False | False | False | False | False | False |
| DuckDB | False | False | False | False | False | False | False | False | False | False | False | False | False |
| ElasticSearch (OpenDistro SQL) | False | False | False | False | False | False | False | False | False | False | False | False | False |
| ElasticSearch (SQL API) | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Exasol | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Firebird | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Firebolt | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Google BigQuery | False | False | True | True | True | True | False | False | False | True | False | False | False |
| Google Sheets | True | True | True | True | True | True | True | True | True | True | True | True | True |
| IBM Db2 | False | False | False | False | False | False | False | False | False | False | False | False | False |
| IBM Db2 for i | False | False | False | False | False | False | False | False | False | False | False | False | False |
| IBM Netezza Performance Server | False | False | False | False | False | False | False | False | False | False | False | False | False |
| KustoKQL | False | True | True | False | False | True | False | False | False | False | False | False | False |
| KustoSQL | False | False | True | True | True | False | True | False | True | True | False | False | False |
| MariaDB | False | False | False | False | False | False | False | False | False | True | False | False | False |
| Microsoft SQL Server | False | False | True | True | True | True | False | False | True | True | False | False | False |
| MotherDuck | False | False | False | False | False | False | False | False | False | False | False | False | False |
| MySQL | False | False | False | False | False | False | False | False | False | True | False | False | False |
| OceanBase | False | False | False | False | False | False | False | False | False | True | False | False | False |
| Ocient | False | False | False | False | False | False | False | False | False | False | False | False | True |
| Oracle | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Parseable | False | False | False | False | False | False | False | False | False | False | False | False | False |
| PostgreSQL | True | True | True | True | True | True | False | False | False | False | False | False | False |
| Presto | True | True | True | True | True | False | True | True | True | True | True | True | False |
| RisingWave | True | True | True | True | True | True | False | False | False | False | False | False | False |
| SAP HANA | False | False | False | False | False | False | False | False | False | False | False | False | False |
| SQLite | True | True | True | True | True | True | True | True | True | True | True | True | True |
| Shillelagh | True | True | True | True | True | True | True | True | True | True | True | True | True |
| SingleStore | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Snowflake | False | False | True | True | True | True | False | False | False | False | False | False | False |
| StarRocks | False | False | False | False | False | False | False | False | False | True | False | False | False |
| Zobi meta database | True | True | True | True | True | True | True | True | True | True | True | True | True |
| TDengine | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Teradata | False | False | False | False | False | False | False | False | False | False | False | False | False |
| Trino | True | True | True | True | True | False | True | True | True | True | True | True | False |
| Vertica | True | True | True | True | True | True | False | False | False | False | False | False | False |
| YDB | False | True | True | True | True | True | False | False | False | False | False | False | False |
| base | True | True | True | True | True | False | True | True | True | True | True | True | False |

### Core Platform & Metadata Features


Integration with platform features and metadata handling.

| Database | Masked Encrypted Extra | Column Type Mappings | Function Names | File Upload | Dynamic Schema | Catalog | Dynamic Catalog | SSH Tunneling | Latest Partition | Query Cancellation | Get Metrics | Extra Table Metadata | Exception Mapping | Custom Errors |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Amazon Athena | False | False | False | True | False | False | False | False | False | False | False | False | False | False |
| Amazon DynamoDB | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Amazon Redshift | False | False | False | True | False | False | False | True | False | True | False | False | False | False |
| Doris | False | True | False | True | True | True | True | True | False | True | False | False | False | False |
| Drill | False | False | False | True | True | False | False | True | False | False | False | False | False | False |
| Druid | False | False | False | True | False | False | False | True | False | False | False | False | True | False |
| Hive | False | True | True | True | True | True | True | True | True | True | False | True | False | False |
| Impala | False | False | False | True | False | False | False | True | False | True | False | False | False | False |
| Kylin | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Pinot | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Solr | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Spark SQL | False | True | True | True | True | True | True | True | True | True | False | True | False | False |
| Ascend | False | False | False | True | False | False | False | True | False | True | False | False | False | False |
| Aurora MySQL (Data API) | False | True | False | True | True | False | False | True | False | True | False | False | False | False |
| Aurora PostgreSQL (Data API) | False | True | False | True | True | True | True | True | False | True | False | False | False | False |
| Azure Synapse | False | True | False | True | False | False | False | True | False | False | False | False | False | False |
| ClickHouse | False | True | True | False | False | False | False | True | False | False | False | False | True | False |
| ClickHouse Connect (Zobi) | False | True | True | False | True | False | False | True | False | False | False | False | True | False |
| CockroachDB | False | True | False | True | True | True | True | True | False | True | False | False | False | False |
| Couchbase | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| CrateDB | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Databend | False | True | True | False | False | False | False | True | False | False | False | False | True | False |
| Databricks | False | False | False | True | True | True | True | True | False | False | False | False | False | True |
| Databricks (legacy) | False | False | False | True | True | True | True | True | False | False | False | False | False | True |
| Databricks Interactive Cluster | False | True | True | True | True | True | True | True | True | True | False | True | False | False |
| Databricks SQL Endpoint | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Denodo | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Dremio | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| DuckDB | False | True | False | True | False | False | False | True | False | False | False | False | False | False |
| ElasticSearch (OpenDistro SQL) | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| ElasticSearch (SQL API) | False | False | False | True | False | False | False | True | False | False | False | False | True | False |
| Exasol | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Firebird | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Firebolt | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Google BigQuery | False | False | False | True | False | True | True | False | True | False | False | True | True | False |
| Google Sheets | False | False | True | True | False | False | False | False | False | False | False | True | False | False |
| IBM Db2 | False | False | False | True | True | False | False | True | False | False | False | False | False | False |
| IBM Db2 for i | False | False | False | True | True | False | False | True | False | False | False | False | False | False |
| IBM Netezza Performance Server | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| KustoKQL | False | False | False | True | False | False | False | True | False | False | False | False | True | False |
| KustoSQL | False | True | False | True | False | False | False | True | False | False | False | False | True | False |
| MariaDB | False | True | False | True | True | False | False | True | False | True | False | False | False | False |
| Microsoft SQL Server | False | True | False | True | False | False | False | True | False | False | False | False | False | False |
| MotherDuck | False | True | False | True | False | True | True | True | False | False | False | False | False | False |
| MySQL | False | True | False | True | True | False | False | True | False | True | False | False | False | False |
| OceanBase | False | True | False | True | True | False | False | True | False | True | False | False | False | False |
| Ocient | False | False | False | True | False | False | False | True | False | True | False | False | False | False |
| Oracle | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Parseable | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| PostgreSQL | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Presto | False | True | True | True | True | True | True | True | True | True | False | True | False | False |
| RisingWave | False | True | False | True | True | True | True | True | False | True | False | False | False | False |
| SAP HANA | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| SQLite | False | False | True | True | False | False | False | False | False | False | False | False | False | False |
| Shillelagh | False | False | True | True | False | False | False | False | False | False | False | False | False | False |
| SingleStore | False | True | True | True | True | False | False | True | False | True | False | False | False | False |
| Snowflake | False | False | False | True | True | True | True | True | False | True | False | False | False | False |
| StarRocks | False | True | False | True | True | False | False | True | False | True | False | False | False | False |
| Zobi meta database | False | False | True | False | False | False | False | False | False | False | False | False | False | False |
| TDengine | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Teradata | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| Trino | False | True | True | True | True | True | True | True | True | True | False | True | True | False |
| Vertica | False | False | False | True | False | False | False | True | False | False | False | False | False | False |
| YDB | False | False | False | False | False | False | False | True | False | False | False | False | False | False |
| base | False | True | True | True | True | True | True | True | True | False | False | False | False | False |

### Operational & Advanced Features

| Database | User Impersonation | Expand Data | Cost Estimation | SQL Validation |
| --- | --- | --- | --- | --- |
| Amazon Athena | False | False | False | False |
| Amazon DynamoDB | False | False | False | False |
| Amazon Redshift | False | False | False | False |
| Doris | False | False | False | False |
| Drill | True | False | False | False |
| Druid | False | False | False | False |
| Hive | True | True | True | False |
| Impala | False | False | False | False |
| Kylin | False | False | False | False |
| Pinot | False | False | False | False |
| Solr | False | False | False | False |
| Spark SQL | True | True | True | False |
| Ascend | False | False | False | False |
| Aurora MySQL (Data API) | False | False | False | False |
| Aurora PostgreSQL (Data API) | False | False | True | True |
| Azure Synapse | False | False | False | False |
| ClickHouse | False | False | False | False |
| ClickHouse Connect (Zobi) | False | False | False | False |
| CockroachDB | False | False | True | False |
| Couchbase | False | False | False | False |
| CrateDB | False | False | False | False |
| Databend | False | False | False | False |
| Databricks | False | False | False | False |
| Databricks (legacy) | False | False | False | False |
| Databricks Interactive Cluster | True | True | True | False |
| Databricks SQL Endpoint | False | False | False | False |
| Denodo | False | False | False | False |
| Dremio | False | False | False | False |
| DuckDB | False | False | False | False |
| ElasticSearch (OpenDistro SQL) | False | False | False | False |
| ElasticSearch (SQL API) | False | False | False | False |
| Exasol | False | False | False | False |
| Firebird | False | False | False | False |
| Firebolt | False | False | False | False |
| Google BigQuery | False | False | True | False |
| Google Sheets | True | False | False | False |
| IBM Db2 | False | False | False | False |
| IBM Db2 for i | False | False | False | False |
| IBM Netezza Performance Server | False | False | False | False |
| KustoKQL | False | False | False | False |
| KustoSQL | False | False | False | False |
| MariaDB | False | False | False | False |
| Microsoft SQL Server | False | False | False | False |
| MotherDuck | False | False | False | False |
| MySQL | False | False | False | False |
| OceanBase | False | False | False | False |
| Ocient | False | False | False | False |
| Oracle | False | False | False | False |
| Parseable | False | False | False | False |
| PostgreSQL | False | False | False | False |
| Presto | True | True | True | True |
| RisingWave | False | False | True | False |
| SAP HANA | False | False | False | False |
| SQLite | False | False | False | False |
| Shillelagh | False | False | False | False |
| SingleStore | False | False | False | False |
| Snowflake | False | False | False | False |
| StarRocks | True | False | False | False |
| Zobi meta database | False | False | False | False |
| TDengine | False | False | False | False |
| Teradata | False | False | False | False |
| Trino | True | False | True | False |
| Vertica | False | False | False | False |
| YDB | False | False | False | False |
| base | False | False | True | False |

## How to Add a New Database

Adding a new database to Zobi involves creating a DB engine spec file with a `metadata` attribute. This metadata is used to generate documentation and provide connection information to users.

### Quick Start

1. **Create a new file** in `zobi/db_engine_specs/` (e.g., `mydatabase.py`)
2. **Add metadata** with required fields (description, category, pypi_packages, connection_string)
3. **Run the linter** to verify completeness: `python zobi/db_engine_specs/lint_metadata.py`
4. **Add a logo** (optional) in `docs/static/img/databases/`

### Minimal Example

```python
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory

class MyDatabaseEngineSpec(BaseEngineSpec):
    engine = "mydatabase"
    engine_name = "My Database"

    metadata = {
        # Required fields
        "description": "A brief description of the database.",
        "category": DatabaseCategory.TRADITIONAL_RDBMS,
        "pypi_packages": ["my-database-driver"],
        "connection_string": "mydatabase://{username}:{password}@{host}:{port}/{database}",

        # Recommended fields
        "logo": "mydatabase.svg",
        "homepage_url": "https://mydatabase.example.com/",
        "default_port": 5432,
    }
```

### Full Example with All Fields

```python
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory

class MyDatabaseEngineSpec(BaseEngineSpec):
    engine = "mydatabase"
    engine_name = "My Database"

    metadata = {
        # Required fields
        "description": "A brief description of the database.",
        "category": DatabaseCategory.TRADITIONAL_RDBMS,
        "pypi_packages": ["my-database-driver"],
        "connection_string": "mydatabase://{username}:{password}@{host}:{port}/{database}",

        # Recommended fields
        "logo": "mydatabase.svg",  # Logo file in docs/static/img/databases/
        "homepage_url": "https://mydatabase.example.com/",
        "default_port": 5432,

        # Optional fields
        "docs_url": "https://mydatabase.example.com/docs",
        "notes": "Any special notes about configuration or usage.",
        "install_instructions": "pip install my-database-driver",
        "parameters": {
            "username": "Database username",
            "password": "Database password",
            "host": "Hostname or IP address",
            "port": "Port number (default: 5432)",
            "database": "Database name",
        },
        "connection_examples": [
            {
                "description": "Local connection",
                "connection_string": "mydatabase://user:pass@localhost:5432/mydb",
            },
        ],
        "authentication_methods": [
            {
                "name": "OAuth2",
                "description": "Token-based authentication",
            },
        ],
        "drivers": [
            {
                "name": "Default Driver",
                "pypi_package": "my-database-driver",
                "connection_string": "mydatabase://...",
                "is_recommended": True,
            },
        ],
        "compatible_databases": [
            {
                "name": "Compatible DB",
                "description": "A database that uses the same protocol",
            },
        ],
    }
```

### Database Categories

Use constants from `DatabaseCategory` to categorize your database:

| Category | Description | Examples |
|----------|-------------|----------|
| `CLOUD_AWS` | AWS cloud services | Athena, Redshift, DynamoDB |
| `CLOUD_GCP` | Google Cloud services | BigQuery, Sheets |
| `CLOUD_AZURE` | Azure cloud services | Synapse, Kusto |
| `CLOUD_DATA_WAREHOUSES` | Cloud data warehouses | Snowflake, Databricks |
| `PROJECTS` | projects | Druid, Hive, Spark, Pinot |
| `TRADITIONAL_RDBMS` | Traditional databases | PostgreSQL, MySQL, Oracle |
| `ANALYTICAL_DATABASES` | Analytical/OLAP databases | ClickHouse, StarRocks |
| `SEARCH_NOSQL` | Search and NoSQL databases | Elasticsearch, Couchbase |
| `QUERY_ENGINES` | Query engines | Trino, Presto |
| `TIME_SERIES` | Time-series databases | TDengine, TimescaleDB |
| `OTHER` | Other databases | - |

### Metadata Completeness Linter

A linter is available to check metadata completeness across all engine specs:

```bash
# Run the linter to see current status
python zobi/db_engine_specs/lint_metadata.py

# Generate a markdown report
python zobi/db_engine_specs/lint_metadata.py --markdown

# Output to a file
python zobi/db_engine_specs/lint_metadata.py --markdown -o METADATA_STATUS.md
```

The linter checks for:
- **Required fields**: description, category, pypi_packages, connection_string
- **Recommended fields**: logo, homepage_url, default_port

See [METADATA_STATUS.md](METADATA_STATUS.md) for the current completeness report.

### PostgreSQL-Compatible Databases

If your database is PostgreSQL-compatible, inherit from `PostgresBaseEngineSpec`:

```python
from zobi.db_engine_specs.postgres import PostgresBaseEngineSpec

class MyPostgresCompatibleEngineSpec(PostgresBaseEngineSpec):
    engine = "mydb"
    engine_name = "My PostgreSQL-Compatible DB"

    metadata = {
        "description": "A PostgreSQL-compatible database.",
        "category": DatabaseCategory.TRADITIONAL_RDBMS,
        "pypi_packages": ["psycopg2"],  # Uses the PostgreSQL driver
        "connection_string": "postgresql://{username}:{password}@{host}:{port}/{database}",
        "notes": "Uses the PostgreSQL driver. psycopg2 comes bundled with Zobi.",
    }
```

## Database information

A DB engine spec has attributes that describe the underlying database engine, so that Zobi can know how to build and run queries. For example, some databases don't support subqueries, which are needed for some of the queries produced by Zobi for certain charts. When a database doesn't support subqueries the query is run in two-steps, using the results from the first query to build the second query.

These attributes and their default values (set in the base class, `BaseEngineSpec`) are described below:

### `limit_method = LimitMethod.FORCE_LIMIT`

When running user queries in SQL Lab, Zobi needs to limit the number of rows returned. The reason for that is cost and performance: there's no point in running a query that produces millions of rows when they can't be loaded into the browser.

For most databases this is done by parsing the user submitted query and applying a limit, if one is not present, or replacing the existing limit if it's larger. This is called the `FORCE_LIMIT` method, and is the most efficient, since the database will produce at most the number of rows that Zobi will display.

For some databases this method might not work, and they can use the `WRAP_SQL` method, which wraps the original query in a `SELECT *` and applies a limit via the SQLAlchemy dialect, which should get translated to the correct syntax. This method might be inefficient, since the database optimizer might not be able to push the limit to the inner query.

Finally, as a last resource there is the `FETCH_MANY` method. When a DB engine spec uses this method the query runs unmodified, but Zobi fetches only a certain number of rows from the cursor. It's possible that a database using this method can optimize the query execution and compute rows as they are being read by the cursor, but it's unlikely. This makes this method the least efficient of the three.

Note that when Zobi runs a query with a given limit, say 100, it always modifies the query to request one additional row (`LIMIT 101`, in this case). This extra row is dropped before the results are returned to the user, but it allows Zobi to inform the users that the query was indeed limited. Otherwise a query with `LIMIT 100` that returns exactly 100 rows would seem like it was limited, when in fact it was not.

### `allows_joins = True`

Not all databases support `JOIN`s. When building complex charts, Zobi will try to join the table to itself in order to compute `top_n` groups, for example. If the database doesn't support joins Zobi will instead run a prequery, and use the results to build the final query.

### `allows_subqueries = True`

Similarly, not all databases support subqueries. For more complex charts Zobi will build subqueries if possible, or run the query in two-steps otherwise.

### `allows_alias_in_select = True`

Does the DB support aliases in the projection of a query, eg:

```sql
SELECT COUNT(*) AS cnt
```

Zobi will try to use aliases whenever possible, in order to give friendly names to expressions.

### `allows_alias_in_orderby = True`

Does the DB support referencing alias in the `GROUP BY`, eg:

```sql
SELECT
  UPPER(country_of_origin) AS country
  COUNT(*) AS cnt
FROM
  some_table
GROUP BY
  country
```

Otherwise the query is written as:

```sql
SELECT
  UPPER(country_of_origin) AS country
  COUNT(*) AS cnt
FROM
  some_table
GROUP BY
  UPPER(country_of_origin)
```

### `time_groupby_inline = False`

In theory this attribute should be used to omit time filters from the self-joins. When the attribute is false the time attribute will be present in the subquery used to compute limited series, eg:

```sql
SELECT DATE_TRUNC('day', ts) AS ts,
       team AS team,
       COUNT(*) AS count
FROM public.threads
JOIN
  (SELECT team AS team__,
          COUNT(*) AS mme_inner__
   FROM public.threads
   -- this is added when `time_groupby_inline = False`
   WHERE ts >= TO_TIMESTAMP('2022-07-27 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.US')
     AND ts < TO_TIMESTAMP('2023-07-27 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.US')
   --
   GROUP BY team
   ORDER BY mme_inner__ DESC
   LIMIT 5) AS anon_1 ON team = team__
WHERE ts >= TO_TIMESTAMP('2022-07-27 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.US')
  AND ts < TO_TIMESTAMP('2023-07-27 00:00:00.000000', 'YYYY-MM-DD HH24:MI:SS.US')
GROUP BY DATE_TRUNC('day', ts),
         team
ORDER BY count DESC
LIMIT 10000;
```

In practice, the attribute doesn't seem to be working as of 2023-07-27.

### `allows_alias_to_source_column = True`

When this is true the database allows queries where alias can overshadow existing column names. For example, in this query:

```sql
SELECT
  foo + 1 AS foo
FROM
  some_table
ORDER BY
  foo  -- references the alias `foo + 1`, not the column `foo`
```

### `allows_hidden_orderby_agg = True`

If set to true the database allows expressions in the `GROUP BY` that are not present in the projection (`SELECT`), eg:

```sql
SELECT
  country,
  COUNT(*)
FROM
  some_table
GROUP BY
  country
ORDER BY
  SUM(population)  -- not present in the `SELECT`
```

### `allows_hidden_cc_in_orderby = False`

This the opposite of `allows_alias_in_orderby`, for databases that require aliases in the `ORDER BY`. For example, BigQuery doesn't like this query:

```sql
SELECT
  CASE
    WHEN type = 'feature' THEN 'f'
    WHEN type = 'bug' THEN 'b'
    ELSE 'o'
  END AS cc_type
FROM
  some_table
GROUP BY
  cc_type
ORDER BY
  CASE
    WHEN type = 'feature' THEN 'f'
    WHEN type = 'bug' THEN 'b'
    ELSE 'o'
  END
```

Instead, it must be written as:

```sql
SELECT
  CASE
    WHEN type = 'feature' THEN 'f'
    WHEN type = 'bug' THEN 'b'
    ELSE 'o'
  END AS cc_type
FROM
  some_table
GROUP BY
  cc_type
ORDER BY
  cc_type
```

### `allows_cte_in_subquery = True`

When a virtual dataset is used in a chart the original query is converted into a subquery, and is wrapped in an outer query that is generated based on the chart controls. The virtual dataset query might have a CTE, and some databases don't like subqueries with CTEs in them.

When this attribute is false Zobi will extract the CTE and move it outside of the subquery when generating SQL for charts. The name of the new CTE will be `cte_alias`, also defined in the DB engine spec.

### `allow_limit_clause = True`

Allows for the `LIMIT` clause. Otherwise, the database probably uses `TOP` to limit rows.

### `max_column_name_length: int | None = None`

Most databases have a well defined limit for the maximum length of a column name (SQLite is probably the one exception). While the can be set (and defaults) to `None,` it's highly recommended to set a value to prevent errors.

### `allows_sql_comments = True`

Are comments supported in the DB? In general SQL in comments are defined by double dashes:

```sql
-- this is a comment
SELECT *  -- we need everything
FROM some_table
```

### `allows_escaped_colons = True`

SQLAlchemy recommends escaping colons to prevent them from being interpreted as bindings to parameters. Because of this, when building queries from virtual datasets Zobi will escape all colons with `\:`.

This works for most databases except Athena. The `allows_escaped_colons` attribute specifies if the database supports the escape colon.

## Basic features

These are features that all DB engine specs should support, as the name suggests. They provide a much better user experience for the user.

### Time grains

The most basic feature that DB engine specs need to support is defining time grain expressions. These are dialect-specific SQL expressions that are used to compute metrics on a given time grain when building charts. For example, when computing the metric `COUNT(*)` on a daily basis, Zobi will generate the following query:

```sql
SELECT
  <DB engine spec expression for TimeGrain.DAY>,
  COUNT(*)
...
GROUP BY
  <DB engine spec expression for TimeGrain.DAY>
```

For some databases with support for `DATE_TRUNC` or `TIME_FLOOR` this is easy. Here's how Druid computes 15 minute aggregations:

```sql
TIME_FLOOR(CAST({col} AS TIMESTAMP), 'PT15M')
```

Where `{col}` is the time column being aggregated — the expression is actually a Jinja2 template. Druid uses the ISO standard for durations, with `PT15M` representing 15 minutes.

On the other and, here's the same for SQLite:

```sql
DATETIME(
  STRFTIME(
    '%Y-%m-%dT%H:%M:00',
    {col}
  ),
  printf(
    '-%d minutes',
    CAST(strftime('%M', {col}) AS INT) % 15
  )
)
```

The SQLite version has to truncate the column down to the minute, and then subtract a number of minutes equals to the modulo 15.

Time grain expressions are defined in the `_time_grain_expressions` class attribute, which maps from a `zobi.constants.TimeGrain` to the SQL expression. The dictionary has a special key `None`, that should map to the column directly, for when no time grain is specified.

Note that it's possible to add new time grains via configuration. For example, if you want to add a "2 seconds" time grain to your installation you can add it to `TIME_GRAIN_ADDONS`, and implement it in `TIME_GRAIN_ADDON_EXPRESSIONS`:

```python
# zobi_config.py
TIME_GRAIN_ADDONS = {"PT2S": "2 second"}

TIME_GRAIN_ADDON_EXPRESSIONS = {
    "clickhouse": {
        "PT2S": "toDateTime(intDiv(toUInt32(toDateTime({col})), 2)*2)",
    }
}
```

### Column type mapping

Column type mapping, defined in the `column_type_mappings` class attribute, is just a way of mapping type names from the database to types Zobi understand. The default values in `BaseEngineSpec` are sane:

```python
_default_column_type_mappings: tuple[ColumnTypeMapping, ...] = (
    (
        re.compile(r"^string", re.IGNORECASE),
        types.String(),
        GenericDataType.STRING,
    ),
    (
        re.compile(r"^float", re.IGNORECASE),
        types.Float(),
        GenericDataType.NUMERIC,
    ),
    (
        re.compile(r"^date", re.IGNORECASE),
        types.Date(),
        GenericDataType.TEMPORAL,
    ),
    (
        re.compile(r"^bool(ean)?", re.IGNORECASE),
        types.Boolean(),
        GenericDataType.BOOLEAN,
    ),
    ...
)
```

But you might want to implement more specific types in the DB engine spec, or complex types. For example, for MSSQL we have:

```python
from sqlalchemy.dialects.mssql.base import SMALLDATETIME

class MssqlEngineSpec(BaseEngineSpec):
    ...
    column_type_mappings = (
        (
            re.compile(r"^smalldatetime.*", re.IGNORECASE),
            SMALLDATETIME(),
            GenericDataType.TEMPORAL,
        ),
    )
```

### Function names

DB engine specs should implement a class method called `get_function_names` that returns a list of strings, representing all the function names that the database supports. This is used for autocomplete in SQL Lab.

### Masked encrypted extra

Zobi does a good job in keeping credentials secure. When you add a database with a password, for example:

```text
postgresql://admin:password123@db.example.org:5432/db
```

The password is sent over the network only when the database is created. When you edit the database later, Zobi will return this as the SQLAlchemy URI:

```text
postgresql://admin:XXXXXXXXXX@db.example.org:5432/db
```

The password will be masked in the API response; it's not just masked in the browser UI. This is done in order to avoid sending the password unnecessarily over the network. Also, if a non-admin user has access to the API response, they won't be able to know the database password.

When the database is edited, the Zobi backend is smart enough to replace the masked password with the actual password, unless the password has changed. That is, if you change the database in the URI from `db` to `db2` the SQLAlchemy URI will be stored in the backend as:

```text
postgresql://admin:password123@db.example.org:5432/db2
```

The password is not the only piece of information where security is critical. For many databases (like BigQuery), sensitive information is stored in the credentials JSON payload. For example:

```json
{
  "type": "service_account",
  "project_id": "dbt-tutorial-347100",
  "private_key_id": "<REDACTED_PRIVATE_KEY_ID>",
  "private_key": "<SENSITIVE INFORMATION>",
  "client_email": "dbt-user-278@dbt-tutorial-347100.iam.gserviceaccount.com",
  "client_id": "115666988796889519425",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/dbt-user-278%40dbt-tutorial-347100.iam.gserviceaccount.com"
}
```

Similarly to password, we don't want to send `private_key` to the client when a database is edited; the Zobi API should never return its actual contents. Instead, Zobi should return a masked value, and users should be able to edit the JSON without having to type in the `private_key` on every edit.

To do this, DB engine specs and implement 2 methods, `mask_encrypted_extra` and `unmask_encrypted_extra`. They have these names because the credentials are stored in an encrypted column called `encrypted_extra`. Here's how these methods look like for BigQuery:

```python
from zobi.constants import PASSWORD_MASK


class BigQueryEngineSpec(BaseEngineSpec):

    @classmethod
    def mask_encrypted_extra(cls, encrypted_extra: str | None) -> str | None:
        if encrypted_extra is None:
            return encrypted_extra

        try:
            config = json.loads(encrypted_extra)
        except (json.JSONDecodeError, TypeError):
            return encrypted_extra

        try:
            config["credentials_info"]["private_key"] = PASSWORD_MASK
        except KeyError:
            pass

        return json.dumps(config)

    @classmethod
    def unmask_encrypted_extra(
        cls,
        old: str | None,
        new: str | None
    ) -> str | None:
        if old is None or new is None:
            return new

        try:
            old_config = json.loads(old)
            new_config = json.loads(new)
        except (TypeError, json.JSONDecodeError):
            return new

        if "credentials_info" not in new_config:
            return new

        if "private_key" not in new_config["credentials_info"]:
            return new

        if new_config["credentials_info"]["private_key"] == PASSWORD_MASK:
            new_config["credentials_info"]["private_key"] = old_config[
                "credentials_info"
            ]["private_key"]

        return json.dumps(new_config)
```

This way, when a user edits an existing BigQuery connection, the `private_key` is shown as `XXXXXXXXXX`. Everything else in the JSON is still displayed, and the user can change any of the fields without having to provide the private key.

Note that while this is a basic feature that should be implemented for security reasons, it only makes sense in DB engine specs that use `encrypted_extra` to store connection information.

## Nice to have features

The next set of features are nice to have. They don't apply to all databases, and are not strictly needed for security or usability.

### User impersonation

In general there's no user-level granularity when accessing a database in Zobi. A single database connection is shared by all users who have access to that database. There are many use cases when this is not desirable, and some databases implement mechanisms in which they can **impersonate users**, potentially reducing the scope of permissions available to run the query.

For example, the Google Sheets DB engine spec implements this via the `get_url_for_impersonation` class method:

```python
class GSheetsEngineSpec(ShillelaghEngineSpec):

    @classmethod
    def get_url_for_impersonation(
        cls,
        url: URL,
        impersonate_user: bool,
        username: str | None,
        access_token: str | None,
    ) -> URL:
        if impersonate_user and username is not None:
            user = security_manager.find_user(username=username)
            if user and user.email:
                url = url.update_query_dict({"subject": user.email})

        return url
```

The method `get_url_for_impersonation` updates the SQLAlchemy URI before every query. In this particular case, it will fetch the user's email and add it to the `subject` query argument. The driver will then lower the permissions to match that given user. This allows the connection to be configured with a service account that has access to all the spreadsheets, while giving users access to only the spreadsheets they own are have been shared with them (or with their organization — Google will handle the authorization in this case, not Zobi).

Alternatively, it's also possible to impersonate users by implementing the `update_impersonation_config`. This is a class method which modifies `connect_args` in place. You can use either method, and ideally they [should be consolidated in a single one](https://github.com/HafizMMoaz/zobi/issues/24910).

### OAuth2

Support for authenticating to a database using personal OAuth2 access tokens was introduced in [SIP-85](https://github.com/HafizMMoaz/zobi/issues/20300). The Google Sheets DB engine spec is the reference implementation.

Note that this API is still experimental and evolving quickly, subject to breaking changes. Currently, to add support for OAuth2 to a DB engine spec, the following attributes are needed:

```python
class BaseEngineSpec:

    supports_oauth2 = True
    oauth2_exception = OAuth2RedirectError

    oauth2_scope = " ".join([
        "https://example.org/scope1",
        "https://example.org/scope2",
    ])
    oauth2_authorization_request_uri = "https://example.org/authorize"
    oauth2_token_request_uri = "https://example.org/token"
```

The `oauth2_exception` is an exception that is raised by `cursor.execute` when OAuth2 is needed. This will start the OAuth2 dance when `BaseEngineSpec.execute` is called, by returning the custom error `OAUTH2_REDIRECT` to the frontend. If the database driver doesn't have a specific exception, it might be necessary to overload the `execute` method in the DB engine spec, so that the `BaseEngineSpec.start_oauth2_dance` method gets called whenever OAuth2 is needed.

The DB engine should implement logic in either `get_url_for_impersonation` or `update_impersonation_config` to update the connection with the personal access token. See the Google Sheets DB engine spec for a reference implementation.

Currently OAuth2 needs to be configured at the DB engine spec level, ie, with one client for each DB engien spec. The configuration lives in `zobi_config.py`:

```python
# zobi_config.py
DATABASE_OAUTH2_CLIENTS = {
    "Google Sheets": {
        "id": "XXX.apps.googleusercontent.com",
        "secret": "GOCSPX-YYY",
        "scope": " ".join(
            [
                "https://www.googleapis.com/auth/drive.readonly",
                "https://www.googleapis.com/auth/spreadsheets",
                "https://spreadsheets.google.com/feeds",
            ],
        ),
        "authorization_request_uri": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_request_uri": "https://oauth2.googleapis.com/token",
    },
}
DATABASE_OAUTH2_JWT_ALGORITHM = "HS256"
DATABASE_OAUTH2_REDIRECT_URI = "http://localhost:8088/api/v1/database/oauth2/"
DATABASE_OAUTH2_TIMEOUT = timedelta(seconds=30)
```

When configuring a client only the ID and secret are required; the DB engine spec should have default values for the scope and endpoints. The `DATABASE_OAUTH2_REDIRECT_URI` attribute is optional, and defaults to `/api/v1/databases/oauth2/` in Zobi.

In the future we plan to support adding custom clients via the Zobi UI, and being able to manually assign clients to specific databases.

### File upload

When a DB engine spec supports file upload it declares so via the `supports_file_upload` class attribute. The base class implementation is very generic and should work for any database that has support for `CREATE TABLE`. It leverages Pandas and the [`df_to_sql`](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.to_sql.html) method.

For some databases the `df_to_sql` classmethod needs to be implemented. For example, for BigQuery the DB engine spec implements a custom method that uses the [`to_gbq`](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.to_gbq.html) method.

### Extra table metadata

DB engine specs can return additional metadata associated with a table. This is done via the `get_extra_table_metadata` class method. Trino uses this to return information about the latest partition, for example, and Bigquery returns clustering information. This information is then surfaced in the SQL Lab UI, when browsing tables in the metadata explorer (on the left panel).

### DB API exception mapping

Different DB API 2.0 drivers implement different exceptions, even if they have the same name. The `get_dbapi_exception_mapping` class method returns a dictionary mapping these custom exceptions to Zobi exceptions, so that Zobi can return more specific errors when an exception is raised by the underlying driver.

For example, for ClickHouse we have:

```python
from urllib3.exceptions import NewConnectionError

from zobi.db_engine_specs.exceptions import ZobiDBAPIDatabaseError


class ClickHouseEngineSpec(ClickHouseBaseEngineSpec):

    @classmethod
    def get_dbapi_exception_mapping(cls) -> dict[type[Exception], type[Exception]]:
        return {NewConnectionError: ZobiDBAPIDatabaseError}
```

This way, if the ClickHouse driver raises a `NewConnectionError` it would get wrapped in a `ZobiDBAPIDatabaseError`.

### Custom errors

Queries can fail in many different ways. For example, in SQLite:

```sql
sqlite> CREATE TABLE a (b INT);
sqlite> SELECT c FROM a;
Error: no such column: c
sqlite>
```

When a query fails, Zobi will return the message, "Error: no such column: c", to the user as a generic error.

Since ideally we want to return specific and actionable error messages, DB engine specs can implement methods that map error messages to more specific errors. For example, the SQLite DB engine specs defines:

```python
COLUMN_DOES_NOT_EXIST_REGEX = re.compile("no such column: (?P<column_name>.+)")


class SqliteEngineSpec(BaseEngineSpec):

    custom_errors: dict[Pattern[str], tuple[str, ZobiErrorType, dict[str, Any]]] =
        COLUMN_DOES_NOT_EXIST_REGEX: (
            __('We can\'t seem to resolve the column "%(column_name)s"'),
            ZobiErrorType.COLUMN_DOES_NOT_EXIST_ERROR,
            {},
        ),
    }
```

This way, when a user selects a column that doesn't exist Zobi can return a more informative error.

### Dynamic schema

In SQL Lab it's possible to select a database, and then a schema in that database. Ideally, when running a query in SQL Lab, any unqualified table names (eg, `table`, instead of `schema.table`) should be in the selected schema. For example, if the user selects `dev` as the schema and then runs the following query:

```sql
SELECT * FROM my_table
```

The table `my_table` should live in the `dev` schema. In order to do that, it's necessary to modify the SQLAlchemy URI before running the query. Since different databases have different ways of doing that, this functionality is implemented via the `adjust_engine_params` class method. The method receives the SQLAlchemy URI and `connect_args`, as well as the schema in which the query should run. It then returns a potentially modified URI and `connect_args` to ensure that the query runs in the specified schema.

When a DB engine specs implements `adjust_engine_params` it should have the class attribute `supports_dynamic_schema` set to true. This is critical for security, since **it allows Zobi to know to which schema any unqualified table names belong to**. For example, in the query above, if the database supports dynamic schema, Zobi would check to see if the user running the query has access to `dev.my_table`. On the other hand, if the database doesn't support dynamic schema, Zobi would use the default database schema instead of `dev`.

Implementing this method is also important for usability. When the method is not implemented selecting the schema in SQL Lab has no effect on the schema in which the query runs, resulting in a confusing results when using unqualified table names.

### Catalog

In general, databases support a hierarchy of one-to-many concepts:

1. Database
2. Catalog
3. Namespace
4. Table
5. Column

These concepts have different names depending on the database. For example, Postgres uses the following terminology:

1. Cluster (database)
2. Database (catalog)
3. Schema (namespace)
4. Table
5. Column

BigQuery, on the other hand:

1. BigQuery (database)
2. Project (catalog)
3. Schema (namespace)
4. Table
5. Column

Hive and Trino:

1. Database
2. Catalog
3. Schema
4. Table
5. Column

If the database supports catalogs, then the DB engine spec should have the `supports_catalog` class attribute set to true. It should also implement the `get_default_catalog` method, so that the proper permissions can be created when datasets are added.

### Dynamic catalog

Zobi support for multiple catalogs. Since, in general, a given SQLAlchemy URI connects only to a single catalog, it requires DB engine specs to implement the `adjust_engine_params` method to rewrite the URL to connect to a different catalog, similar to how dynamic schemas work. Additionally, DB engine specs should also implement the `get_catalog_names` method, so that users can browse the available catalogs.

### SSH tunneling

Zobi can connect to databases via an SSH tunnel. For databases where this doesn't make sense (eg, SQLite or BigQuery) the DB engine spec should have `disable_ssh_tunneling` set to true.

### Query cancelation

Zobi will try to cancel running queries if the users wants so, but it's up to the DB engine spec to handle this.

Some databases have an implicit query cancelation. When a cursor stops being polled it will cancel the query. For databases that behave like this, the class method `has_implicit_cancel` (which should really be a class attribute) should return true.

For other databases, DB engine specs can implement query cancelation via the `prepare_cancel_query` and `cancel_query` methods. Implementation of query cancelation is usually heavily dependent on the database, but the DB engine specs that support it can serve as an example.

### Get metrics on dataset creation

When a physical dataset is first created, the `get_metrics` class method is called on the table. The base implementation returns the `COUNT(*)` metric, but DB engine specs can override `get_metrics` to return other metrics. This method is useful for semantic layers that contain their own metrics definitions; when Zobi connect to them it can automatically create those metrics when a dataset is added.

This feature is still experimental, and ideally there would be a mechanism for calling it periodically or when a dataset is explored, in order to sync new metric definitions to the dataset.

### `WHERE` on latest partition

In some databases, running `SELECT *` can be a **very expensive** operation, since the query might scan all partitions for a given table. Because of that, some DB engine specs implement the `where_latest_partition` method, which returns a modified SQLAlchemy query with an additional predicate that filters on the latest partition.

## Advanced features

### Expand complex types

Some databases will visually expand complex types (arrays and structures) when displaying results from queries. For example, the BigQuery UI is able to expand objects into columns and array into rows, so that this:

|   array   |      struct      |
| --------- | ---------------- |
| [1, 2, 3] | {a: one, b: two} |

Is shown as:

| array |      struct      | struct.a | struct.b |
| ----- | ---------------- | -------- | -------- |
| 1     | {a: one, b: two} | one      | two      |
| 2     |                  |          |          |
| 3     |                  |          |          |

A similar behavior has been implemented in Zobi for Presto, and can be enabled via the `PRESTO_EXPAND_DATA` feature flag. To implement this feature a DB engine spec should implement the `expand_data` method, which takes the columns and rows and returns modified columns and rows.

Note that despite being implemented only for Presto, this behavior has nothing that is Presto specific, and in theory could be implemented in a generic way for all database without requiring custom DB engine spec implementations (that is, the Presto `expand_data` method could be moved to the base class, after being cleaned up, and we could then enable the feature per DB in the configuration).

### Query cost estimation

Some databases allow uses to estimate the cost of running a query before running it. This is done via the `estimate_query_cost` method in DB engine specs, which receives the SQL and returns a list of "costs". The definition of what "cost" is varies from database to database (in the few that support this functionality), and it can be formatted via the `query_cost_formatter`.

The `query_cost_formatter` can be overridden with an arbitrary function via the config `QUERY_COST_FORMATTERS_BY_ENGINE`. This allows custom deployments of Zobi to format the results in different ways. For example, at some point in Lyft the cost for running Presto queries would also show the carbon footprint (in trees).

### SQL validation

A few databases support validating the syntax of the SQL as the user is typing it, indicating in SQL Lab any errors. This is usually done using an `EXPLAIN` query and, because it gets called every few seconds as the user types, it's important that the database returns the result quickly.

This is currently implement for Presto and Postgres, via custom classes in `zobi/sql_validators` that should be enabled in the configuration. Implementing this as custom classes, instead of a `validate_sql` method in the DB engine spec offers no advantages, and ideally in the future we should move the logic to DB engine specs.

## Testing DB engine specs

Zobi has a command to test the connection to a given database, as well as checking if the SQLAlchemy dialect implements all necessary methods used by Zobi, and checking which features are supported by the DB engine spec (if one exists). To run the tool just call the `test-db` command with the SQLAlchemy URI to be tested:

```bash
zobi test-db sqlite://
```

If the connection needs additional arguments they can be passed when the command runs.
