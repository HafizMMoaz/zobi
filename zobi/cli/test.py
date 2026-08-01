import logging

import click
from colorama import Fore
from flask import current_app
from flask.cli import with_appcontext

import zobi.utils.database as database_utils
from zobi import security_manager
from zobi.utils.decorators import transaction

logger = logging.getLogger(__name__)


@click.command()
@with_appcontext
@transaction()
def load_test_users() -> None:
    """
    Loads admin, alpha, and gamma user for testing purposes

    Syncs permissions for those users/roles
    """
    print(Fore.GREEN + "Loading a set of users for unit tests")

    if current_app.config["TESTING"]:
        sm = security_manager

        examples_db = database_utils.get_example_database()

        examples_pv = sm.add_permission_view_menu("database_access", examples_db.perm)

        sm.sync_role_definitions()
        gamma_sqllab_role = sm.add_role("gamma_sqllab")
        sm.add_permission_role(gamma_sqllab_role, examples_pv)

        gamma_no_csv_role = sm.add_role("gamma_no_csv")
        sm.add_permission_role(gamma_no_csv_role, examples_pv)

        for role in ["Gamma", "sql_lab"]:
            for perm in sm.find_role(role).permissions:
                sm.add_permission_role(gamma_sqllab_role, perm)

                if str(perm) != "can csv on Zobi":
                    sm.add_permission_role(gamma_no_csv_role, perm)

        users = (
            ("admin", "Admin"),
            ("gamma", "Gamma"),
            ("gamma2", "Gamma"),
            ("gamma_sqllab", "gamma_sqllab"),
            ("alpha", "Alpha"),
            ("gamma_no_csv", "gamma_no_csv"),
        )
        for username, role in users:
            user = sm.find_user(username)
            if not user:
                sm.add_user(
                    username,
                    username,
                    "user",
                    username + "@fab.org",
                    sm.find_role(role),
                    password="general",  # noqa: S106
                )
