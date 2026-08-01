# zobi-extensions-cli

[![PyPI version](https://badge.fury.io/py/zobi-extensions-cli.svg)](https://badge.fury.io/py/zobi-extensions-cli)
[![License](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)

Official command-line interface for building, bundling, and managing Zobi extensions. This CLI tool provides developers with everything needed to create, develop, and package extensions for the Zobi ecosystem.

## 🚀 Features

- **Extension Scaffolding** - Generate initial folder structure and scaffold new extension projects
- **Validation** - Validate extension structure and configuration before building
- **Development Server** - Automatically rebuild extensions as files change during development
- **Build System** - Build extension assets for production deployment
- **Bundle Packaging** - Package extensions into distributable .zobz files

## 📦 Installation

```bash
pip install zobi-extensions-cli
```

## 🛠️ Quick Start

### Available Commands

```bash
# Scaffold a new extension project (interactive prompts, or pass options directly)
zobi-extensions init [--publisher <publisher>] [--name <name>] [--display-name <name>]
                         [--version <version>] [--license <license>]
                         [--frontend/--no-frontend] [--backend/--no-backend]

# Validate extension structure and configuration
zobi-extensions validate

# Build extension assets for production (runs validate first)
zobi-extensions build

# Package extension into a distributable .zobz file (runs build first)
zobi-extensions bundle [--output/-o <path>]

# Automatically rebuild extension as files change during development
zobi-extensions dev
```

## 📋 Extension Structure

The CLI scaffolds extensions with the following structure:

```
{publisher}.{name}/             # e.g., my-org.dashboard-widgets/
├── extension.json              # Extension configuration and metadata
├── .gitignore
├── frontend/                   # Optional frontend code
│   ├── src/
│   │   └── index.tsx           # Frontend entry point
│   ├── package.json
│   ├── webpack.config.js
│   └── tsconfig.json
└── backend/                    # Optional backend code
    ├── src/
    │   └── {publisher}/        # e.g., my_org/
    │       └── {name}/         # e.g., dashboard_widgets/
    │           └── entrypoint.py
    └── pyproject.toml
```

## 📄 License

Licensed under the MIT. See [LICENSE](https://github.com/HafizMMoaz/zobi/blob/master/LICENSE.txt) for details.

## 🔗 Links

- [Community](https://zobi.dev/community/)
- [GitHub Repository](https://github.com/HafizMMoaz/zobi)
- [Extensions Documentation](https://zobi.dev/developer-docs/extensions/overview)
