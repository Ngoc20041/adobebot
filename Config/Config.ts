export const paypalConfig = {
    clientId: "ASwQI4rRLTgpbpdK7XembuOK0WQ-fASvq2fSy6vwyoML-uxQQVwRZugHPZP4zGpOCH0FCDEC0idJ2imA",
    secret: "EGSmvsU2E6XchpAxwclfZ7x4G4MsgHA3yNNiDUizXzFbovGDC2a-ldcr_gl5e3ZCokji6u2ciCE-TPQe",
    // clientId: "AegZWyIvAAq9NDPHZ-8fvgfnIhYH4NaJfs1sECYhRLWblaOyV1qCPJF2l6gG2zFyqU0C7MAqQaibPvNY", //key sandbox
    // secret: "EBzD7a1HpSO4WuEi555IbyoQQiekgIphtHvOj9LEGEbfgHLoJuD3HfdDSjv_PIYjcw0TntLoNa_nNslj", //key sandbox
    get auth() {
        // Tự động tạo chuỗi base64 khi gọi
        return btoa(`${this.clientId}:${this.secret}`);
    },
    paypal_api_url: "https://api-m.paypal.com",
    // paypal_api_url: "https://api-m.sandbox.paypal.com",
};
export const TelegramConfig = {
    tokenBotTelegram: "8039983944:AAGwY6MdMdrRD16Zcdl1HOw8ovMU1VMkqYw",
    // tokenBotTelegram: "7892722624:AAHWbVPB0uKf7wchRT-xlAZyJltdM5tsTrg", // bbn bot
    idGroup: -1002328295199,
    MessageThreadId: 10678,
    // idChannel: -1002313174879,
    idChannel: -1002899420511, // test
    botName: "adobe_test_bot",
};
export const NowPaymentsConfig = {
    Nowpayment_api_url: "https://api-sandbox.nowpayments.io", //  sandbox
    NowPaymentapiKey: "PAMSQ4S-94HMCHZ-P6SE5K9-K3JWBPM", // Thay bằng API key thực tế
};