// ─── Enums ───
export type UserRole = 'OWNER' | 'MANAGER' | 'CAPTAIN' | 'KITCHEN' | 'CASHIER' | 'DELIVERY';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'ONLINE';
export type OrderPlatform = 'POS' | 'ZOMATO' | 'SWIGGY' | 'ONDC' | 'OWN_WEBSITE';
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'BILLED' | 'PAID' | 'CANCELLED';
export type FoodType = 'VEG' | 'NONVEG' | 'EGG' | 'VEGAN';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'WALLET' | 'CREDIT';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW';
export type KOTStation = 'HOT' | 'COLD' | 'BAR' | 'TANDOOR';
export type TableShape = 'SQUARE' | 'ROUND' | 'RECTANGLE' | 'OVAL';
export type DiscountType = 'PERCENT' | 'FLAT' | 'COUPON';
export type StockTransactionType = 'IN' | 'OUT' | 'WASTE' | 'ADJUST';
export type LoyaltyTransactionType = 'EARN' | 'REDEEM';
export type CampaignType = 'SMS' | 'WHATSAPP' | 'EMAIL';
export type IntegrationPlatform = 'ZOMATO' | 'SWIGGY' | 'ONDC' | 'PETPOOJA' | 'RAZORPAY' | 'WHATSAPP' | 'TALLY';

// ─── Common ───
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Session ───
export interface SessionUser {
  id: string;
  tenantId: string;
  restaurantId?: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
}

// ─── Dashboard ───
export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  avgOrderValue: number;
  occupancyRate: number;
  topItems: { name: string; qty: number; revenue: number }[];
  hourlyRevenue: { hour: number; revenue: number }[];
}
