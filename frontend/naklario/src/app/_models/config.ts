export interface BootstrapConfig {
    apiUrl: string;
    fetchSettingsFromAPI: boolean;
    appSettings: AppConfig;
}

export interface AppConfig {
    features: {
        roulette: boolean;
        notifications: boolean;
        analytics: boolean;
        codes: boolean;
    }
    vapidKey: string;
}