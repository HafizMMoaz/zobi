# @zobi/core

[![npm version](https://badge.fury.io/js/%40zobi%2Fcore.svg)](https://badge.fury.io/js/%40zobi%2Fcore)
[![License](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)

The official core package for building Zobi extensions and integrations. This package provides essential building blocks including shared UI components, utility functions, APIs, and type definitions for both the host application and extensions.

## 📦 Installation

```bash
npm install @zobi/core
```

## 🏗️ Package Structure

The source is organized into focused namespaces, each in its own directory:

```
src/
├── authentication/
├── commands/
├── common/
├── components/
├── contributions/
├── editors/
├── extensions/
├── menus/
├── sqlLab/
├── theme/
├── translation/
├── utils/
├── views/
└── index.ts
```

## 🚀 Quick Start

Frontend contributions are registered as module-level side effects from your extension's entry point.

### Views

Add custom panels or UI components at specific locations in the application:

```tsx
import { views } from '@zobi/core';
import MyPanel from './MyPanel';

views.registerView(
  { id: 'my-extension.main', name: 'My Panel Name' },
  'sqllab.panels',
  () => <MyPanel />,
);
```

### Commands

Define named actions that can be triggered from menus, keyboard shortcuts, or code:

```typescript
import { commands } from '@zobi/core';

commands.registerCommand(
  {
    id: 'my-extension.copy-query',
    title: 'Copy Query',
    icon: 'CopyOutlined',
    description: 'Copy the current query to clipboard',
  },
  () => {
    /* implementation */
  },
);
```

### Menus

Attach commands to primary, secondary, or context menus at a given location:

```typescript
import { menus } from '@zobi/core';

menus.registerMenuItem(
  { view: 'sqllab.editor', command: 'my-extension.copy-query' },
  'sqllab.editor',
  'primary',
);
```

### Editors

Replace the default text editor for one or more languages:

```typescript
import { editors } from '@zobi/core';
import MonacoSQLEditor from './MonacoSQLEditor';

editors.registerEditor(
  {
    id: 'my-extension.monaco-sql',
    name: 'Monaco SQL Editor',
    languages: ['sql'],
  },
  MonacoSQLEditor,
);
```

## 📄 License

Licensed under the MIT. See [LICENSE](https://github.com/HafizMMoaz/zobi/blob/master/LICENSE.txt) for details.

## 🔗 Links

- [Community](https://zobi.dev/community/)
- [GitHub Repository](https://github.com/HafizMMoaz/zobi)
- [Extensions Documentation](https://zobi.dev/developer-docs/extensions/overview)
