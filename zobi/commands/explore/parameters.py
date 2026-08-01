from dataclasses import dataclass
from typing import Optional


@dataclass
class CommandParameters:
    permalink_key: Optional[str]
    form_data_key: Optional[str]
    datasource_id: Optional[int]
    datasource_type: Optional[str]
    slice_id: Optional[int]
