import { useEffect, useRef, useState } from 'react';
import {
  LocalStorageKeys,
  setItem,
  getItem,
} from 'src/utils/localStorageHelpers';

export default function useStoredSidebarWidth(
  id: string,
  initialWidth: number,
) {
  const widthsMapRef = useRef<Record<string, number>>();
  const [sidebarWidth, setSidebarWidth] = useState<number>(initialWidth);

  useEffect(() => {
    widthsMapRef.current =
      widthsMapRef.current ??
      getItem(LocalStorageKeys.CommonResizableSidebarWidths, {});
    if (widthsMapRef.current[id]) {
      setSidebarWidth(widthsMapRef.current[id]);
    }
  }, [id]);

  function setStoredSidebarWidth(updatedWidth: number) {
    setSidebarWidth(updatedWidth);
    setItem(LocalStorageKeys.CommonResizableSidebarWidths, {
      ...widthsMapRef.current,
      [id]: updatedWidth,
    });
  }

  return [sidebarWidth, setStoredSidebarWidth] as const;
}
