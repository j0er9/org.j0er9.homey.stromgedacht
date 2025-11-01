import { CAPABILITIES, API_BASE_URL, POLL_INTERVAL, ZIP_CODE_REGEX } from '../lib/constants';

describe('constants', () => {
  describe('CAPABILITIES', () => {
    it('should define all required capabilities', () => {
      expect(CAPABILITIES).toHaveProperty('NOW');
      expect(CAPABILITIES).toHaveProperty('FORECAST_6H');
      expect(CAPABILITIES).toHaveProperty('FORECAST_24H');
    });

    it('should have correct capability names', () => {
      expect(CAPABILITIES.NOW).toBe('status_power_grid_now');
      expect(CAPABILITIES.FORECAST_6H).toBe('status_power_grid_6h_forecast');
      expect(CAPABILITIES.FORECAST_24H).toBe('status_power_grid_24h_forecast');
    });
  });

  describe('API_BASE_URL', () => {
    it('should be the correct API endpoint', () => {
      expect(API_BASE_URL).toBe('https://api.stromgedacht.de/v1');
    });

    it('should not have trailing slash', () => {
      expect(API_BASE_URL).not.toMatch(/\/$/);
    });
  });

  describe('POLL_INTERVAL', () => {
    it('should be 10 minutes in milliseconds', () => {
      expect(POLL_INTERVAL).toBe(600000); // 10 * 60 * 1000
    });

    it('should be a positive number', () => {
      expect(POLL_INTERVAL).toBeGreaterThan(0);
    });
  });

  describe('ZIP_CODE_REGEX', () => {
    it('should match valid 5-digit zip codes', () => {
      expect(ZIP_CODE_REGEX.test('70173')).toBe(true);
      expect(ZIP_CODE_REGEX.test('12345')).toBe(true);
      expect(ZIP_CODE_REGEX.test('00000')).toBe(true);
      expect(ZIP_CODE_REGEX.test('99999')).toBe(true);
    });

    it('should not match invalid zip codes', () => {
      expect(ZIP_CODE_REGEX.test('1234')).toBe(false);   // too short
      expect(ZIP_CODE_REGEX.test('123456')).toBe(false); // too long
      expect(ZIP_CODE_REGEX.test('abcde')).toBe(false);  // not numeric
      expect(ZIP_CODE_REGEX.test('7017a')).toBe(false);  // contains letter
      expect(ZIP_CODE_REGEX.test('')).toBe(false);       // empty
      expect(ZIP_CODE_REGEX.test(' 70173')).toBe(false); // leading space
      expect(ZIP_CODE_REGEX.test('70173 ')).toBe(false); // trailing space
    });
  });
});
