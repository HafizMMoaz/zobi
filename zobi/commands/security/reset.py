import logging
from typing import Any, Optional

from zobi import db, security_manager
from zobi.commands.base import BaseCommand
from zobi.connectors.sqla.models import SqlaTable
from zobi.key_value.models import KeyValueEntry
from zobi.models.core import Database, FavStar, Log
from zobi.models.dashboard import Dashboard
from zobi.models.slice import Slice

logger = logging.getLogger(__name__)


class ResetZobiCommand(BaseCommand):
    def __init__(
        self,
        confirm: bool,
        user: Any,
        exclude_users: Optional[str] = None,
        exclude_roles: Optional[str] = None,
    ) -> None:
        self._user = user
        self._confirm = confirm
        self._users_to_exclude = ["admin"]
        if exclude_users:
            self._users_to_exclude.extend(exclude_users.split(","))
        self._roles_to_exclude = ["Admin", "Public", "Gamma", "Alpha", "sql_lab"]
        if exclude_roles:
            self._roles_to_exclude.extend(exclude_roles.split(","))

    def validate(self) -> None:
        if not self._confirm:
            raise Exception("Reset aborted.")  # pylint: disable=broad-exception-raised
        if not self._user or not self._user.is_active:
            raise Exception("User not found.")  # pylint: disable=broad-exception-raised

    def run(self) -> None:
        self.validate()
        logger.debug("Resetting Zobi Started")
        db.session.query(SqlaTable).delete()
        databases = db.session.query(Database)
        for database in databases:
            db.session.delete(database)
        db.session.query(Dashboard).delete()
        db.session.query(Slice).delete()
        db.session.query(KeyValueEntry).delete()
        db.session.query(Log).delete()
        db.session.query(FavStar).delete()

        logger.debug("Ignoring Users: %s", self._users_to_exclude)
        users_to_delete = (
            db.session.query(security_manager.user_model)
            .filter(security_manager.user_model.username.not_in(self._users_to_exclude))
            .all()
        )
        for user in users_to_delete:
            if not any(role.name == "Admin" for role in user.roles):
                db.session.delete(user)

        logger.debug("Ignoring Roles: %s", self._roles_to_exclude)
        roles_to_delete = (
            db.session.query(security_manager.role_model)
            .filter(security_manager.role_model.name.not_in(self._roles_to_exclude))
            .all()
        )
        for role in roles_to_delete:
            db.session.delete(role)

        # Insert new record into Log table
        log = Log(
            action="Factory Reset", json="{}", user_id=self._user.id, user=self._user
        )
        db.session.add(log)

        db.session.commit()  # pylint: disable=consider-using-transaction
        logger.debug("Resetting Zobi Completed")
