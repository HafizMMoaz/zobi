import { t } from '@zobi/core/translation';
import { Radio } from '@zobi-ui/core/components/Radio';
import {
  COMMON_RANGE_OPTIONS,
  COMMON_RANGE_SET,
  DateFilterTestKey,
} from 'src/explore/components/controls/DateFilterControl/utils';
import {
  CommonRangeType,
  FrameComponentProps,
} from 'src/explore/components/controls/DateFilterControl/types';

export function CommonFrame(props: FrameComponentProps) {
  let commonRange = 'Last week';
  if (COMMON_RANGE_SET.has(props.value as CommonRangeType)) {
    commonRange = props.value;
  } else {
    props.onChange(commonRange);
  }

  return (
    <>
      <div className="section-title" data-test={DateFilterTestKey.CommonFrame}>
        {t('Configure Time Range: Last...')}
      </div>
      <Radio.GroupWrapper
        spaceConfig={{
          direction: 'vertical',
          size: 15,
          align: 'start',
          wrap: false,
        }}
        size="large"
        value={commonRange}
        onChange={(e: any) => props.onChange(e.target.value)}
        options={COMMON_RANGE_OPTIONS}
      />
    </>
  );
}
