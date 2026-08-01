
from importlib import import_module
from typing import Any


def load_class_from_name(fq_class_name: str) -> Any:
    """
    Given a string representing a fully qualified class name, attempts to load
    the class and return it.

    :param fq_class_name: The fully qualified name of the class to load
    :return: The class object
    :raises Exception: if the class cannot be loaded
    """
    if not fq_class_name:
        raise ValueError(f"Invalid class name {fq_class_name}")

    parts = fq_class_name.split(".")
    module_name = ".".join(parts[:-1])
    class_name = parts[-1]

    module = import_module(module_name)
    return getattr(module, class_name)
