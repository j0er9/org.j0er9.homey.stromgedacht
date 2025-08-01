import Homey from 'homey';

import { Driver, Device } from 'homey';
import PairSession from 'homey/lib/PairSession';
import fetch from 'node-fetch';

interface StromGedachtState {
  state: 'green' | 'green+' | 'yellow' | 'red';
  valid_from: string;
  valid_to: string;
}

interface StromGedachtResponse {
  status: number;
  data: StromGedachtState[];
}

interface GridMonitorDeviceSettings {
  plz: string;
}

module.exports = class GridMonitorDriver extends Homey.Driver {

  private POLL_INTERVAL = 10 * 60 * 1000; // 10 minutes
  private timers = new Map<string, NodeJS.Timeout>();


  async onInit() {
    this.log('GridMonitorDriver initialized');
  }


  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }

  async onPair(session: PairSession) {
    let devices: { name: string; 
      data: { id:  string;  }; store: { zip: string; }; }[] = [];
    this.log('Pairing started');
    let validatedZip: string | null = null;

    session.setHandler('validate_plz', async (data: { zip: string }) => {
      this.log('Validating PLZ:', data.zip);

      if (!data.zip || !/^\d{5}$/.test(data.zip)) {
        throw new Error('Invalid postal code format');
      }

      try {
        const url = `https://api.stromgedacht.de/v1/now?zip=${data.zip}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json() as StromGedachtResponse;

        validatedZip = data.zip;

        const device = {
          name: 'Grid Monitor for ' + data.zip,
          data: {
            id: data.zip
          },
          store: {
            zip: data.zip
          }
        };
        devices.push(device);
        return { valid: true };
      } catch (error) {
        this.error('zip validation failed:', error);
        throw new Error(error instanceof Error ? error.message : 'Validation failed');
      }
    });

    session.setHandler('list_devices', async () => {
      this.log('Pairing completed with devices:', devices);
      return devices;
    });
  }

  private async fetchGridStatus(plz: string, offset: number): Promise<string> {
    const response = await fetch(
      `https://api.stromgedacht.de/v1/now?zip=${plz}&hoursInFuture=${offset}`
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json() as StromGedachtState[];
    return data[0]?.state || 'unknown';
  }

  private triggerFlows(capability: string, newStatus: string, device: Device) {
    const triggers: Record<string, string> = {
      'status_power_grid_now': 'status_changed_now',
      'status_power_grid_6h_forecast': 'status_changed_6h_forecast',
      'status_power_grid_24h_forecast': 'status_changed_24h_forecast'
    };

    const triggerId = triggers[capability];
    if (!triggerId) return;

    (this.homey.flow.getTriggerCard(triggerId) as any)
      .trigger(device, { status: newStatus })
      .catch((error: Error) => this.error(error));
  }

  async onDeviceAdded(device: Device) {
    this.log('device added: ', device);
    const update = async () => {
      try {
        const zip = device.getSetting('zip');
        // API-Abfrage und Statusaktualisierung hier
      } catch (error) {
        this.error(error);
      }
    };

    // Timer für das Gerät starten
    const timer = setInterval(update, this.POLL_INTERVAL);
    this.timers.set(device.getName(), timer);

    // Erstes Update sofort durchführen
    await update();
  }

};
