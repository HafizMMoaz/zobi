import { IN_COMPONENT_ELEMENT_TYPES } from './constants';

export default function getLeafComponentIdFromPath(
  directPathToChild: string[] = [],
): string | null {
  if (directPathToChild.length > 0) {
    const currentPath = directPathToChild.slice();

    while (currentPath.length) {
      const componentId = currentPath.pop();
      const componentType = componentId && componentId.split('-')[0];

      if (
        componentType &&
        !IN_COMPONENT_ELEMENT_TYPES.includes(componentType)
      ) {
        return componentId;
      }
    }
  }

  return null;
}
