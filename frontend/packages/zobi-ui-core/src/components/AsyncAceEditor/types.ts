import type { Editor as OrigEditor, TextMode as OrigTextMode } from 'brace';
import type { ComponentType } from 'react';
import type { IAceEditorProps } from 'react-ace';
import type { PlaceholderProps } from '../AsyncEsmComponent/types';
import { aceModuleLoaders } from '.';

export interface AceCompleterKeywordData {
  name: string;
  value: string;
  score: number;
  meta: string;
  docText?: string;
  docHTML?: string;
}

export type TextMode = OrigTextMode & { $id: string };

export interface AceCompleter {
  insertMatch: (
    data?: Editor | { value: string } | string,
    options?: AceCompleterKeywordData,
  ) => void;
}

export type Editor = OrigEditor & {
  completer: AceCompleter;
  completers: AceCompleter[];
};

export interface AceCompleterKeyword extends AceCompleterKeywordData {
  completer?: AceCompleter;
}

export type AceModule = keyof typeof aceModuleLoaders;

export type AsyncAceEditorProps = IAceEditorProps & {
  keywords?: AceCompleterKeyword[];
};

export type AceEditorMode = 'sql';
export type AceEditorTheme = 'textmate' | 'github';
export type AsyncAceEditorOptions = {
  defaultMode?: AceEditorMode;
  defaultTheme?: AceEditorTheme;
  defaultTabSize?: number;
  fontFamily?: string;
  placeholder?: ComponentType<
    PlaceholderProps & Partial<IAceEditorProps>
  > | null;
};
