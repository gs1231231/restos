// ─── Currency Formatter (India) ───
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

// ─── Date Formatters ───
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// ─── Order Number Generator ───
export function generateOrderNumber(restaurantPrefix: string, counter: number): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  return `${restaurantPrefix}-${dateStr}-${String(counter).padStart(4, '0')}`;
}

// ─── KOT Number ───
export function generateKOTNumber(counter: number): string {
  return `KOT-${String(counter).padStart(5, '0')}`;
}

// ─── Bill Number ───
export function generateBillNumber(prefix: string, counter: number): string {
  const fy = getFiscalYear();
  return `${prefix}/${fy}/${String(counter).padStart(5, '0')}`;
}

function getFiscalYear(): string {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${String(year).slice(2)}-${String(year + 1).slice(2)}`;
}

// ─── GST Calculations ───
export function calculateGST(amount: number, rate: number, isInterState = false) {
  const taxAmount = amount * (rate / 100);
  if (isInterState) {
    return { cgst: 0, sgst: 0, igst: taxAmount, total: taxAmount };
  }
  return { cgst: taxAmount / 2, sgst: taxAmount / 2, igst: 0, total: taxAmount };
}

// ─── Phone Validation (India) ───
export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10));
}

// ─── GSTIN Validation ───
export function isValidGSTIN(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
}

// ─── FSSAI Validation ───
export function isValidFSSAI(fssai: string): boolean {
  return /^\d{14}$/.test(fssai);
}

// ─── Slug Generator ───
export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── Round to nearest ₹ ───
export function roundOff(amount: number): { rounded: number; diff: number } {
  const rounded = Math.round(amount);
  return { rounded, diff: rounded - amount };
}

// ─── Time Slot Helper ───
export function generateTimeSlots(startHour = 9, endHour = 23, intervalMinutes = 30): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

// ─── Constants ───
export const FOOD_TYPE_LABELS = { VEG: 'Veg', NONVEG: 'Non-Veg', EGG: 'Egg', VEGAN: 'Vegan' } as const;
export const FOOD_TYPE_COLORS = { VEG: '#22c55e', NONVEG: '#ef4444', EGG: '#f59e0b', VEGAN: '#10b981' } as const;
export const ORDER_STATUS_FLOW = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'BILLED', 'PAID'] as const;
export const GST_RATES = [0, 5, 12, 18, 28] as const;
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry',
] as const;
