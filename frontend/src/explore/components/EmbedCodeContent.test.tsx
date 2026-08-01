import { isValidElement } from 'react';
import fetchMock from 'fetch-mock';
import { render, screen } from 'spec/helpers/testing-library';
import EmbedCodeContent from 'src/explore/components/EmbedCodeContent';

const url = 'http://localhost/explore/p/100';
fetchMock.post('glob:*/api/v1/explore/permalink', { url });

const mockFormData = {
  datasource: 'table__1',
  viz_type: 'table',
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('EmbedCodeButton', () => {
  test('renders', () => {
    expect(isValidElement(<EmbedCodeContent />)).toBe(true);
  });

  test('returns correct embed code', async () => {
    render(<EmbedCodeContent formData={mockFormData} />, { useRedux: true });
    expect(await screen.findByText('iframe', { exact: false })).toBeVisible();
    expect(await screen.findByText('/iframe', { exact: false })).toBeVisible();
    expect(
      await screen.findByText('width="600"', { exact: false }),
    ).toBeVisible();
    expect(
      await screen.findByText('height="400"', { exact: false }),
    ).toBeVisible();
    expect(
      await screen.findByText(`src="${url}?standalone=1&height=400"`, {
        exact: false,
      }),
    ).toBeVisible();
  });
});
