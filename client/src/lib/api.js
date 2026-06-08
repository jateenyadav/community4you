import { mockRequest } from "./mockBackend.js";

const TOKEN_KEY = "c4y_token";

// In production point this at your deployed backend via VITE_API_URL.
// In dev it stays empty and Vite proxies "/api" to the local server.
// If no backend URL is set AND we're not on localhost (i.e. a static deploy
// like Netlify), fall back to an in-browser mock backend so the demo works
// with zero infrastructure.
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const isLocalhost =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname);

// Use the mock when there's no configured backend and we're not running the
// local dev server (which proxies /api to a real Express instance).
const USE_MOCK = !API_BASE && !isLocalhost;

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const token = getToken();

  if (USE_MOCK) {
    const headers = {};
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    try {
      return await mockRequest(path, { method, body, headers });
    } catch (err) {
      throw new Error(err.message || "Request failed");
    }
  }

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),
  updateProfile: (payload) => request("/auth/me", { method: "PATCH", body: payload }),

  // communities
  listCommunities: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== "")
    ).toString();
    return request(`/communities${qs ? `?${qs}` : ""}`, { auth: false });
  },
  categories: () => request("/communities/categories", { auth: false }),
  stats: () => request("/communities/stats", { auth: false }),
  trending: () => request("/communities/trending", { auth: false }),
  getCommunity: (slug) => request(`/communities/${slug}`),
  createCommunity: (payload) => request("/communities", { method: "POST", body: payload }),
  updateCommunity: (slug, payload) => request(`/communities/${slug}`, { method: "PATCH", body: payload }),
  deleteCommunity: (slug) => request(`/communities/${slug}`, { method: "DELETE" }),
  join: (slug) => request(`/communities/${slug}/join`, { method: "POST" }),
  leave: (slug) => request(`/communities/${slug}/join`, { method: "DELETE" }),

  // posts
  createPost: (slug, payload) => request(`/communities/${slug}/posts`, { method: "POST", body: payload }),
  deletePost: (slug, postId) => request(`/communities/${slug}/posts/${postId}`, { method: "DELETE" }),
  toggleLike: (slug, postId) => request(`/communities/${slug}/posts/${postId}/like`, { method: "POST" }),

  // comments
  listComments: (slug, postId) => request(`/communities/${slug}/posts/${postId}/comments`, { auth: false }),
  addComment: (slug, postId, payload) =>
    request(`/communities/${slug}/posts/${postId}/comments`, { method: "POST", body: payload }),
  deleteComment: (slug, postId, commentId) =>
    request(`/communities/${slug}/posts/${postId}/comments/${commentId}`, { method: "DELETE" }),

  // dashboard
  myCommunities: () => request("/me/communities"),
};
