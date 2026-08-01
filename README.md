# Zobi

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)
[![Latest Release](https://img.shields.io/github/v/release/HafizMMoaz/zobi?sort=semver)](https://github.com/HafizMMoaz/zobi/releases/latest)
[![GitHub Stars](https://img.shields.io/github/stars/HafizMMoaz/zobi?style=social)](https://github.com/HafizMMoaz/zobi/stargazers)

<picture width="500">
  <source
    width="600"
    media="(prefers-color-scheme: dark)"
    src="https://raw.githubusercontent.com/HafizMMoaz/zobi/main/zobi-branding/logo-horiz.svg"
    alt="Zobi logo (dark)"
  />
  <img
    width="600"
    src="https://raw.githubusercontent.com/HafizMMoaz/zobi/main/zobi-branding/logo-horiz.svg"
    alt="Zobi logo (light)"
  />
</picture>

A modern, enterprise-ready business intelligence web application.

[Website](https://zobi.dev) · [Documentation](https://zobi.dev/docs) · [Issue Tracker](https://github.com/HafizMMoaz/zobi/issues)

## Features

- **Rich Visualization**: Create interactive charts, dashboards, and data stories
- **SQL IDE**: Write and execute SQL queries with a powerful editor
- **Semantic Layer**: Define metrics and dimensions for self-service analytics
- **Role-Based Access Control**: Fine-grained permissions for teams
- **Embedded Analytics**: Embed charts and dashboards into your applications
- **Extensible Plugin System**: Build custom visualizations and integrations

## Getting Started

### Quick Start with Docker

```bash
git clone https://github.com/HafizMMoaz/zobi.git
cd zobi
docker compose up
```

### Installation

```bash
# Backend
pip install zobi

# Frontend
cd frontend
npm install
npm run dev
```

## Architecture

```
zobi/
├── zobi/                    # Python backend (Flask, SQLAlchemy)
│   ├── views/api/              # REST API endpoints
│   ├── models/                 # Database models
│   └── connectors/             # Database connections
├── frontend/               # React TypeScript frontend
│   ├── components/             # Reusable components
│   ├── explore/                # Chart builder
│   └── dashboard/              # Dashboard interface
├── core/                   # Python core package
├── embedded-sdk/           # Embedding SDK
├── websocket/              # WebSocket server
└── extensions-cli/         # Extension CLI tools
```

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.