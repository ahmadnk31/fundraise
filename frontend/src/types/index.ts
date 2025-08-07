// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<{
  items: T[];
  pagination: PaginationMeta;
}> {}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse extends ApiResponse<{
  token: string;
  user: User;
}> {}

// Campaign Types
export interface Campaign {
  id: string;
  title: string;
  slug: string;
  summary: string;
  story: string;
  category: string;
  location?: string;
  goalAmount: string;
  currentAmount: string;
  currency: string;
  deadline?: string;
  budgetBreakdown?: string;
  coverImage?: string;
  additionalMedia: string[];
  isActive: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CampaignStats {
  totalDonors: number;
  totalDonations: number;
  percentageRaised: number;
}

export interface CampaignDetail extends Campaign {
  recentDonations: Donation[];
  stats: CampaignStats;
}

export interface CampaignDetailResponse {
  campaign: Campaign;
  recentDonations: Donation[];
  stats: CampaignStats;
}

// Donation Types
export interface Donation {
  id: string;
  amount: string;
  currency: string;
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  campaign?: {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
  };
}

export interface CreatePaymentIntentRequest {
  campaignId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
}

export interface PaymentIntentResponse extends ApiResponse<{
  clientSecret: string;
  paymentIntentId: string;
}> {}

export interface CreateDonationRequest {
  campaignId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  message?: string;
  isAnonymous: boolean;
  paymentIntentId: string;
  billingAddress?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

// Upload Types
export interface UploadedFile {
  file: File;
  preview: string;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  uploadProgress: number;
  publicUrl?: string;
  fileKey?: string;
  error?: string;
}

export interface UploadResponse extends ApiResponse<{
  fileKey: string;
  publicUrl: string;
  originalName: string;
  size: number;
  mimeType: string;
}> {}

export interface SignedUrlResponse extends ApiResponse<{
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}> {}

// Dashboard Types
export interface DashboardData {
  campaigns: {
    total: number;
    active: number;
    totalRaised: number;
  };
  donations: {
    total: number;
    totalAmount: number;
  };
  recentActivity: Array<{
    id: string;
    amount: string;
    donorName?: string;
    isAnonymous: boolean;
    createdAt: string;
    campaign: {
      id: string;
      title: string;
      slug: string;
    };
  }>;
}

// Form Types
export interface CampaignFormData {
  title: string;
  category: string;
  location: string;
  summary: string;
  story: string;
  goalAmount: string;
  deadline: string;
  budgetBreakdown: string;
  coverImage: string;
  additionalMedia: string[];
}

export interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Query Parameter Types
export interface CampaignQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'recent' | 'goal' | 'raised';
  featured?: boolean;
}

export interface UserCampaignQueryParams {
  page?: number;
  limit?: number;
  status?: 'all' | 'active' | 'inactive';
}

export interface UserDonationQueryParams {
  page?: number;
  limit?: number;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Environment Types
export interface EnvConfig {
  apiUrl: string;
}
