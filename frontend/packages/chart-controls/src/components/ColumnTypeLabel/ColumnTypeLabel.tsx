/* eslint-disable no-nested-ternary */
import { ReactNode } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import {
  ClockCircleOutlined,
  QuestionOutlined,
  FunctionOutlined,
  FieldBinaryOutlined,
  FieldStringOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { Icons } from '@zobi.dev/core/components';

export type ColumnLabelExtendedType = 'expression' | 'metric' | '';

export type ColumnTypeLabelProps = {
  type?: ColumnLabelExtendedType | GenericDataType;
};

const TypeIconWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${theme.sizeUnit * 6}px;
    height: ${theme.sizeUnit * 6}px;
    margin-right: ${theme.sizeUnit}px;

    && svg {
      margin-right: 0;
      margin-left: 0;
      width: 100%;
      height: 100%;
    }
  `};
`;

export function ColumnTypeLabel({ type }: ColumnTypeLabelProps) {
  let typeIcon: ReactNode = (
    <QuestionOutlined aria-label={t('unknown type icon')} />
  );

  if (type === 'metric') {
    typeIcon = <Icons.Sigma aria-label={t('metric type icon')} />;
  } else if (type === '' || type === 'expression') {
    typeIcon = <FunctionOutlined aria-label={t('function type icon')} />;
  } else if (type === GenericDataType.String) {
    typeIcon = <FieldStringOutlined aria-label={t('string type icon')} />;
  } else if (type === GenericDataType.Numeric) {
    typeIcon = <NumberOutlined aria-label={t('numeric type icon')} />;
  } else if (type === GenericDataType.Boolean) {
    typeIcon = <FieldBinaryOutlined aria-label={t('boolean type icon')} />;
  } else if (type === GenericDataType.Temporal) {
    typeIcon = <ClockCircleOutlined aria-label={t('temporal type icon')} />;
  }

  return <TypeIconWrapper>{typeIcon}</TypeIconWrapper>;
}

export default ColumnTypeLabel;
