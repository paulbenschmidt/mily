import { UserType, TimelineEventType, AuthResponse } from '@/types/api';

// Use /api prefix to trigger Next.js rewrites
const API_BASE_URL = '/api';

class AuthApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL!) {
    this.baseUrl = baseUrl;
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  async initializeCsrf(): Promise<void> {
    /**
     * Initialize CSRF token by fetching from backend.
     * This should be called once on app initialization.
     * The backend will set the csrftoken cookie in the response.
     */
    try {
      await fetch(`${this.baseUrl}/auth/csrf-token/`, {
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to initialize CSRF token');
    }
  }

  private handleErrorResponse(response: Response, errorData: Record<string, unknown>): never {
    // Forbidden (403)
    if (response.status === 403) {
      throw new Error('You don\'t have permission to perform this action.');
    }

    // Rate limiting (429)
    if (response.status === 429) {
      const error = new Error('Please slow down and try again in a few moments.') as Error & { errorCode?: string };
      error.errorCode = 'RATE_LIMIT_EXCEEDED';
      throw error;
    }

    // Server error (500)
    if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    // Generic error handling
    const errorMessage =
      (typeof errorData.error === 'string' ? errorData.error : null) ||
      (typeof errorData.detail === 'string' ? errorData.detail : null) ||
      `Request failed: ${response.status} ${response.statusText}`;

    console.log(errorData);
    const error = new Error(errorMessage) as Error & { errorCode?: string; email?: string };
    error.errorCode = typeof errorData.error_code === 'string' ? errorData.error_code : undefined;
    error.email = typeof errorData.email === 'string' ? errorData.email : undefined;
    throw error;
  }

  private async request<T>(params: {
    endpoint: string;
    options?: RequestInit;
    skipAuth?: boolean;
  }): Promise<T> {
    const { endpoint, options = {}, skipAuth = false } = params;
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add CSRF token for state-changing requests (CSRF token is automatically set by backend via Django middleware)
    if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
      const csrfToken = this.getCookie('csrftoken');
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
    }

    console.log(url);
    console.log(options);

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    console.log(response);

    // If we get a 401, try to refresh the token
    if (response.status === 401 && !skipAuth) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the request - new access token cookie is now set
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      this.handleErrorResponse(response, errorData);
    }

    // Handle 204 No Content responses (e.g., DELETE requests)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }


  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        return true;
      }

      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/timeline')) {
        // Timeline routes should not trigger auth checks or redirects
        // Without this, unauthenticated users would be redirected to login
        return true;
      }

      // Refresh failed - redirect to login (unless already there)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
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
    return this.request<AuthResponse>({
      endpoint: '/auth/register/',
      options: {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      skipAuth: true,
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    // Backend sets httpOnly cookies automatically
    return this.request<AuthResponse>({
      endpoint: '/auth/login/',
      options: {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      skipAuth: true,
    });
  }

  async logout(): Promise<{ message: string }> {
    try {
      // Backend is responsible for clearing cookies since they are httpOnly
      await this.request<{ message: string }>({
        endpoint: '/auth/logout/',
        options: {
          method: 'POST',
        },
      });
    } catch (error) {
      console.error('Logout failed');
    }
    return { message: 'Logout successful' };
  }

  async getAuthStatus(): Promise<{ authenticated: boolean; user?: UserType }> {
    try {
      const user = await this.getCurrentUser();
      return { authenticated: true, user };
    } catch {
      return { authenticated: false };
    }
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      endpoint: '/auth/password-reset-request/',
      options: {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      skipAuth: true,
    });
  }

  async confirmPasswordReset(
    uid: string,
    token: string,
    new_password: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      endpoint: '/auth/password-reset-confirm/',
      options: {
        method: 'POST',
        body: JSON.stringify({ uid, token, new_password }),
      },
      skipAuth: true,
    });
  }

  async changePassword(
    current_password: string,
    new_password: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>({
      endpoint: '/auth/change-password/',
      options: {
        method: 'POST',
        body: JSON.stringify({ current_password, new_password }),
      },
    });
  }

  // Verify email - backend sets httpOnly cookies automatically
  async verifyEmail(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      endpoint: '/auth/verify-email/',
      options: {
        method: 'POST',
        body: JSON.stringify({ token }),
      },
      skipAuth: true,
    });
  }

  // User endpoints
  async getCurrentUser(): Promise<UserType> {
    return this.request<UserType>({
      endpoint: '/users/me/',
    });
  }

  async updateUser(userData: Partial<UserType>): Promise<UserType> {
    return this.request<UserType>({
      endpoint: '/users/me/',
      options: {
        method: 'PATCH',
        body: JSON.stringify(userData),
      },
    });
  }

  async deleteAccount(): Promise<{ message: string }> {
    // Backend is responsible for clearing cookies since they are httpOnly
    return this.request<{ message: string }>({
      endpoint: '/users/me/',
      options: {
        method: 'DELETE',
      },
    });
  }

  // Events endpoints
  async getEvents(): Promise<TimelineEventType[]> {
    return this.request<TimelineEventType[]>({
      endpoint: '/events/self/',
    });
  }

  // Use Omit to create a type that excludes server-generated fields
  async createEvent(eventData: Omit<TimelineEventType, 'id' | 'user' | 'created_at' | 'updated_at'>): Promise<TimelineEventType> {
    return this.request<TimelineEventType>({
      endpoint: '/events/',
      options: {
        method: 'POST',
        body: JSON.stringify(eventData),
      },
    });
  }

  // Update an existing event using PATCH to allow partial updates
  async updateEvent(eventId: string, eventData: Partial<Omit<TimelineEventType, 'id' | 'user' | 'created_at' | 'updated_at'>>): Promise<TimelineEventType> {
    return this.request<TimelineEventType>({
      endpoint: `/events/${eventId}/`,
      options: {
        method: 'PATCH',
        body: JSON.stringify(eventData),
      },
    });
  }

  // Delete an existing event
  async deleteEvent(eventId: string): Promise<void> {
    await this.request<void>({
      endpoint: `/events/${eventId}/`,
      options: {
        method: 'DELETE',
      },
    });
  }

  // Get a single event by ID
  async getEvent(eventId: string): Promise<TimelineEventType> {
    return this.request<TimelineEventType>({
      endpoint: `/events/${eventId}/`,
    });
  }

  // Photo management endpoints
  async createPhotoUpload(
    eventId: string,
    photoData: { filename: string; content_type: string; file_size: number; width?: number; height?: number }
  ): Promise<{ upload_url: string; photo_id: string; s3_key: string }> {
    return this.request<{ upload_url: string; photo_id: string; s3_key: string }>({
      endpoint: `/events/${eventId}/create-photo-upload/`,
      options: {
        method: 'POST',
        body: JSON.stringify(photoData),
      },
    });
  }

  async updatePhotoMetadata(
    eventId: string,
    photoId: string,
    metadata: { display_order?: number; width?: number; height?: number }
  ): Promise<void> {
    await this.request<void>({
      endpoint: `/events/${eventId}/photos/${photoId}/`,
      options: {
        method: 'PATCH',
        body: JSON.stringify(metadata),
      },
    });
  }

  async deletePhoto(eventId: string, photoId: string): Promise<void> {
    await this.request<void>({
      endpoint: `/events/${eventId}/photos/${photoId}/`,
      options: {
        method: 'DELETE',
      },
    });
  }

  // Send timeline share invitation
  async sendShareInvitation(email: string): Promise<{ id: string; shared_with_email: string }> {
    return await this.request<{ id: string; shared_with_email: string }>({
      endpoint: '/shares/',
      options: {
        method: 'POST',
        body: JSON.stringify({
          shared_with_email: email,
        }),
      },
    });
  }

  // Get list of shares (people you've shared your timeline with)
  async getSharedByYou(): Promise<Array<{
    id: string;
    user: UserType;
    shared_with_email: string;
    shared_with_user: UserType | null;
    is_accepted: boolean;
    accepted_at: string | null;
    invitation_sent_at: string;
  }>> {
    return await this.request<Array<{
      id: string;
      user: UserType;
      shared_with_email: string;
      shared_with_user: UserType | null;
      is_accepted: boolean;
      accepted_at: string | null;
      invitation_sent_at: string;
    }>>({
      endpoint: '/shares/',
      options: {
        method: 'GET',
      },
    });
  }

  // Get list of timelines shared with the current user
  async getSharedWithMe(): Promise<Array<{
    id: string;
    user: UserType;
    shared_with_email: string;
    shared_with_user: UserType | null;
    is_accepted: boolean;
    accepted_at: string | null;
    invitation_sent_at: string;
  }>> {
    return await this.request<Array<{
      id: string;
      user: UserType;
      shared_with_email: string;
      shared_with_user: UserType | null;
      is_accepted: boolean;
      accepted_at: string | null;
      invitation_sent_at: string;
    }>>({
      endpoint: '/shares/shared-with-me/',
      options: {
        method: 'GET',
      },
    });
  }

  // Remove a share
  async deleteShare(shareId: string): Promise<void> {
    await this.request<void>({
      endpoint: `/shares/${shareId}/`,
      options: {
        method: 'DELETE',
      },
    });
  }

  // Accept a share invitation
  async acceptShareInvitation(shareId: string): Promise<void> {
    await this.request<void>({
      endpoint: `/shares/${shareId}/accept/`,
      options: {
        method: 'PATCH',
      },
    });
  }

  // Reject a share invitation
  async rejectShareInvitation(shareId: string): Promise<void> {
    await this.request<void>({
      endpoint: `/shares/${shareId}/reject/`,
      options: {
        method: 'DELETE',
      },
    });
  }

  // Get another user's timeline by handle
  async getTimelineByHandle(handle: string): Promise<{
    events: TimelineEventType[];
    user: UserType;
  }> {
    return await this.request<{
      events: TimelineEventType[];
      user: UserType;
    }>({
      endpoint: `/timelines/${handle}`,
      options: {
        method: 'GET',
      },
      skipAuth: true, // Public endpoint, auth is optional but will be sent if available
    });
  }
}

export const authApiClient = new AuthApiClient();
