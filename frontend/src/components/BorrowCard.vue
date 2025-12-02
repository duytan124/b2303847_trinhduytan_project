<script setup>
import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import BorrowService from "../services/borrow.service";
import BookService from "../services/book.service";
import { push } from "notivue";

const role = computed(() => sessionStorage.getItem("role"));
const staff_id = computed(() => sessionStorage.getItem("id"));
const router = useRouter();
const borrowService = new BorrowService();
const bookService = new BookService();
const emit = defineEmits(["fetchBorrows"]);

const props = defineProps({
    borrow: {
        type: Object,
        required: true,
    },
});

const loading = ref(true);

// === LOGIC GIỮ NGUYÊN ===

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

const handleReturnBook = async () => {
    try {
        await borrowService.updateBorrow(props.borrow._id, { status: "return_pending" });
        push.info("Đang xử lý trả sách");
        emit("fetchBorrows");
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi trả sách");
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
    <div class="flex flex-col bg-white rounded-xl shadow-md overflow-hidden transition-transform md:hover:shadow-xl">

        <!-- IMAGE -->
        <div class="relative h-48 w-full bg-gray-100">
            <div v-if="loading" class="absolute inset-0 animate-pulse bg-gray-200"></div>

            <img :src="`https://picsum.photos/seed/${encodeURIComponent(props.borrow.book_id?.title)}/800`"
                alt="Book cover" @load="loading = false" @error="loading = false" :class="[
                    'h-full w-full object-cover transition-opacity duration-300',
                    loading ? 'opacity-0' : 'opacity-100'
                ]" />
        </div>

        <!-- CONTENT -->
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">

            <!-- BASIC INFO -->
            <div class="space-y-1">
                <h3 class="text-lg font-semibold text-gray-900 truncate">
                    {{ props.borrow.book_id?.title || "Không xác định" }}
                </h3>

                <p class="text-sm text-gray-600 truncate">
                    Người mượn:
                    <span class="font-medium">
                        {{ props.borrow.user_id?.last_name }} {{ props.borrow.user_id?.first_name }}
                    </span>
                </p>

                <p class="text-sm text-gray-600 truncate">
                    Ngày mượn:
                    {{ props.borrow.borrow_date
                    ? new Date(props.borrow.borrow_date).toLocaleDateString("vi-VN")
                    : "Không xác định" }}
                </p>

                <p class="text-sm text-gray-600 truncate">
                    Ngày trả:
                    {{ props.borrow.return_date
                        ? new Date(props.borrow.return_date).toLocaleDateString("vi-VN")
                        : "Không xác định" }}
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

                <!-- Staff Buttons -->
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

                <!-- User Buttons -->
                <template v-else-if="role === 'user'">
                    <button :disabled="props.borrow.status !== 'borrowing'" @click="handleReturnBook"
                        class="py-2 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition disabled:bg-gray-400">
                        Trả sách
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>
