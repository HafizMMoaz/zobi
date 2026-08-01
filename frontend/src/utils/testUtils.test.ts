
import { testWithId } from './testUtils';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('testUtils', () => {
  test('testWithId with prefix only', () => {
    expect(testWithId('prefix')()).toEqual({ 'data-test': 'prefix' });
  });

  test('testWithId with prefix only and idOnly', () => {
    expect(testWithId('prefix', true)()).toEqual('prefix');
  });

  test('testWithId with id only', () => {
    expect(testWithId()('id')).toEqual({ 'data-test': 'id' });
  });

  test('testWithId with id only and idOnly', () => {
    expect(testWithId(undefined, true)('id')).toEqual('id');
  });

  test('testWithId with prefix and id', () => {
    expect(testWithId('prefix')('id')).toEqual({ 'data-test': 'prefix__id' });
  });

  test('testWithId with prefix and id and idOnly', () => {
    expect(testWithId('prefix', true)('id')).toEqual('prefix__id');
  });

  test('testWithId without prefix and id', () => {
    expect(testWithId()()).toEqual({ 'data-test': '' });
  });

  test('testWithId without prefix and id and idOnly', () => {
    expect(testWithId(undefined, true)()).toEqual('');
  });
});
