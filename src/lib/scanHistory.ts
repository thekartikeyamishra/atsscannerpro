// src/lib/scanHistory.ts
// LocalStorage wrapper for client-side scan history.
//
// DESIGN PRINCIPLES:
// 1. SSR Safe: Always checks `typeof window` before accessing localStorage to prevent Next.js hydration crashes.
// 2. Fault Tolerant: Wraps all localStorage operations in try/catch to handle privacy modes or full storage limits gracefully.
// 3. Bounded Growth: Limits the history array to a maximum of 20 items to prevent unbounded storage usage.

export interface ScanHistoryItem {
  /** The unique retrieval token for the result */
  token: string;
  /** The title of the role scanned against (e.g., "Frontend Engineer") */
  roleTitle: string;
  /** Overall match score (0-100) */
  score: number;
  /** Letter grade (A+, B, etc.) */
  grade: string;
  /** Timestamp in milliseconds since epoch */
  timestamp: number;
}

const HISTORY_KEY = 'ats_scan_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Retrieves the user's scan history from LocalStorage.
 * Returns an empty array during Server-Side Rendering (SSR) or on error.
 */
export function getScanHistory(): ScanHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('[ScanHistory] Failed to parse history:', error);
    return [];
  }
}

/**
 * Saves a new scan result to the client's local history.
 * Prepends the new item and truncates the list to MAX_HISTORY_ITEMS.
 * 
 * @param item The scan details (timestamp is generated automatically).
 */
export function saveScanToHistory(item: Omit<ScanHistoryItem, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getScanHistory();
    
    const newItem: ScanHistoryItem = {
      ...item,
      timestamp: Date.now(),
    };

    // Remove any existing entry with the same token to prevent duplicates
    const filtered = history.filter(h => h.token !== item.token);
    
    // Add to the front of the array and cap the length
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[ScanHistory] Failed to save scan to history:', error);
  }
}

/**
 * Removes a specific scan from the local history using its token.
 * 
 * @param token The retrieval token of the scan to remove.
 */
export function removeScanFromHistory(token: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getScanHistory();
    const filtered = history.filter(h => h.token !== token);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[ScanHistory] Failed to remove scan from history:', error);
  }
}

/**
 * Permanently clears all scan history from the device.
 */
export function clearScanHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('[ScanHistory] Failed to clear history:', error);
  }
}