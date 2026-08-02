import { defaultQueryEditor } from 'src/SqlLab/fixtures';
import { newQueryTabName } from './newQueryTabName';

const emptyEditor = {
  ...defaultQueryEditor,
  title: '',
  schema: '',
  autorun: false,
  sql: '',
  remoteId: null,
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('newQueryTabName', () => {
  test("should return default title if queryEditor's length is 0", () => {
    const defaultTitle = 'default title';
    const title = newQueryTabName([], defaultTitle);
    expect(title).toEqual(defaultTitle);
  });
  test('should return next available number if there are unsaved editors', () => {
    const untitledQueryText = 'Untitled Query';
    const unsavedEditors = [
      { ...emptyEditor, name: `${untitledQueryText} 1` },
      { ...emptyEditor, name: `${untitledQueryText} 2` },
    ];

    const nextTitle = newQueryTabName(unsavedEditors);
    expect(nextTitle).toEqual(`${untitledQueryText} 3`);
  });
});
