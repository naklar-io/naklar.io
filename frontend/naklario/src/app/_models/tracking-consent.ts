export interface TrackingConsentSettings {
    googleAnalytics: boolean;
    comfort: boolean;
}

export const defaultTrackingSettings: TrackingConsentSettings = {
   googleAnalytics: false,
   comfort: false,
};
