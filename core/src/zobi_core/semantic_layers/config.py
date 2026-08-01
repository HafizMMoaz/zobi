from __future__ import annotations

from typing import Any

from pydantic import BaseModel


def build_configuration_schema(
    config_class: type[BaseModel],
    configuration: BaseModel | None = None,
) -> dict[str, Any]:
    """
    Build a JSON schema from a Pydantic configuration class.

    Handles generic boilerplate that any semantic layer with dynamic fields needs:

    - Reorders properties to match model field order (Pydantic sorts alphabetically)
    - When ``configuration`` is None, sets ``enum: []`` on all ``x-dynamic`` properties
      so the frontend renders them as empty dropdowns

    Semantic layer implementations call this instead of
    ``model_json_schema()`` directly,
    then only need to add their own dynamic population logic.
    """
    schema = config_class.model_json_schema()

    # Pydantic sorts properties alphabetically; restore model field order
    field_order = [
        field.alias or name for name, field in config_class.model_fields.items()
    ]
    schema["properties"] = {
        key: schema["properties"][key]
        for key in field_order
        if key in schema["properties"]
    }

    if configuration is None:
        for prop_schema in schema["properties"].values():
            if prop_schema.get("x-dynamic"):
                prop_schema["enum"] = []

    return schema


def check_dependencies(
    prop_schema: dict[str, Any],
    configuration: BaseModel,
) -> bool:
    """
    Check whether a dynamic property's dependencies are satisfied.

    Reads the ``x-dependsOn`` list from the property schema and returns ``True``
    when every referenced attribute on ``configuration`` is truthy.
    """
    dependencies = prop_schema.get("x-dependsOn", [])
    return all(getattr(configuration, dep, None) for dep in dependencies)
