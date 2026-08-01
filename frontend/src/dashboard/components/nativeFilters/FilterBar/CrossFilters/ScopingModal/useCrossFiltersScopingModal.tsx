import { ReactElement, useCallback, useState } from 'react';
import { ScopingModal } from './ScopingModal';

export const useCrossFiltersScopingModal = (
  initialChartId?: number,
): [() => void, ReactElement | null] => {
  const [isVisible, setIsVisible] = useState(false);

  const openModal = useCallback(() => setIsVisible(true), []);
  const closeModal = useCallback(() => setIsVisible(false), []);

  return [
    openModal,
    isVisible ? (
      <ScopingModal
        initialChartId={initialChartId}
        closeModal={closeModal}
        isVisible={isVisible}
      />
    ) : null,
  ];
};
