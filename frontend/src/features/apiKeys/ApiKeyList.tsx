import { useEffect, useRef, useState } from 'react';
import { ZobiClient } from '@zobi.dev/core';
import { t } from '@zobi.dev/extension-api/translation';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import {
  Button,
  Table,
  Modal,
  Tag,
  Tooltip,
} from '@zobi.dev/core/components';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { ApiKeyCreateModal } from './ApiKeyCreateModal';

export interface ApiKey {
  uuid: string;
  name: string;
  key_prefix: string;
  active: boolean;
  created_on: string;
  expires_on: string | null;
  revoked_on: string | null;
  last_used_on: string | null;
  scopes: string | null;
}

export function ApiKeyList() {
  const theme = useTheme();
  const { addDangerToast, addSuccessToast } = useToasts();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const fetchCounterRef = useRef(0);

  async function fetchApiKeys() {
    fetchCounterRef.current += 1;
    const thisRequest = fetchCounterRef.current;
    setLoading(true);
    try {
      const response = await ZobiClient.get({
        endpoint: '/api/v1/security/api_keys/',
      });
      // Only apply results if this is still the most recent request
      if (thisRequest === fetchCounterRef.current) {
        setApiKeys(response.json.result || []);
      }
    } catch (error) {
      if (thisRequest === fetchCounterRef.current) {
        addDangerToast(t('Failed to fetch API keys'));
      }
    } finally {
      if (thisRequest === fetchCounterRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchApiKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRevokeKey(keyUuid: string) {
    Modal.confirm({
      title: t('Revoke API Key'),
      content: t(
        'Are you sure you want to revoke this API key? This action cannot be undone.',
      ),
      okText: t('Revoke'),
      okType: 'danger',
      cancelText: t('Cancel'),
      onOk: async () => {
        try {
          await ZobiClient.delete({
            endpoint: `/api/v1/security/api_keys/${keyUuid}`,
          });
          addSuccessToast(t('API key revoked successfully'));
          fetchApiKeys();
        } catch (error) {
          addDangerToast(t('Failed to revoke API key'));
        }
      },
    });
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (key: ApiKey) => {
    if (key.revoked_on) {
      return <Tag color="error">{t('Revoked')}</Tag>;
    }
    if (key.expires_on && new Date(key.expires_on) < new Date()) {
      return <Tag color="warning">{t('Expired')}</Tag>;
    }
    if (!key.active) {
      return <Tag color="default">{t('Inactive')}</Tag>;
    }
    return <Tag color="success">{t('Active')}</Tag>;
  };

  const columns = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('Key Prefix'),
      dataIndex: 'key_prefix',
      key: 'key_prefix',
      render: (prefix: string) => (
        <code
          css={css`
            background: ${theme.colorFillSecondary};
            padding: 2px 6px;
            border-radius: 3px;
          `}
        >
          {prefix}...
        </code>
      ),
    },
    {
      title: t('Created'),
      dataIndex: 'created_on',
      key: 'created_on',
      render: formatDate,
    },
    {
      title: t('Last Used'),
      dataIndex: 'last_used_on',
      key: 'last_used_on',
      render: formatDate,
    },
    {
      title: t('Status'),
      key: 'status',
      render: (_: unknown, record: ApiKey) => getStatusBadge(record),
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_: unknown, record: ApiKey) => (
        <>
          {!record.revoked_on && record.active && (
            <Tooltip title={t('Revoke this API key')}>
              <Button
                type="link"
                danger
                onClick={() => handleRevokeKey(record.uuid)}
              >
                {t('Revoke')}
              </Button>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <div
        css={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${theme.sizeUnit * 4}px;
        `}
      >
        <div>
          <p
            css={css`
              margin-bottom: ${theme.sizeUnit * 2}px;
            `}
          >
            {t('API keys allow scoped programmatic access to Zobi.')}
          </p>
          <p
            css={css`
              margin-bottom: 0;
            `}
          >
            {t('Keys are shown only once at creation. Store them securely.')}
          </p>
        </div>
        <Button type="primary" onClick={() => setShowCreateModal(true)}>
          {t('Create API Key')}
        </Button>
      </div>
      <Table
        columns={columns}
        data={apiKeys}
        loading={loading}
        rowKey="uuid"
        pagination={{ pageSize: 10 }}
      />
      {showCreateModal && (
        <ApiKeyCreateModal
          show={showCreateModal}
          onHide={() => {
            setShowCreateModal(false);
          }}
          onSuccess={() => {
            fetchApiKeys();
          }}
        />
      )}
    </div>
  );
}
