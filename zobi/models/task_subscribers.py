"""TaskSubscriber model for tracking multi-user task subscriptions"""

from datetime import datetime, timezone

from flask_appbuilder import Model
from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from zobi_core.tasks.models import TaskSubscriber as CoreTaskSubscriber

from zobi.models.helpers import AuditMixinNullable


class TaskSubscriber(CoreTaskSubscriber, AuditMixinNullable, Model):
    """
    Model for tracking task subscriptions in shared tasks.

    This model enables multi-user collaboration on async tasks. When a user
    schedules a shared task with the same parameters as an existing task,
    they are automatically subscribed to that task instead of creating a
    duplicate.

    Subscribers can unsubscribe from shared tasks. When the last subscriber
    unsubscribes, the task is automatically aborted.
    """

    __tablename__ = "task_subscribers"

    id = Column(Integer, primary_key=True)
    task_id = Column(
        Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(
        Integer, ForeignKey("ab_user.id", ondelete="CASCADE"), nullable=False
    )
    subscribed_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))

    # Relationships
    task = relationship("Task", back_populates="subscribers")
    user = relationship("User", foreign_keys=[user_id], lazy="joined")

    __table_args__ = (
        UniqueConstraint("task_id", "user_id", name="uq_task_subscribers_task_user"),
    )

    def __repr__(self) -> str:
        return f"<TaskSubscriber user_id={self.user_id} task_id={self.task_id}>"
