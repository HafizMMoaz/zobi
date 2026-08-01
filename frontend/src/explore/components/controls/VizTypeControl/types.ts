import { ReactElement } from 'react';

export interface VizMeta {
  icon: ReactElement;
  name: string;
}

export interface FastVizSwitcherProps {
  onChange: (vizName: string) => void;
  currentSelection: string | null;
}

export interface VizTileProps {
  vizMeta: VizMeta;
  isActive: boolean;
  isRendered: boolean;
  onTileClick: (vizType: string) => void;
}

export interface VizTypeControlProps {
  description?: string;
  label?: string;
  name: string;
  onChange: (vizType: string | null) => void;
  value: string | null;
  isModalOpenInit?: boolean;
}
