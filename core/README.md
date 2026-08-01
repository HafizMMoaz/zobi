# zobi-core

[![PyPI version](https://badge.fury.io/py/zobi-core.svg)](https://badge.fury.io/py/zobi-core)
[![License](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)

The official core package for building Zobi backend extensions and integrations. This package provides essential building blocks including base classes, API utilities, type definitions, and decorators for both the host application and extensions.

## 📦 Installation

```bash
pip install zobi-core
```

## 🏗️ Package Structure

```
src/zobi_core/
├── common/
├── extensions/
├── mcp/
├── queries/
├── rest_api/
├── tasks/
└── __init__.py
```

## 🚀 Quick Start

### Basic Extension API

```python
from flask_appbuilder.api import expose, permission_name, protect, safe
from zobi_core.rest_api.api import RestApi
from zobi_core.rest_api.decorators import api


@api(id="dataset_references", name="Dataset References API")
class DatasetReferencesAPI(RestApi):

    @expose("/metadata", methods=("POST",))
    @protect()
    @safe
    @permission_name("read")
    def metadata(self) -> Response:
        # ... endpoint implementation
```

### Background Tasks

```python
from zobi_core.tasks.decorators import task
from zobi_core.tasks.types import TaskScope

@task(name="generate_report", scope=TaskScope.SHARED)
def generate_report(chart_id: int) -> None:
    # ... task implementation
```

### MCP Tools

```python
from zobi_core.mcp.decorators import tool

@tool(name="my_tool", description="Custom business logic", tags=["extension"])
def my_extension_tool(param: str) -> dict:
    # ... tool implementation
```

### MCP Prompts

```python
from zobi_core.mcp.decorators import prompt

@prompt(name="my_prompt", title="My Prompt", description="Interactive prompt", tags={"extension"})
async def my_prompt_handler(ctx: Context) -> str:
    # ... prompt implementation
```

## 📄 License

Licensed under the MIT. See [LICENSE](https://github.com/HafizMMoaz/zobi/blob/master/LICENSE.txt) for details.

## 🔗 Links

- [Community](https://zobi.dev/community/)
- [GitHub Repository](https://github.com/HafizMMoaz/zobi)
- [Extensions Documentation](https://zobi.dev/developer-docs/extensions/overview)
