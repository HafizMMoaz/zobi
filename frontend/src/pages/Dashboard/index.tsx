import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPage } from 'src/dashboard/containers/DashboardPage';

const DashboardRoute: FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  return <DashboardPage idOrSlug={idOrSlug} />;
};

export default DashboardRoute;
