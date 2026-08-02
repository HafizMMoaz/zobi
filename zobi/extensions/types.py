from dataclasses import dataclass

from zobi_core.extensions.types import Manifest


@dataclass
class BundleFile:
    name: str
    content: bytes


@dataclass
class LoadedExtension:
    id: str
    name: str
    manifest: Manifest
    frontend: dict[str, bytes]
    backend: dict[str, bytes]
    version: str
    source_base_path: (
        str  # Base path for traceback filenames (absolute path or zobz:// URL)
    )
