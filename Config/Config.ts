export const paypalConfig = {
    clientId: "AegZWyIvAAq9NDPHZ-8fvgfnIhYH4NaJfs1sECYhRLWblaOyV1qCPJF2l6gG2zFyqU0C7MAqQaibPvNY",
    secret: "EBzD7a1HpSO4WuEi555IbyoQQiekgIphtHvOj9LEGEbfgHLoJuD3HfdDSjv_PIYjcw0TntLoNa_nNslj",

    get auth() {
        // Tự động tạo chuỗi base64 khi gọi
        return btoa(`${this.clientId}:${this.secret}`);
    },
    paypal_api_url: "https://api.sandbox.paypal.com",
};
