import { Device } from 'homey';
import Homey from 'homey';
import { StromGedachtApi } from '../../lib/StromGedachtApi';
import { CAPABILITIES, POLL_INTERVAL } from '../../lib/constants';
import { TriggerArgs, TriggerState } from '../../lib/types';

module.exports = class GridStatusDevice extends Device {
  private timer!: NodeJS.Timeout;
  private currentGridStatusChangedTrigger!: Homey.FlowCardTriggerDevice;
  private forecast6hGridChangedTrigger!: Homey.FlowCardTriggerDevice;
  private forecast24hGridChangedTrigger!: Homey.FlowCardTriggerDevice;

  async onInit() {
    this.currentGridStatusChangedTrigger = this.homey.flow.getDeviceTriggerCard('current-grid-status-changed');
    this.currentGridStatusChangedTrigger.registerRunListener(async (args: TriggerArgs, state: TriggerState) => {
      this.log('Current grid status. Flow trigger check:', args.onlyExecuteForStatus, args.device.getCapabilityValue(CAPABILITIES.NOW));
      return args.onlyExecuteForStatus === args.device?.getCapabilityValue(CAPABILITIES.NOW);
    });

    this.forecast6hGridChangedTrigger = this.homey.flow.getDeviceTriggerCard('6h-forecast-grid-status-changed');
    this.forecast6hGridChangedTrigger.registerRunListener(async (args: TriggerArgs, state: TriggerState) => {
      this.log('6h forecast grid status. Flow trigger check:', args.onlyExecuteForStatus, args.device.getCapabilityValue(CAPABILITIES.FORECAST_6H));
      return args.onlyExecuteForStatus === args.device?.getCapabilityValue(CAPABILITIES.FORECAST_6H);
    });

    this.forecast24hGridChangedTrigger = this.homey.flow.getDeviceTriggerCard('24h-forecast-grid-status-changed');
    this.forecast24hGridChangedTrigger.registerRunListener(async (args: TriggerArgs, state: TriggerState) => {
      this.log('24h forecast grid status. Flow trigger check:', args.onlyExecuteForStatus, args.device.getCapabilityValue(CAPABILITIES.FORECAST_24H));
      return args.onlyExecuteForStatus === args.device?.getCapabilityValue(CAPABILITIES.FORECAST_24H);
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
    this.log("Grid Monitor settings changed");
  }

  async onRenamed(name: string) {
    this.log('Grid Monitor was renamed to:', name);
  }

  private async initializePolling() {
    await this.updateCapabilities();

    this.timer = setInterval(
      async () => await this.updateCapabilities(),
      POLL_INTERVAL
    );
    this.timer.unref();
  }

  private async updateCapabilities() {
    const zip = this.getStoreValue('zip') as string;
    let hasAnySuccess = false;
    const errors: string[] = [];

    // Update all capabilities
    await this.updateSingleCapability(CAPABILITIES.NOW, 0, zip, this.currentGridStatusChangedTrigger, errors, () => hasAnySuccess = true);
    await this.updateSingleCapability(CAPABILITIES.FORECAST_6H, 6, zip, this.forecast6hGridChangedTrigger, errors, () => hasAnySuccess = true);
    await this.updateSingleCapability(CAPABILITIES.FORECAST_24H, 24, zip, this.forecast24hGridChangedTrigger, errors, () => hasAnySuccess = true);

    // Handle device availability based on overall success/failure
    if (!hasAnySuccess) {
      await this.setUnavailable(`Connection errors: ${errors.join('; ')}`).catch(this.error);
    } else if (errors.length > 0) {
      this.log('Some updates failed but device remains available. Errors:', errors.join('; '));
      await this.setAvailable().catch(this.error);
    } else {
      await this.setAvailable().catch(this.error);
    }
  }

  private async updateSingleCapability(
    capabilityName: string,
    offset: number,
    zip: string,
    trigger: Homey.FlowCardTriggerDevice,
    errors: string[],
    onSuccess: () => void
  ): Promise<void> {
    try {
      const newValue = await StromGedachtApi.fetchGridStatus(zip, offset);
      const currentValue = this.getCapabilityValue(capabilityName);
      
      await this.setCapabilityValue(capabilityName, newValue);
      
      if (currentValue !== newValue) {
        this.log(`Capability ${capabilityName} changed to: ${newValue} (PLZ: ${zip})`);
        await trigger.trigger(this, { status: newValue }).catch(this.error);
      }
      
      onSuccess();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.error(`Failed to update ${capabilityName}:`, errorMsg);
      errors.push(`${capabilityName}: ${errorMsg}`);
    }
  }
};
