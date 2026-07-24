/**
 * Fetch utilities with better error handling and timeout management
 * Prevents AbortError and other fetch-related issues
 */

// Global timeout for fetch requests
const DEFAULT_TIMEOUT = 20000; // 20 seconds

/**
 * Enhanced fetch with timeout and better error handling
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL, 
  init?: RequestInit, 
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  // If signal is already provided, use it as-is
  if (init?.signal) {
    return fetch(input, init);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Transform AbortError to more user-friendly error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }
    
    throw error;
  }
}

/**
 * Safe JSON fetch with built-in error handling
 */
export async function fetchJSON<T = any>(
  input: RequestInfo | URL, 
  init?: RequestInit, 
  timeout?: number
): Promise<T> {
  try {
    const response = await fetchWithTimeout(input, init, timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    
    return await response.json();
  } catch (error) {
    // Handle common fetch errors gracefully
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        throw new Error('Connection timeout');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error');
      }
    }
    
    throw error;
  }
}

/**
 * Utility to check if an error is an abort error
 */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && (
    error.name === 'AbortError' || 
    error.message.includes('aborted') ||
    error.message.includes('timeout')
  );
}

/**
 * Utility to suppress abort errors in console
 */
export function suppressAbortError(error: unknown): boolean {
  if (isAbortError(error)) {
    // Don't log abort errors to console
    return true;
  }
  return false;
}