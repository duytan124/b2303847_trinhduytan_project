    <template>
        <div class="flex flex-col min-h-screen text-sm">
            <Header />
            <main class="flex-grow-1 py-5">
                <div class="container">
                    <!-- Tiêu đề & Nút tải lại -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4 class="fw-bold text-dark mb-0">
                            <i class="bi bi-card-list text-primary me-2"></i> Danh Sách Đơn Quá Hạn
                        </h4>
                        <button class="btn btn-outline-primary btn-sm" @click="fetchFineReport" :disabled="loading">
                            <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i> Làm mới
                        </button>
                    </div>

                    <!-- Bảng Dữ Liệu -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-0 table-responsive">

                            <div v-if="loading" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status"></div>
                            </div>

                            <table v-else class="table table-hover align-middle mb-0">
                                <thead class="table-light text-secondary">
                                    <tr>
                                        <th class="ps-4" style="width: 50px;">STT</th>
                                        <th>Người Mượn</th>
                                        <th class="text-center">Số Ngày Quá Hạn</th>
                                        <th class="text-end pe-4">Số Tiền Phạt</th>
                                    </tr>
                                </thead>

                                <tbody v-if="overdueFines.length > 0">
                                    <tr v-for="(item, index) in overdueFines" :key="item._id || index">
                                        <td class="ps-4 text-muted">{{ index + 1 }}</td>
                                        <td class="fw-medium">{{ getUserName(item.user_id) }}</td>
                                        <td class="text-center">
                                            <span class="badge bg-danger-subtle text-danger rounded-pill px-2">
                                                {{ item.overdue_days || 0 }} ngày
                                            </span>
                                        </td>
                                        <td class="text-end pe-4 fw-bold text-danger">
                                            {{ formatCurrency(item.amount) }}
                                        </td>
                                    </tr>
                                </tbody>

                                <tbody v-else>
                                    <tr>
                                        <td colspan="4" class="text-center py-5 text-muted">
                                            <i class="bi bi-check2-circle fs-2 d-block mb-2 text-success"></i>
                                            Không có đơn nào quá hạn cần xử lý.
                                        </td>
                                    </tr>
                                </tbody>

                                <!-- TỔNG KẾT DƯỚI CÙNG -->
                                <tfoot v-if="overdueFines.length > 0" class="bg-light-subtle fw-bold border-top-2">
                                    <tr>
                                        <!-- GÓC TRÁI: Dùng text-start để canh trái và colspan="3" để đẩy cột tiền sang tít bên phải -->
                                        <td colspan="3" class="text-start ps-4 fs-6 py-3">
                                            Tổng cộng: {{ stats.totalOverdueCount }} đơn
                                        </td>

                                        <!-- GÓC PHẢI: Giữ nguyên text-end để canh lề phải -->
                                        <td class="text-end pe-4 fs-5 text-danger py-3">
                                            {{ formatCurrency(stats.totalFineAmount) }}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    </template>

    <script setup>
    import { ref, computed, onMounted, onUnmounted } from 'vue'; // Đã thêm onUnmounted
    import axios from 'axios';
    import Header from '../../components/Header.vue';
    import Footer from '../../components/Footer.vue';

    const allData = ref([]);
    const loading = ref(false);
    let pollingInterval = null; // Biến lưu trữ ID của bộ đếm thời gian

    const stats = ref({
        totalOverdueCount: 0,
        totalFineAmount: 0
    });

    // Lọc ra các đơn quá hạn (chưa thanh toán)
    const overdueFines = computed(() => {
        return allData.value.filter(item => item.status === 'unpaid' || !item.return_date);
    });

    // Gọi API lấy dữ liệu
    const fetchFineReport = async () => {
        // Chỉ hiện loading nếu danh sách đang rỗng để tránh chớp màn hình khi tự động refresh ngầm
        if (allData.value.length === 0) {
            loading.value = true;
        }
        
        try {
            const response = await axios.get('/api/fines/report');

            // Gán dữ liệu (Hỗ trợ cả 2 dạng API trả về)
            if (response.data.fines) {
                allData.value = response.data.fines;
            } else {
                allData.value = response.data;
            }

            calculateStats();
        } catch (error) {
            console.error("Lỗi khi tải báo cáo phạt:", error);
        } finally {
            loading.value = false;
        }
    };

    // Tính toán tổng số lượng và tiền phạt
    const calculateStats = () => {
        stats.value.totalOverdueCount = overdueFines.value.length;
        stats.value.totalFineAmount = overdueFines.value.reduce((sum, item) => sum + (item.amount || 0), 0);
    };

    // Helpers định dạng
    const formatCurrency = (val) => {
        if (!val) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
    };

    const getUserName = (user) => {
        if (!user) return 'N/A';
        if (user.first_name || user.last_name) return `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return user.username || user.email || 'Khách vãng lai';
    };

    onMounted(() => {
        // 1. Gọi ngay khi vừa vào trang
        fetchFineReport();

        // 2. Thiết lập tự động gọi API mỗi 60 giây (60000 ms)
        pollingInterval = setInterval(() => {
            fetchFineReport();
        }, 60000);
    });

    // 3. Dọn dẹp Interval khi rời khỏi trang để tránh lỗi memory leak
    onUnmounted(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
    });
    </script>

    <style scoped>
    .border-top-2 {
        border-top: 2px solid #dee2e6 !important;
    }

    .spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    </style>