import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true,
});

export function getErrorMessage(error, fallbackMessage = "Something went wrong.") {
  if (typeof error?.response?.data === "string" && error.response.data.trim()) {
    return error.response.data;
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
