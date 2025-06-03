export const paypalConfig = {
    clientId: "AegZWyIvAAq9NDPHZ-8fvgfnIhYH4NaJfs1sECYhRLWblaOyV1qCPJF2l6gG2zFyqU0C7MAqQaibPvNY",
    secret: "EBzD7a1HpSO4WuEi555IbyoQQiekgIphtHvOj9LEGEbfgHLoJuD3HfdDSjv_PIYjcw0TntLoNa_nNslj",

    get auth() {
        // Tự động tạo chuỗi base64 khi gọi
        return btoa(`${this.clientId}:${this.secret}`);
    },
    paypal_api_url: "https://api.sandbox.paypal.com",
};
export const TelegramConfig = {
    tokenBotTelegram: "7892722624:AAHWbVPB0uKf7wchRT-xlAZyJltdM5tsTrg",
    // tokenBotTelegram: "7740748720:AAEGTTP-veIilS4zwraptEd_yoaC5Z9vzSk",
    idChannel: -1002313174879,
};
