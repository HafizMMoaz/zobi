import { Component } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { Tooltip, PublishedLabel } from '@zobi.dev/core/components';
import { HeaderProps, HeaderDropdownProps } from '../Header/types';

export type DashboardPublishedStatusType = {
  dashboardId: HeaderDropdownProps['dashboardId'];
  userCanEdit: HeaderDropdownProps['userCanEdit'];
  userCanSave: HeaderDropdownProps['userCanSave'];
  isPublished: HeaderProps['isPublished'];
  savePublished: HeaderProps['savePublished'];
};

const draftButtonTooltip = t(
  'This dashboard is not published, it will not show up in the list of dashboards. ' +
    'Click here to publish this dashboard.',
);

const draftDivTooltip = t(
  'This dashboard is not published which means it will not show up in the list of dashboards.' +
    ' Favorite it to see it there or access it by using the URL directly.',
);

const publishedTooltip = t(
  'This dashboard is published. Click to make it a draft.',
);

export default class PublishedStatus extends Component<DashboardPublishedStatusType> {
  constructor(props: DashboardPublishedStatusType) {
    super(props);
    this.togglePublished = this.togglePublished.bind(this);
  }

  togglePublished() {
    this.props.savePublished(this.props.dashboardId, !this.props.isPublished);
  }

  render() {
    const { isPublished, userCanEdit, userCanSave } = this.props;

    // Show everybody the draft badge
    if (!isPublished) {
      // if they can edit the dash, make the badge a button
      if (userCanEdit && userCanSave) {
        return (
          <Tooltip
            id="unpublished-dashboard-tooltip"
            placement="bottom"
            title={draftButtonTooltip}
          >
            <div>
              <PublishedLabel
                isPublished={isPublished}
                onClick={this.togglePublished}
              />
            </div>
          </Tooltip>
        );
      }
      return (
        <Tooltip
          id="unpublished-dashboard-tooltip"
          placement="bottom"
          title={draftDivTooltip}
        >
          <div>
            <PublishedLabel isPublished={isPublished} />
          </div>
        </Tooltip>
      );
    }

    // Show the published badge for the owner of the dashboard to toggle
    if (userCanEdit && userCanSave) {
      return (
        <Tooltip
          id="published-dashboard-tooltip"
          placement="bottom"
          title={publishedTooltip}
        >
          <div>
            <PublishedLabel
              isPublished={isPublished}
              onClick={this.togglePublished}
            />
          </div>
        </Tooltip>
      );
    }

    // Don't show anything if one doesn't own the dashboard and it is published
    return null;
  }
}
