import fetch from 'node-fetch';
import { StromGedachtState } from './StromGedachtState';
import { StromGedachtApiResponse } from './types';
import { API_BASE_URL } from './constants';

export class StromGedachtApi {
  
  /**
   * Validates a German postal code (ZIP) with the Stromgedacht API
   * @param zip - 5-digit German postal code
   * @throws Error if the ZIP code is invalid or API request fails
   */
  static async validateZip(zip: string): Promise<void> {
    const url = `${API_BASE_URL}/now?zip=${zip}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    await response.json() as StromGedachtApiResponse;
  }

  /**
   * Fetches the grid status for a specific postal code and time offset
   * @param zip - 5-digit German postal code
   * @param hoursInFuture - Hours in the future (0 for current, 6 for 6h forecast, etc.)
   * @returns Grid status as string (superGreen, green, yellow, red)
   */
  static async fetchGridStatus(zip: string, hoursInFuture: number): Promise<string> {
    const url = `${API_BASE_URL}/now?zip=${zip}&hoursInFuture=${hoursInFuture}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as StromGedachtApiResponse;
    return this.mapStateToString(data.state);
  }

  /**
   * Maps API state number to internal state string
   * @param state - State number from API
   * @returns State string
   */
  private static mapStateToString(state: number): string {
    switch (state) {
      case -1: return StromGedachtState.SUPER_GREEN;
      case 1: return StromGedachtState.GREEN;
      case 3: return StromGedachtState.YELLOW;
      case 4: return StromGedachtState.RED;
      default: throw new Error(`Unknown state: ${state}`);
    }
  }
}
