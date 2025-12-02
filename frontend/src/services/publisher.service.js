import ApiClient from "./api.service";

class PublisherService {
  constructor(baseUrl = "/api/publisher") {
    this.api = ApiClient(baseUrl);
  }

  async getAllPublishers() {
    return (await this.api.get("/")).data;
  }

  async getPublisherById(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  async createPublisher(data) {
    return (await this.api.post("/", data)).data;
  }

  async updatePublisher(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  async deletePublisher(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  async deleteAllPublishers() {
    return (await this.api.delete("/")).data;
  }
}

export default PublisherService;
