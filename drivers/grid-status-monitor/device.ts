import { Device } from 'homey';
import { StromGedachtState } from '../../lib/StromGedachtState';
import fetch from 'node-fetch';

module.exports = class GridStatusDevice extends Device {
  private timer!: NodeJS.Timeout;
  private readonly POLL_INTERVAL = 10 * 60 * 1000; // 10 Minuten
  private currentGridStatusChangedTrigger: any;
  private forecast6hGridChangedTrigger: any;
  private forecast24hGridChangedTrigger: any;

  async onInit() {
    this.currentGridStatusChangedTrigger = this.homey.flow.getDeviceTriggerCard('current-grid-status-changed');
    this.currentGridStatusChangedTrigger.registerRunListener(async (args: {
      device: any; onlyExecuteForStatus: any;
    }, state: { status: any; }) => {
      this.log('Current grid status. Flow trigger check:', args.onlyExecuteForStatus, args.device.getCapabilityValue('status_power_grid_now'), ' device:', args.device);
      return args.onlyExecuteForStatus === args.device?.getCapabilityValue('status_power_grid_now');
    });

    this.forecast6hGridChangedTrigger = this.homey.flow.getDeviceTriggerCard('6h-forecast-grid-status-changed');
    this.forecast6hGridChangedTrigger.registerRunListener(async (args: {
      device: any; onlyExecuteForStatus: any;
    }, state: { status: any; }) => {
      this.log('6h forecast grid status. Flow trigger check:', args.onlyExecuteForStatus, args.device.getCapabilityValue('status_power_grid_6h_forecast'), ' device:', args.device);
      return args.onlyExecuteForStatus === args.device?.getCapabilityValue('status_power_grid_6h_forecast');
    });

    this.forecast24hGridChangedTrigger = this.homey.flow.getDeviceTriggerCard('24h-forecast-grid-status-changed');
    this.forecast24hGridChangedTrigger.registerRunListener(async (args: {
      device: any; onlyExecuteForStatus: any;
    }, state: { status: any; }) => {
      this.log('24h forecast grid status. Flow trigger check:', args.onlyExecuteForStatus, args.device.getCapabilityValue('status_power_grid_24h_forecast'), ' device:', args.device);
      return args.onlyExecuteForStatus === args.device?.getCapabilityValue('status_power_grid_24h_forecast');
    });

    this.setAvailable();
    this.log('Device initialized');
    await this.initializePolling();
  }

  async onAdded() {
    this.log('Device added');
    await this.updateCapabilities();
  }

  async onDeleted() {
    this.log('Device removed');
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log("MyDevice settings where changed");
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyDevice was renamed');
  }

  private async initializePolling() {
    // Sofortige Aktualisierung beim Start
    await this.updateCapabilities();

    // Periodische Aktualisierung einrichten
    this.timer = setInterval(
      async () => await this.updateCapabilities(),
      this.POLL_INTERVAL
    );
    this.timer.unref();
  }

  private async updateCapabilities() {
    try {
      const zip = this.getStoreValue('zip') as string;
      var newValue = await this.fetchGridStatus(0, zip);
      if (this.getCapabilityValue('status_power_grid_now') !== newValue) {
        await this.setCapabilityValue('status_power_grid_now', newValue);
        this.log('Current Grid status changed:', newValue, ' PLZ:', zip);
        this.currentGridStatusChangedTrigger.trigger(this, { status: newValue });
      } else {
        await this.setCapabilityValue('status_power_grid_now', newValue);
      }

      newValue = await this.fetchGridStatus(6, zip);
      if (this.getCapabilityValue('status_power_grid_6h_forecast') !== newValue) {
        await this.setCapabilityValue('status_power_grid_6h_forecast', newValue);
        this.log('Forecast 6h Grid status changed:', newValue, ' PLZ:', zip);
        this.forecast6hGridChangedTrigger.trigger(this, { status: newValue });
      } else {
        await this.setCapabilityValue('status_power_grid_6h_forecast', newValue);
      }

      newValue = await this.fetchGridStatus(24, zip);
      if (this.getCapabilityValue('status_power_grid_24h_forecast') !== newValue) {
        await this.setCapabilityValue('status_power_grid_24h_forecast', newValue);
        this.log('Forecast 24h Grid status changed:', newValue, ' PLZ:', zip);
        this.forecast24hGridChangedTrigger.trigger(this, { status: newValue });
      } else {
        await this.setCapabilityValue('status_power_grid_24h_forecast', newValue);
      }

    } catch (error) {
      this.error('Update failed:', error instanceof Error ? error.message : error);
      await this.setUnavailable('Connection error').catch(this.error);
    }
  }

  private async fetchGridStatus(offset: number, plz: string): Promise<string> {
    const response = await fetch(
      `https://api.stromgedacht.de/v1/now?zip=${plz}&hoursInFuture=${offset}`
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json() as { state: number };
    const state = data.state;
    this.log('PLZ: ', plz, ' State: ', state, ' for offset ', offset);
    switch (state) {
      case -1: return StromGedachtState.SUPER_GREEN;
      case 1: return StromGedachtState.GREEN;
      case 3: return StromGedachtState.YELLOW;
      case 4: return StromGedachtState.RED;
      default: throw new Error(`Unknown state: ${state}`);
    }

  }
};
