import sys

import click
from flask import current_app
from flask.cli import with_appcontext
from werkzeug.security import check_password_hash


@click.command()
@with_appcontext
@click.option("--username", prompt="Admin Username", help="Admin Username")
@click.option(
    "--silent",
    is_flag=True,
    prompt=(
        "Are you sure you want to reset Zobi? This action cannot be undone. Continue?"
    ),
    help="Confirmation flag",
)
@click.option(
    "--exclude-users",
    default=None,
    help="Comma separated list of users to exclude from reset",
)
@click.option(
    "--exclude-roles",
    default=None,
    help="Comma separated list of roles to exclude from reset",
)
def factory_reset(
    username: str, silent: bool, exclude_users: str, exclude_roles: str
) -> None:
    """Factory Reset Zobi"""

    # Check feature flag inside the command
    if not current_app.config.get("FEATURE_FLAGS", {}).get(
        "ENABLE_FACTORY_RESET_COMMAND"
    ):
        click.secho(
            "Factory reset command is disabled. Enable "
            "ENABLE_FACTORY_RESET_COMMAND feature flag.",
            fg="red",
        )
        sys.exit(1)

    # pylint: disable=import-outside-toplevel
    from zobi import security_manager
    from zobi.commands.security.reset import ResetZobiCommand

    # Validate the user
    password = click.prompt("Admin Password", hide_input=True)
    user = security_manager.find_user(username)
    if not user or not check_password_hash(user.password, password):
        click.secho("Invalid credentials", fg="red")
        sys.exit(1)
    if not any(role.name == "Admin" for role in user.roles):
        click.secho("Permission Denied", fg="red")
        sys.exit(1)

    try:
        ResetZobiCommand(silent, user, exclude_users, exclude_roles).run()
        click.secho("Factory reset complete", fg="green")
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"Factory reset failed: {ex}", fg="red")
        sys.exit(1)
