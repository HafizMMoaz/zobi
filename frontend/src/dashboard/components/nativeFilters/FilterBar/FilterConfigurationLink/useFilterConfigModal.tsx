import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setFilterConfiguration } from 'src/dashboard/actions/nativeFilters';
import { saveChartCustomization } from 'src/dashboard/actions/chartCustomizationActions';
import { SaveChangesType } from 'src/dashboard/components/nativeFilters/FiltersConfigModal/types';
import FiltersConfigModal from 'src/dashboard/components/nativeFilters/FiltersConfigModal/FiltersConfigModal';

interface UseFilterConfigModalProps {
  createNewOnOpen?: boolean;
  dashboardId: number;
  initialFilterId?: string;
}

interface UseFilterConfigModalReturn {
  isFilterConfigModalOpen: boolean;
  openFilterConfigModal: () => void;
  closeFilterConfigModal: () => void;
  handleSave: (changes: SaveChangesType) => Promise<void>;
  FilterConfigModalComponent: JSX.Element | null;
}

export const useFilterConfigModal = ({
  createNewOnOpen = false,
  dashboardId,
  initialFilterId,
}: UseFilterConfigModalProps): UseFilterConfigModalReturn => {
  const dispatch = useDispatch();
  const [isFilterConfigModalOpen, setIsFilterConfigModalOpen] = useState(false);

  const openFilterConfigModal = useCallback(() => {
    setIsFilterConfigModalOpen(true);
  }, []);

  const closeFilterConfigModal = useCallback(() => {
    setIsFilterConfigModalOpen(false);
  }, []);

  const handleSave = useCallback(
    async (changes: SaveChangesType) => {
      try {
        if (changes.filterChanges) {
          dispatch(setFilterConfiguration(changes.filterChanges));
        }
        if (changes.customizationChanges) {
          dispatch(
            saveChartCustomization(
              changes.customizationChanges.modified,
              changes.customizationChanges.deleted,
              changes.customizationChanges.reordered,
              true,
            ),
          );
        }
        closeFilterConfigModal();
      } catch (error) {
        // Error toast already shown in action, prevent modal close
      }
    },
    [dispatch, closeFilterConfigModal],
  );

  const FilterConfigModalComponent = isFilterConfigModalOpen ? (
    <FiltersConfigModal
      isOpen={isFilterConfigModalOpen}
      onSave={handleSave}
      onCancel={closeFilterConfigModal}
      key={`filters-for-${dashboardId}`}
      createNewOnOpen={createNewOnOpen}
      initialFilterId={initialFilterId}
    />
  ) : null;

  return {
    isFilterConfigModalOpen,
    openFilterConfigModal,
    closeFilterConfigModal,
    handleSave,
    FilterConfigModalComponent,
  };
};
