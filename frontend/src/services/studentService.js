import api from "../api/api";

export const studentService = {
  async getAll() {
    const response = await api.get("/students");
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post("/students", payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/students/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    await api.delete(`/students/${id}`);
  },
};
