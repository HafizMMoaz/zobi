"""Assembles a LiteLLM ``Router`` from the configured providers and models.

The Router is expensive to build and safe to reuse, so it is cached. Cache
invalidation derives from a *database* stamp rather than an in-process counter:
Zobi runs multiple gunicorn workers, and a counter bumped in the worker that
handled the edit would leave every other worker serving a stale Router until
restart. Reading a cheap aggregate on each access means any worker notices a
change made by any other.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from sqlalchemy import func, select

from zobi.extensions import db
from zobi.models.llm import LLMModel, LLMProvider, LLMRouterConfig

if TYPE_CHECKING:
    from litellm import Router

logger = logging.getLogger(__name__)

#: Single-entry cache of (stamp, Router). Module-level so it survives across
#: requests within a worker.
_CACHED: tuple[tuple[Any, ...], Any] | None = None


class NoModelsConfiguredError(Exception):
    """Raised when the gateway is called with no active model to serve it."""


def _config_stamp() -> tuple[Any, ...]:
    """Cheap fingerprint of everything the Router is built from.

    Combines row counts with the latest ``changed_on`` per table. Counts catch
    inserts and deletes, timestamps catch edits. Both are single aggregate
    queries against small tables.
    """
    provider_stamp = db.session.execute(
        select(func.count(LLMProvider.id), func.max(LLMProvider.changed_on))
    ).one()
    model_stamp = db.session.execute(
        select(func.count(LLMModel.id), func.max(LLMModel.changed_on))
    ).one()
    config_stamp = db.session.execute(
        select(func.max(LLMRouterConfig.changed_on))
    ).one()
    return (*provider_stamp, *model_stamp, *config_stamp)


def _deployment_for(model: LLMModel) -> dict[str, Any]:
    """Build one Router deployment entry from a model row and its provider.

    Merge order is provider credentials first, then per-model overrides, so a
    model may override an inherited param (a different ``api_base`` for the
    same key, say) but the model's own ``model`` string always wins.
    """
    litellm_params: dict[str, Any] = {
        **model.provider.credentials(),
        **model.extra_params_dict,
        "model": model.model_string,
    }

    # Limits and budgets are per-deployment and only meaningful when set;
    # passing None makes LiteLLM treat them as configured-but-zero.
    optional = {
        "tpm": model.tpm,
        "rpm": model.rpm,
        "max_parallel_requests": model.max_parallel_requests,
        "max_budget": model.max_budget,
        "budget_duration": model.budget_duration,
    }
    litellm_params.update({k: v for k, v in optional.items() if v is not None})

    return {
        "model_name": model.alias,
        "litellm_params": litellm_params,
        # A stable id lets LiteLLM's cooldown and usage tracking distinguish
        # two deployments that share an alias.
        "model_info": {"id": str(model.uuid), "zobi_model_id": model.id},
    }


def build_model_list() -> list[dict[str, Any]]:
    """Every active deployment, as LiteLLM's ``model_list``.

    Exposed separately from ``get_router`` because it is what tests assert on
    and what the Router config screen previews - without instantiating a
    Router or touching the network.
    """
    models = (
        db.session.query(LLMModel)
        .join(LLMProvider)
        .filter(LLMModel.is_active.is_(True), LLMProvider.is_active.is_(True))
        .all()
    )
    return [_deployment_for(model) for model in models]


def get_router_config() -> LLMRouterConfig:
    """The singleton config row, created on demand if the migration seed is gone."""
    config = db.session.query(LLMRouterConfig).get(LLMRouterConfig.SINGLETON_ID)
    if config is None:
        config = LLMRouterConfig(id=LLMRouterConfig.SINGLETON_ID)
        db.session.add(config)
        db.session.flush()
    return config


def _router_kwargs(config: LLMRouterConfig) -> dict[str, Any]:
    """Router-wide settings, omitting anything unset so LiteLLM's own defaults apply."""
    kwargs: dict[str, Any] = {"routing_strategy": config.routing_strategy}

    optional = {
        "num_retries": config.num_retries,
        "timeout": config.timeout,
        "cooldown_time": config.cooldown_time,
        "default_max_parallel_requests": config.default_max_parallel_requests,
    }
    kwargs.update({k: v for k, v in optional.items() if v is not None})

    if fallbacks := config.fallbacks_list:
        kwargs["fallbacks"] = fallbacks

    return kwargs


def build_router() -> Router:
    """Construct a fresh Router.

    Prefer ``get_router`` unless you deliberately need to bypass the cache.
    """
    from litellm import Router  # noqa: PLC0415  # heavy import, defer to first use

    model_list = build_model_list()
    if not model_list:
        raise NoModelsConfiguredError(
            "No active LLM models are configured. "
            "Add a provider and model under Manage > AI Models."
        )

    config = get_router_config()
    # Deliberately logs counts and strategy only - litellm_params holds
    # decrypted credentials and must never reach the log.
    logger.info(
        "Building LiteLLM Router: %d deployment(s), strategy=%s",
        len(model_list),
        config.routing_strategy,
    )
    return Router(model_list=model_list, **_router_kwargs(config))


def get_router() -> Router:
    """The cached Router, rebuilt whenever provider/model/config state changes."""
    global _CACHED  # noqa: PLW0603  # pylint: disable=global-statement

    stamp = _config_stamp()
    if _CACHED is not None and _CACHED[0] == stamp:
        return _CACHED[1]

    router = build_router()
    _CACHED = (stamp, router)
    return router


def clear_router_cache() -> None:
    """Drop the cached Router.

    The stamp check already handles correctness; this exists so tests can
    isolate, and so a command can force a rebuild in the same request that
    wrote the change without waiting on ``changed_on`` granularity.
    """
    global _CACHED  # noqa: PLW0603  # pylint: disable=global-statement
    _CACHED = None
