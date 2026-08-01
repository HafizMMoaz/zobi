import { useState } from 'react';
import { css, useTheme } from '@zobi/core-legacy/theme';
import { Icons, Radio, Popover } from '../..';

export interface HeaderWithRadioGroupProps {
  headerTitle: string;
  groupTitle: string;
  groupOptions: { label: string; value: string | number }[];
  value?: string | number;
  onChange: (value: string) => void;
}

function HeaderWithRadioGroup(props: HeaderWithRadioGroupProps) {
  const { headerTitle, groupTitle, groupOptions, value, onChange } = props;
  const theme = useTheme();
  const [popoverVisible, setPopoverVisible] = useState(false);

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
      `}
    >
      <Popover
        trigger="click"
        open={popoverVisible}
        content={
          <div>
            <div
              css={css`
                font-weight: ${theme.fontWeightStrong};
                margin-bottom: ${theme.sizeUnit}px;
              `}
            >
              {groupTitle}
            </div>
            <Radio.GroupWrapper
              spaceConfig={{
                direction: 'vertical',
                size: 4,
                wrap: false,
                align: 'start',
              }}
              value={value}
              onChange={e => {
                onChange(e.target.value);
                setPopoverVisible(false);
              }}
              options={groupOptions}
            />
          </div>
        }
        placement="bottomLeft"
        arrow={{ pointAtCenter: true }}
      >
        <Icons.SettingOutlined
          iconSize="m"
          iconColor={theme.colorIcon}
          css={css`
            margin-top: ${theme.sizeUnit * 0.75}px;
            margin-right: ${theme.sizeUnit}px;
          `}
          onClick={() => setPopoverVisible(true)}
        />
      </Popover>
      {headerTitle}
    </div>
  );
}

export default HeaderWithRadioGroup;
