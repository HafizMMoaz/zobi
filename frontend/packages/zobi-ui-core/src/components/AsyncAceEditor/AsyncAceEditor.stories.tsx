import {
  SQLEditor,
  FullSQLEditor,
  MarkdownEditor,
  TextAreaEditor,
  CssEditor,
  JsonEditor,
  ConfigEditor,
} from '.';

import type { AsyncAceEditorOptions } from './types';

type EditorType =
  | 'sql'
  | 'full-sql'
  | 'markdown'
  | 'text-area'
  | 'css'
  | 'json'
  | 'config';

const editorTypes: EditorType[] = [
  'sql',
  'full-sql',
  'markdown',
  'text-area',
  'css',
  'json',
  'config',
];

export default {
  title: 'Components/AsyncAceEditor',
};

const parseEditorType = (editorType: EditorType) => {
  switch (editorType) {
    case 'sql':
      return SQLEditor;
    case 'full-sql':
      return FullSQLEditor;
    case 'markdown':
      return MarkdownEditor;
    case 'text-area':
      return TextAreaEditor;
    case 'css':
      return CssEditor;
    case 'json':
      return JsonEditor;
    default:
      return ConfigEditor;
  }
};

export const AsyncAceEditor = (
  args: AsyncAceEditorOptions & { editorType: EditorType },
) => {
  const { editorType, ...props } = args;
  const Editor = parseEditorType(editorType);
  return <Editor {...props} />;
};

AsyncAceEditor.args = {
  defaultTabSize: 2,
  width: '100%',
  height: '500px',
  value: `{"text": "Simple text"}`,
};

AsyncAceEditor.argTypes = {
  editorType: {
    defaultValue: 'json',
    control: { type: 'select' },
    options: editorTypes,
  },
  defaultTheme: {
    defaultValue: 'github',
    control: { type: 'radio' },
    options: ['textmate', 'github'],
  },
};

AsyncAceEditor.parameters = {
  actions: {
    disable: true,
  },
};
