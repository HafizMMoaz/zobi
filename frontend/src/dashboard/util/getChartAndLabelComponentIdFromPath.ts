import { IN_COMPONENT_ELEMENT_TYPES } from './constants';

export default function getChartAndLabelComponentIdFromPath(
  directPathToChild: (string | undefined)[],
): Record<string, string> {
  const result: Record<string, string> = {};

  if (directPathToChild.length > 0) {
    const currentPath = directPathToChild
      .slice()
      .filter((x): x is string => x !== undefined);
    while (currentPath.length) {
      const componentId = currentPath.pop()!;
      const componentType = componentId.split('-')[0];

      result[componentType.toLowerCase()] = componentId;
      if (!IN_COMPONENT_ELEMENT_TYPES.includes(componentType)) {
        break;
      }
    }
  }

  return result;
}
