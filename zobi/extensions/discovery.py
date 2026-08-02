import logging
import os
from pathlib import Path
from typing import Generator
from zipfile import is_zipfile, ZipFile

from zobi.extensions.types import LoadedExtension
from zobi.extensions.utils import get_bundle_files_from_zip, get_loaded_extension
from zobi.utils import json

logger = logging.getLogger(__name__)


def discover_and_load_extensions(
    extensions_path: str,
) -> Generator[LoadedExtension, None, None]:
    """
    Discover and load all .zobz extension files from the specified path.

    Args:
        extensions_path: Path to directory containing .zobz extension files

    Yields:
        LoadedExtension instances for each valid .zobz file found
    """
    if not extensions_path or not os.path.exists(extensions_path):
        logger.warning(
            "Extensions path does not exist or is empty: %s", extensions_path
        )
        return

    extensions_dir = Path(extensions_path)

    try:
        # Look for .zobz files only
        for zobz_file in extensions_dir.glob("*.zobz"):
            if not is_zipfile(zobz_file):
                logger.warning(
                    "File has .zobz extension but is not a valid zip file: %s",
                    zobz_file,
                )
                continue

            try:
                with ZipFile(zobz_file, "r") as zip_file:
                    # Read the manifest first to get the extension ID for the
                    # zobz:// path
                    try:
                        manifest_content = zip_file.read("manifest.json")
                        manifest_data = json.loads(manifest_content)
                        extension_id = manifest_data["id"]
                    except (KeyError, json.JSONDecodeError) as e:
                        logger.error(
                            "Failed to read extension ID from manifest in %s: %s",
                            zobz_file,
                            e,
                        )
                        continue

                    # Use zobz:// scheme for tracebacks
                    source_base_path = f"zobz://{extension_id}"

                    files = get_bundle_files_from_zip(zip_file)
                    extension = get_loaded_extension(
                        files, source_base_path=source_base_path
                    )
                    logger.info(
                        "Loaded extension '%s' from %s", extension.id, zobz_file
                    )
                    yield extension
            except Exception as e:
                logger.error("Failed to load extension from %s: %s", zobz_file, e)
                continue

    except Exception as e:
        logger.error("Error discovering extensions in %s: %s", extensions_path, e)
