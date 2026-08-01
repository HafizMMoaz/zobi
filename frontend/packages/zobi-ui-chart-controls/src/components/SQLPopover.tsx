import {
  Popover,
  type PopoverProps,
  SQLEditor,
} from '@zobi-ui/core/components';
import { CalculatorOutlined } from '@ant-design/icons';
import { t } from '@zobi/core/translation';
import { css, styled, useTheme } from '@zobi/core/theme';

const StyledCalculatorIcon = styled(CalculatorOutlined)`
  ${({ theme }) => css`
    color: ${theme.colorIcon};
    font-size: ${theme.fontSizeSM}px;
    & svg {
      margin-left: ${theme.sizeUnit}px;
      margin-right: ${theme.sizeUnit}px;
    }
  `}
`;

export const SQLPopover = (props: PopoverProps & { sqlExpression: string }) => {
  const theme = useTheme();
  return (
    <Popover
      content={
        <SQLEditor
          value={props.sqlExpression}
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            highlightActiveLine: false,
            highlightGutterLine: false,
          }}
          minLines={2}
          maxLines={6}
          readOnly
          wrapEnabled
          style={{
            border: `1px solid ${theme.colorBorder}`,
            maxWidth: theme.sizeUnit * 100,
          }}
        />
      }
      placement="bottomLeft"
      arrow={{ pointAtCenter: true }}
      title={t('SQL expression')}
      {...props}
    >
      <StyledCalculatorIcon />
    </Popover>
  );
};
