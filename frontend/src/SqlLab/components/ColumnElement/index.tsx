import { ReactNode } from 'react';
import { ClassNames } from '@emotion/react';
import { t } from '@zobi/core/translation';
import { styled, useTheme } from '@zobi/core/theme';
import { Flex, Tooltip } from '@zobi-ui/core/components';

const StyledTooltip = (props: any) => {
  const theme = useTheme();
  return (
    <ClassNames>
      {({ css }) => (
        <Tooltip
          overlayClassName={css`
            .ant-tooltip-inner {
              max-width: ${theme.sizeUnit * 125}px;
              word-wrap: break-word;
              text-align: center;

              pre {
                background: transparent;
                border: none;
                text-align: left;
                color: ${theme.colorBgLayout};
                font-size: ${theme.fontSizeXS}px;
              }
            }
          `}
          {...props}
        />
      )}
    </ClassNames>
  );
};

const Hr = styled.hr`
  margin-top: ${({ theme }) => theme.sizeUnit * 1.5}px;
`;

const iconMap = {
  pk: 'fa-key',
  fk: 'fa-link',
  index: 'fa-bookmark',
};

const tooltipTitleMap = {
  pk: t('Primary key'),
  fk: t('Foreign key'),
  index: t('Index'),
};

export type ColumnKeyTypeType = keyof typeof tooltipTitleMap;

interface ColumnElementProps {
  column: {
    name: string;
    keys?: { type: ColumnKeyTypeType }[];
    type: string;
  };
  actions?: ReactNode;
}

const ColumnType = styled.div`
  white-space: nowrap;
  color: ${({ theme }) => theme.colorTextDescription};
  font-size: ${({ theme }) => theme.fontSizeSM}px;
`;

const ColumnElement = ({ column, actions }: ColumnElementProps) => {
  let columnName: ReactNode = column.name;
  let icons;
  if (column.keys && column.keys.length > 0) {
    columnName = <strong>{column.name}</strong>;
    icons = column.keys.map((key, i) => (
      <span key={i} className="ColumnElement">
        <StyledTooltip
          placement="right"
          title={
            <>
              <strong>{tooltipTitleMap[key.type]}</strong>
              <Hr />
              <pre className="text-small">
                {JSON.stringify(key, null, '  ')}
              </pre>
            </>
          }
        >
          {' '}
          <i className={`fa text-muted ${iconMap[key.type]}`} />
        </StyledTooltip>
      </span>
    ));
  }
  return (
    <Flex align="center" justify="space-between">
      <div data-test="col-name">
        {columnName}
        {icons}
        {actions}
      </div>
      <ColumnType>{column.type}</ColumnType>
    </Flex>
  );
};

export default ColumnElement;
