from enum import Enum
from typing import Any, Dict, List, Literal, Optional, TypedDict, Union

ThemeAlgorithmCombination = List[
    Union[Literal["default"], Literal["dark"], Literal["compact"]]
]


ThemeAlgorithmOption = Union[
    Literal["default"], Literal["dark"], Literal["compact"], ThemeAlgorithmCombination
]


class Theme(TypedDict, total=False):
    """
    Represents a theme configuration.
    token: Optional[Dict[str, Any]]
    components: Optional[Dict[str, Any]]
    algorithm: Optional[ThemeAlgorithmOption]
    hashed: Optional[bool]
    inherit: Optional[bool]
    """

    token: Dict[str, Any]
    components: Optional[Dict[str, Any]]
    algorithm: Optional[ThemeAlgorithmOption]
    hashed: Optional[bool]
    inherit: Optional[bool]


class ThemeMode(str, Enum):
    DEFAULT = "default"
    DARK = "dark"
    SYSTEM = "system"
    COMPACT = "compact"
