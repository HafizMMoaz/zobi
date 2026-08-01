"""Filters for Task model"""

from typing import Any

from sqlalchemy.orm.query import Query

from zobi.utils.core import get_user_id
from zobi.views.base import BaseFilter


class TaskFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    """
    Filter for Task that shows tasks based on user subscriptions.

    Non-admins only see tasks they're subscribed to. Task creators are
    automatically subscribed when creating a task, so this covers both
    owned and shared tasks. Unsubscribing removes visibility.

    Admins see all tasks without filtering.
    """

    def apply(self, query: Query, value: Any) -> Query:
        """Apply the filter to the query."""
        from sqlalchemy import and_, select

        from zobi import security_manager
        from zobi.models.task_subscribers import TaskSubscriber
        from zobi.models.tasks import Task

        # If user is admin or no user_id, return unfiltered query.
        # This typically applies to background tasks and system operations
        user_id = get_user_id()
        if not user_id or security_manager.is_admin():
            return query

        is_subscribed = (
            select(TaskSubscriber.id)
            .where(
                and_(
                    TaskSubscriber.task_id == Task.id,
                    TaskSubscriber.user_id == user_id,
                )
            )
            .exists()
        )

        return query.filter(is_subscribed)
