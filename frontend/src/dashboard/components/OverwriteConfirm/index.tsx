import { useSelector } from 'react-redux';
import { AsyncEsmComponent } from '@zobi-ui/core/components';
import { DashboardState, RootState } from 'src/dashboard/types';

const Modal = AsyncEsmComponent(() => import('./OverwriteConfirmModal'));

const OverrideConfirm = () => {
  const overwriteConfirmMetadata = useSelector<
    RootState,
    DashboardState['overwriteConfirmMetadata']
  >(({ dashboardState }) => dashboardState.overwriteConfirmMetadata);

  return (
    <>
      {overwriteConfirmMetadata && (
        <Modal overwriteConfirmMetadata={overwriteConfirmMetadata} />
      )}
    </>
  );
};

export default OverrideConfirm;
