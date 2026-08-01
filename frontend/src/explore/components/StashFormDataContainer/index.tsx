import { useEffect, FC, ReactNode } from 'react';

import { useDispatch } from 'react-redux';
import { setStashFormData } from 'src/explore/actions/exploreActions';
import useEffectEvent from 'src/hooks/useEffectEvent';

type Props = {
  shouldStash: boolean;
  fieldNames: ReadonlyArray<string>;
  children?: ReactNode;
};

const StashFormDataContainer: FC<Props> = ({
  shouldStash,
  fieldNames,
  children,
}) => {
  const dispatch = useDispatch();
  const onVisibleUpdate = useEffectEvent((shouldStash: boolean) =>
    dispatch(setStashFormData(shouldStash, fieldNames)),
  );
  useEffect(() => {
    onVisibleUpdate(shouldStash);
  }, [shouldStash, onVisibleUpdate]);

  return <>{children}</>;
};

export default StashFormDataContainer;
