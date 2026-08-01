import { render, screen, cleanup } from 'spec/helpers/testing-library';
import type { editors } from '@zobi/core';
import EditorHost from './EditorHost';

// Mock the AceEditorProvider to avoid loading the full Ace editor in tests
jest.mock('./AceEditorProvider', () => ({
  __esModule: true,
  default: ({ id, value, language }: EditorProps) => (
    <div data-test="ace-editor-provider">
      <span data-test="ace-editor-id">{id}</span>
      <span data-test="ace-editor-value">{value}</span>
      <span data-test="ace-editor-language">{language}</span>
    </div>
  ),
}));

// Mock the EditorProviders - return undefined (no extension provider)
jest.mock('./EditorProviders', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getProvider: jest.fn().mockReturnValue(undefined),
      hasProvider: jest.fn().mockReturnValue(false),
      onDidRegister: jest.fn().mockReturnValue({ dispose: jest.fn() }),
      onDidUnregister: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    }),
  },
}));

afterEach(() => {
  cleanup();
});

type EditorProps = editors.EditorProps;

const defaultProps: EditorProps = {
  id: 'test-editor',
  value: 'SELECT * FROM table',
  onChange: jest.fn(),
  language: 'sql',
};

test('renders default Ace editor when no extension provider is registered', () => {
  render(<EditorHost {...defaultProps} />);

  expect(screen.getByTestId('ace-editor-provider')).toBeInTheDocument();
  expect(screen.getByTestId('ace-editor-id')).toHaveTextContent('test-editor');
  expect(screen.getByTestId('ace-editor-value')).toHaveTextContent(
    'SELECT * FROM table',
  );
  expect(screen.getByTestId('ace-editor-language')).toHaveTextContent('sql');
});

test('passes id prop to the editor', () => {
  render(<EditorHost {...defaultProps} id="custom-id" />);

  expect(screen.getByTestId('ace-editor-id')).toHaveTextContent('custom-id');
});

test('passes value prop to the editor', () => {
  render(<EditorHost {...defaultProps} value="SELECT 1" />);

  expect(screen.getByTestId('ace-editor-value')).toHaveTextContent('SELECT 1');
});

test('passes language option to the editor', () => {
  render(<EditorHost {...defaultProps} language="json" />);

  expect(screen.getByTestId('ace-editor-language')).toHaveTextContent('json');
});
