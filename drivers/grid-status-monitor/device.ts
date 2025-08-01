import { Device } from 'homey';
import { StromGedachtState } from '../../lib/StromGedachtState';
import fetch from 'node-fetch';

module.exports = class GridStatusDevice extends Device {
  private timer!: NodeJS.Timeout;
  private readonly POLL_INTERVAL = 30 * 1000; // 10 Minuten
  private currentGridStatusChangedTrigger: any;
  async onInit() {
     this.currentGridStatusChangedTrigger = this.homey.flow.getDeviceTriggerCard('current-grid-status-changed');
        this.currentGridStatusChangedTrigger.registerRunListener(async (args: { currentGridStatusChangedTo: any; }, state: { status_power_grid_now: any; }) => {
          this.log('Flow trigger check:', args.currentGridStatusChangedTo, state.status_power_grid_now);
          return args.currentGridStatusChangedTo === state.status_power_grid_now;
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
      const newValue = await this.fetchGridStatus(0, zip);
      if (this.getCapabilityValue('status_power_grid_now') !== newValue) {
        this.log('Current Grid status changed:', newValue);
        await this.setCapabilityValue('status_power_grid_now', newValue);
        this.currentGridStatusChangedTrigger.trigger(this, { status: newValue });
      }

      // Capability-Werte aktualisieren
      await this.setCapabilityValue('status_power_grid_6h_forecast', await this.fetchGridStatus(6, zip));
      await this.setCapabilityValue('status_power_grid_24h_forecast', await this.fetchGridStatus(24, zip));
    } catch (error) {
      this.error('Update failed:', error instanceof Error ? error.message : error);
      await this.setUnavailable('Connection error').catch(this.error);
    }
  }

  private async fetchGridStatus(offset: number, plz: string): Promise<string> {
    // const response = await fetch(
    //   `https://api.stromgedacht.de/v1/now?zip=${plz}&hoursInFuture=${offset}`
    // );

    // if (!response.ok) throw new Error(`API Error: ${response.status}`);

    // const data = await response.json() as { state: number };
    // this.log('Data: ', data);
    // const state = data.state;
    // this.log('State: ', state);

    const validStates = [-1, 1, 3, 4];
    const state = validStates[Math.floor(Math.random() * validStates.length)];
    switch (state) {
      case -1: return StromGedachtState.SUPER_GREEN;
      case 1: return StromGedachtState.GREEN;
      case 3: return StromGedachtState.YELLOW;
      case 4: return StromGedachtState.RED;
      default: throw new Error(`Unknown state: ${state}`);
    }

  }
};
