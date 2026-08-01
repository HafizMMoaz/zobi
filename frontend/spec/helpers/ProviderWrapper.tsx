
import { ThemeProvider } from '@zobi/core/theme';
import querystring from 'query-string';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';

export function ProviderWrapper(props: any) {
  const { children, theme } = props;

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <QueryParamProvider
          adapter={ReactRouter5Adapter}
          options={{
            searchStringToObject: querystring.parse,
            objectToSearchString: (object: Record<string, any>) =>
              querystring.stringify(object, { encode: false }),
          }}
        >
          {children}
        </QueryParamProvider>
      </Router>
    </ThemeProvider>
  );
}
