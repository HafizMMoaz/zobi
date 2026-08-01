from zobi.reports.models import ReportRecipients
from zobi.reports.notifications.base import BaseNotification, NotificationContent
from zobi.reports.notifications.email import EmailNotification  # noqa: F401
from zobi.reports.notifications.slack import SlackNotification  # noqa: F401
from zobi.reports.notifications.slackv2 import SlackV2Notification  # noqa: F401
from zobi.reports.notifications.webhook import WebhookNotification  # noqa: F401


def create_notification(
    recipient: ReportRecipients, notification_content: NotificationContent
) -> BaseNotification:
    """
    Notification polymorphic factory
    Returns the Notification class for the recipient type
    """
    for plugin in BaseNotification.plugins:
        if plugin.type == recipient.type:
            return plugin(recipient, notification_content)
    raise Exception(  # pylint: disable=broad-exception-raised
        "Recipient type not supported"
    )
