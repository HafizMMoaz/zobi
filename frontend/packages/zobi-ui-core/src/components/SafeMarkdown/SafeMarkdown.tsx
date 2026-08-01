
import { useEffect, useMemo, useState } from 'react';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
// TODO: Upgrade to remark-gfm v4+ after migrating to React 18.
// remark-gfm v4+ requires react-markdown v9+, which requires React 18.
// Currently pinned to v3.0.1 for compatibility with react-markdown v8 and React 17.
import remarkGfm from 'remark-gfm';
import { mergeWith } from 'lodash';
import { FeatureFlag, isFeatureEnabled } from '../../utils';

interface SafeMarkdownProps {
  source: string;
  htmlSanitization?: boolean;
  htmlSchemaOverrides?: typeof defaultSchema;
}

export function getOverrideHtmlSchema(
  originalSchema: typeof defaultSchema,
  htmlSchemaOverrides: SafeMarkdownProps['htmlSchemaOverrides'],
) {
  return mergeWith(originalSchema, htmlSchemaOverrides, (objValue, srcValue) =>
    Array.isArray(objValue) ? objValue.concat(srcValue) : undefined,
  );
}

export function SafeMarkdown({
  source,
  htmlSanitization = true,
  htmlSchemaOverrides = {},
}: SafeMarkdownProps) {
  const escapeHtml = isFeatureEnabled(FeatureFlag.EscapeMarkdownHtml);
  const [rehypeRawPlugin, setRehypeRawPlugin] = useState<any>(null);
  const [ReactMarkdown, setReactMarkdown] = useState<any>(null);
  useEffect(() => {
    Promise.all([import('rehype-raw'), import('react-markdown')]).then(
      ([rehypeRaw, ReactMarkdown]) => {
        setRehypeRawPlugin(() => rehypeRaw.default);
        setReactMarkdown(() => ReactMarkdown.default);
      },
    );
  }, []);

  const rehypePlugins = useMemo(() => {
    const rehypePlugins: any = [];
    if (!escapeHtml && rehypeRawPlugin) {
      rehypePlugins.push(rehypeRawPlugin);
      if (htmlSanitization) {
        const schema = getOverrideHtmlSchema(
          defaultSchema,
          htmlSchemaOverrides,
        );
        rehypePlugins.push([rehypeSanitize, schema]);
      }
    }
    return rehypePlugins;
  }, [escapeHtml, htmlSanitization, htmlSchemaOverrides, rehypeRawPlugin]);

  if (!ReactMarkdown || !rehypeRawPlugin) {
    return null;
  }

  // React Markdown escapes HTML by default
  return (
    <ReactMarkdown
      rehypePlugins={rehypePlugins}
      remarkPlugins={[remarkGfm]}
      skipHtml={false}
      transformLinkUri={null}
    >
      {source}
    </ReactMarkdown>
  );
}
