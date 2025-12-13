export const CAPABILITIES = {
  NOW: 'status_power_grid_now',
  FORECAST_6H: 'status_power_grid_6h_forecast',
  FORECAST_24H: 'status_power_grid_24h_forecast',
  FORECAST_48H: 'status_power_grid_48h_forecast'
} as const;

export const API_BASE_URL = 'https://api.stromgedacht.de/v1';

export const POLL_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const ZIP_CODE_REGEX = /^\d{5}$/;
