
openapi_spec_methods_override = {
    "get": {"get": {"summary": "Get a CSS template"}},
    "get_list": {
        "get": {
            "summary": "Get a list of CSS templates",
            "description": "Gets a list of CSS templates, use Rison or JSON "
            "query parameters for filtering, sorting,"
            " pagination and for selecting specific"
            " columns and metadata.",
        }
    },
    "post": {"post": {"summary": "Create a CSS template"}},
    "put": {"put": {"summary": "Update a CSS template"}},
    "delete": {"delete": {"summary": "Delete a CSS template"}},
    "info": {"get": {"summary": "Get metadata information about this API resource"}},
}

get_delete_ids_schema = {"type": "array", "items": {"type": "integer"}}
