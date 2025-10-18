import { UserType, TimelineEventType, AuthResponse } from '@/types/api';

// Use /api prefix to trigger Next.js rewrites
const API_BASE_URL = '/api';

class AuthApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL!) {
    this.baseUrl = baseUrl;
  }

  // JWT Token Management
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'refresh_token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  private setTokens(access: string, refresh: string): void {
    if (typeof window === 'undefined') return;
    // Set tokens in httpOnly-like cookies (client-side for now)
    // In production, consider using httpOnly cookies set by the backend
    const maxAge = 60 * 60; // 1 hour for access token
    const refreshMaxAge = 7 * 24 * 60 * 60; // 7 days for refresh token
    
    document.cookie = `access_token=${encodeURIComponent(access)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
    document.cookie = `refresh_token=${encodeURIComponent(refresh)}; Path=/; Max-Age=${refreshMaxAge}; SameSite=Lax; Secure`;
  }

  public clearTokens(): void {
    if (typeof window === 'undefined') return;
    document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add JWT token to Authorization header
    if (!skipAuth) {
      const accessToken = this.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    // If we get a 401 and have a refresh token, try to refresh
    if (response.status === 401 && !skipAuth && this.getRefreshToken()) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        const newAccessToken = this.getAccessToken();
        if (newAccessToken) {
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Request failed: ${response.status} ${response.statusText}`) as Error & { errorCode?: string; email?: string };
      error.errorCode = errorData.error_code;
      error.email = errorData.email;
      throw error;
    }

    return response.json();
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          // Update access token, keep existing refresh token
          const maxAge = 60 * 60; // 1 hour
          document.cookie = `access_token=${encodeURIComponent(data.access)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Authentication endpoints
  async signup(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    handle: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, true); // Skip auth for signup
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse & { access: string; refresh: string }> {
    const response = await this.request<AuthResponse & { access: string; refresh: string }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, true); // Skip auth for login
    
    // Store tokens in cookies
    if (response.access && response.refresh) {
      this.setTokens(response.access, response.refresh);
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    try {
      await this.request<{ message: string }>('/auth/logout/', {
        method: 'POST',
      });
    } finally {
      // Always clear tokens, even if request fails
      this.clearTokens();
    }
    return { message: 'Logout successful' };
  }

  async getAuthStatus(): Promise<{ authenticated: boolean; user?: UserType }> {
    return this.request<{ authenticated: boolean; user?: UserType }>('/auth/status/');
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset-request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, true); // Skip auth for password reset request
  }

  async confirmPasswordReset(
    uid: string,
    token: string,
    new_password: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset-confirm/', {
      method: 'POST',
      body: JSON.stringify({ uid, token, new_password }),
    }, true); // Skip auth for password reset confirm
  }

  // Verify email and get JWT tokens
  async verifyEmail(token: string): Promise<AuthResponse & { access: string; refresh: string }> {
    const response = await this.request<AuthResponse & { access: string; refresh: string }>('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, true); // Skip auth for email verification
    
    // Store tokens in cookies
    if (response.access && response.refresh) {
      this.setTokens(response.access, response.refresh);
    }
    
    return response;
  }

  // User endpoints
  async getCurrentUser(): Promise<UserType> {
    return this.request<UserType>('/users/me/');
  }

  async getUserProfile(): Promise<UserType> {
    return this.getCurrentUser();
  }

  async updateUser(userData: Partial<UserType>): Promise<UserType> {
    return this.request<UserType>('/users/me/', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // Events endpoints
  async getEvents(): Promise<TimelineEventType[]> {
    return this.request<TimelineEventType[]>('/events/self/');
  }

  // Use Omit to create a type that excludes server-generated fields
  async createEvent(eventData: Omit<TimelineEventType, 'id' | 'user' | 'created_at' | 'updated_at'>): Promise<TimelineEventType> {
    return this.request<TimelineEventType>('/events/', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Update an existing event using PATCH to allow partial updates
  async updateEvent(eventId: string, eventData: Partial<Omit<TimelineEventType, 'id' | 'user' | 'created_at' | 'updated_at'>>): Promise<TimelineEventType> {
    return this.request<TimelineEventType>(`/events/${eventId}/`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
  }

  // Delete an existing event
  async deleteEvent(eventId: string): Promise<void> {
    await this.request<void>(`/events/${eventId}/`, {
      method: 'DELETE',
    });
  }
}

export const authApiClient = new AuthApiClient();
