import getOverwriteItems from './getOverwriteItems';

test('returns diff items', () => {
  const prevFilterScopes = {
    filter1: {
      scope: ['abc'],
      immune: [],
    },
  };
  const nextFilterScopes = {
    scope: ['ROOT_ID'],
    immune: ['efg'],
  };

  const prevValue = {
    css: '',
    json_metadata: JSON.stringify({
      filter_scopes: prevFilterScopes,
      default_filters: {},
    }),
  };

  const nextValue = {
    css: '.updated_css {color: white;}',
    json_metadata: JSON.stringify({
      filter_scopes: nextFilterScopes,
      default_filters: {},
    }),
  };
  expect(getOverwriteItems(prevValue, nextValue)).toEqual([
    { keyPath: 'css', newValue: nextValue.css, oldValue: prevValue.css },
    {
      keyPath: 'json_metadata.filter_scopes',
      newValue: JSON.stringify(nextFilterScopes, null, 2),
      oldValue: JSON.stringify(prevFilterScopes, null, 2),
    },
  ]);
});
