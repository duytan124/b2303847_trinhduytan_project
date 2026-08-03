<script setup>
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";
import InputSearch from "../../components/InputSearch.vue";
import BorrowCard from "../../components/BorrowCard.vue";
import { useRouter } from "vue-router";
import { ref, computed, onMounted, onUnmounted } from 'vue';
import BorrowService from "../../services/borrow.service";
import BookService from "../../services/book.service";
import { push } from "notivue";

const router = useRouter();
const borrowService = new BorrowService();
const bookService = new BookService();

const role = computed(() => sessionStorage.getItem("role"));
const staff_id = computed(() => sessionStorage.getItem("id"));

const borrows = ref([]);
const searchText = ref("");
const filteredStatus = ref("");
const filteredStatusText = ref("");

let timerId = null;
let isProcessingAutoReturn = false; // Cờ khóa chống race-condition khi setInterval chạy mỗi 3 giây

// 1. LẤY DỮ LIỆU PHIẾU MƯỢN
const fetchBorrows = async () => {
    try {
        const response = await borrowService.getAllBorrows();

        // Sắp xếp đơn mượn mới nhất lên đầu
        const sortedBorrows = (response || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        borrows.value = sortedBorrows;

        // Kích hoạt kiểm tra & tự động duyệt trả các đơn hợp lệ
        await autoApprovePaidBorrows();
    } catch (error) {
        console.error("Lỗi khi tải danh sách phiếu mượn:", error);
    }
};

// 2. TỰ ĐỘNG DUYỆT TRẢ SÁCH VÀ CẬP NHẬT TRẠNG THÁI
const autoApprovePaidBorrows = async () => {
    // Tránh gửi trùng lặp request khi hàm trước chưa chạy xong
    if (isProcessingAutoReturn) return;
    isProcessingAutoReturn = true;

    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        for (const borrow of borrows.value) {
            // A. Tự động chuyển đơn quá hạn nếu quá due_date
            if (borrow.due_date && borrow.status === "borrowing") {
                const dueDate = new Date(borrow.due_date);
                dueDate.setHours(0, 0, 0, 0);

                if (now > dueDate) {
                    try {
                        await borrowService.updateBorrow(borrow._id, { status: "overdue" });
                        borrow.status = "overdue";
                    } catch (err) {
                        console.error(`Lỗi cập nhật quá hạn [${borrow._id}]:`, err);
                    }
                }
            }

            // B. ĐIỀU KIỆN TỰ ĐỘNG DUYỆT TRẢ SÁCH (Tránh triệt để lỗi 402):
            // Lấy trạng thái khoản phạt (nếu fine_id đã được populate)
            const fineObj = typeof borrow.fine_id === "object" ? borrow.fine_id : null;
            const fineStatus = fineObj?.status; // "paid" hoặc "unpaid"

            // ĐIỀU KIỆN DUYỆT:
            // 1. Trường hợp có phạt: Khoản phạt BẮT BUỘC phải là "paid"
            // 2. Trường hợp không phạt: Đơn đang ở trạng thái "return_pending" (Chờ duyệt trả)
            const isFinePaid = fineStatus === "paid";
            const isNoFinePending = !borrow.fine_id && borrow.status === "return_pending";

            const isEligibleToReturn = (isFinePaid || isNoFinePending) && borrow.status !== "returned";

            if (isEligibleToReturn) {
                try {
                    // 1. Cập nhật trạng thái phiếu mượn thành "returned"
                    await borrowService.updateBorrow(borrow._id, {
                        status: "returned",
                        staff_id: staff_id.value || borrow.staff_id?._id
                    });

                    // 2. Cộng +1 lại số lượng sách vào kho
                    const bookId = borrow.book_id?._id || borrow.book_id;
                    if (bookId) {
                        const currentQty = borrow.book_id?.quantity || 0;
                        await bookService.updateBook(bookId, {
                            quantity: currentQty + 1
                        });

                        if (typeof borrow.book_id === "object") {
                            borrow.book_id.quantity = currentQty + 1;
                        }
                    }

                    // 3. Đánh dấu trạng thái mới tại client & thông báo
                    borrow.status = "returned";
                    push.success(`Đã tự động duyệt trả sách: "${borrow.book_id?.title || 'Đơn mượn'}"`);
                } catch (autoErr) {
                    console.error(`Lỗi tự động duyệt trả [${borrow._id}]:`, autoErr);
                }
            }
        }
    } finally {
        isProcessingAutoReturn = false;
    }
};

const handleFilterStatus = (status) => {
    filteredStatus.value = status;
    switch (status) {
        case "pending":
            filteredStatusText.value = "Chờ duyệt";
            break;
        case "return_pending":
            filteredStatusText.value = "Chờ duyệt trả";
            break;
        case "borrowing":
            filteredStatusText.value = "Đang mượn";
            break;
        case "returned":
            filteredStatusText.value = "Đã trả";
            break;
        case "rejected":
            filteredStatusText.value = "Từ chối";
            break;
        case "overdue":
            filteredStatusText.value = "Quá hạn";
            break;
        default:
            filteredStatusText.value = "Tất cả sách";
            break;
    }
};

// Combined filter: Lọc đồng thời cả Trạng thái và Từ khóa tìm kiếm
const filteredBorrows = computed(() => {
    let result = borrows.value;

    if (filteredStatus.value) {
        result = result.filter(borrow => borrow.status === filteredStatus.value);
    }

    if (searchText.value.trim()) {
        const keyword = searchText.value.toLowerCase().trim();
        result = result.filter(borrow => {
            const searchableText = [
                borrow.book_id?.title,
                borrow.user_id?.first_name,
                borrow.user_id?.last_name,
                borrow.staff_id?.name
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchableText.includes(keyword);
        });
    }

    return result;
});

// Duyệt hàng loạt các đơn mượn sách mới (pending)
const handleApproveAllBorrows = async () => {
    try {
        const pendingBorrows = borrows.value.filter(borrow => borrow.status === "pending");

        for (const borrow of pendingBorrows) {
            if (borrow.book_id?.quantity > 0) {
                await borrowService.updateBorrow(borrow._id, {
                    staff_id: staff_id.value,
                    status: "borrowing"
                });
                await bookService.updateBook(borrow.book_id?._id, {
                    quantity: borrow.book_id?.quantity - 1
                });
            } else {
                push.error("Không thể duyệt tất cả sách do có sách đã hết");
                return;
            }
        }

        push.success("Đã duyệt tất cả các đơn mượn chờ xử lý");
        fetchBorrows();
    } catch (error) {
        console.error(error);
        push.error("Đã xảy ra lỗi trong quá trình duyệt các đơn mượn");
    }
};

onMounted(() => {
    if (role.value !== "staff") {
        router.push("/");
        return;
    }
    fetchBorrows();
    timerId = setInterval(() => {
        fetchBorrows();
    }, 3000);
});

onUnmounted(() => {
    if (timerId) {
        clearInterval(timerId);
    }
});
</script>

<template>
    <div class="flex flex-col min-h-screen overflow-hidden">
        <Header></Header>

        <div class="flex-grow mx-8 sm:mx-16 lg:mx-24 my-8">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-1 lg:gap-8">

                <!-- Thanh tìm kiếm & bộ lọc cho thủ thư -->
                <div class="grid grid-cols-1 place-items-center">
                    <div class="flex flex-col sm:flex-row justify-center gap-2 w-full">
                        <div class="tooltip" data-tip="Người mượn, nhân viên duyệt, tựa sách">
                            <InputSearch class="w-full" v-model="searchText"></InputSearch>
                        </div>

                        <template v-if="role === 'staff'">
                            <button class="btn btn-neutral hover:btn-success hover:text-white hover:scale-[1.01]"
                                @click="handleApproveAllBorrows">
                                Duyệt tất cả đơn mới
                            </button>

                            <div class="dropdown dropdown-center flex justify-center">
                                <div tabindex="0" role="button" class="btn bg-base-100 hover:bg-base-300">
                                    {{ filteredStatusText || "Tất cả sách" }}
                                </div>
                                <ul tabindex="0"
                                    class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                    <li><a @click="handleFilterStatus('')">Tất cả sách</a></li>
                                    <li><a @click="handleFilterStatus('pending')">Chờ duyệt</a></li>
                                    <li><a @click="handleFilterStatus('borrowing')">Đang mượn</a></li>
                                    <li><a @click="handleFilterStatus('return_pending')">Chờ duyệt trả</a></li>
                                    <li><a @click="handleFilterStatus('returned')">Đã trả</a></li>
                                    <li><a @click="handleFilterStatus('rejected')">Từ chối</a></li>
                                    <li><a @click="handleFilterStatus('overdue')">Quá hạn</a></li>
                                </ul>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Danh sách phiếu mượn -->
                <template v-if="filteredBorrows.length > 0">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        <BorrowCard v-for="borrow in filteredBorrows" :key="borrow._id" :borrow="borrow"
                            @fetchBorrows="fetchBorrows">
                        </BorrowCard>
                    </div>
                </template>

                <template v-else>
                    <div class="grid grid-cols-1 text-center">
                        <p class="py-6 font-bold text-gray-500">Hiện tại không có đơn mượn sách cần duyệt</p>
                    </div>
                </template>

            </div>
        </div>

        <Footer></Footer>
    </div>
</template>