import { t } from '@zobi/core/translation';
import { SEPARATOR } from '@zobi-ui/core';
import { Input, Icons, InfoTooltip } from '@zobi-ui/core/components';
import { FrameComponentProps } from 'src/explore/components/controls/DateFilterControl/types';
import DateFunctionTooltip from './DateFunctionTooltip';

function getAdvancedRange(value: string): string {
  if (value.includes(SEPARATOR)) {
    return value;
  }
  if (value.startsWith('Last')) {
    return [value, ''].join(SEPARATOR);
  }
  if (value.startsWith('Next')) {
    return ['', value].join(SEPARATOR);
  }
  return SEPARATOR;
}

export function AdvancedFrame(props: FrameComponentProps) {
  const advancedRange = getAdvancedRange(props.value || '');
  const [since, until] = advancedRange.split(SEPARATOR);
  if (advancedRange !== props.value) {
    props.onChange(getAdvancedRange(props.value || ''));
  }

  function onChange(control: 'since' | 'until', value: string) {
    if (control === 'since') {
      props.onChange(`${value}${SEPARATOR}${until}`);
    } else {
      props.onChange(`${since}${SEPARATOR}${value}`);
    }
  }

  return (
    <>
      <div className="section-title">
        {t('Configure Advanced Time Range ')}
        <DateFunctionTooltip placement="rightBottom">
          <Icons.InfoCircleOutlined />
        </DateFunctionTooltip>
      </div>
      <div className="control-label">
        {t('Start (inclusive)')}{' '}
        <InfoTooltip
          tooltip={t('Start date included in time range')}
          placement="right"
        />
      </div>
      <Input
        key="since"
        value={since}
        onChange={e => onChange('since', e.target.value)}
      />
      <div className="control-label">
        {t('End (exclusive)')}{' '}
        <InfoTooltip
          tooltip={t('End date excluded from time range')}
          placement="right"
        />
      </div>
      <Input
        key="until"
        value={until}
        onChange={e => onChange('until', e.target.value)}
      />
    </>
  );
}
