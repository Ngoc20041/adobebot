export function renderHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PayPal Webhook Viewer</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 2rem;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          h2 {
            color: #0070ba;
          }
          pre {
            background-color: #fff;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
            overflow-x: auto;
            font-family: monospace;
            font-size: 0.95rem;
            white-space: pre-wrap;
            word-break: break-word;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>📦 Dữ liệu mới nhất từ PayPal</h2>
          <pre>${content}</pre>
        </div>
      </body>
    </html>
  `;
}
