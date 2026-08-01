"""Code related with dealing with legacy / change management"""

from typing import Any


def update_time_range(form_data: dict[str, Any]) -> None:
    """
    Legacy adjustments to time range.

        - Move `since` and `until` to `time_range`.
        - Define `time_range` when `granularity_sqla` is set and unfiltered.

    """
    if "since" in form_data or "until" in form_data:
        since = form_data.pop("since", "") or ""
        until = form_data.pop("until", "") or ""
        form_data["time_range"] = f"{since} : {until}"

    if temporal_column := form_data.get("granularity_sqla"):
        if any(
            adhoc_filter.get("subject") == temporal_column
            and adhoc_filter.get("comparator") == "No filter"
            for adhoc_filter in form_data.get("adhoc_filters", [])
        ):
            form_data.setdefault("time_range", "No filter")
