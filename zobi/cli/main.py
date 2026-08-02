#!/usr/bin/env python
import importlib
import logging
import pkgutil
from typing import Any

import click
from colorama import Fore, Style
from flask import current_app
from flask.cli import FlaskGroup, with_appcontext

from zobi import appbuilder, cli, security_manager
from zobi.extensions import db
from zobi.utils.decorators import transaction

logger = logging.getLogger(__name__)


def normalize_token(token_name: str) -> str:
    """
    As of click>=7, underscores in function names are replaced by dashes.
    To avoid the need to rename all cli functions, e.g. load_examples to
    load-examples, this function is used to convert dashes back to
    underscores.

    :param token_name: token name possibly containing dashes
    :return: token name where dashes are replaced with underscores
    """
    return token_name.replace("_", "-")


def create_app() -> Any:
    """Create app instance for CLI"""
    from zobi.app import create_app as create_zobi_app

    return create_zobi_app()


@click.group(
    cls=FlaskGroup,
    create_app=create_app,
    context_settings={"token_normalize_func": normalize_token},
)
@with_appcontext
def zobi() -> None:
    """\033[1;37mThe Zobi CLI\033[0m"""
    # NOTE: codes above are ANSI color codes for bold white in CLI header ^^^


# add sub-commands
for load, module_name, is_pkg in pkgutil.walk_packages(  # noqa: B007
    cli.__path__, cli.__name__ + "."
):
    module = importlib.import_module(module_name)
    for attribute in module.__dict__.values():
        if isinstance(attribute, (click.core.Command, click.core.Group)):
            zobi.add_command(attribute)

            if isinstance(attribute, click.core.Group):
                break


@zobi.command()
@with_appcontext
@transaction()
def init() -> None:
    """Inits the Zobi application"""
    appbuilder.add_permissions(update_perms=True)
    security_manager.sync_role_definitions()


@zobi.command()
@with_appcontext
@click.option("--verbose", "-v", is_flag=True, help="Show extra information")
def version(verbose: bool) -> None:
    """Prints the current version number"""

    print(Fore.BLUE + "-=" * 15)
    print(Fore.YELLOW + "Zobi " + Fore.CYAN + f"{current_app.config['VERSION_STRING']}")
    print(Fore.BLUE + "-=" * 15)
    if verbose:
        print("[DB] : " + f"{db.engine}")
    print(Style.RESET_ALL)
