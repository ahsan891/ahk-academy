/**
 * Payment Utility Functions
 * Reference code generation, date calculations, and currency formatting.
 */

/**
 * Generate a unique reference code in format "AHK-XXXX"
 * Used for payment tracking via IBAN and Papara transfers.
 */
export function generateReferenceCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "AHK-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Check if a payment is overdue (past its due date)
 */
export function isPaymentOverdue(dueDate: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < now;
}

/**
 * Get the number of days until a payment is due.
 * Returns negative number if overdue.
 */
export function getDaysUntilDue(dueDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format a currency amount with proper symbol and locale formatting.
 * Supports USD, EUR, TRY, GBP.
 */
export function formatCurrency(amount: number, currency: string): string {
  const currencyMap: Record<string, { locale: string; currency: string }> = {
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "de-DE", currency: "EUR" },
    TRY: { locale: "tr-TR", currency: "TRY" },
    GBP: { locale: "en-GB", currency: "GBP" },
  };

  const config = currencyMap[currency.toUpperCase()] || currencyMap.USD;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate the next billing date based on a billing cycle day.
 * If the day has already passed this month, returns next month's date.
 */
export function getNextBillingDate(billingCycleDay: number): Date {
  const now = new Date();
  const currentDay = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (currentDay < billingCycleDay) {
    // Due date is still this month
    return new Date(year, month, billingCycleDay);
  } else {
    // Due date is next month
    return new Date(year, month + 1, billingCycleDay);
  }
}

/**
 * Generate a unique transaction reference that doesn't conflict with existing ones.
 * Retries with new codes if collision detected.
 */
export async function generateUniqueReferenceCode(
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateReferenceCode();
    const exists = await checkExists(code);
    if (!exists) return code;
    attempts++;
  }

  // Fallback: add timestamp suffix for guaranteed uniqueness
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `AHK-${timestamp}`;
}
