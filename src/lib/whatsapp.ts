/**
 * WhatsApp Business API Service (360dialog)
 * Used for session reminders, homework delivery, payment receipts, and broadcasts.
 */

const BASE_URL = "https://waba.360dialog.io/v1/messages";

interface WhatsAppResponse {
  messages?: { id: string }[];
  errors?: { code: number; title: string; detail: string }[];
}

export class WhatsAppService {
  private static getHeaders(): Record<string, string> {
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (!apiKey) throw new Error("WHATSAPP_API_KEY not set");
    return {
      "D360-API-KEY": apiKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Send a plain text message to a phone number
   */
  static async sendText(phone: string, message: string): Promise<boolean> {
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message },
        }),
      });

      if (!res.ok) {
        const error: WhatsAppResponse = await res.json();
        console.error("[WhatsApp] sendText failed:", error.errors);
        return false;
      }

      return true;
    } catch (error) {
      console.error("[WhatsApp] sendText error:", error);
      return false;
    }
  }

  /**
   * Send a template message with variable substitutions
   */
  static async sendTemplate(
    phone: string,
    templateName: string,
    variables: string[]
  ): Promise<boolean> {
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: variables.map((v) => ({ type: "text", text: v })),
              },
            ],
          },
        }),
      });

      if (!res.ok) {
        const error: WhatsAppResponse = await res.json();
        console.error("[WhatsApp] sendTemplate failed:", error.errors);
        return false;
      }

      return true;
    } catch (error) {
      console.error("[WhatsApp] sendTemplate error:", error);
      return false;
    }
  }

  /**
   * Broadcast a template message to multiple phone numbers
   * Returns true if ALL messages sent successfully
   */
  static async broadcastTemplate(
    phones: string[],
    templateName: string,
    variables: string[]
  ): Promise<boolean> {
    const results = await Promise.allSettled(
      phones.map((phone) => this.sendTemplate(phone, templateName, variables))
    );

    const allSucceeded = results.every(
      (r) => r.status === "fulfilled" && r.value === true
    );

    if (!allSucceeded) {
      const failCount = results.filter(
        (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value)
      ).length;
      console.error(
        `[WhatsApp] broadcastTemplate: ${failCount}/${phones.length} messages failed`
      );
    }

    return allSucceeded;
  }
}
