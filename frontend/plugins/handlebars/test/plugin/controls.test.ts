import {
  ControlPanelState,
  ControlState,
  CustomControlItem,
} from '@zobi.dev/chart-controls';
import { QueryFormData } from '@zobi.dev/core';
import { handlebarsTemplateControlSetItem } from '../../src/plugin/controls/handlebarTemplate';
import { styleControlSetItem } from '../../src/plugin/controls/style';

const handlebarsConfig = (handlebarsTemplateControlSetItem as CustomControlItem)
  .config;
const styleConfig = (styleControlSetItem as CustomControlItem).config;

const buildState = (form_data: Partial<QueryFormData>) =>
  ({
    form_data: form_data as QueryFormData,
    controls: {},
    datasource: null,
    common: { conf: { HTML_SANITIZATION: true } },
    slice: { slice_id: 1 },
  }) as unknown as ControlPanelState;

const CUSTOM = '<div>custom template</div>';
const CUSTOM_CSS = '.foo { color: red; }';

test('handlebarsTemplate mapStateToProps reads snake_case handlebars_template (MCP-created charts)', () => {
  const result = handlebarsConfig.mapStateToProps!(
    buildState({ handlebars_template: CUSTOM } as Partial<QueryFormData>),
    {} as ControlState,
  );
  expect(result.value).toBe(CUSTOM);
});

test('handlebarsTemplate mapStateToProps reads camelCase handlebarsTemplate (UI-created charts)', () => {
  const result = handlebarsConfig.mapStateToProps!(
    buildState({ handlebarsTemplate: CUSTOM } as Partial<QueryFormData>),
    {} as ControlState,
  );
  expect(result.value).toBe(CUSTOM);
});

test('handlebarsTemplate mapStateToProps prefers camelCase when both keys present (latest edit wins over legacy snake_case)', () => {
  const result = handlebarsConfig.mapStateToProps!(
    buildState({
      handlebars_template: 'stale legacy value',
      handlebarsTemplate: 'latest edit',
    } as Partial<QueryFormData>),
    {} as ControlState,
  );
  expect(result.value).toBe('latest edit');
});

test('handlebarsTemplate mapStateToProps returns undefined when no template stored (allows default)', () => {
  const result = handlebarsConfig.mapStateToProps!(
    buildState({}),
    {} as ControlState,
  );
  expect(result.value).toBeUndefined();
});

test('styleTemplate mapStateToProps reads camelCase styleTemplate (MCP and UI charts)', () => {
  const result = styleConfig.mapStateToProps!(
    buildState({ styleTemplate: CUSTOM_CSS } as Partial<QueryFormData>),
    {} as ControlState,
  );
  expect(result.value).toBe(CUSTOM_CSS);
  expect(result.htmlSanitization).toBe(true);
});

test('styleTemplate mapStateToProps prefers camelCase when both keys present', () => {
  const result = styleConfig.mapStateToProps!(
    buildState({
      style_template: 'stale',
      styleTemplate: 'latest',
    } as Partial<QueryFormData>),
    {} as ControlState,
  );
  expect(result.value).toBe('latest');
});

test('styleTemplate mapStateToProps reads snake_case style_template as fallback', () => {
  const result = styleConfig.mapStateToProps!(
    buildState({ style_template: CUSTOM_CSS } as Partial<QueryFormData>),
    {} as ControlState,
  );
  expect(result.value).toBe(CUSTOM_CSS);
});

test('styleTemplate mapStateToProps uses HTML_SANITIZATION=false from config', () => {
  const result = styleConfig.mapStateToProps!(
    {
      ...buildState({}),
      common: { conf: { HTML_SANITIZATION: false } },
    } as unknown as ControlPanelState,
    {} as ControlState,
  );
  expect(result.htmlSanitization).toBe(false);
});
