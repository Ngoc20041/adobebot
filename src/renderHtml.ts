export function renderHtml(json: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>PayPal Webhook Debug</title>
        <style>
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>PayPal Webhook JSON</h1>
        <pre>${json}</pre>
      </body>
    </html>
  `;
}