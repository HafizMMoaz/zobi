import { useCallback, useEffect, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { makeApi, ZobiApiError, getExtensionsRegistry } from '@zobi.dev/core';
import { Alert } from '@zobi.dev/extension-api/components';
import { styled, css } from '@zobi.dev/extension-api/theme';
import {
  Button,
  FormItem,
  InfoTooltip,
  Input,
  Modal,
  Loading,
  Form,
  Space,
} from '@zobi.dev/core/components';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { EmbeddedDashboard } from 'src/dashboard/types';
import { Typography } from '@zobi.dev/core/components/Typography';
import { ModalTitleWithIcon } from 'src/components/ModalTitleWithIcon';

const extensionsRegistry = getExtensionsRegistry();

type Props = {
  dashboardId: string;
  show: boolean;
  onHide: () => void;
};

type EmbeddedApiPayload = { allowed_domains: string[] };

const stringToList = (stringyList: string): string[] =>
  stringyList.split(/(?:\s|,)+/).filter(x => x);

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

export const DashboardEmbedControls = ({ dashboardId, onHide }: Props) => {
  const { addInfoToast, addDangerToast } = useToasts();
  const [ready, setReady] = useState(true); // whether we have initialized yet
  const [loading, setLoading] = useState(false); // whether we are currently doing an async thing
  const [embedded, setEmbedded] = useState<EmbeddedDashboard | null>(null); // the embedded dashboard config
  const [allowedDomains, setAllowedDomains] = useState<string>('');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const endpoint = `/api/v1/dashboard/${dashboardId}/embedded`;
  // whether saveable changes have been made to the config
  const isDirty =
    !embedded ||
    stringToList(allowedDomains).join() !== embedded.allowed_domains.join();

  const enableEmbedded = useCallback(() => {
    setLoading(true);
    makeApi<EmbeddedApiPayload, { result: EmbeddedDashboard }>({
      method: 'POST',
      endpoint,
    })({
      allowed_domains: stringToList(allowedDomains),
    })
      .then(
        ({ result }) => {
          setEmbedded(result);
          setAllowedDomains(result.allowed_domains.join(', '));
          addInfoToast(t('Changes saved.'));
        },
        err => {
          console.error(err);
          addDangerToast(
            t(
              t('Sorry, something went wrong. The changes could not be saved.'),
            ),
          );
        },
      )
      .finally(() => {
        setLoading(false);
      });
  }, [endpoint, allowedDomains]);

  const disableEmbedded = useCallback(() => {
    setShowDeactivateConfirm(true);
  }, []);

  const confirmDeactivate = useCallback(() => {
    setLoading(true);
    makeApi<{}>({ method: 'DELETE', endpoint })({})
      .then(
        () => {
          setEmbedded(null);
          setAllowedDomains('');
          setShowDeactivateConfirm(false);
          addInfoToast(t('Embedding deactivated.'));
          onHide();
        },
        err => {
          console.error(err);
          addDangerToast(
            t(
              'Sorry, something went wrong. Embedding could not be deactivated.',
            ),
          );
        },
      )
      .finally(() => {
        setLoading(false);
      });
  }, [endpoint, addInfoToast, addDangerToast, onHide]);

  useEffect(() => {
    setReady(false);
    makeApi<{}, { result: EmbeddedDashboard }>({
      method: 'GET',
      endpoint,
    })({})
      .catch(err => {
        if ((err as ZobiApiError).status === 404) {
          // 404 just means the dashboard isn't currently embedded
          return { result: null };
        }
        addDangerToast(t('Sorry, something went wrong. Please try again.'));
        throw err;
      })
      .then(({ result }) => {
        setReady(true);
        setEmbedded(result);
        setAllowedDomains(result ? result.allowed_domains.join(', ') : '');
      });
  }, [dashboardId]);

  if (!ready) {
    return <Loading />;
  }

  const DocsConfigDetails = extensionsRegistry.get(
    'embedded.documentation.configuration_details',
  );
  const docsDescription = extensionsRegistry.get(
    'embedded.documentation.description',
  );
  const docsUrl =
    extensionsRegistry.get('embedded.documentation.url') ??
    'https://www.npmjs.com/package/@zobi.dev/embedded-sdk';

  return (
    <>
      {embedded ? (
        DocsConfigDetails ? (
          <DocsConfigDetails embeddedId={embedded.uuid} />
        ) : (
          <p>
            {t(
              'This dashboard is ready to embed. In your application, pass the following id to the SDK:',
            )}
            <br />
            <code>{embedded.uuid}</code>
          </p>
        )
      ) : (
        <p>
          {t(
            'Configure this dashboard to embed it into an external web application.',
          )}
        </p>
      )}
      <p>
        {t('For further instructions, consult the')}{' '}
        <Typography.Link href={docsUrl} target="_blank" rel="noreferrer">
          {docsDescription
            ? docsDescription()
            : t('Zobi Embedded SDK documentation.')}
        </Typography.Link>
      </p>
      <h3>{t('Settings')}</h3>
      <Form layout="vertical">
        <FormItem
          name="allowed-domains"
          label={
            <span>
              {t('Allowed Domains (comma separated)')}{' '}
              <InfoTooltip
                placement="top"
                tooltip={t(
                  'A list of domain names that can embed this dashboard. Leaving this field empty will allow embedding from any domain.',
                )}
              />
            </span>
          }
        >
          <Input
            id="allowed-domains"
            value={allowedDomains}
            placeholder={t('zobi.example.com')}
            onChange={event => setAllowedDomains(event.target.value)}
          />
        </FormItem>
      </Form>
      {showDeactivateConfirm ? (
        <Alert
          closable={false}
          type="warning"
          message={t('Disable embedding?')}
          description={t('This will remove your current embed configuration.')}
          css={{
            textAlign: 'left',
            marginTop: '16px',
          }}
          action={
            <Space>
              <Button
                key="cancel"
                buttonStyle="secondary"
                onClick={() => setShowDeactivateConfirm(false)}
              >
                {t('Cancel')}
              </Button>
              <Button
                key="deactivate"
                buttonStyle="danger"
                onClick={confirmDeactivate}
                loading={loading}
              >
                {t('Deactivate')}
              </Button>
            </Space>
          }
        />
      ) : (
        <ButtonRow
          css={theme => css`
            margin-top: ${theme.margin}px;
          `}
        >
          {embedded ? (
            <>
              <Button
                onClick={disableEmbedded}
                buttonStyle="secondary"
                loading={loading}
              >
                {t('Deactivate')}
              </Button>
              <Button
                onClick={enableEmbedded}
                buttonStyle="primary"
                disabled={!isDirty}
                loading={loading}
              >
                {t('Save changes')}
              </Button>
            </>
          ) : (
            <Button
              onClick={enableEmbedded}
              buttonStyle="primary"
              loading={loading}
            >
              {t('Enable embedding')}
            </Button>
          )}
        </ButtonRow>
      )}
    </>
  );
};

const DashboardEmbedModal = (props: Props) => {
  const { show, onHide } = props;
  const DashboardEmbedModalExtension = extensionsRegistry.get('embedded.modal');

  return DashboardEmbedModalExtension ? (
    <DashboardEmbedModalExtension {...props} />
  ) : (
    <Modal
      name={t('Embed')}
      show={show}
      onHide={onHide}
      hideFooter
      title={<ModalTitleWithIcon title={t('Embed')} />}
    >
      <DashboardEmbedControls {...props} />
    </Modal>
  );
};

export default DashboardEmbedModal;
