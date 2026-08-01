import { ReactNode } from 'react';
import { Collapse, CollapseLabelInModal } from '@zobi.dev/core/components';
import { styled } from '@zobi.dev/extension-api/theme';

interface CollapsibleModalSectionProps {
  sectionKey: string;
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  hasErrors?: boolean;
  testId?: string;
  children: ReactNode;
}

// Wrapper to ensure consistent spacing within sections
const SectionContent = styled.div`
  ${({ theme }) => `
    padding: ${theme.sizeUnit * 2}px 0;
  `}
`;

export function CollapsibleModalSection({
  sectionKey,
  title,
  subtitle,
  defaultExpanded = false,
  hasErrors = false,
  testId,
  children,
}: CollapsibleModalSectionProps) {
  return (
    <Collapse.Panel
      key={sectionKey}
      header={
        <CollapseLabelInModal
          title={title}
          subtitle={subtitle}
          validateCheckStatus={!hasErrors}
          testId={testId}
        />
      }
    >
      <SectionContent>{children}</SectionContent>
    </Collapse.Panel>
  );
}

interface CollapsibleModalSectionsProps {
  defaultActiveKey?: string | string[];
  accordion?: boolean;
  children: ReactNode;
}

export function CollapsibleModalSections({
  defaultActiveKey = 'general',
  accordion = true,
  children,
}: CollapsibleModalSectionsProps) {
  return (
    <Collapse
      expandIconPosition="end"
      defaultActiveKey={defaultActiveKey}
      accordion={accordion}
      modalMode
    >
      {children}
    </Collapse>
  );
}
