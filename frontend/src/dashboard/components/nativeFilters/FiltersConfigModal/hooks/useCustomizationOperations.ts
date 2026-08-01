import { useCallback } from 'react';
import { ChartCustomizationType } from '@zobi.dev/core';
import { generateChartCustomizationId } from '../utils';
import type { ItemStateManager } from './useItemStateManager';

export interface CustomizationOperationsParams {
  customizationState: ItemStateManager;
  handleModifyItem: (id: string) => void;
  setActiveItem: (id: string) => void;
  setSaveAlertVisible: (visible: boolean) => void;
}

export interface CustomizationOperations {
  addChartCustomization: (type: ChartCustomizationType) => void;
  handleRemoveCustomization: (id: string) => void;
  restoreCustomization: (id: string) => void;
  handleRearrangeCustomizations: (
    dragIndex: number,
    targetIndex: number,
    id: string,
  ) => void;
}

export function useCustomizationOperations({
  customizationState,
  handleModifyItem,
  setActiveItem,
  setSaveAlertVisible,
}: CustomizationOperationsParams): CustomizationOperations {
  const addChartCustomization = useCallback(
    (type: ChartCustomizationType) => {
      const newCustomizationId = generateChartCustomizationId(type);
      customizationState.setNewIds([
        ...customizationState.newIds,
        newCustomizationId,
      ]);
      handleModifyItem(newCustomizationId);
      setActiveItem(newCustomizationId);
      setSaveAlertVisible(false);
      customizationState.setOrderedIds([
        ...customizationState.orderedIds,
        newCustomizationId,
      ]);
    },
    [customizationState, handleModifyItem, setActiveItem, setSaveAlertVisible],
  );

  const handleRemoveCustomization = useCallback(
    (id: string) => {
      const timerId = window.setTimeout(() => {
        customizationState.setRemovedItems(current => ({
          ...current,
          [id]: { isPending: false },
        }));
      }, 5000);

      customizationState.setRemovedItems(current => ({
        ...current,
        [id]: { isPending: true, timerId },
      }));
      customizationState.setChanges(prev => ({
        ...prev,
        deleted: [...prev.deleted, id],
      }));
      setSaveAlertVisible(false);
    },
    [customizationState, setSaveAlertVisible],
  );

  const restoreCustomization = useCallback(
    (id: string) => {
      const removal = customizationState.removedItems[id];
      if (removal?.isPending) {
        clearTimeout(removal.timerId);
      }

      customizationState.setRemovedItems(current => ({
        ...current,
        [id]: null,
      }));
      customizationState.setChanges(prev => ({
        ...prev,
        deleted: prev.deleted.filter(deletedId => deletedId !== id),
      }));
    },
    [customizationState],
  );

  const handleRearrangeCustomizations = useCallback(
    (dragIndex: number, targetIndex: number, id: string) => {
      const newOrderedIds = [...customizationState.orderedIds];
      const [removed] = newOrderedIds.splice(dragIndex, 1);
      newOrderedIds.splice(targetIndex, 0, removed);
      customizationState.setOrderedIds(newOrderedIds);
      customizationState.setChanges(prev => ({
        ...prev,
        reordered: newOrderedIds,
      }));
    },
    [customizationState],
  );

  return {
    addChartCustomization,
    handleRemoveCustomization,
    restoreCustomization,
    handleRearrangeCustomizations,
  };
}
