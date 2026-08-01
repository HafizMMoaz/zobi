import type {
  ControlPanelState,
  ControlState,
} from '@zobi.dev/chart-controls';
import Separator from './Separator';

function getCodeControlMapStateToProps() {
  const sections =
    (Separator.controlPanelSections as unknown as Array<{
      controlSetRows?: Array<
        Array<{
          name?: string;
          config?: {
            mapStateToProps?: (s: Partial<ControlPanelState>) => {
              language: string;
            };
          };
        }>
      >;
    }>) || [];

  const codeControl = sections
    .flatMap(s => s.controlSetRows || [])
    .flatMap(r => r)
    .find(i => i?.name === 'code') as unknown as {
    config: {
      mapStateToProps: (s: Partial<ControlPanelState>) => { language: string };
    };
  };

  if (!codeControl || !codeControl.config?.mapStateToProps) {
    throw new Error('Code control configuration not found');
  }
  return codeControl.config.mapStateToProps;
}

// Separator control panel config
test('Separator control panel config defaults language to markdown when markup_type is missing', () => {
  const mapStateToProps = getCodeControlMapStateToProps();
  const state: Partial<ControlPanelState> = {};
  const result = mapStateToProps(state);
  expect(result.language).toBe('markdown');
});

test('Separator control panel config uses markup_type value when provided', () => {
  const mapStateToProps = getCodeControlMapStateToProps();
  const state: Partial<ControlPanelState> = {
    controls: {
      // minimal mock for the control used in mapStateToProps
      markup_type: { value: 'html' } as Partial<
        ControlState<'SelectControl'>
      > as ControlState<'SelectControl'>,
    },
  };
  const result = mapStateToProps(state);
  expect(result.language).toBe('html');
});
