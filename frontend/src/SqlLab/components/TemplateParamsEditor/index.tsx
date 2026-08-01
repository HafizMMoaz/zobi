import { useState, useEffect } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { debounce } from 'lodash';
import {
  Badge,
  InfoTooltip,
  ModalTrigger,
  Tooltip,
  Constants,
} from '@zobi.dev/core/components';
import { EditorHost } from 'src/core/editors';
import useQueryEditor from 'src/SqlLab/hooks/useQueryEditor';

const StyledEditorHost = styled(EditorHost)`
  &.ace_editor {
    border: 1px solid ${({ theme }) => theme.colorBorder};
  }
`;

const StyledParagraph = styled.p`
  margin-top: 0;
`;

const Code = styled.code`
  color: ${({ theme }) => theme.colorPrimary};
`;

export type TemplateParamsEditorProps = {
  queryEditorId: string;
  language: 'yaml' | 'json';
  onChange: (params: any) => void;
};

const TemplateParamsEditor = ({
  queryEditorId,
  language,
  onChange = () => {},
}: TemplateParamsEditorProps) => {
  const [parsedJSON, setParsedJSON] = useState({});
  const [isValid, setIsValid] = useState(true);

  const { templateParams } = useQueryEditor(queryEditorId, ['templateParams']);
  const code = templateParams ?? '{}';

  useEffect(() => {
    try {
      setParsedJSON(JSON.parse(code));
      setIsValid(true);
    } catch {
      setParsedJSON({} as any);
      setIsValid(false);
    }
  }, [code]);

  const modalBody = (
    <div>
      <StyledParagraph>
        {t('Assign a set of parameters as')} <Code>JSON</Code>{' '}
        {t('below (example:')} <Code>{'{"my_table": "foo"}'}</Code>
        {t('), and they become available in your SQL (example:')}{' '}
        <Code>SELECT * FROM {'{{ my_table }}'} </Code>) {t('by using')}&nbsp;
        <a
          href="https://zobi.dev/sqllab.html#templating-with-jinja"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('Jinja templating')}
        </a>{' '}
        {t('syntax.')}
      </StyledParagraph>
      <StyledEditorHost
        id={`template-params-${queryEditorId}`}
        height="800px"
        onChange={debounce(onChange, Constants.FAST_DEBOUNCE)}
        language={language === 'yaml' ? 'yaml' : 'json'}
        width="100%"
        value={code}
      />
    </div>
  );

  const paramCount = parsedJSON ? Object.keys(parsedJSON).length : 0;

  return (
    <ModalTrigger
      modalTitle={t('Template parameters')}
      triggerNode={
        <Tooltip
          id="parameters-tooltip"
          placement="top"
          title={t('Edit template parameters')}
          trigger={['hover']}
        >
          <div role="button" css={{ width: 'inherit' }}>
            {t('Parameters ')}
            <Badge count={paramCount} />
            {!isValid && (
              <InfoTooltip
                type="error"
                tooltip={t('Invalid JSON')}
                label="invalid-json"
              />
            )}
          </div>
        </Tooltip>
      }
      modalBody={modalBody}
    />
  );
};

export default TemplateParamsEditor;
