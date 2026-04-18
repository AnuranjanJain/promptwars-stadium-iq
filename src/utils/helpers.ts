// ============================================================
// StadiumIQ — Shared Utility Functions
// Pure utility functions for distance calculations, formatting,
// and venue-specific data transformations.
// ============================================================

import { LatLng } from '@/types';

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula. This is used for venue-scale distance
 * calculations between POIs, sections, and user positions.
 *
 * @param a - The first coordinate point
 * @param b - The second coordinate point
 * @returns Distance in meters between the two points
 *
 * @example
 * ```ts
 * const meters = getDistance(
 *   { lat: 28.6129, lng: 77.2295 },
 *   { lat: 28.6140, lng: 77.2285 }
 * );
 * console.log(meters); // ~147.5
 * ```
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

/**
 * Converts degrees to radians.
 * @param deg - Angle in degrees
 * @returns Angle in radians
 */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Formats a distance in meters into a human-readable string.
 * - Under 100m: exact meters (e.g., "42m")
 * - 100–999m: rounded to nearest 10m (e.g., "120m")
 * - 1000m+: kilometers with one decimal (e.g., "1.5km")
 *
 * @param meters - Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Maps a crowd density value (0–1) to a human-readable label,
 * color code, and emoji indicator for consistent UI presentation.
 *
 * @param density - Crowd density as a fraction (0 = empty, 1 = full)
 * @returns Object with label, hex color, and emoji
 */
export function getDensityLevel(density: number): { label: string; color: string; emoji: string } {
  if (density < 0.3) return { label: 'Low', color: '#22c55e', emoji: '🟢' };
  if (density < 0.6) return { label: 'Moderate', color: '#f59e0b', emoji: '🟡' };
  if (density < 0.8) return { label: 'Busy', color: '#f97316', emoji: '🟠' };
  return { label: 'Very Crowded', color: '#ef4444', emoji: '🔴' };
}

/**
 * Maps a queue wait time to a severity level with label and color
 * for visual indicators in the queue dashboard.
 *
 * @param minutes - Estimated wait time in minutes
 * @returns Object with severity label and hex color
 */
export function getWaitSeverity(minutes: number): { label: string; color: string } {
  if (minutes <= 3) return { label: 'No Wait', color: '#22c55e' };
  if (minutes <= 8) return { label: 'Short Wait', color: '#84cc16' };
  if (minutes <= 15) return { label: 'Moderate Wait', color: '#f59e0b' };
  return { label: 'Long Wait', color: '#ef4444' };
}

/**
 * Converts a timestamp to a relative time string (e.g., "5m ago").
 * Used in the live event feed to show how recent each event is.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
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
 * Generates a unique identifier using a combination of the current
 * timestamp and random characters. Suitable for client-side ID generation
 * where collision probability is acceptably low.
 *
 * @returns A unique string identifier
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Returns the emoji icon associated with a POI category.
 *
 * @param category - The POI category string
 * @returns Emoji icon string, or 📍 for unknown categories
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
 * Returns the human-readable label for a POI category.
 *
 * @param category - The POI category string
 * @returns Human-readable category label, or the raw string for unknowns
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
 * Clamps a numeric value between a minimum and maximum bound.
 *
 * @param value - The value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
