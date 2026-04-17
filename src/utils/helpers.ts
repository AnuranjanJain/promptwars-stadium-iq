// ============================================================
// StadiumIQ — Shared Utility Functions
// ============================================================

import { LatLng } from '@/types';

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function getDistance(a: LatLng, b: LatLng): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const calc = sinDLat * sinDLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Get density level label and color
 */
export function getDensityLevel(density: number): { label: string; color: string; emoji: string } {
  if (density < 0.3) return { label: 'Low', color: '#22c55e', emoji: '🟢' };
  if (density < 0.6) return { label: 'Moderate', color: '#f59e0b', emoji: '🟡' };
  if (density < 0.8) return { label: 'Busy', color: '#f97316', emoji: '🟠' };
  return { label: 'Very Crowded', color: '#ef4444', emoji: '🔴' };
}

/**
 * Get wait time severity
 */
export function getWaitSeverity(minutes: number): { label: string; color: string } {
  if (minutes <= 3) return { label: 'No Wait', color: '#22c55e' };
  if (minutes <= 8) return { label: 'Short Wait', color: '#84cc16' };
  if (minutes <= 15) return { label: 'Moderate Wait', color: '#f59e0b' };
  return { label: 'Long Wait', color: '#ef4444' };
}

/**
 * Format relative time
 */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Category icons
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    food: '🍔',
    restroom: '🚻',
    merchandise: '🛍️',
    gate: '🚪',
    medical: '🏥',
    info: 'ℹ️',
    atm: '🏧',
    parking: '🅿️',
  };
  return icons[category] || '📍';
}

/**
 * Category labels
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    food: 'Food & Beverage',
    restroom: 'Restrooms',
    merchandise: 'Merchandise',
    gate: 'Gates',
    medical: 'First Aid',
    info: 'Information',
    atm: 'ATM',
    parking: 'Parking',
  };
  return labels[category] || category;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
