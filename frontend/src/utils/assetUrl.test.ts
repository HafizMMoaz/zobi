import * as getBootstrapData from 'src/utils/getBootstrapData';
import { assetUrl, ensureStaticPrefix } from './assetUrl';

const staticAssetsPrefixMock = jest.spyOn(
  getBootstrapData,
  'staticAssetsPrefix',
);
const resourcePath = '/endpoint/img.png';
const absoluteResourcePath = `https://cdn.domain.com/static${resourcePath}`;

beforeEach(() => {
  staticAssetsPrefixMock.mockReturnValue('');
});

describe('assetUrl should prepend static asset prefix for relative paths', () => {
  test.each(['', '/myapp'])("'%s' for relative path", app_root => {
    staticAssetsPrefixMock.mockReturnValue(app_root);
    expect(assetUrl(resourcePath)).toBe(`${app_root}${resourcePath}`);
    expect(assetUrl(absoluteResourcePath)).toBe(
      `${app_root}/${absoluteResourcePath}`,
    );
  });
});

describe('assetUrl should ignore static asset prefix for absolute URLs', () => {
  test.each(['', '/myapp'])("'%s' for absolute url", app_root => {
    staticAssetsPrefixMock.mockReturnValue(app_root);
    expect(ensureStaticPrefix(absoluteResourcePath)).toBe(absoluteResourcePath);
  });
});
