
import re
from datetime import datetime, timedelta
from functools import partial
from typing import Any, Dict, SupportsInt  # noqa: F401

from zobi.jinja_context import PrestoTemplateProcessor


def DATE(  # noqa: N802
    ts: datetime, day_offset: SupportsInt = 0, hour_offset: SupportsInt = 0
) -> str:
    """Current day as a string"""
    day_offset, hour_offset = int(day_offset), int(hour_offset)
    offset_day = (ts + timedelta(days=day_offset, hours=hour_offset)).date()
    return str(offset_day)


class CustomPrestoTemplateProcessor(PrestoTemplateProcessor):
    """A custom presto template processor for test."""

    engine = "db_for_macros_testing"

    def process_template(self, sql: str, **kwargs) -> str:
        """Processes a sql template with $ style macro using regex."""
        # Add custom macros functions.
        macros = {"DATE": partial(DATE, datetime.utcnow())}  # type: Dict[str, Any]
        # Update with macros defined in context and kwargs.
        macros.update(self._context)
        macros.update(kwargs)

        def replacer(match):
            """Expands $ style macros with corresponding function calls."""
            macro_name, args_str = match.groups()
            args = [a.strip() for a in args_str.split(",")]
            if args == [""]:
                args = []
            f = macros[macro_name[1:]]
            return f(*args)

        macro_names = ["$" + name for name in macros.keys()]
        pattern = r"(%s)\s*\(([^()]*)\)" % "|".join(map(re.escape, macro_names))
        return re.sub(pattern, replacer, sql)
