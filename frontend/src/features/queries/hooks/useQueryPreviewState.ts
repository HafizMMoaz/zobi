import { useState, useEffect } from 'react';

type BaseQueryObject = {
  id: number;
};

export default function useQueryPreviewState<D extends BaseQueryObject = any>({
  queries,
  fetchData,
  currentQueryId,
}: {
  queries: D[];
  fetchData: (id: number) => any;
  currentQueryId: number;
}) {
  const index = queries.findIndex(query => query.id === currentQueryId);
  const [currentIndex, setCurrentIndex] = useState(index);
  const [disablePrevious, setDisablePrevious] = useState(false);
  const [disableNext, setDisableNext] = useState(false);

  function checkIndex() {
    setDisablePrevious(currentIndex === 0);
    setDisableNext(currentIndex === queries.length - 1);
  }

  function handleDataChange(previous: boolean) {
    const offset = previous ? -1 : 1;
    const index = currentIndex + offset;
    if (index >= 0 && index < queries.length) {
      fetchData(queries[index].id);
      setCurrentIndex(index);
      checkIndex();
    }
  }

  function handleKeyPress(ev: any) {
    if (currentIndex >= 0 && currentIndex < queries.length) {
      if (ev.key === 'ArrowDown' || ev.key === 'k') {
        ev.preventDefault();
        handleDataChange(false);
      } else if (ev.key === 'ArrowUp' || ev.key === 'j') {
        ev.preventDefault();
        handleDataChange(true);
      }
    }
  }

  useEffect(() => {
    checkIndex();
  });

  return {
    handleKeyPress,
    handleDataChange,
    disablePrevious,
    disableNext,
  };
}
