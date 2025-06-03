export const paypalConfig = {
    clientId: "ASwQI4rRLTgpbpdK7XembuOK0WQ-fASvq2fSy6vwyoML-uxQQVwRZugHPZP4zGpOCH0FCDEC0idJ2imA",
    secret: "EGSmvsU2E6XchpAxwclfZ7x4G4MsgHA3yNNiDUizXzFbovGDC2a-ldcr_gl5e3ZCokji6u2ciCE-TPQe",

    get auth() {
        // Tự động tạo chuỗi base64 khi gọi
        return btoa(`${this.clientId}:${this.secret}`);
    },
    paypal_api_url: "https://api-m.paypal.com",
};
export const TelegramConfig = {
    tokenBotTelegram: "7892722624:AAHWbVPB0uKf7wchRT-xlAZyJltdM5tsTrg",
    // tokenBotTelegram: "7740748720:AAEGTTP-veIilS4zwraptEd_yoaC5Z9vzSk",
    idChannel: -1002313174879,
    botName: "adobe_test_bot",
};
