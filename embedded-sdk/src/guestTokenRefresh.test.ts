import {
  REFRESH_TIMING_BUFFER_MS,
  getGuestTokenRefreshTiming,
  MIN_REFRESH_WAIT_MS,
  DEFAULT_TOKEN_EXP_MS,
} from "./guestTokenRefresh";

describe("guest token refresh", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2022-03-03 01:00"));
    jest.spyOn(global, "setTimeout");
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  function makeFakeJWT(claims: any) {
    // not a valid jwt, but close enough for this code
    const tokenifiedClaims = Buffer.from(JSON.stringify(claims)).toString(
      "base64"
    );
    return `abc.${tokenifiedClaims}.xyz`;
  }

  it("schedules refresh with an epoch exp", () => {
    // exp is in seconds
    const ttl = 1300;
    const exp = Date.now() / 1000 + ttl;
    const fakeToken = makeFakeJWT({ exp });

    const timing = getGuestTokenRefreshTiming(fakeToken);

    expect(timing).toBeGreaterThan(MIN_REFRESH_WAIT_MS);
    expect(timing).toBe(ttl * 1000 - REFRESH_TIMING_BUFFER_MS);
  });

  it("schedules refresh with an epoch exp containing a decimal", () => {
    const ttl = 1300.123;
    const exp = Date.now() / 1000 + ttl;
    const fakeToken = makeFakeJWT({ exp });

    const timing = getGuestTokenRefreshTiming(fakeToken);

    expect(timing).toBeGreaterThan(MIN_REFRESH_WAIT_MS);
    expect(timing).toBe(ttl * 1000 - REFRESH_TIMING_BUFFER_MS);
  });

  it("schedules refresh with iso exp", () => {
    const exp = new Date("2022-03-03 01:09").toISOString();
    const fakeToken = makeFakeJWT({ exp });

    const timing = getGuestTokenRefreshTiming(fakeToken);
    const expectedTiming = 1000 * 60 * 9 - REFRESH_TIMING_BUFFER_MS;

    expect(timing).toBeGreaterThan(MIN_REFRESH_WAIT_MS);
    expect(timing).toBe(expectedTiming);
  });

  it("avoids refresh spam", () => {
    const fakeToken = makeFakeJWT({ exp: Date.now() / 1000 });

    const timing = getGuestTokenRefreshTiming(fakeToken);

    expect(timing).toBe(MIN_REFRESH_WAIT_MS - REFRESH_TIMING_BUFFER_MS);
  });

  it("uses a default when it cannot parse the date", () => {
    const fakeToken = makeFakeJWT({ exp: "invalid date" });

    const timing = getGuestTokenRefreshTiming(fakeToken);

    expect(timing).toBeGreaterThan(MIN_REFRESH_WAIT_MS);
    expect(timing).toBe(DEFAULT_TOKEN_EXP_MS - REFRESH_TIMING_BUFFER_MS);
  });
});
