import logging
from collections.abc import Generator
from typing import Any, Callable, Optional

import backoff


def retry_call(  # pylint: disable=too-many-arguments
    func: Callable[..., Any],
    *args: Any,
    strategy: Callable[..., Generator[int, None, None]] = backoff.constant,
    exception: type[Exception] = Exception,
    giveup_log_level: int = logging.WARNING,
    fargs: Optional[list[Any]] = None,
    fkwargs: Optional[dict[str, Any]] = None,
    **kwargs: Any,
) -> Any:
    """
    Retry a given call.
    """
    kwargs["giveup_log_level"] = giveup_log_level
    decorated = backoff.on_exception(strategy, exception, *args, **kwargs)(func)
    fargs = fargs or []
    fkwargs = fkwargs or {}
    return decorated(*fargs, **fkwargs)
