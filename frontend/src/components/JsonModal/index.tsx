import { FC, useMemo } from 'react';
import { JSONTree } from 'react-json-tree';
import { styled } from '@zobi.dev/extension-api/theme';
import { useJsonTreeTheme } from 'src/hooks/useJsonTreeTheme';
import { Button, ModalTrigger } from '@zobi.dev/core/components';
import { CopyToClipboard } from '../CopyToClipboard';
import { convertBigIntStrToNumber } from './utils';
import type { JsonModalProps } from './types';

/**
 * Preserve line breaks for multiline cell content (e.g. stack traces)
 * while keeping the change scoped to this component only.
 */
const PreWrap = styled.span`
  white-space: pre-wrap;
`;

function renderBigIntStrToNumber(value: string | number) {
  return <>{convertBigIntStrToNumber(value)}</>;
}

export const JsonModal: FC<JsonModalProps> = ({
  modalTitle,
  jsonObject,
  jsonValue,
  wrapContent = true,
}) => {
  const jsonTreeTheme = useJsonTreeTheme();

  const content = useMemo(
    () =>
      typeof jsonValue === 'object' ? JSON.stringify(jsonValue) : jsonValue,
    [jsonValue],
  );

  return (
    <ModalTrigger
      modalBody={
        <JSONTree
          data={jsonObject}
          theme={jsonTreeTheme}
          valueRenderer={renderBigIntStrToNumber}
        />
      }
      modalFooter={
        <Button>
          <CopyToClipboard shouldShowText={false} text={content} />
        </Button>
      }
      modalTitle={modalTitle}
      triggerNode={wrapContent ? <PreWrap>{content}</PreWrap> : content}
    />
  );
};

export type { JsonModalProps };
