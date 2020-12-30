export interface AppConfig {
    apiUrl: string;
    features: {
        roulette: boolean;
        notifications: boolean;
        analytics: boolean;
        codes: boolean;
    };
    vapidKey: string;
}
