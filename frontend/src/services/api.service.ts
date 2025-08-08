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
  UploadResponse,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  Follow,
  FollowCampaignRequest,
  FollowStatus,
  Payout,
  CreatePayoutRequest,
  CampaignBalance,
  CampaignFinancials,
  PlatformSettings,
  StripeConnectStatus
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

  // Comment API methods
  static async getComments(campaignId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    comments: Comment[];
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
      `${API_BASE_URL}/api/comments/campaign/${campaignId}?${searchParams.toString()}`
    );
    return this.handleResponse(response);
  }

  static async getReplies(commentId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    replies: Comment[];
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
      `${API_BASE_URL}/api/comments/${commentId}/replies?${searchParams.toString()}`
    );
    return this.handleResponse(response);
  }

  static async createComment(data: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse(response) as ApiResponse<{ comment: Comment }>;
    
    // Backend returns { comment: commentData }, but we need just the comment
    if (result.success && result.data?.comment) {
      return {
        success: result.success,
        message: result.message,
        data: result.data.comment
      };
    }
    
    return {
      success: false,
      message: result.message || 'Failed to create comment'
    };
  }

  static async updateComment(id: string, data: UpdateCommentRequest): Promise<ApiResponse<Comment>> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse(response) as ApiResponse<{ comment: Comment }>;
    
    // Backend returns { comment: commentData }, but we need just the comment
    if (result.success && result.data?.comment) {
      return {
        success: result.success,
        message: result.message,
        data: result.data.comment
      };
    }
    
    return {
      success: false,
      message: result.message || 'Failed to update comment'
    };
  }

  static async deleteComment(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Follow API methods
  static async followCampaign(data: FollowCampaignRequest): Promise<ApiResponse<Follow>> {
    const response = await fetch(`${API_BASE_URL}/api/follows`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async unfollowCampaign(campaignId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/follows/${campaignId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getFollowStatus(campaignId: string): Promise<ApiResponse<FollowStatus>> {
    const response = await fetch(`${API_BASE_URL}/api/follows/status/${campaignId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getCampaignFollowers(campaignId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    followers: Follow[];
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
      `${API_BASE_URL}/api/follows/campaign/${campaignId}?${searchParams.toString()}`
    );
    return this.handleResponse(response);
  }

  static async getUserFollowedCampaigns(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    followedCampaigns: Follow[];
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
      `${API_BASE_URL}/api/follows/user?${searchParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  static async getFollowCount(campaignId: string): Promise<ApiResponse<{
    campaignId: string;
    followCount: number;
  }>> {
    const response = await fetch(`${API_BASE_URL}/api/follows/count/${campaignId}`);
    return this.handleResponse(response);
  }

  // Payout API methods
  static async getCampaignBalance(campaignId: string): Promise<ApiResponse<CampaignBalance>> {
    const response = await fetch(`${API_BASE_URL}/api/payouts/campaign/${campaignId}/balance`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async requestPayout(data: CreatePayoutRequest): Promise<ApiResponse<Payout>> {
    const response = await fetch(`${API_BASE_URL}/api/payouts/request`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async getUserPayouts(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{
    payouts: Payout[];
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
      `${API_BASE_URL}/api/payouts/history?${searchParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  static async getCampaignFinancials(campaignId: string): Promise<ApiResponse<CampaignFinancials>> {
    const response = await fetch(`${API_BASE_URL}/api/payouts/campaign/${campaignId}/financials`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getPlatformSettings(): Promise<ApiResponse<PlatformSettings>> {
    const response = await fetch(`${API_BASE_URL}/api/payouts/settings`);
    return this.handleResponse(response);
  }

  // Report functionality
  static async reportCampaign(data: {
    campaignId: string;
    reason: 'spam' | 'inappropriate' | 'fraud' | 'offensive' | 'copyright' | 'other';
    description: string;
  }): Promise<ApiResponse<{ reportId: string }>> {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Stripe Connect
  static async createStripeConnectOnboarding(campaignId: string): Promise<ApiResponse<{ url: string; accountId: string }>> {
    const response = await fetch(`${API_BASE_URL}/api/stripe-connect/connect/onboard`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ campaignId }),
    });
    return this.handleResponse(response);
  }

  static async getStripeConnectStatus(campaignId: string): Promise<ApiResponse<StripeConnectStatus>> {
    const response = await fetch(`${API_BASE_URL}/api/stripe-connect/connect/status/${campaignId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async createStripeConnectLogin(campaignId: string): Promise<ApiResponse<{ url: string }>> {
    const response = await fetch(`${API_BASE_URL}/api/stripe-connect/connect/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ campaignId }),
    });
    return this.handleResponse(response);
  }

  // Manual Payouts
  static async getManualPayoutInstructions(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/manual-payouts/manual/instructions`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async createManualPayout(data: {
    campaignId: string;
    amount: string;
    paymentMethod: 'bank_transfer' | 'paypal' | 'check';
    accountDetails: {
      accountHolder: string;
      bankName?: string;
      accountNumber?: string;
      routingNumber?: string;
      paypalEmail?: string;
      address?: string;
    };
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/manual-payouts/manual`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Admin Payout Management
  static async getPendingPayouts(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/api/admin/payouts/pending`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async processAdminPayout(payoutId: string, data: {
    action: 'approve' | 'reject' | 'process_stripe';
    rejectionReason?: string;
    stripeTransferData?: {
      destinationAccount?: string;
      transferAmount?: number;
    };
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/admin/payouts/process/${payoutId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }
}

export default ApiService;
