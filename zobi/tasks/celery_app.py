"""
This is the main entrypoint used by Celery workers. As such,
it needs to call create_app() in order to initialize things properly
"""

from typing import Any

from celery.signals import task_postrun, worker_process_init

# Zobi framework imports
from zobi import create_app
from zobi.extensions import celery_app, db

# Init the Flask app / configure everything
flask_app = create_app()

# Need to import late, as the celery_app will have been setup by "create_app()"
# ruff: noqa: E402, F401
# pylint: disable=wrong-import-position, unused-import
from . import cache, scheduler

# Export the celery app globally for Celery (as run on the cmd line) to find
app = celery_app


@worker_process_init.connect
def reset_db_connection_pool(**kwargs: Any) -> None:  # pylint: disable=unused-argument
    with flask_app.app_context():
        # https://docs.sqlalchemy.org/en/14/core/connections.html#engine-disposal
        db.engine.dispose()


@task_postrun.connect
def teardown(  # pylint: disable=unused-argument
    retval: Any,
    *args: Any,
    **kwargs: Any,
) -> None:
    """
    After each Celery task teardown the Flask-SQLAlchemy session.

    Note for non eagar requests Flask-SQLAlchemy will perform the teardown.

    :param retval: The return value of the task
    :see: https://docs.celeryq.dev/en/stable/userguide/signals.html#task-postrun
    :see: https://gist.github.com/twolfson/a1b329e9353f9b575131
    """

    if flask_app.config.get("SQLALCHEMY_COMMIT_ON_TEARDOWN"):
        if not isinstance(retval, Exception):
            db.session.commit()  # pylint: disable=consider-using-transaction

    if not flask_app.config.get("CELERY_ALWAYS_EAGER"):
        db.session.remove()
