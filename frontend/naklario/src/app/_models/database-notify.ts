export interface WebPushDevice {
    registrationId: string,
    p256dh: string,
    auth: string,
    browser?: string
}