from typing import Any

from zobi import db
from zobi.models.sql_lab import SavedQuery


def import_saved_query(config: dict[str, Any], overwrite: bool = False) -> SavedQuery:
    existing = db.session.query(SavedQuery).filter_by(uuid=config["uuid"]).first()
    if existing:
        if not overwrite:
            return existing
        config["id"] = existing.id

    saved_query = SavedQuery.import_from_dict(config, recursive=False)
    if saved_query.id is None:
        db.session.flush()

    return saved_query
