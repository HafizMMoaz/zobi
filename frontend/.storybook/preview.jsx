import { withJsx } from '@mihkeleidast/storybook-addon-source';
import { themeObject, css, exampleThemes } from '@zobi/core/theme';
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import reducerIndex from 'spec/helpers/reducerIndex';
import { Global } from '@emotion/react';
import { App, Layout, Space, Content } from 'antd';

import 'src/theme.ts';
import './storybook.css';

// Set up bootstrap data for components that check HTML_SANITIZATION config
// (e.g., HandlebarsViewer). This allows <style> tags in Handlebars templates.
if (typeof document !== 'undefined') {
  let appEl = document.getElementById('app');
  if (!appEl) {
    appEl = document.createElement('div');
    appEl.id = 'app';
    document.body.appendChild(appEl);
  }
  appEl.setAttribute(
    'data-bootstrap',
    JSON.stringify({
      common: {
        conf: {
          HTML_SANITIZATION: false,
        },
      },
    }),
  );
}

export const GlobalStylesOverrides = () => (
  <Global
    styles={css`
      html,
      body,
      #storybook-root {
        margin: 0 !important;
        padding: 0 !important;
        min-height: 100vh !important;
      }

      .ant-app {
        min-height: 100vh !important;
      }
    `}
  />
);

const store = createStore(
  combineReducers(reducerIndex),
  {},
  compose(applyMiddleware(thunk)),
);

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'zobi',
    toolbar: {
      icon: 'paintbrush',
      items: Object.keys(exampleThemes),
    },
  },
};

const themeDecorator = (Story, context) => {
  const themeKey = context.globals.theme || 'zobi';
  themeObject.setConfig(exampleThemes[themeKey]);

  return (
    <themeObject.ZobiThemeProvider>
      <App>
        <GlobalStylesOverrides />
        <Layout
          style={{
            minHeight: '100vh',
            width: '100%',
            padding: 24,
            backgroundColor: themeObject.theme.colorBgBase,
          }}
        >
          <Story {...context} />
        </Layout>
      </App>
    </themeObject.ZobiThemeProvider>
  );
};

const providerDecorator = Story => (
  <Provider store={store}>
    <Story />
  </Provider>
);

export const decorators = [withJsx, themeDecorator, providerDecorator];

export const parameters = {
  paddings: {
    values: [
      { name: 'None', value: '0px' },
      { name: 'Small', value: '16px' },
      { name: 'Medium', value: '32px' },
      { name: 'Large', value: '64px' },
    ],
    default: 'Medium',
  },
  options: {
    storySort: {
      order: [
        'Zobi Frontend',
        ['Controls', 'Display', 'Feedback', 'Input', '*'],
        ['Overview', 'Examples', '*'],
        'Design System',
        [
          'Introduction',
          'Foundations',
          'Components',
          ['Overview', 'Examples', '*'],
          'Patterns',
          '*',
        ],
        ['Overview', 'Examples', '*'],
        '*',
      ],
    },
  },
  controls: { expanded: true, sort: 'alpha', disableSaveFromUI: true },
};
