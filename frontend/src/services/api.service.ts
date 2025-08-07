import { 
  ApiResponse, 
  AuthResponse, 
  Campaign, 
  CampaignDetail, 
  CampaignDetailResponse,
  CampaignQueryParams,
  User,
  Donation,
  CreateDonationRequest,
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  DashboardData,
  UserCampaignQueryParams,
  UserDonationQueryParams,
  SignedUrlResponse,
  UploadResponse
} from '@/types';
// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText || 'Request failed',
      }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  // Auth endpoints
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  static async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  static async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ token }),
    });
    return this.handleResponse<ApiResponse>(response);
  }

  static async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    return this.handleResponse<ApiResponse>(response);
  }

  static async resetPassword(data: { token: string; password: string }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse>(response);
  }

  // Campaign endpoints
  static async getCampaigns(params?: CampaignQueryParams): Promise<ApiResponse<{
    campaigns: Campaign[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/campaigns?${searchParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  static async getCategoryStats(): Promise<ApiResponse<{
    categories: Record<string, number>;
    total: number;
  }>> {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/categories/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getCampaign(identifier: string): Promise<ApiResponse<CampaignDetailResponse>> {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/${identifier}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<CampaignDetailResponse>>(response);
  }

  static async createCampaign(data: {
    title: string;
    summary: string;
    story: string;
    category: string;
    location?: string;
    goalAmount: string;
    deadline?: string;
    budgetBreakdown: string;
    coverImage: string;
    additionalMedia: string[];
  }): Promise<ApiResponse<Campaign>> {
    const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<Campaign>>(response);
  }

  static async updateCampaign(id: string, data: Partial<{
    title: string;
    summary: string;
    story: string;
    category: string;
    location: string;
    goalAmount: string;
    deadline: string;
    budgetBreakdown: string;
    coverImage: string;
    additionalMedia: string[];
  }>): Promise<ApiResponse<Campaign>> {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<Campaign>>(response);
  }

  static async deleteCampaign(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse>(response);
  }

  // User endpoints
  static async getProfile(): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  static async updateProfile(data: {
    firstName: string;
    lastName: string;
    avatar?: string;
  }): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/users/password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse>(response);
  }

  static async getUserCampaigns(params?: UserCampaignQueryParams): Promise<ApiResponse<{
    campaigns: Campaign[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/users/campaigns?${searchParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  static async getUserDonations(params?: UserDonationQueryParams): Promise<ApiResponse<{
    donations: Donation[];
    stats: {
      totalDonations: number;
      totalAmountDonated: string;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/users/donations?${searchParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  static async getDashboard(): Promise<ApiResponse<DashboardData>> {
    const response = await fetch(`${API_BASE_URL}/api/users/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<DashboardData>>(response);
  }

  // Upload endpoints
  static async getSignedUploadUrl(data: {
    filename: string;
    contentType: string;
    type: 'campaign' | 'profile' | 'update';
  }): Promise<SignedUrlResponse> {
    const response = await fetch(`${API_BASE_URL}/api/upload/signed-url`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<SignedUrlResponse>(response);
  }

  static async deleteFile(fileKey: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/upload/${fileKey}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse>(response);
  }

  // Donation endpoints
  static async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/donations/create-payment-intent`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<PaymentIntentResponse>(response);
  }

  static async createDonation(data: CreateDonationRequest): Promise<ApiResponse<Donation>> {
    const response = await fetch(`${API_BASE_URL}/api/donations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<Donation>>(response);
  }

  static async getDonation(id: string): Promise<ApiResponse<Donation>> {
    const response = await fetch(`${API_BASE_URL}/api/donations/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<Donation>>(response);
  }

  static async getCampaignDonations(campaignId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    donations: Donation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/campaigns/${campaignId}/donations?${searchParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }
}

export default ApiService;
