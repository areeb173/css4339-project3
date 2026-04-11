import axios from "axios";

// withCredentials ensures session cookies are sent on every request
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true,
});

/**
 * Extracts a human-readable message from an Axios error.
 * Handles string responses, object responses with a `message` field,
 * and network-level errors.
 */
export function getErrorMessage(error, fallbackMessage = "Something went wrong.") {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  // Some endpoints return { message: "..." } JSON objects
  if (data && typeof data === "object" && typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (!error?.response && error?.message) {
    // Network error — server is likely down
    return "Cannot reach the server. Make sure the backend is running.";
  }

  return error?.message || fallbackMessage;
}

async function unwrap(requestPromise) {
  const response = await requestPromise;
  return response.data;
}

const api = {
  getSessionUser() {
    return unwrap(apiClient.get("/admin/me"));
  },
  login(credentials) {
    return unwrap(apiClient.post("/admin/login", credentials));
  },
  logout() {
    return unwrap(apiClient.post("/admin/logout", {}));
  },
  registerUser(payload) {
    return unwrap(apiClient.post("/user", payload));
  },
  getUsers() {
    return unwrap(apiClient.get("/user/list"));
  },
  getUser(userId) {
    return unwrap(apiClient.get(`/user/${userId}`));
  },
  getPhotos(userId) {
    return unwrap(apiClient.get(`/photosOfUser/${userId}`));
  },
  addComment(photoId, comment) {
    return unwrap(apiClient.post(`/commentsOfPhoto/${photoId}`, { comment }));
  },
};

export default api;
