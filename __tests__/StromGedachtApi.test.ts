import { StromGedachtApi } from '../lib/StromGedachtApi';
import { StromGedachtState } from '../lib/StromGedachtState';
import fetch from 'node-fetch';

// Mock node-fetch
jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('StromGedachtApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateZip', () => {
    it('should validate successfully for valid zip code', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 1 }),
      } as any);

      await expect(StromGedachtApi.validateZip('70173')).resolves.not.toThrow();
      expect(mockedFetch).toHaveBeenCalledWith(
        'https://api.stromgedacht.de/v1/now?zip=70173'
      );
    });

    it('should throw error when API call fails', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as any);

      await expect(StromGedachtApi.validateZip('99999')).rejects.toThrow(
        'API Error: 404 Not Found'
      );
    });

    it('should throw error when fetch fails', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(StromGedachtApi.validateZip('70173')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('fetchGridStatus', () => {
    it('should fetch and return SUPER_GREEN status', async () => {
      const mockResponse = {
        state: -1,
        from: '2025-11-01T10:00:00Z',
        to: '2025-11-01T11:00:00Z',
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const result = await StromGedachtApi.fetchGridStatus('70173', 0);
      expect(result).toBe(StromGedachtState.SUPER_GREEN);
      expect(mockedFetch).toHaveBeenCalledWith(
        'https://api.stromgedacht.de/v1/now?zip=70173&hoursInFuture=0'
      );
    });

    it('should fetch and return GREEN status', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 1 }),
      } as any);

      const result = await StromGedachtApi.fetchGridStatus('70173', 0);
      expect(result).toBe(StromGedachtState.GREEN);
    });

    it('should fetch and return YELLOW status', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 3 }),
      } as any);

      const result = await StromGedachtApi.fetchGridStatus('70173', 0);
      expect(result).toBe(StromGedachtState.YELLOW);
    });

    it('should fetch and return RED status', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 4 }),
      } as any);

      const result = await StromGedachtApi.fetchGridStatus('70173', 0);
      expect(result).toBe(StromGedachtState.RED);
    });

    it('should fetch 6h forecast correctly', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 1 }),
      } as any);

      await StromGedachtApi.fetchGridStatus('70173', 6);
      expect(mockedFetch).toHaveBeenCalledWith(
        'https://api.stromgedacht.de/v1/now?zip=70173&hoursInFuture=6'
      );
    });

    it('should fetch 24h forecast correctly', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 1 }),
      } as any);

      await StromGedachtApi.fetchGridStatus('70173', 24);
      expect(mockedFetch).toHaveBeenCalledWith(
        'https://api.stromgedacht.de/v1/now?zip=70173&hoursInFuture=24'
      );
    });

    it('should throw error when API call fails', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as any);

      await expect(
        StromGedachtApi.fetchGridStatus('70173', 0)
      ).rejects.toThrow('API Error: 500 Internal Server Error');
    });

    it('should throw error when fetch throws', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        StromGedachtApi.fetchGridStatus('70173', 0)
      ).rejects.toThrow('Network error');
    });

    it('should throw error for unknown state', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 999 }),
      } as any);

      await expect(
        StromGedachtApi.fetchGridStatus('70173', 0)
      ).rejects.toThrow('Unknown state: 999');
    });
  });
});
