// Định nghĩa kiểu cho phản hồi NowPayments
export interface NowPaymentsOrderDetail {
    payment_id: string;
    payment_status: string;
    pay_amount: number;
    price_currency: string;
    order_id: string;
    order_description?: string;
    invoice_id: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
}