import api from "../api/api";

export const courseService = {
  async getAll() {
    const response = await api.get("/courses");
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  async getEnrolledStudents(id) {
    const response = await api.get(`/courses/${id}/students`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post("/courses", payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/courses/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    await api.delete(`/courses/${id}`);
  },
};
