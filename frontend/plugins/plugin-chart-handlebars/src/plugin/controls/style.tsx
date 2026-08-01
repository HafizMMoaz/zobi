import {
  ControlSetItem,
  CustomControlConfig,
  sharedControls,
} from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';
import { useTheme } from '@zobi/core/theme';
import { InfoTooltip } from '@zobi-ui/core/components';
import { CodeEditor } from '../../components/CodeEditor/CodeEditor';
import { ControlHeader } from '../../components/ControlHeader/controlHeader';
import { debounceFunc } from '../../consts';

interface StyleCustomControlProps {
  value: string;
  htmlSanitization: boolean;
}

const StyleControl = (props: CustomControlConfig<StyleCustomControlProps>) => {
  const theme = useTheme();
  const htmlSanitization = props.htmlSanitization ?? true;

  const defaultValue = props?.value
    ? undefined
    : `/*
  .data-list {
    background-color: yellow;
  }
*/`;

  return (
    <div>
      <ControlHeader>
        <div>
          {typeof props.label === 'function' ? null : props.label}
          {htmlSanitization && (
            <InfoTooltip
              iconStyle={{ marginLeft: theme.sizeUnit }}
              tooltip={t(
                'CSS styles may be removed by server-side HTML sanitization. ' +
                  'If styles are not applying, ask your Zobi administrator ' +
                  'to adjust the HTML sanitization configuration.',
              )}
            />
          )}
        </div>
      </ControlHeader>
      <CodeEditor
        theme="dark"
        mode="css"
        value={props.value}
        defaultValue={defaultValue}
        onChange={source => {
          debounceFunc(props.onChange, source || '');
        }}
      />
    </div>
  );
};

export const styleControlSetItem: ControlSetItem = {
  name: 'styleTemplate',
  config: {
    ...sharedControls.entity,
    type: StyleControl,
    label: t('CSS Styles'),
    description: t('CSS applied to the chart'),
    isInt: false,
    renderTrigger: true,
    valueKey: null,

    validators: [],
    mapStateToProps: ({ form_data, common }) => ({
      value: form_data?.styleTemplate ?? form_data?.style_template,
      htmlSanitization: common?.conf?.HTML_SANITIZATION ?? true,
    }),
  },
};
