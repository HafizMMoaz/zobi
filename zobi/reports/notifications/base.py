from dataclasses import dataclass
from typing import Any, Optional

import pandas as pd

from zobi.reports.models import ReportRecipients, ReportRecipientType
from zobi.utils.core import HeaderDataType


@dataclass
class NotificationContent:
    name: str
    header_data: HeaderDataType  # this is optional to account for error states
    csv: Optional[bytes] = None  # bytes for csv file
    pdf: Optional[bytes] = None  # bytes for PDF file
    screenshots: Optional[list[bytes]] = None  # bytes for a list of screenshots
    text: Optional[str] = None
    description: Optional[str] = ""
    url: Optional[str] = None  # url to chart/dashboard for this screenshot
    embedded_data: Optional[pd.DataFrame] = None


class BaseNotification:  # pylint: disable=too-few-public-methods
    """
    Serves has base for all notifications and creates a simple plugin system
    for extending future implementations.
    Child implementations get automatically registered and should identify the
    notification type
    """

    plugins: list[type["BaseNotification"]] = []
    type: Optional[ReportRecipientType] = None
    """
    Child classes set their notification type ex: `type = "email"` this string will be
    used by ReportRecipients.type to map to the correct implementation
    """

    def __init_subclass__(cls, *args: Any, **kwargs: Any) -> None:
        super().__init_subclass__(*args, **kwargs)
        cls.plugins.append(cls)

    def __init__(
        self, recipient: ReportRecipients, content: NotificationContent
    ) -> None:
        self._recipient = recipient
        self._content = content

    def send(self) -> None:
        raise NotImplementedError()
