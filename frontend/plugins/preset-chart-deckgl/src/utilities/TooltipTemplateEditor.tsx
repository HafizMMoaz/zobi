
import { useCallback, useEffect, useState } from 'react';
import { styled, css, useThemeMode } from '@zobi/core/theme';
import { CodeEditor } from '@zobi-ui/core/components';

const EditorContainer = styled.div`
  ${({ theme }) => css`
    min-height: ${theme.sizeUnit * 50}px;
    width: 100%;

    .ace_editor {
      font-family: ${theme.fontFamilyCode};
    }
  `}
`;

interface TooltipTemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export function TooltipTemplateEditor({
  value,
  onChange,
  name,
}: TooltipTemplateEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const isDarkMode = useThemeMode();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <div>
      <EditorContainer>
        <CodeEditor
          mode="handlebars"
          theme={isDarkMode ? 'dark' : 'light'}
          name={name}
          height="200px"
          width="100%"
          value={localValue}
          onChange={handleChange}
        />
      </EditorContainer>
    </div>
  );
}
