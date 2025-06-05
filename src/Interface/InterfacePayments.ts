// Định nghĩa kiểu cho dữ liệu webhook PayPal
export interface WebhookData {
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
 // Định nghĩa kiểu cho capture PayPal
export interface CaptureResult {
    id: string;
    status: string;
    purchase_units?: Array<{
        payments?: {
            captures?: Array<{
                id: string;
                status: string;
                amount: {
                    currency_code: string;
                    value: string;
                };
            }>;
        };
    }>;
    [key: string]: any;
}

