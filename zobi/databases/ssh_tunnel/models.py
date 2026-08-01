
from __future__ import annotations

from typing import Any

import sqlalchemy as sa
from flask_appbuilder import Model
from sqlalchemy.orm import backref, relationship
from sqlalchemy.types import Text

from zobi.constants import PASSWORD_MASK
from zobi.extensions import encrypted_field_factory
from zobi.models.core import Database
from zobi.models.helpers import (
    AuditMixinNullable,
    ExtraJSONMixin,
    ImportExportMixin,
)


class SSHTunnel(AuditMixinNullable, ExtraJSONMixin, ImportExportMixin, Model):
    """
    A ssh tunnel configuration in a database.
    """

    __tablename__ = "ssh_tunnels"

    id = sa.Column(sa.Integer, primary_key=True)
    database_id = sa.Column(
        sa.Integer,
        sa.ForeignKey("dbs.id"),
        nullable=False,
        unique=True,
    )
    database: Database = relationship(
        "Database",
        backref=backref(
            "ssh_tunnel",
            uselist=False,
            cascade="all, delete-orphan",
            lazy="joined",
        ),
        foreign_keys=[database_id],
    )

    server_address = sa.Column(sa.Text)
    server_port = sa.Column(sa.Integer)
    username = sa.Column(encrypted_field_factory.create(Text))

    # basic authentication
    password = sa.Column(encrypted_field_factory.create(Text), nullable=True)

    # password protected pkey authentication
    private_key = sa.Column(encrypted_field_factory.create(Text), nullable=True)
    private_key_password = sa.Column(
        encrypted_field_factory.create(Text), nullable=True
    )

    export_fields = [
        "server_address",
        "server_port",
        "username",
        "password",
        "private_key",
        "private_key_password",
    ]

    extra_import_fields = [
        "database_id",
    ]

    @property
    def data(self) -> dict[str, Any]:
        output = {
            "id": self.id,
            "server_address": self.server_address,
            "server_port": self.server_port,
            "username": self.username,
        }
        if self.password is not None:
            output["password"] = PASSWORD_MASK
        if self.private_key is not None:
            output["private_key"] = PASSWORD_MASK
        if self.private_key_password is not None:
            output["private_key_password"] = PASSWORD_MASK
        return output
