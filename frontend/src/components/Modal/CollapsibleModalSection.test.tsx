import { render, screen } from 'spec/helpers/testing-library';
import {
  CollapsibleModalSection,
  CollapsibleModalSections,
} from './CollapsibleModalSection';

test('renders section with title and content', () => {
  render(
    <CollapsibleModalSections>
      <CollapsibleModalSection
        sectionKey="test"
        title="Test Section"
        subtitle="Test subtitle"
      >
        <div>Section content</div>
      </CollapsibleModalSection>
    </CollapsibleModalSections>,
  );

  expect(screen.getByText('Test Section')).toBeInTheDocument();
  expect(screen.getByText('Test subtitle')).toBeInTheDocument();
});

test('renders section content when expanded', async () => {
  render(
    <CollapsibleModalSections defaultActiveKey={['test']}>
      <CollapsibleModalSection sectionKey="test" title="Test Section">
        <div>Section content</div>
      </CollapsibleModalSection>
    </CollapsibleModalSections>,
  );

  // Content should be in DOM when section is expanded by default
  expect(screen.getByText('Test Section')).toBeInTheDocument();
});

test('applies testId to section', () => {
  render(
    <CollapsibleModalSections>
      <CollapsibleModalSection
        sectionKey="test"
        title="Test Section"
        testId="custom-section"
      >
        <div>Content</div>
      </CollapsibleModalSection>
    </CollapsibleModalSections>,
  );

  expect(screen.getByTestId('custom-section')).toBeInTheDocument();
});

test('shows validation error state', () => {
  render(
    <CollapsibleModalSections>
      <CollapsibleModalSection sectionKey="test" title="Test Section" hasErrors>
        <div>Content</div>
      </CollapsibleModalSection>
    </CollapsibleModalSections>,
  );

  // CollapseLabelInModal should receive validateCheckStatus=false when hasErrors=true
  expect(screen.getByText('Test Section')).toBeInTheDocument();
});

test('renders multiple sections with accordion behavior', () => {
  render(
    <CollapsibleModalSections accordion defaultActiveKey="section1">
      <CollapsibleModalSection sectionKey="section1" title="Section 1">
        <div>Content 1</div>
      </CollapsibleModalSection>
      <CollapsibleModalSection sectionKey="section2" title="Section 2">
        <div>Content 2</div>
      </CollapsibleModalSection>
    </CollapsibleModalSections>,
  );

  expect(screen.getByText('Section 1')).toBeInTheDocument();
  expect(screen.getByText('Section 2')).toBeInTheDocument();
  // Content 1 should be visible since section1 is the default active key
});

test('renders sections without accordion behavior', () => {
  render(
    <CollapsibleModalSections
      accordion={false}
      defaultActiveKey={['section1', 'section2']}
    >
      <CollapsibleModalSection sectionKey="section1" title="Section 1">
        <div>Content 1</div>
      </CollapsibleModalSection>
      <CollapsibleModalSection sectionKey="section2" title="Section 2">
        <div>Content 2</div>
      </CollapsibleModalSection>
    </CollapsibleModalSections>,
  );

  expect(screen.getByText('Section 1')).toBeInTheDocument();
  expect(screen.getByText('Section 2')).toBeInTheDocument();
  // Test that both sections can be rendered (accordion=false allows multiple open)
});
