<script setup>
import { useRouter } from "vue-router";
import { ref, computed, watch } from "vue";
import BorrowService from "../services/borrow.service";
import BookService from "../services/book.service";
import { push } from "notivue";

const role = computed(() => sessionStorage.getItem("role"));
const staff_id = computed(() => sessionStorage.getItem("id"));
const router = useRouter();
const borrowService = new BorrowService();
const bookService = new BookService();

const emit = defineEmits(["fetchBorrows", "requirePayment"]);

const props = defineProps({
    borrow: {
        type: Object,
        required: true,
    },
});

const loading = ref(true);

// 📌 Mức phí phạt cố định (5.000 VNĐ / 1 ngày quá hạn)
const FINE_PER_DAY = 5000;

// === STATE CỦA MODAL VIETQR ===
const showModal = ref(false);
const fineData = ref(null);

// 📌 LẤY CẤU HÌNH TÀI KHOẢN TỪ FILE .ENV
const bankBin = computed(() => (import.meta.env.VITE_BANK_BIN || '970436').toString().trim());
const accountNo = computed(() => (import.meta.env.VITE_BANK_ACCOUNT || '1040447022').toString().trim());
const bankName = computed(() => (import.meta.env.VITE_BANK_NAME || 'THU VIEN CTU LIBRARY').toString().trim());

// 🎯 Tự động đóng Modal ngay khi trạng thái phiếu mượn thay đổi (Ví dụ: overdue -> return_pending)
watch(() => props.borrow.status, () => {
    if (showModal.value) {
        showModal.value = false;
        push.success("Trạng thái đơn đã cập nhật thành công!");
    }
});

// 1. Logic tính số ngày quá hạn
const overdueDays = computed(() => {
    if (!props.borrow.due_date) return 0;

    const dueDate = new Date(props.borrow.due_date);
    dueDate.setHours(0, 0, 0, 0);

    const checkDate = props.borrow.return_date
        ? new Date(props.borrow.return_date)
        : new Date();
    checkDate.setHours(0, 0, 0, 0);

    const diffTime = checkDate - dueDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
});

// 2. Logic tính tổng tiền phạt
const fineAmount = computed(() => {
    return overdueDays.value * FINE_PER_DAY;
});

// 3. Format hiển thị tiền VNĐ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Không xác định" : date.toLocaleDateString("vi-VN");
};

// 🎯 COMPUTED TẠO LINK VIETQR TỰ ĐỘNG TỪ .ENV
const qrCodeUrl = computed(() => {
    if (!fineData.value || !fineData.value.fine_amount) return '';

    const amount = Math.round(Number(fineData.value.fine_amount) || 0); // Ép về số nguyên
    const borrowId = props.borrow._id || '';
    const addInfo = `NP ${borrowId}`.trim(); // Rút gọn nội dung để tránh lỗi app ngân hàng

    return `https://img.vietqr.io/image/${bankBin.value}-${accountNo.value}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(bankName.value)}`;
});

// === CÁC HÀM XỬ LÝ CỦA THỦ THƯ (STAFF) ===
const handleApproveBook = async () => {
    try {
        if (props.borrow.book_id?.quantity <= 0) {
            push.error("Duyệt sách thất bại do số lượng sách đã hết");
            return;
        }
        await borrowService.updateBorrow(props.borrow._id, { staff_id: staff_id.value });
        await borrowService.updateBorrow(props.borrow._id, { status: "borrowing" });
        await bookService.updateBook(props.borrow.book_id?._id, {
            quantity: props.borrow.book_id?.quantity - 1,
        });
        push.success("Duyệt sách thành công");
        emit("fetchBorrows");
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi duyệt sách");
    }
};

const handleApproveReturnBook = async () => {
    try {
        await borrowService.updateBorrow(props.borrow._id, { staff_id: staff_id.value });
        await borrowService.updateBorrow(props.borrow._id, { status: "returned" });
        await bookService.updateBook(props.borrow.book_id?._id, {
            quantity: props.borrow.book_id?.quantity + 1,
        });
        push.success("Duyệt trả sách thành công");
        emit("fetchBorrows");
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi duyệt trả sách");
    }
};

const handleRejectBook = async () => {
    try {
        await borrowService.updateBorrow(props.borrow._id, { staff_id: staff_id.value });
        await borrowService.updateBorrow(props.borrow._id, { status: "rejected" });
        push.success("Từ chối duyệt sách thành công");
        emit("fetchBorrows");
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi duyệt sách");
    }
};

// 📌 XỬ LÝ NÚT TRẢ SÁCH CỦA ĐỘC GIẢ (USER)
const handleReturnBook = async () => {
    // Trường hợp 1: Sách đã Quá hạn -> Bật Modal VietQR thanh toán
    if (props.borrow.status === 'overdue' || overdueDays.value > 0) {
        fineData.value = {
            _id: props.borrow.fine_id?._id || props.borrow.fine_id || props.borrow._id,
            fine_amount: fineAmount.value,
            late_days: overdueDays.value
        };
        showModal.value = true;
        emit("requirePayment", { borrowId: props.borrow._id, fine: fineData.value });
        return;
    }

    // Trường hợp 2: Trả sách đúng hạn
    try {
        await borrowService.updateBorrow(props.borrow._id, { status: "return_pending" });
        push.success("Đã gửi yêu cầu trả sách thành công");
        emit("fetchBorrows");
    } catch (error) {
        console.error(error);
        push.error("Đã xảy ra lỗi khi gửi yêu cầu trả sách");
    }
};

const handleDeleteBorrow = async (borrow_id) => {
    try {
        if (confirm("Xác nhận xóa đơn mượn sách?")) {
            await borrowService.deleteBorrow(borrow_id);
            push.info("Xóa đơn mượn sách thành công");
            emit("fetchBorrows");
        }
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi xóa đơn mượn sách");
    }
};

const goToEditBorrow = (borrow_id) => {
    router.push({ name: "borrow.edit", params: { id: borrow_id } });
};
</script>

<template>
    <div
        class="flex flex-col bg-white rounded-xl shadow-md overflow-hidden transition-transform md:hover:shadow-xl border border-gray-100">

        <!-- IMAGE -->
        <div class="relative h-48 w-full bg-gray-100">
            <div v-if="loading" class="absolute inset-0 animate-pulse bg-gray-200"></div>

            <img :src="`https://picsum.photos/seed/${encodeURIComponent(props.borrow.book_id?.title || 'book')}/800`"
                alt="Book cover" @load="loading = false" @error="loading = false" :class="[
                    'h-full w-full object-cover transition-opacity duration-300',
                    loading ? 'opacity-0' : 'opacity-100'
                ]" />
        </div>

        <!-- CONTENT -->
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">

            <!-- BASIC INFO -->
            <div class="space-y-1">
                <h3 class="text-lg font-semibold text-gray-900 truncate" :title="props.borrow.book_id?.title">
                    {{ props.borrow.book_id?.title || "Không xác định" }}
                </h3>

                <p class="text-sm text-gray-600 truncate">
                    Người mượn:
                    <span class="font-medium text-gray-800">
                        {{ props.borrow.user_id?.last_name }} {{ props.borrow.user_id?.first_name }}
                    </span>
                </p>

                <p class="text-sm text-gray-600 truncate">
                    Ngày mượn:
                    <span class="font-medium text-gray-800">{{ formatDate(props.borrow.borrow_date) }}</span>
                </p>

                <p class="text-sm text-gray-600 truncate">
                    Hạn trả:
                    <span class="font-medium text-blue-600">{{ formatDate(props.borrow.due_date) }}</span>
                </p>

                <p v-if="props.borrow.return_date" class="text-sm text-gray-600 truncate">
                    Ngày trả thực tế:
                    <span class="font-medium text-emerald-600">{{ formatDate(props.borrow.return_date) }}</span>
                </p>

                <p class="text-sm text-gray-600 truncate">
                    Trạng thái:
                    <span :class="{
                        'text-amber-500': props.borrow.status === 'pending',
                        'text-sky-500': props.borrow.status === 'borrowing',
                        'text-amber-500': props.borrow.status === 'return_pending',
                        'text-emerald-500': props.borrow.status === 'returned',
                        'text-red-600': ['rejected', 'overdue'].includes(props.borrow.status),
                    }" class="font-bold">
                        {{
                            {
                                pending: "Chờ duyệt",
                                borrowing: "Đang mượn",
                                return_pending: "Chờ duyệt trả",
                                returned: "Đã trả",
                                rejected: "Từ chối",
                                overdue: "Quá hạn"
                            }[props.borrow.status] || "Không xác định"
                        }}
                    </span>
                </p>

                <!-- KHU VỰC HIỂN THỊ TIỀN PHẠT QUÁ HẠN -->
                <div v-if="overdueDays > 0"
                    class="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1">
                    <p class="text-red-700 font-semibold flex justify-between">
                        <span>⚠️ Số ngày quá hạn:</span>
                        <span>{{ overdueDays }} ngày</span>
                    </p>
                    <p class="text-red-700 font-bold flex justify-between text-sm">
                        <span>Phạt quá hạn:</span>
                        <span>{{ formatCurrency(fineAmount) }}</span>
                    </p>
                </div>
            </div>

            <!-- QUANTITY -->
            <div>
                <template v-if="props.borrow.book_id?.quantity >= 1">
                    <p class="text-emerald-600 font-bold truncate">
                        Còn {{ props.borrow.book_id.quantity }} quyển
                    </p>
                </template>
                <template v-else>
                    <p class="text-stone-600 font-bold truncate">Đã hết sách</p>
                </template>
            </div>

            <!-- BUTTONS -->
            <div class="mt-4 flex flex-col gap-2">
                <template v-if="role === 'staff'">
                    <button v-if="props.borrow.status === 'pending'" @click="handleApproveBook"
                        class="py-2 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition">
                        Duyệt sách
                    </button>

                    <button v-if="props.borrow.status === 'pending'" @click="handleRejectBook"
                        class="py-2 px-4 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition">
                        Từ chối
                    </button>

                    <button v-if="props.borrow.status === 'return_pending'" @click="handleApproveReturnBook"
                        class="py-2 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition">
                        Duyệt trả sách
                    </button>

                    <button v-if="['returned', 'rejected', 'overdue'].includes(props.borrow.status)"
                        @click="handleDeleteBorrow(props.borrow._id)"
                        class="py-2 px-4 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition">
                        Xóa đơn mượn
                    </button>

                    <button @click="goToEditBorrow(props.borrow._id)"
                        class="py-2 px-4 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition">
                        Chỉnh sửa
                    </button>
                </template>

                <template v-else-if="role === 'user'">
                    <button :disabled="!['borrowing', 'overdue'].includes(props.borrow.status)"
                        @click="handleReturnBook"
                        class="py-2 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition disabled:bg-gray-400">
                        Trả sách
                    </button>
                </template>
            </div>
        </div>
    </div>

    <!-- 🎯 MODAL VIETQR THANH TOÁN TỰ ĐỘNG -->
    <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <div class="bg-white p-6 rounded-2xl max-w-md w-full text-center shadow-2xl border border-gray-100">
                <h3 class="font-bold text-xl text-red-600 mb-1">Thanh Toán Phạt Quá Hạn</h3>
                <p class="text-xs text-gray-500 mb-3">
                    Vui lòng quét mã QR bên dưới để nộp phạt. Hệ thống sẽ **tự động ghi nhận** và cập nhật ngay khi nhận
                    được thanh toán.
                </p>

                <!-- MÃ QR ĐỘNG -->
                <div class="flex justify-center mb-3">
                    <img :src="qrCodeUrl" alt="Mã VietQR Thanh Toán"
                        class="w-64 h-64 object-contain rounded-xl border p-2 bg-white shadow-inner" />
                </div>

                <!-- THÔNG TIN PHẠT -->
                <div class="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <p class="text-red-700 font-bold text-base">
                        Số tiền phạt: {{ formatCurrency(fineData?.fine_amount) }}
                    </p>
                    <p class="text-xs text-red-600 mt-1">
                        Thời gian trễ: <strong>{{ fineData?.late_days }} ngày</strong>
                    </p>
                </div>

                <!-- CÁC NÚT THAO TÁC -->
                <div class="flex justify-center">
                    <button
                        class="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                        @click="showModal = false">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>