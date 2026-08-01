import { FC } from 'react';
import { FormItem, Input } from '@zobi-ui/core/components';
import { t } from '@zobi/core/translation';
import { NativeFilterType, ChartCustomizationType } from '@zobi-ui/core';
import { styled } from '@zobi/core/theme';
import { CHART_CUSTOMIZATION_DIVIDER_PREFIX } from './utils';

interface Props {
  componentId: string;
  divider?: {
    title: string;
    description: string;
  };
}
const Container = styled.div`
  ${({ theme }) => `
    padding: ${theme.sizeUnit * 4}px;
  `}
`;

const DividerConfigForm: FC<Props> = ({ componentId, divider }) => {
  const isChartCustomization = componentId.startsWith(
    CHART_CUSTOMIZATION_DIVIDER_PREFIX,
  );
  const dividerType = isChartCustomization
    ? ChartCustomizationType.Divider
    : NativeFilterType.Divider;

  return (
    <Container>
      <FormItem
        initialValue={divider ? divider.title : ''}
        label={t('Title')}
        name={['filters', componentId, 'title']}
        rules={[
          { required: true, message: t('Title is required'), whitespace: true },
        ]}
      >
        <Input />
      </FormItem>
      <FormItem
        initialValue={divider ? divider.description : ''}
        label={t('Description')}
        name={['filters', componentId, 'description']}
      >
        <Input.TextArea rows={4} />
      </FormItem>
      <FormItem
        hidden
        name={['filters', componentId, 'type']}
        initialValue={dividerType}
      />
    </Container>
  );
};

export default DividerConfigForm;
