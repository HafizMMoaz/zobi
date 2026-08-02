export default {
  1: {
    allow_ctas: false,
    allow_cvas: false,
    allow_dml: false,
    allow_file_upload: false,
    allow_run_async: true,
    backend: 'postgresql',
    database_name: 'examples',
    expose_in_sqllab: true,
    force_ctas_schema: null,
    id: 1,
  },
};

export const disabledAsyncDb = {
  21: {
    allow_ctas: false,
    allow_cvas: false,
    allow_dml: false,
    allow_file_upload: false,
    allow_run_async: false,
    backend: 'postgresql',
    database_name: 'examples',
    expose_in_sqllab: true,
    force_ctas_schema: null,
    id: 21,
  },
};
