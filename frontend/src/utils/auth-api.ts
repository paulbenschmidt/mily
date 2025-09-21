import { User, TimelineEvent, AuthResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


class AuthApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL!) {
    this.baseUrl = baseUrl;
  }

  private getCSRFToken(): string | null {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add CSRF token for state-changing requests
    if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session auth
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication endpoints
  async signup(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    handle: string;
    birth_date: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    console.log("Login called", credentials);
    return this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout/', {
      method: 'POST',
    });
  }

  async getAuthStatus(): Promise<{ authenticated: boolean; user?: User }> {
    return this.request<{ authenticated: boolean; user?: User }>('/auth/status/');
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async confirmPasswordReset(
    uid: string,
    token: string,
    new_password: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset-confirm/', {
      method: 'POST',
      body: JSON.stringify({ uid, token, new_password }),
    });
  }

  async getCSRFTokenFromServer(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/csrf-token/');
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me/');
  }

  async getUserProfile(): Promise<User> {
    return this.getCurrentUser();
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users/me/', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // Events endpoints
  async getEvents(): Promise<TimelineEvent[]> {
    return this.request<TimelineEvent[]>('/events/self/');
  }
}

export const authApiClient = new AuthApiClient();
