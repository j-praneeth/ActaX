/**
 * Safe fetch utility that handles JSON parsing errors gracefully
 */

export interface SafeFetchOptions extends RequestInit {
  timeout?: number;
}

export interface SafeFetchResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
}

/**
 * Safely parses JSON response, handling HTML error pages
 */
async function safeJsonParse<T = any>(response: Response): Promise<T> {
  const text = await response.text();
  
  // Check if response is HTML (error page)
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. This usually means the endpoint doesn't exist or there's a server error.`);
  }
  
  // Check if response is empty
  if (!text.trim()) {
    throw new Error(`Empty response from server. Status: ${response.status}`);
  }
  
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
  }
}

/**
 * Safe fetch wrapper that handles JSON parsing errors
 */
export async function safeFetch<T = any>(
  url: string, 
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    let data: T | null = null;
    let error: string | null = null;
    
    if (response.ok) {
      try {
        data = await safeJsonParse<T>(response);
      } catch (parseError) {
        error = parseError instanceof Error ? parseError.message : 'Failed to parse JSON response';
      }
    } else {
      try {
        const errorData = await safeJsonParse(response);
        error = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      } catch (parseError) {
        error = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    
    return {
      data,
      error,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          data: null,
          error: 'Request timeout',
          status: 408,
          ok: false,
        };
      }
      
      return {
        data: null,
        error: error.message,
        status: 0,
        ok: false,
      };
    }
    
    return {
      data: null,
      error: 'Unknown error occurred',
      status: 0,
      ok: false,
    };
  }
}

/**
 * Legacy fetch wrapper for backward compatibility
 */
export async function fetchWithErrorHandling<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await safeFetch<T>(url, options);
  
  if (!response.ok || response.error) {
    throw new Error(response.error || `HTTP ${response.status}`);
  }
  
  if (response.data === null) {
    throw new Error('No data received from server');
  }
  
  return response.data;
}

/**
 * Check if a response is likely an HTML error page
 */
export function isHtmlResponse(text: string): boolean {
  return text.trim().startsWith('<!DOCTYPE') || 
         text.trim().startsWith('<html') ||
         text.includes('<html') ||
         text.includes('<!DOCTYPE');
}

/**
 * Extract error message from HTML response
 */
export function extractErrorFromHtml(html: string): string {
  // Try to extract title or error message from HTML
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1];
  }
  
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1];
  }
  
  return 'Server returned HTML error page';
}
