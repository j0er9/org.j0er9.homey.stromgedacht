import Homey from 'homey';
import PairSession from 'homey/lib/PairSession';
import { StromGedachtApi } from '../../lib/StromGedachtApi';
import { CAPABILITIES, ZIP_CODE_REGEX } from '../../lib/constants';
import { PairDevice, ConditionArgs } from '../../lib/types';

module.exports = class GridMonitorDriver extends Homey.Driver {

  async onInit() {
    this.log('GridMonitorDriver initialized');
    this.registerConditionCards();
  }

  private registerConditionCards(): void {
    const conditions = [
      { id: 'current-grid-status-is', capability: CAPABILITIES.NOW },
      { id: '6h-forecast-grid-status-is', capability: CAPABILITIES.FORECAST_6H },
      { id: '24h-forecast-grid-status-is', capability: CAPABILITIES.FORECAST_24H }
    ];

    conditions.forEach(({ id, capability }) => {
      const conditionCard = this.homey.flow.getConditionCard(id);
      conditionCard.registerRunListener(async (args: ConditionArgs) => {
        const actualStatus = args.device.getCapabilityValue(capability);
        this.log(`Checking condition ${id}: expected=${args.status}, actual=${actualStatus}`);
        return actualStatus === args.status;
      });
    });
  }

  async onPair(session: PairSession) {
    const devices: PairDevice[] = [];
    this.log('Pairing started');

    session.setHandler('validate_plz', async (data: { zip: string }) => {
      this.log('Validating PLZ:', data.zip);

      if (!data.zip || !ZIP_CODE_REGEX.test(data.zip)) {
        // Use Homey i18n for format error so the message is localized
        throw new Error(this.homey.__('driver.error_invalid_format'));
      }

      try {
        await StromGedachtApi.validateZip(data.zip);

        const device: PairDevice = {
          name: this.homey.__('driver.device_name').replace('__zip__', data.zip),
          data: { id: data.zip },
          store: { zip: data.zip }
        };
        devices.push(device);
        return { valid: true };
      } catch (error) {
        this.error('ZIP validation failed:', error);
        // Return a localized validation failed message
        throw new Error(this.homey.__('driver.error_validation_failed'));
      }
    });

    session.setHandler('list_devices', async () => {
      this.log('Pairing completed with devices:', devices);
      return devices;
    });
  }

};