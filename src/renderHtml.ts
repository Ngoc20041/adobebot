export function renderHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>PayPal Webhook Viewer</title>
        <style>
          body { font-family: monospace; background: #f9f9f9; padding: 20px; }
          pre { background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 0 5px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <h2>📦 Dữ liệu mới nhất từ PayPal</h2>
        ${content}
      </body>
    </html>
  `;
}
