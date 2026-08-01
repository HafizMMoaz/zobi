
import { type Dispatch, type SetStateAction } from 'react';
import { JsonObject } from '@zobi.dev/core';
import {
  DashboardInfo as DashboardInfoType,
  Layout,
} from 'src/dashboard/types';
import { ChartState } from 'src/explore/types';
import { AlertObject } from 'src/features/alerts/types';
import { ToastMeta } from 'src/components/MessageToasts/types';

type ToastOptions = Partial<Omit<ToastMeta, 'id' | 'toastType' | 'text'>>;

export interface HeaderDropdownProps {
  addSuccessToast: (msg: string, options?: ToastOptions) => void;
  addDangerToast: (msg: string, options?: ToastOptions) => void;
  customCss?: string;
  colorNamespace?: string;
  colorScheme?: string;
  dashboardId: number;
  dashboardInfo: DashboardInfoType;
  dashboardTitle?: string;
  editMode: boolean;
  expandedSlices?: Record<number, boolean>;
  forceRefreshAllCharts: () => unknown;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  layout: Layout;
  onSave: (...args: unknown[]) => unknown;
  refreshFrequency: number;
  shouldPersistRefreshFrequency: boolean;
  showPropertiesModal: () => void;
  showRefreshModal: () => void;
  userCanEdit: boolean | undefined;
  userCanSave: boolean | undefined;
  userCanShare: boolean | undefined;
  userCanCurate: boolean;
  userCanExport: boolean | undefined;
  manageEmbedded: () => void;
  lastModifiedTime: number;
  logEvent: (...args: unknown[]) => unknown;
  refreshLimit?: number;
  refreshWarning?: string;
  directPathToChild?: string[];
  showReportModal: () => void;
  setCurrentReportDeleting: Dispatch<SetStateAction<AlertObject | null>>;
}

export interface HeaderProps {
  addSuccessToast: (msg: string, options?: ToastOptions) => void;
  addDangerToast: (msg: string, options?: ToastOptions) => void;
  addWarningToast: (msg: string, options?: ToastOptions) => void;
  colorNamespace?: string;
  charts: ChartState | JsonObject;
  colorScheme?: string;
  customCss?: string;
  user: object | undefined;
  dashboardInfo: DashboardInfoType;
  dashboardTitle?: string;
  setColorScheme: () => void;
  setUnsavedChanges: () => void;
  isStarred: boolean;
  isPublished: boolean;
  onChange: () => void;
  onSave: (...args: unknown[]) => unknown;
  fetchFaveStar: () => void;
  saveFaveStar: () => void;
  savePublished: (dashboardId: number, isPublished: boolean) => void;
  updateDashboardTitle: (nextTitle: string) => void;
  editMode: boolean;
  setEditMode: () => void;
  showBuilderPane: () => void;
  updateCss: () => void;
  logEvent: (eventName: string, eventData: JsonObject) => void;
  hasUnsavedChanges: boolean;
  maxUndoHistoryExceeded: boolean;
  lastModifiedTime: number;
  onUndo: () => void;
  onRedo: () => void;
  onRefresh: () => void;
  undoLength: number;
  redoLength: number;
  setMaxUndoHistoryExceeded: () => void;
  maxUndoHistoryToast: () => void;
  refreshFrequency: number;
  shouldPersistRefreshFrequency: boolean;
  setRefreshFrequency: () => void;
  dashboardInfoChanged: () => void;
  dashboardTitleChanged: () => void;
}
