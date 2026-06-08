const TOKEN_KEY = "c4y_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
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
