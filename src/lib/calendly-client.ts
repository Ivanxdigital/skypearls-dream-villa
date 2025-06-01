/**
 * Calendly API Client for Skypearls Villas RAG Integration
 * 
 * This module provides functions to interact with the Calendly V2 API
 * for booking villa consultations and retrieving scheduling information.
 */

// Calendly API Types
interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number;
  kind: string;
  pooling_type?: string;
  type: string;
  color: string;
  created_at: string;
  updated_at: string;
  internal_note?: string;
  description_plain?: string;
  description_html?: string;
}

interface CalendlyApiResponse<T> {
  collection?: T[];
  pagination?: {
    count: number;
    next_page?: string;
    previous_page?: string;
    next_page_token?: string;
    previous_page_token?: string;
  };
  resource?: T;
}

interface CalendlyError {
  title: string;
  message: string;
  details?: Array<{
    parameter: string;
    message: string;
  }>;
}

// Custom error class for Calendly API errors
export class CalendlyApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: CalendlyError
  ) {
    super(message);
    this.name = 'CalendlyApiError';
  }
}

// Cache interface for global caching
interface CalendlyCache {
  user?: CalendlyUser;
  eventTypes?: CalendlyEventType[];
  lastFetch?: number;
}

interface CustomGlobalThis {
  _skypearlsCalendlyCache?: CalendlyCache;
}

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Make authenticated API request to Calendly
 */
async function makeCalendlyRequest<T>(endpoint: string): Promise<T> {
  const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN;
  
  if (!token) {
    throw new CalendlyApiError(
      'Calendly Personal Access Token is not configured. Please set CALENDLY_PERSONAL_ACCESS_TOKEN environment variable.'
    );
  }

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://api.calendly.com${endpoint}`;

  try {
    console.log('[Calendly] Making API request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorDetails: CalendlyError | undefined;
      
      try {
        const errorBody = await response.json();
        errorDetails = errorBody;
      } catch {
        // If we can't parse the error body, that's fine
      }

      throw new CalendlyApiError(
        `Calendly API request failed: ${response.status} ${response.statusText}`,
        response.status,
        errorDetails
      );
    }

    const data = await response.json();
    console.log('[Calendly] API request successful');
    return data;
  } catch (error) {
    if (error instanceof CalendlyApiError) {
      throw error;
    }
    
    console.error('[Calendly] API request failed:', error);
    throw new CalendlyApiError(
      `Failed to make Calendly API request: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get the current user's information
 */
export async function getUser(): Promise<CalendlyUser> {
  const cache = (globalThis as CustomGlobalThis)._skypearlsCalendlyCache;
  const now = Date.now();
  
  // Return cached user if available and not expired
  if (cache?.user && cache.lastFetch && (now - cache.lastFetch) < CACHE_TTL) {
    console.log('[Calendly] Returning cached user');
    return cache.user;
  }

  try {
    const response = await makeCalendlyRequest<CalendlyApiResponse<CalendlyUser>>('/users/me');
    
    if (!response.resource) {
      throw new CalendlyApiError('Invalid response from Calendly API: missing user data');
    }

    const user = response.resource;
    
    // Update cache
    const globalCache = (globalThis as CustomGlobalThis)._skypearlsCalendlyCache || {};
    globalCache.user = user;
    globalCache.lastFetch = now;
    (globalThis as CustomGlobalThis)._skypearlsCalendlyCache = globalCache;
    
    console.log('[Calendly] User fetched successfully:', user.name);
    return user;
  } catch (error) {
    console.error('[Calendly] Failed to get user:', error);
    throw error;
  }
}

/**
 * Get all event types for the current user
 */
export async function getEventTypes(): Promise<CalendlyEventType[]> {
  const cache = (globalThis as CustomGlobalThis)._skypearlsCalendlyCache;
  const now = Date.now();
  
  // Return cached event types if available and not expired
  if (cache?.eventTypes && cache.lastFetch && (now - cache.lastFetch) < CACHE_TTL) {
    console.log('[Calendly] Returning cached event types');
    return cache.eventTypes;
  }

  try {
    const user = await getUser();
    const response = await makeCalendlyRequest<CalendlyApiResponse<CalendlyEventType>>(
      `/event_types?user=${user.uri}&active=true`
    );
    
    if (!response.collection) {
      throw new CalendlyApiError('Invalid response from Calendly API: missing event types collection');
    }

    const eventTypes = response.collection;
    
    // Update cache
    const globalCache = (globalThis as CustomGlobalThis)._skypearlsCalendlyCache || {};
    globalCache.eventTypes = eventTypes;
    globalCache.lastFetch = now;
    (globalThis as CustomGlobalThis)._skypearlsCalendlyCache = globalCache;
    
    console.log('[Calendly] Event types fetched successfully:', eventTypes.length, 'events');
    return eventTypes;
  } catch (error) {
    console.error('[Calendly] Failed to get event types:', error);
    throw error;
  }
}

/**
 * Get the scheduling URL for a specific event type
 */
export async function getEventTypeSchedulingUrl(eventTypeUuid: string): Promise<string> {
  try {
    const eventTypes = await getEventTypes();
    const eventType = eventTypes.find(et => et.uri.includes(eventTypeUuid) || et.slug === eventTypeUuid);
    
    if (!eventType) {
      throw new CalendlyApiError(`Event type not found: ${eventTypeUuid}`);
    }
    
    if (!eventType.active) {
      throw new CalendlyApiError(`Event type is not active: ${eventType.name}`);
    }
    
    console.log('[Calendly] Found scheduling URL for event:', eventType.name);
    return eventType.scheduling_url;
  } catch (error) {
    console.error('[Calendly] Failed to get scheduling URL:', error);
    throw error;
  }
}

/**
 * Find the best event type for villa consultations
 * Looks for consultation, meeting, or call-related event types
 */
export async function getVillaConsultationEventType(): Promise<CalendlyEventType | null> {
  try {
    const eventTypes = await getEventTypes();
    
    // Keywords to look for in event type names (case-insensitive)
    const consultationKeywords = [
      'consultation',
      'villa',
      'property',
      'meeting',
      'call',
      'discovery',
      'intro',
      'chat',
      'discussion'
    ];
    
    // Find the best matching event type
    const consultationEvent = eventTypes.find(et => 
      et.active && consultationKeywords.some(keyword => 
        et.name.toLowerCase().includes(keyword) ||
        (et.description_plain && et.description_plain.toLowerCase().includes(keyword))
      )
    );
    
    if (consultationEvent) {
      console.log('[Calendly] Found villa consultation event:', consultationEvent.name);
      return consultationEvent;
    }
    
    // Fallback to first active event type
    const fallbackEvent = eventTypes.find(et => et.active);
    if (fallbackEvent) {
      console.log('[Calendly] Using fallback event type:', fallbackEvent.name);
      return fallbackEvent;
    }
    
    console.warn('[Calendly] No suitable event type found');
    return null;
  } catch (error) {
    console.error('[Calendly] Failed to find villa consultation event type:', error);
    return null;
  }
}

/**
 * Clear the Calendly cache (useful for testing or forcing refresh)
 */
export function clearCalendlyCache(): void {
  console.log('[Calendly] Clearing cache');
  delete (globalThis as CustomGlobalThis)._skypearlsCalendlyCache;
}

/**
 * Health check for Calendly API connectivity
 */
export async function checkCalendlyHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    await getUser();
    return { healthy: true };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 