import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const nextAuth = NextAuth(authConfig);
export const handlers: typeof nextAuth.handlers = nextAuth.handlers;
export const auth: typeof nextAuth.auth = nextAuth.auth;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;

// ─── RBAC Permission Matrix ───
const ROLE_HIERARCHY = ['DELIVERY', 'CASHIER', 'KITCHEN', 'CAPTAIN', 'MANAGER', 'OWNER'] as const;

const PERMISSIONS: Record<string, string[]> = {
  // Dashboard
  'dashboard.view':       ['OWNER', 'MANAGER', 'CAPTAIN', 'CASHIER'],
  'dashboard.analytics':  ['OWNER', 'MANAGER'],
  // Tables
  'table.view':           ['OWNER', 'MANAGER', 'CAPTAIN', 'CASHIER'],
  'table.manage':         ['OWNER', 'MANAGER'],
  'table.assign':         ['OWNER', 'MANAGER', 'CAPTAIN'],
  // Orders
  'order.create':         ['OWNER', 'MANAGER', 'CAPTAIN', 'CASHIER'],
  'order.view':           ['OWNER', 'MANAGER', 'CAPTAIN', 'CASHIER', 'KITCHEN'],
  'order.cancel':         ['OWNER', 'MANAGER'],
  'order.transfer':       ['OWNER', 'MANAGER', 'CAPTAIN'],
  // KOT
  'kot.view':             ['OWNER', 'MANAGER', 'CAPTAIN', 'KITCHEN'],
  'kot.update':           ['OWNER', 'MANAGER', 'KITCHEN'],
  // Billing
  'bill.create':          ['OWNER', 'MANAGER', 'CASHIER'],
  'bill.cancel':          ['OWNER', 'MANAGER'],
  'bill.discount':        ['OWNER', 'MANAGER'],
  // Menu
  'menu.view':            ['OWNER', 'MANAGER', 'CAPTAIN', 'CASHIER', 'KITCHEN'],
  'menu.manage':          ['OWNER', 'MANAGER'],
  'menu.toggleAvail':     ['OWNER', 'MANAGER', 'KITCHEN'],
  // Staff
  'staff.view':           ['OWNER', 'MANAGER'],
  'staff.manage':         ['OWNER'],
  // Inventory
  'inventory.view':       ['OWNER', 'MANAGER'],
  'inventory.manage':     ['OWNER', 'MANAGER'],
  // Reports
  'report.view':          ['OWNER', 'MANAGER'],
  'report.export':        ['OWNER'],
  // Settings
  'settings.view':        ['OWNER', 'MANAGER'],
  'settings.manage':      ['OWNER'],
  // Integrations
  'integration.manage':   ['OWNER'],
  // CRM
  'crm.view':             ['OWNER', 'MANAGER', 'CAPTAIN'],
  'crm.manage':           ['OWNER', 'MANAGER'],
  // Reservations
  'reservation.view':     ['OWNER', 'MANAGER', 'CAPTAIN'],
  'reservation.manage':   ['OWNER', 'MANAGER', 'CAPTAIN'],
};

export function hasPermission(role: string, action: string): boolean {
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY.indexOf(role as any);
}

export function isRoleAbove(userRole: string, targetRole: string): boolean {
  return getRoleLevel(userRole) > getRoleLevel(targetRole);
}

// ─── Session Types ───
export interface SessionUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  tenantId: string;
  restaurantId: string | null;
}

export type { Session } from 'next-auth';
