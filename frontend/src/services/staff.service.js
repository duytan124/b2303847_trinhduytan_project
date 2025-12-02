import ApiClient from "./api.service";

class StaffService {
  constructor(baseUrl = "/api/staff") {
    this.api = ApiClient(baseUrl);
  }

  async getAllStaffs() {
    return (await this.api.get("/")).data;
  }

  async getStaff(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  async createStaff(data) {
    return (await this.api.post("/", data)).data;
  }

  async updateStaff(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  async deleteStaff(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  async deleteAllStaffs() {
    return (await this.api.delete("/")).data;
  }

  async login(username, password) {
    try {
      const response = await this.api.post("/login", { username, password });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default StaffService;
