import api from "./api.service"; // Hoặc axios instance đã cấu hình baseURL của bạn

class FineService {
    async payFine(id) {
        return (await api.patch(`/fines/${id}/pay`)).data;
    }
}

export default new FineService();