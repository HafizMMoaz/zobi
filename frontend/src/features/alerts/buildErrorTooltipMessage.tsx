import { css } from '@zobi.dev/extension-api/theme';
import { List } from '@zobi.dev/core/components';
import { ValidationObject } from './types';
import { TRANSLATIONS } from './AlertReportModal';

export const buildErrorTooltipMessage = (
  validationStatus: ValidationObject,
) => {
  const sectionErrors: string[] = [];
  Object.values(validationStatus).forEach(section => {
    if (section.hasErrors) {
      const sectionTitle = `${section.name}: `;
      sectionErrors.push(sectionTitle + section.errors.join(', '));
    }
  });
  return (
    <div>
      {TRANSLATIONS.ERROR_TOOLTIP_MESSAGE}
      <List
        dataSource={sectionErrors}
        renderItem={err => (
          <List.Item
            css={theme => css`
              &&& {
                color: ${theme.colorWhite};
              }
            `}
            compact
          >
            • {err}
          </List.Item>
        )}
        size="small"
        split={false}
      />
    </div>
  );
};
