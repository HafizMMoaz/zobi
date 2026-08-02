import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { SafeMarkdown } from '@zobi.dev/core/components';
import { extendedDayjs as dayjs } from '@zobi.dev/core/utils/dates';
import Handlebars from 'handlebars';
import { useMemo, useState } from 'react';
import { isPlainObject } from 'lodash';
import Helpers from 'just-handlebars-helpers';
import HandlebarsGroupBy from 'handlebars-group-by';

export interface HandlebarsViewerProps {
  templateSource: string;
  data: any;
}

export const HandlebarsViewer = ({
  templateSource,
  data,
}: HandlebarsViewerProps) => {
  const [renderedTemplate, setRenderedTemplate] = useState('');
  const [error, setError] = useState('');
  const appContainer = document.getElementById('app');
  const { common } = JSON.parse(
    appContainer?.getAttribute('data-bootstrap') || '{}',
  );
  const htmlSanitization = common?.conf?.HTML_SANITIZATION ?? true;
  const htmlSchemaOverrides =
    common?.conf?.HTML_SANITIZATION_SCHEMA_EXTENSIONS || {};

  useMemo(() => {
    try {
      const template = Handlebars.compile(templateSource);
      const result = template(data);
      setRenderedTemplate(result);
      setError('');
    } catch (error) {
      setRenderedTemplate('');
      setError(error instanceof Error ? error.message : String(error));
    }
  }, [templateSource, data]);

  const StyledError = styled.pre`
    white-space: pre-wrap;
  `;

  if (error) {
    return <StyledError>{error}</StyledError>;
  }

  if (renderedTemplate) {
    return (
      <SafeMarkdown
        source={renderedTemplate}
        htmlSanitization={htmlSanitization}
        htmlSchemaOverrides={htmlSchemaOverrides}
      />
    );
  }
  return <p>{t('Loading...')}</p>;
};

//  usage: {{ dateFormat my_date format="MMMM YYYY" }}
Handlebars.registerHelper('dateFormat', function (context, block) {
  const f = block.hash.format || 'YYYY-MM-DD';
  return dayjs(context).format(f);
});

// usage: {{  }}
Handlebars.registerHelper('stringify', (obj: any, obj2: any) => {
  // calling without an argument
  if (obj2 === undefined)
    throw new Error('Please call with an object. Example: `stringify myObj`');
  return isPlainObject(obj) ? JSON.stringify(obj) : String(obj);
});

Handlebars.registerHelper(
  'formatNumber',
  function (number: any, locale = 'en-US') {
    if (typeof number !== 'number') {
      return number;
    }
    return number.toLocaleString(locale);
  },
);

// usage: {{parseJson jsonString}}
Handlebars.registerHelper('parseJson', (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    if (error instanceof Error) {
      error.message = `Invalid JSON string: ${error.message}`;
      throw error;
    }
    throw new Error(`Invalid JSON string: ${String(error)}`);
  }
});

Helpers.registerHelpers(Handlebars);
HandlebarsGroupBy.register(Handlebars);
