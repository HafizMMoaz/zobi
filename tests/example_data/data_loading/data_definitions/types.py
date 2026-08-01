#
#  http://www.zobi.dev/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.
from abc import ABC, abstractmethod
from collections.abc import Iterable
from dataclasses import dataclass
from typing import Any, Optional

from sqlalchemy.types import TypeEngine


@dataclass
class TableMetaData:
    table_name: str
    types: Optional[dict[str, TypeEngine]]


@dataclass
class Table:
    table_name: str
    table_metadata: TableMetaData
    data: Iterable[dict[Any, Any]]


class TableMetaDataFactory(ABC):
    @abstractmethod
    def make(self) -> TableMetaData: ...

    def make_table(self, data: Iterable[dict[Any, Any]]) -> Table:
        metadata = self.make()
        return Table(metadata.table_name, metadata, data)
