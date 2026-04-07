/**
 * Admin API Client
 * Handles all admin analytics API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApiPayload<T> =
  | T
  | {
      data?: T;
      result?: T;
      analytics?: T;
      summary?: T;
    };

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  if (typeof window === "undefined") return {};

  const token = localStorage.getItem("qnect_jwt");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const extractPayload = <T>(payload: ApiPayload<T>): T => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const objectPayload = payload as {
      data?: T;
      result?: T;
      analytics?: T;
      summary?: T;
    };

    if (objectPayload.data !== undefined) return objectPayload.data;
    if (objectPayload.result !== undefined) return objectPayload.result;
    if (objectPayload.analytics !== undefined) return objectPayload.analytics;
    if (objectPayload.summary !== undefined) return objectPayload.summary;
  }

  return payload as T;
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiPayload<T>;
  return extractPayload(payload);
};

// Type definitions matching backend responses
export interface DashboardSummary {
  activeTokens: number;
  servedToday: number;
  skippedTokens: number;
  totalTokensToday: number;
  peakHour: string;
}

export interface QueueLoad {
  time: string;
  activeTokens: number;
}

export interface TokensServed {
  hour: string;
  served: number;
}

export interface AvgWaitTime {
  queue: string;
  avgWaitMinutes: number;
}

export interface TokenStatusCount {
  status: string;
  count: number;
}

/**
 * Fetch dashboard summary with overview metrics
 */
export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/summary`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard summary: ${response.statusText}`);
  }

  const summary = await parseJsonResponse<Partial<DashboardSummary>>(response);

  return {
    activeTokens: Number(summary.activeTokens ?? 0),
    servedToday: Number(summary.servedToday ?? 0),
    skippedTokens: Number(summary.skippedTokens ?? 0),
    totalTokensToday: Number(summary.totalTokensToday ?? 0),
    peakHour: summary.peakHour || "N/A",
  };
};

/**
 * Fetch queue load analytics (active tokens over time)
 */
export const fetchQueueLoadAnalytics = async (): Promise<QueueLoad[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/analytics/queue-load`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch queue load analytics: ${response.statusText}`);
  }

  const data = await parseJsonResponse<QueueLoad[] | unknown>(response);
  return Array.isArray(data)
    ? data.map((item) => ({
        time: String((item as QueueLoad).time ?? ""),
        activeTokens: Number((item as QueueLoad).activeTokens ?? 0),
      }))
    : [];
};

/**
 * Fetch tokens served per hour analytics
 */
export const fetchTokensServedAnalytics = async (): Promise<TokensServed[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/analytics/tokens-served`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tokens served analytics: ${response.statusText}`);
  }

  const data = await parseJsonResponse<TokensServed[] | unknown>(response);
  return Array.isArray(data)
    ? data.map((item) => ({
        hour: String((item as TokensServed).hour ?? ""),
        served: Number((item as TokensServed).served ?? 0),
      }))
    : [];
};

/**
 * Fetch average wait time per queue analytics
 */
export const fetchAvgWaitTimeAnalytics = async (): Promise<AvgWaitTime[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/analytics/avg-wait-time`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch wait time analytics: ${response.statusText}`);
  }

  const data = await parseJsonResponse<AvgWaitTime[] | unknown>(response);
  return Array.isArray(data)
    ? data.map((item) => ({
        queue: String((item as AvgWaitTime).queue ?? "Unknown"),
        avgWaitMinutes: Number((item as AvgWaitTime).avgWaitMinutes ?? 0),
      }))
    : [];
};

/**
 * Fetch token status distribution analytics
 */
export const fetchTokenStatusAnalytics = async (): Promise<TokenStatusCount[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/analytics/token-status`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch token status analytics: ${response.statusText}`);
  }

  const data = await parseJsonResponse<TokenStatusCount[] | unknown>(response);
  return Array.isArray(data)
    ? data.map((item) => ({
        status: String((item as TokenStatusCount).status ?? "Unknown"),
        count: Number((item as TokenStatusCount).count ?? 0),
      }))
    : [];
};

export interface AdminUser {
  _id: string;
  email: string;
  emailVerified: boolean;
  createdByAdmin: {
    _id: string;
  } | null;
}

/**
 * Fetch all admin users
 */
export const fetchAdmins = async (): Promise<AdminUser[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch admins: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Create a new admin (direct creation)
 */
export const createAdmin = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to create admin");
  }

  return response.json();
};

