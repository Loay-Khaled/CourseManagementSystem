import api from "../api/api";

export const enrollmentService = {
  async getAll() {
    const response = await api.get("/enrollments");
    return response.data;
  },

  async enroll(payload) {
    const response = await api.post("/enrollments", payload);
    return response.data;
  },

  async unenroll(id) {
    await api.delete(`/enrollments/${id}`);
  },
};
