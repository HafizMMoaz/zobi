import { t } from '@zobi.dev/extension-api/translation';
import { getClientErrorObject, ZobiClient } from '@zobi.dev/core';
import { css } from '@zobi.dev/extension-api/theme';
import { Button } from '@zobi.dev/core/components';
import { CopyToClipboard } from 'src/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import withToasts from 'src/components/MessageToasts/withToasts';
import useQueryEditor from 'src/SqlLab/hooks/useQueryEditor';
import { LOG_ACTIONS_SQLLAB_COPY_LINK } from 'src/logger/LogUtils';
import useLogAction from 'src/logger/useLogAction';

interface ShareSqlLabQueryProps {
  queryEditorId: string;
  addDangerToast: (msg: string) => void;
}

const ShareSqlLabQuery = ({
  queryEditorId,
  addDangerToast,
}: ShareSqlLabQueryProps) => {
  const logAction = useLogAction({ queryEditorId });
  const { dbId, name, schema, autorun, sql, templateParams } = useQueryEditor(
    queryEditorId,
    ['dbId', 'name', 'schema', 'autorun', 'sql', 'templateParams'],
  );

  const getCopyUrlForPermalink = (callback: Function) => {
    const sharedQuery = { dbId, name, schema, autorun, sql, templateParams };

    return ZobiClient.post({
      endpoint: '/api/v1/sqllab/permalink',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sharedQuery),
    })
      .then(({ json }) => {
        callback(json.url);
      })
      .catch(response => {
        getClientErrorObject(response).then(() => {
          addDangerToast(t('There was an error with your request'));
        });
      });
  };

  const getCopyUrl = (callback: Function) => {
    logAction(LOG_ACTIONS_SQLLAB_COPY_LINK, {
      shortcut: false,
    });
    return getCopyUrlForPermalink(callback);
  };

  const buildButton = () => {
    const tooltip = t('Copy query link to your clipboard');
    return (
      <Button
        color="default"
        variant="text"
        tooltip={tooltip}
        css={css`
          span > :first-of-type {
            margin-right: 0;
          }
        `}
        icon={<Icons.LinkOutlined iconSize="m" />}
      />
    );
  };

  return (
    <CopyToClipboard
      getText={getCopyUrl}
      wrapped={false}
      copyNode={buildButton()}
      hideTooltip
    />
  );
};

export default withToasts(ShareSqlLabQuery);
