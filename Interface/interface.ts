// paypalTypes.ts
export interface PaypalWebhookData {
    id: string;
    event_type: string;
    resource: {
        id: string;
        intent?: string;
        status?: string;
        [key: string]: any;
    };
    [key: string]: any;
}
