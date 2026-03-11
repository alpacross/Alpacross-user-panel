// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend-dev.pprince.io";
// const BASE_URL = "https://backend-dev.alpacross.com";
// const BASE_URL = "api.alpacross.com";
// export const BASE_URL = "http://localhost:3000";
export const BASE_URL = "https://api.alpacross.com";

const AUTH_TOKEN_KEY = "authToken";

export function setAuthToken(token) {
  try {
    if (typeof window !== "undefined") {
      if (token) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  } catch {}
}

export function getAuthToken() {
  try {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    }
  } catch {}
  return "";
}

export function clearAuthToken() {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {}
}

export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  // Attach Authorization header from stored token if available
  try {
    const token = getAuthToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  } catch {}
  const init = {
    method: options.method || "GET",
    headers,
    body: typeof options.body === "string" ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    credentials: "omit",
    cache: "no-store",
  };

  const res = await fetch(url, init);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const message = (data && (data.message || data.error || (data.result && data.result.description))) || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export const endpoints = {
  ticker: () => "/ticker",
  register: () => "/users/register",
  confirmEmail: () => "/auth/verify_email",
  login: () => "/users/login",
  forgotPassword: () => "/auth/forgot_password",
  forgotPassword2: () => "/auth/update_password",
  preEnable2fa: () => "/user/enable2fa", // GET
  enable2fa: () => "/user/enable2fa",    // PUT
  disable2fa: () => "/user/disable2fa",   // PUT
  twoFAStatus: (userId) => `/users/getTwoFaStatus/${userId}`, // POST
  
  // New 2FA Endpoints (User Request)
  generate2fa: () => "/users/twofa/enable",   // POST - Get QR Code
  verify2fa: () => "/users/twofa/verify",     // POST - Verify & Enable
  disableTwoFaSimple: () => "/users/disableTwoFaSimple", // POST - Disable with code
  
  // Sumsub Integration
  // Backend Requirement: GET /sumsub/access-token
  // Should return: { token: "sbx:..." } or { access_token: "..." }
  // Headers: Authorization: Bearer <user_token>
  // Backend info: Create an applicant on backend, generate access token with levelName 'basic-kyc-level' (or as configured)
  sumsubAccessToken: () => "/sumsub/access-token",

  // WEBHOOK SETUP (Backend Only):
  // 1. Sumsub Dashboard -> Developer Space -> Webhooks
  // 2. Endpoint: POST /api/callbacks/sumsub (or similar on your backend)
  // 3. Events to watch: 'applicantReviewed'
  // 4. Logic: If reviewResult.reviewAnswer === 'GREEN', update user.isVerified = true in DB.
  
  // Check verification status
  // Backend Requirement: GET /user/verification-status
  // Should return: { isVerified: true/false, status: "pending/verified/rejected" }
  getVerificationStatus: () => "/user/verification-status",

  // New KYC Endpoints
  getKycStatus: () => "/api/kyc/kycStatus", // GET
  startKyc: () => "/api/kyc/startKyc",     // POST

  // Payment History and Actions
  getPaymentHistory: (status = "", limit = 50, offset = 0) => {
    let url = `/payments/history?limit=${limit}&offset=${offset}`;
    if (status) url += `&status=${status}`;
    return url;
  },
  requestCancel: (id) => `/payments/request-cancel/${id}`,
  managePayment: (id) => `/payments/manage/${id}`, // For refund and other operations
};

// Safely decode a JWT payload without verifying signature (client-side display only)
function safeBase64UrlToJson(base64Url) {
  try {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const jsonString = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("binary");
    // Convert binary string to UTF-8
    const utf8 = decodeURIComponent(Array.prototype.map.call(jsonString, (c) =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(""));
    return JSON.parse(utf8);
  } catch {
    try {
      // Fallback: try direct JSON parse (in case payload is already plain text)
      return JSON.parse(base64Url);
    } catch {
      return null;
    }
  }
}

export function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return safeBase64UrlToJson(parts[1]);
  } catch {
    return null;
  }
}

export function getTokenPayload() {
  try {
    const token = getAuthToken();
    return decodeJwtPayload(token);
  } catch {
    return null;
  }
}

/**
 * Fetch all wallets for the authenticated user
 * POST /users/wallets (Backend uses POST method)
 * Response: Array of wallet objects or { wallets: [...] }
 */
export async function getWallets() {
  const response = await apiRequest("/users/wallets", { method: "POST" });
  if (Array.isArray(response)) return response;
  if (response?.wallets) return response.wallets;
  if (response?.data) return Array.isArray(response.data) ? response.data : [];
  return [];
}

/**
 * Create a new wallet
 * POST /users/add-wallet
 * Body: { walletAddress: string, network: string }
 */
export async function createWallet(data) {
  return apiRequest("/users/add-wallet", {
    method: "POST",
    body: {
      walletAddress: data.address,
      network: data.chain
    },
  });
}

/**
 * Get a specific wallet by ID
 * GET /wallets/:id
 */
export async function getWallet(id) {
  return apiRequest(`/wallets/${id}`);
}


