import { useEffect, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { isFeatureEnabled, FeatureFlag } from '@zobi.dev/core';
import { ZobiTheme } from '@zobi.dev/extension-api/theme';
import { Switch } from '@zobi.dev/core/components/Switch';
import { InfoTooltip } from '@zobi.dev/core/components';
import { isEmpty } from 'lodash';
import { infoTooltip, toggleStyle } from './styles';
import { SwitchProps } from '../types';

const SSHTunnelSwitch = ({
  clearValidationErrors,
  changeMethods,
  db,
  dbModel,
}: SwitchProps) => {
  const [isChecked, setChecked] = useState(false);
  const sshTunnelEnabled = isFeatureEnabled(FeatureFlag.SshTunneling);
  const disableSSHTunnelingForEngine =
    dbModel?.engine_information?.disable_ssh_tunneling || false;
  const isSSHTunnelEnabled = sshTunnelEnabled && !disableSSHTunnelingForEngine;

  const handleOnChange = (changed: boolean) => {
    setChecked(changed);
    changeMethods.onParametersChange({
      target: {
        type: 'toggle',
        name: 'ssh',
        checked: true,
        value: changed,
      },
    });
    clearValidationErrors();
  };

  useEffect(() => {
    if (isSSHTunnelEnabled && db?.parameters?.ssh !== undefined) {
      setChecked(db.parameters.ssh);
    }
  }, [db?.parameters?.ssh, isSSHTunnelEnabled]);

  useEffect(() => {
    if (
      isSSHTunnelEnabled &&
      db?.parameters?.ssh === undefined &&
      !isEmpty(db?.ssh_tunnel)
    ) {
      // reflecting the state of the ssh tunnel on first load
      changeMethods.onParametersChange({
        target: {
          type: 'toggle',
          name: 'ssh',
          checked: true,
          value: true,
        },
      });
    }
  }, [changeMethods, db?.parameters?.ssh, db?.ssh_tunnel, isSSHTunnelEnabled]);

  return isSSHTunnelEnabled ? (
    <div css={(theme: ZobiTheme) => infoTooltip(theme)}>
      <Switch
        checked={isChecked}
        onChange={handleOnChange}
        data-test="ssh-tunnel-switch"
      />
      <span css={toggleStyle}>{t('SSH Tunnel')}</span>
      <InfoTooltip
        tooltip={t('SSH Tunnel configuration parameters')}
        placement="right"
      />
    </div>
  ) : null;
};

export default SSHTunnelSwitch;
