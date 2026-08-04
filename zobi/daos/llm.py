import logging
from typing import Optional

from zobi.daos.base import BaseDAO
from zobi.extensions import db
from zobi.models.llm import LLMModel, LLMProvider, LLMRouterConfig

logger = logging.getLogger(__name__)


class LLMProviderDAO(BaseDAO[LLMProvider]):
    @classmethod
    def find_by_name(cls, name: str) -> Optional[LLMProvider]:
        return db.session.query(LLMProvider).filter(LLMProvider.name == name).first()

    @classmethod
    def has_models(cls, provider_id: int) -> bool:
        """Whether any model still references this provider.

        Deleting a provider cascades to its models, so callers warn first
        rather than silently taking models with it.
        """
        return (
            db.session.query(LLMModel.id)
            .filter(LLMModel.provider_id == provider_id)
            .first()
            is not None
        )


class LLMModelDAO(BaseDAO[LLMModel]):
    @classmethod
    def find_by_alias(cls, alias: str) -> list[LLMModel]:
        """Every deployment under an alias - more than one means a balanced pool."""
        return db.session.query(LLMModel).filter(LLMModel.alias == alias).all()

    @classmethod
    def alias_has_siblings(cls, alias: str, exclude_id: int) -> bool:
        """Whether an alias survives the deletion of one model using it.

        Deleting the last model behind a routed alias breaks routing; deleting
        one of several just shrinks the pool and is always safe.
        """
        return (
            db.session.query(LLMModel.id)
            .filter(LLMModel.alias == alias, LLMModel.id != exclude_id)
            .first()
            is not None
        )


class LLMRouterConfigDAO(BaseDAO[LLMRouterConfig]):
    @classmethod
    def get_singleton(cls) -> LLMRouterConfig:
        """The one config row, created on demand if it is missing."""
        config = db.session.query(LLMRouterConfig).get(LLMRouterConfig.SINGLETON_ID)
        if config is None:
            config = LLMRouterConfig(id=LLMRouterConfig.SINGLETON_ID)
            db.session.add(config)
            db.session.flush()
        return config
