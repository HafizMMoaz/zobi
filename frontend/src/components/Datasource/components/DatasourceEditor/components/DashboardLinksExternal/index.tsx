import { styled } from '@zobi/core/theme';
import { GenericLink } from 'src/components';

const DashboardLinksWrapper = styled.span`
  .truncated {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    width: 100%;
    vertical-align: bottom;
  }

  a {
    color: ${({ theme }) => theme.colorPrimary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

interface Dashboard {
  id: number;
  dashboard_title: string;
  url: string;
}

interface DashboardLinksExternalProps {
  dashboards: Dashboard[];
}

const DashboardLinksExternal = ({
  dashboards,
}: DashboardLinksExternalProps) => {
  if (!dashboards || dashboards.length === 0) {
    return <span>—</span>;
  }

  return (
    <DashboardLinksWrapper>
      <span className="truncated">
        {dashboards.map((dashboard, index) => (
          <GenericLink
            key={dashboard.id}
            to={`/zobi/dashboard/${dashboard.id}/`}
            target="_blank"
          >
            {index === 0
              ? dashboard.dashboard_title
              : `, ${dashboard.dashboard_title}`}
          </GenericLink>
        ))}
      </span>
    </DashboardLinksWrapper>
  );
};

export default DashboardLinksExternal;
