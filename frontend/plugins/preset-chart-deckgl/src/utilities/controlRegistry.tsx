
import { ControlType } from '@zobi-ui/chart-controls';
import { TooltipTemplateControl } from './TooltipTemplateControl';

/**
 * Registry for custom control components used in DeckGL charts
 */
export const deckGLControlRegistry = {
  TooltipTemplateControl,
};

/**
 * Expand control type to include local DeckGL controls
 */
export function expandDeckGLControlType(controlType: ControlType) {
  if (typeof controlType === 'string' && controlType in deckGLControlRegistry) {
    return deckGLControlRegistry[
      controlType as keyof typeof deckGLControlRegistry
    ];
  }
  return controlType;
}

/**
 * HOC to wrap control components with DeckGL-specific logic
 */
export function withDeckGLControls(Component: React.ComponentType<any>) {
  return function DeckGLControlWrapper(props: any) {
    const { type, ...otherProps } = props;
    const ExpandedComponent = expandDeckGLControlType(type) || Component;
    if (typeof ExpandedComponent === 'string') {
      // If it's a string, it's a built-in control type, use the original Component
      return <Component {...otherProps} />;
    }
    return <ExpandedComponent {...otherProps} />;
  };
}

export default deckGLControlRegistry;
