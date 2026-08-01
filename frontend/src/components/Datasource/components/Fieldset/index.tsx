import { ReactNode, useCallback } from 'react';
import { Divider, Form, Typography } from '@zobi-ui/core/components';
import { css } from '@zobi/core/theme';
import { recurseReactClone } from '../../utils';
import Field from '../Field';

export interface FieldsetProps {
  children: ReactNode;
  onChange?: (updatedItem: Record<string, any>) => void;
  item?: Record<string, any>;
  title?: ReactNode;
  compact?: boolean;
}

type fieldKeyType = string | number;

export default function Fieldset({
  children,
  onChange,
  item = {},
  title = null,
  compact = false,
}: FieldsetProps) {
  const handleChange = useCallback(
    (fieldKey: fieldKeyType, val: any) => {
      onChange?.({
        ...item,
        [fieldKey]: val,
      });
    },
    [onChange, item],
  );

  const propExtender = (field: { props: { fieldKey: fieldKeyType } }) => ({
    onChange: handleChange,
    value: item?.[field.props.fieldKey],
    compact,
  });

  return (
    <Form className="CRUD" layout="vertical">
      {title && (
        <Typography.Title
          level={5}
          css={css`
            margin-top: 0.5em;
          `}
        >
          {title} <Divider />
        </Typography.Title>
      )}

      {recurseReactClone(children, Field, propExtender)}
    </Form>
  );
}
