import logging
from collections.abc import Sequence
from io import IOBase
from typing import Union

import backoff
from flask import g
from slack_sdk.errors import (
    BotUserAccessError,
    SlackApiError,
    SlackClientConfigurationError,
    SlackClientError,
    SlackClientNotConnectedError,
    SlackObjectFormationError,
    SlackRequestError,
    SlackTokenRotationError,
)

from zobi.reports.models import ReportRecipientType
from zobi.reports.notifications.base import BaseNotification
from zobi.reports.notifications.exceptions import (
    NotificationAuthorizationException,
    NotificationMalformedException,
    NotificationParamException,
    NotificationUnprocessableException,
    SlackV1NotificationError,
)
from zobi.reports.notifications.slack_mixin import SlackMixin
from zobi.utils import json
from zobi.utils.core import recipients_string_to_list
from zobi.utils.decorators import statsd_gauge
from zobi.utils.slack import (
    get_slack_client,
    should_use_v2_api,
)

logger = logging.getLogger(__name__)


# TODO: Deprecated: Remove this class in Zobi 6.0.0
class SlackNotification(SlackMixin, BaseNotification):  # pylint: disable=too-few-public-methods
    """
    Sends a slack notification for a report recipient
    """

    type = ReportRecipientType.SLACK

    def _get_channel(self) -> str:
        """
        Get the recipient's channel(s).
        Note Slack SDK uses "channel" to refer to one or more
        channels. Multiple channels are demarcated by a comma.
        :returns: The comma separated list of channel(s)
        """
        recipient_str = json.loads(self._recipient.recipient_config_json)["target"]

        return ",".join(recipients_string_to_list(recipient_str))

    def _get_inline_files(
        self,
    ) -> tuple[Union[str, None], Sequence[Union[str, IOBase, bytes]]]:
        if self._content.csv:
            return ("csv", [self._content.csv])
        if self._content.screenshots:
            return ("png", self._content.screenshots)
        if self._content.pdf:
            return ("pdf", [self._content.pdf])
        return (None, [])

    @backoff.on_exception(backoff.expo, SlackApiError, factor=10, base=2, max_tries=5)
    @statsd_gauge("reports.slack.send")
    def send(self) -> None:
        file_type, files = self._get_inline_files()
        title = self._content.name
        body = self._get_body(content=self._content)
        global_logs_context = getattr(g, "logs_context", {}) or {}

        # see if the v2 api will work
        if should_use_v2_api():
            # if we can fetch channels, then raise an error and use the v2 api
            raise SlackV1NotificationError

        try:
            client = get_slack_client()
            channel = self._get_channel()
            # files_upload returns SlackResponse as we run it in sync mode.
            if files:
                for file in files:
                    client.files_upload(
                        channels=channel,
                        file=file,
                        initial_comment=body,
                        title=title,
                        filetype=file_type,
                    )
            else:
                client.chat_postMessage(channel=channel, text=body)
            logger.info(
                "Report sent to slack",
                extra={
                    "execution_id": global_logs_context.get("execution_id"),
                },
            )
        except (
            BotUserAccessError,
            SlackRequestError,
            SlackClientConfigurationError,
        ) as ex:
            raise NotificationParamException(str(ex)) from ex
        except SlackObjectFormationError as ex:
            raise NotificationMalformedException(str(ex)) from ex
        except SlackTokenRotationError as ex:
            raise NotificationAuthorizationException(str(ex)) from ex
        except (SlackClientNotConnectedError, SlackApiError) as ex:
            raise NotificationUnprocessableException(str(ex)) from ex
        except SlackClientError as ex:
            # this is the base class for all slack client errors
            # keep it last so that it doesn't interfere with @backoff
            raise NotificationUnprocessableException(str(ex)) from ex
