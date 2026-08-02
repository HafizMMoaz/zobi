import fetchMock from 'fetch-mock';
import { render, screen } from 'spec/helpers/testing-library';
import UserRegistrations from '.';

const userRegistrationsEndpoint = 'glob:*/security/user_registrations/?*';

const mockUserRegistrations = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  username: `user${i}`,
  first_name: `User${i}`,
  last_name: `Test${i}`,
  email: `user${i}@test.com`,
  registration_date: new Date(2025, 2, 25, 11, 4, 32 + i).toISOString(),
  registration_hash: `hash${i}`,
}));

fetchMock.get(userRegistrationsEndpoint, {
  ids: [0, 1, 2, 3, 4],
  count: 5,
  result: mockUserRegistrations,
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('UserRegistrations', () => {
  beforeEach(() => {
    render(<UserRegistrations />, {
      useRedux: true,
      useRouter: true,
      useQueryParams: true,
    });
  });
  test('fetches and renders user registrations', async () => {
    expect(await screen.findByText('User registrations')).toBeVisible();
    const calls = fetchMock.callHistory.calls(userRegistrationsEndpoint);
    expect(calls.length).toBeGreaterThan(0);
  });
});
