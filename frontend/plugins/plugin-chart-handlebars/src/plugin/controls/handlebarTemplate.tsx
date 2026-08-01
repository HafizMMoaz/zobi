import {
  ControlSetItem,
  CustomControlConfig,
  sharedControls,
} from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';
import { validateNonEmpty } from '@zobi-ui/core';
import { useTheme } from '@zobi/core/theme';
import { InfoTooltip } from '@zobi-ui/core/components';
import { CodeEditor } from '../../components/CodeEditor/CodeEditor';
import { ControlHeader } from '../../components/ControlHeader/controlHeader';
import { debounceFunc } from '../../consts';

interface HandlebarsCustomControlProps {
  value: string;
}

const HandlebarsTemplateControl = (
  props: CustomControlConfig<HandlebarsCustomControlProps>,
) => {
  const theme = useTheme();
  const val = String(
    props?.value ? props?.value : props?.default ? props?.default : '',
  );

  return (
    <div>
      <ControlHeader>
        <div>
          {typeof props.label === 'function' ? null : props.label}
          <InfoTooltip
            iconStyle={{ marginLeft: theme.sizeUnit }}
            tooltip={
              <span>
                {t('See ')}{' '}
                <a
                  href="https://zobi.dev/docs/using-zobi/handlebars-chart"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('the Handlebars chart documentation')}
                </a>{' '}
                {t('for a list of available helpers.')}
              </span>
            }
          />
        </div>
      </ControlHeader>
      <CodeEditor
        theme="dark"
        value={val}
        onChange={source => {
          debounceFunc(props.onChange, source || '');
        }}
      />
    </div>
  );
};

export const handlebarsTemplateControlSetItem: ControlSetItem = {
  name: 'handlebarsTemplate',
  config: {
    ...sharedControls.entity,
    type: HandlebarsTemplateControl,
    label: t('Handlebars Template'),
    description: t('A handlebars template that is applied to the data'),
    default: `<ul class="data-list">
  {{#each data}}
    <li>{{stringify this}}</li>
  {{/each}}
</ul>`,
    isInt: false,
    renderTrigger: true,
    valueKey: null,
    validators: [validateNonEmpty],
    mapStateToProps: ({ form_data }) => ({
      value: form_data?.handlebarsTemplate ?? form_data?.handlebars_template,
    }),
  },
};
