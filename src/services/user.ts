import apiClient from '@/utils/api';

const USER_ENDPOINTS = {
  CHECK_INBOX_AVAILABILITY: '/user/check-inbox-availability/',
  GET_SUGGESTED_USERNAMES: '/user/get-suggested-usernames/',
  CREATE_INBOX: '/user/create-inbox/',
  COMPLETE_DATA: '/user/complete-data/',
  GLOBAL_STATS: '/user/global-stats/',
} as const;

// Response types
export interface InboxAvailabilityResponse {
  available: boolean;
  message: string;
}

export interface SuggestedUsernamesResponse {
  suggestions: string[];
}

export interface CreateInboxResponse {
  success: boolean;
  inboxEmail: string;
}

export interface UserCompleteDataResponse {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  birthYear: string | null;
  gender: string | null;
  isVerified: boolean;
  isInboxCreated: boolean;
  inboxEmail: string | null;
  createdAt: string;
}

class UserService {
  /**
   * Check if a username is available for creating an inbox email address
   */
  async checkInboxAvailability(username: string): Promise<InboxAvailabilityResponse> {
    const response = await apiClient.get<InboxAvailabilityResponse>(
      USER_ENDPOINTS.CHECK_INBOX_AVAILABILITY,
      { params: { username } }
    );
    return response.data;
  }

  /**
   * Get suggested usernames for creating an inbox email address
   */
  async getSuggestedUsernames(name?: string, basedOn?: string): Promise<SuggestedUsernamesResponse> {
    const params: Record<string, string> = {};
    if (name) params.name = name;
    if (basedOn) params.basedOn = basedOn;

    const response = await apiClient.get<SuggestedUsernamesResponse>(
      USER_ENDPOINTS.GET_SUGGESTED_USERNAMES,
      { params }
    );
    return response.data;
  }

  /**
   * Create an inbox email address for the authenticated user
   */
  async createInbox(username: string): Promise<CreateInboxResponse> {
    const response = await apiClient.post<CreateInboxResponse>(
      USER_ENDPOINTS.CREATE_INBOX,
      { username }
    );
    return response.data;
  }

  /**
   * Get complete user data
   */
  async getCompleteData(): Promise<UserCompleteDataResponse> {
    const response = await apiClient.get<UserCompleteDataResponse>(USER_ENDPOINTS.COMPLETE_DATA);
    return response.data;
  }
}

export const userService = new UserService();
export default userService;
