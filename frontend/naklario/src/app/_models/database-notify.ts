export interface WebPushDevice {
  registrationId: string;
  p256dh: string;
  auth: string;
  browser?: string;
}

export type RangeMode = "ALLOW" | "BLOCK";
export enum Day {
  Montag = 0,
  Dienstag = 1,
  Mittwoch = 2,
  Donnerstag = 3,
  Freitag = 4,
  Samstag = 5,
  Sonntag = 6,
}

export interface NotificationSettings {
  enablePush: boolean;
  enableMail: boolean;
  notifyInterval: string;
  ranges: NotificationRange[];
  rangesMode: RangeMode;
}

export interface NotificationRange {
  days: Day[];
  startTime: string;
  endTime: string;
  pk?: number;
}