import api from "../api/api";

export const authService = {
  async login(payload) {
    const response = await api.post("/auth/login", payload);
    return response.data;
  },

  async register(payload) {
    const response = await api.post("/auth/register", payload);
    return response.data;
  },

  async refresh(refreshToken) {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  async logout(refreshToken) {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data;
  },
};
