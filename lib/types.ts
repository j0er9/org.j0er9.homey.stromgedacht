import Homey from 'homey';

export interface StromGedachtApiResponse {
  state: number;
}

export interface PairDevice {
  name: string;
  data: { id: string };
  store: { zip: string };
}

export interface ConditionArgs {
  device: Homey.Device;
  status: string;
}

export interface TriggerArgs {
  device: Homey.Device;
  onlyExecuteForStatus: string;
}

export interface TriggerState {
  status: string;
}
