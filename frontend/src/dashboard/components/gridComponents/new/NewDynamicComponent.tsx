import { FC } from 'react';
import DraggableNewComponent from './DraggableNewComponent';
import { DYNAMIC_TYPE } from '../../../util/componentTypes';
import { NEW_DYNAMIC_COMPONENT } from '../../../util/constants';
import { DashboardComponentsRegistryMetadata } from '../../../../visualizations/dashboardComponents/DashboardComponentsRegistry';

type DraggableNewDynamicComponent = {
  componentKey: string;
  metadata: DashboardComponentsRegistryMetadata;
};

const DraggableNewDynamicComponent: FC<DraggableNewDynamicComponent> = ({
  componentKey,
  metadata,
}) => (
  <DraggableNewComponent
    id={NEW_DYNAMIC_COMPONENT}
    type={DYNAMIC_TYPE}
    label={metadata.name}
    meta={{ metadata, componentKey }}
  />
);

export default DraggableNewDynamicComponent;
