/**
 * Email Service using Resend
 * Handles all transactional emails: session reminders, homework notifications, payment receipts.
 */

const RESEND_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "AHK Academy <noreply@ahkacademy.pro>";

export class EmailService {
  private static getHeaders(): Record<string, string> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY not set");
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private static wrapHtml(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1e40af;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">AHK Academy</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f3f4f6;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-align:center;">
                AHK Academy - Learn English, Speak Confidently<br>
                <a href="https://ahkacademy.pro" style="color:#1e40af;text-decoration:none;">ahkacademy.pro</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Send a raw email with custom HTML content
   */
  static async send(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const res = await fetch(RESEND_URL, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to,
          subject,
          html: this.wrapHtml(html),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("[Email] send failed:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("[Email] send error:", error);
      return false;
    }
  }

  /**
   * Send a speaking session reminder to a student
   */
  static async sendSessionReminder(
    to: string,
    studentName: string,
    topic: string,
    date: string,
    meetingLink: string
  ): Promise<boolean> {
    const html = `
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Speaking Session Reminder</h2>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;">Hi ${studentName},</p>
      <p style="margin:0 0 20px;color:#374151;font-size:14px;">You have an upcoming speaking session:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-radius:8px;padding:16px;margin-bottom:20px;">
        <tr><td style="padding:8px 16px;">
          <p style="margin:0 0 8px;color:#1e40af;font-size:14px;font-weight:600;">Topic: ${topic}</p>
          <p style="margin:0 0 8px;color:#374151;font-size:14px;">Date: ${date}</p>
          <p style="margin:0;color:#374151;font-size:14px;">Duration: 1.5 hours</p>
        </td></tr>
      </table>
      <a href="${meetingLink}" style="display:inline-block;background-color:#1e40af;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Join Meeting</a>
      <p style="margin:16px 0 0;color:#6b7280;font-size:12px;">Tip: Review the topic beforehand to make the most of your session!</p>
    `;
    return this.send(to, `Reminder: Speaking Session - ${topic}`, html);
  }

  /**
   * Notify student that their homework is ready
   */
  static async sendHomeworkReady(
    to: string,
    studentName: string,
    homeworkTitle: string
  ): Promise<boolean> {
    const html = `
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">New Homework Available</h2>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;">Hi ${studentName},</p>
      <p style="margin:0 0 20px;color:#374151;font-size:14px;">Your personalized homework has been generated based on your last speaking session.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:20px;">
        <tr><td style="padding:8px 16px;">
          <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">${homeworkTitle}</p>
        </td></tr>
      </table>
      <a href="https://ahkacademy.pro/student/homework" style="display:inline-block;background-color:#1e40af;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">View Homework</a>
    `;
    return this.send(to, `New Homework: ${homeworkTitle}`, html);
  }

  /**
   * Send payment receipt to student
   */
  static async sendPaymentReceipt(
    to: string,
    studentName: string,
    amount: number,
    method: string
  ): Promise<boolean> {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    const html = `
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Payment Confirmed</h2>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;">Hi ${studentName},</p>
      <p style="margin:0 0 20px;color:#374151;font-size:14px;">Your payment has been successfully confirmed. Here are the details:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;color:#6b7280;font-size:14px;">Amount:</td>
              <td style="padding:4px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;font-size:14px;">Method:</td>
              <td style="padding:4px 0;color:#111827;font-size:14px;text-align:right;">${method}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;font-size:14px;">Date:</td>
              <td style="padding:4px 0;color:#111827;font-size:14px;text-align:right;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;font-size:14px;">Status:</td>
              <td style="padding:4px 0;color:#166534;font-size:14px;font-weight:600;text-align:right;">Confirmed</td>
            </tr>
          </table>
        </td></tr>
      </table>
      <p style="margin:0;color:#6b7280;font-size:12px;">Thank you for your payment! If you have any questions, please contact us.</p>
    `;
    return this.send(to, `Payment Confirmed - ${formattedAmount}`, html);
  }

  /**
   * Send payment reminder to student
   */
  static async sendPaymentReminder(
    to: string,
    studentName: string,
    amount: number,
    dueDate: string
  ): Promise<boolean> {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    const html = `
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Payment Reminder</h2>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;">Hi ${studentName},</p>
      <p style="margin:0 0 20px;color:#374151;font-size:14px;">This is a friendly reminder that your payment is coming due:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;color:#6b7280;font-size:14px;">Amount Due:</td>
              <td style="padding:4px 0;color:#92400e;font-size:14px;font-weight:600;text-align:right;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;font-size:14px;">Due Date:</td>
              <td style="padding:4px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${dueDate}</td>
            </tr>
          </table>
        </td></tr>
      </table>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;font-weight:600;">Payment Methods:</p>
      <ul style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:14px;">
        <li style="margin-bottom:4px;">Bank Transfer (IBAN)</li>
        <li style="margin-bottom:4px;">Papara</li>
        <li style="margin-bottom:4px;">Credit Card (Stripe)</li>
      </ul>
      <a href="https://ahkacademy.pro/student/payments" style="display:inline-block;background-color:#1e40af;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">View Payment Details</a>
    `;
    return this.send(to, `Payment Reminder - ${formattedAmount} due ${dueDate}`, html);
  }
}
