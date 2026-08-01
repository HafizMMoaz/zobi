import React from 'react';
import { ensureIsArray } from '@zobi.dev/core';
import { views } from 'src/core';
import { resolveView } from 'src/core/views';

export interface ViewListExtensionProps {
  viewId: string;
}

const ViewListExtension = ({ viewId }: ViewListExtensionProps) => {
  const viewItems = ensureIsArray(views.getViews(viewId));

  return (
    <>
      {viewItems
        .filter(view => view && typeof view.id !== 'undefined')
        .map(view => (
          <React.Fragment key={view.id}>{resolveView(view.id)}</React.Fragment>
        ))}
    </>
  );
};

export default ViewListExtension;
