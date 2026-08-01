import json
import logging
import os
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Global caching for JSON language packs
ALL_LANGUAGE_PACKS: dict[str, dict[str, Any]] = {"en": {}}

DIR = os.path.dirname(os.path.abspath(__file__))


def get_language_pack(locale: str) -> Optional[dict[str, Any]]:
    """Get/cache a language pack

    Returns the language pack from cache if it exists, caches otherwise

    >>> get_language_pack('fr')['Dashboards']
    "Tableaux de bords"
    """
    pack = ALL_LANGUAGE_PACKS.get(locale)
    if not pack:
        filename = DIR + f"/{locale}/LC_MESSAGES/messages.json"
        if not locale or locale == "en":
            # Forcing a dummy, quasy-empty language pack for English since the file
            # in the en directory is contains data with empty mappings
            filename = DIR + "/empty_language_pack.json"
        try:
            with open(filename, encoding="utf8") as f:
                pack = json.load(f)
                ALL_LANGUAGE_PACKS[locale] = pack or {}
        except Exception:  # pylint: disable=broad-except
            logger.error(
                "Error loading language pack for, falling back on en %s", locale
            )
            pack = get_language_pack("en")
    return pack
