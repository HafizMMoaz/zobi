import { useState, useCallback, useMemo, ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import { css } from '@zobi/core/theme';
import { List } from '@zobi-ui/core/components';

export interface SectionValidationObject {
  hasErrors: boolean;
  errors: string[];
  name: string;
}

export interface ValidationObject {
  [key: string]: SectionValidationObject;
}

export interface ModalSection {
  key: string;
  name: string;
  validator: () => string[];
}

interface UseModalValidationProps {
  sections: ModalSection[];
  onValidationChange?: (hasErrors: boolean) => void;
}

interface UseModalValidationReturn {
  validationStatus: ValidationObject;
  validateSection: (key: string) => void;
  validateAll: () => boolean;
  errorTooltip: ReactNode;
  hasErrors: boolean;
  updateValidationStatus: (section: string, errors: string[]) => void;
}

export function buildErrorTooltipMessage(
  validationStatus: ValidationObject,
): ReactNode {
  const sectionErrors: string[] = [];
  Object.values(validationStatus).forEach(section => {
    if (section.hasErrors) {
      const sectionTitle = `${section.name}: `;
      sectionErrors.push(sectionTitle + section.errors.join(', '));
    }
  });

  if (sectionErrors.length === 0) {
    return '';
  }

  return (
    <div>
      {t('Please fix the following errors')}
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
}

export function useModalValidation({
  sections,
  onValidationChange,
}: UseModalValidationProps): UseModalValidationReturn {
  // Initialize validation status for all sections
  const initialValidationStatus = useMemo(
    () =>
      sections.reduce((acc, section) => {
        acc[section.key] = {
          hasErrors: false,
          errors: [],
          name: section.name,
        };
        return acc;
      }, {} as ValidationObject),
    [sections],
  );

  const [validationStatus, setValidationStatus] = useState<ValidationObject>(
    initialValidationStatus,
  );

  const updateValidationStatus = useCallback(
    (sectionKey: string, errors: string[]) => {
      setValidationStatus(currentValidationData => {
        const newStatus = {
          ...currentValidationData,
          [sectionKey]: {
            hasErrors: errors.length > 0,
            name: currentValidationData[sectionKey].name,
            errors,
          },
        };

        // Notify parent about validation change
        if (onValidationChange) {
          const hasAnyErrors = Object.values(newStatus).some(
            section => section.hasErrors,
          );
          onValidationChange(hasAnyErrors);
        }

        return newStatus;
      });
    },
    [onValidationChange],
  );

  const validateSection = useCallback(
    (key: string) => {
      const section = sections.find(s => s.key === key);
      if (section) {
        const errors = section.validator();
        updateValidationStatus(key, errors);
      }
    },
    [sections, updateValidationStatus],
  );

  const validateAll = useCallback(() => {
    let hasAnyErrors = false;
    sections.forEach(section => {
      const errors = section.validator();
      updateValidationStatus(section.key, errors);
      if (errors.length > 0) {
        hasAnyErrors = true;
      }
    });
    return !hasAnyErrors;
  }, [sections, updateValidationStatus]);

  const hasErrors = useMemo(
    () => Object.values(validationStatus).some(section => section.hasErrors),
    [validationStatus],
  );

  const errorTooltip = useMemo(
    () => (hasErrors ? buildErrorTooltipMessage(validationStatus) : ''),
    [validationStatus, hasErrors],
  );

  return {
    validationStatus,
    validateSection,
    validateAll,
    errorTooltip,
    hasErrors,
    updateValidationStatus,
  };
}
