import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import type { editors } from '@zobi.dev/extension-api';
import { EditorHost } from 'src/core/editors';
import { ModalFormField } from 'src/components/Modal';
import { ValidationObject } from 'src/components/Modal/useModalValidation';

type EditorAnnotation = editors.EditorAnnotation;

/**
 * Convert Ace annotation format to EditorAnnotation format.
 */
const toEditorAnnotations = (
  aceAnnotations: Array<{
    type: string;
    row: number;
    column: number;
    text: string;
  }>,
): EditorAnnotation[] =>
  aceAnnotations.map(ann => ({
    severity: ann.type as EditorAnnotation['severity'],
    line: ann.row,
    column: ann.column,
    message: ann.text,
  }));

const StyledEditorHost = styled(EditorHost)`
  /* Border is already applied by AceEditor itself */
`;

interface AdvancedSectionProps {
  jsonMetadata: string;
  jsonAnnotations: any[];
  validationStatus: ValidationObject;
  onJsonMetadataChange: (value: string) => void;
}

const AdvancedSection = ({
  jsonMetadata,
  jsonAnnotations,
  validationStatus,
  onJsonMetadataChange,
}: AdvancedSectionProps) => (
  <ModalFormField
    label={t('JSON Metadata')}
    testId="dashboard-metadata-field"
    helperText={t(
      'This JSON object is generated dynamically when clicking the save ' +
        'or overwrite button in the dashboard view. It is exposed here for ' +
        'reference and for power users who may want to alter specific parameters.',
    )}
    error={
      validationStatus.advanced?.hasErrors && jsonAnnotations.length > 0
        ? t('Invalid JSON metadata')
        : undefined
    }
    bottomSpacing={false}
  >
    <StyledEditorHost
      id="dashboard-json-metadata"
      data-test="dashboard-metadata-editor"
      value={jsonMetadata}
      onChange={onJsonMetadataChange}
      language="json"
      tabSize={2}
      wordWrap
      width="100%"
      height="60vh"
      annotations={toEditorAnnotations(jsonAnnotations)}
    />
  </ModalFormField>
);

export default AdvancedSection;
