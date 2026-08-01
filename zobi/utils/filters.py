from typing import Any

from flask_appbuilder import Model
from sqlalchemy import or_
from sqlalchemy.sql.elements import BooleanClauseList


def get_dataset_access_filters(
    base_model: type[Model],
    *args: Any,
) -> BooleanClauseList:
    # pylint: disable=import-outside-toplevel
    from zobi import security_manager
    from zobi.connectors.sqla.models import Database

    database_ids = security_manager.get_accessible_databases()
    perms = security_manager.user_view_menu_names("datasource_access")
    schema_perms = security_manager.user_view_menu_names("schema_access")
    catalog_perms = security_manager.user_view_menu_names("catalog_access")

    return or_(
        Database.id.in_(database_ids),
        base_model.perm.in_(perms),
        base_model.catalog_perm.in_(catalog_perms),
        base_model.schema_perm.in_(schema_perms),
        *args,
    )
