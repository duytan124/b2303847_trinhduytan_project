<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BookService from '../../services/book.service';
import BorrowService from '../../services/borrow.service';
import { push } from 'notivue';
import { useForm, useField } from "vee-validate";
import { borrowSchema } from '../../validations/borrow.validation';

const bookService = new BookService();
const borrowService = new BorrowService();

const route = useRoute();
const router = useRouter();

const user_id = computed(() => sessionStorage.getItem("id"));
const book_id = route.params.id;
const book = ref({});
const quantity = ref(1);

// 📌 1. Hàm format hiển thị ngày/tháng/năm (DD/MM/YYYY) cho giao diện
const formatDateVN = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// 📌 2. Hàm format YYYY-MM-DD chuẩn để gửi lên Backend
const formatDateISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 📌 Tự động tính Ngày mượn (Hôm nay) và Hạn trả (+5 ngày)
const today = new Date();
const borrow_date_iso = formatDateISO(today);
const borrow_date_vn = formatDateVN(today);

const futureDate = new Date();
futureDate.setDate(today.getDate() + 5);
const due_date_iso = formatDateISO(futureDate);
const due_date_vn = formatDateVN(futureDate);

const { handleSubmit } = useForm({
    validationSchema: borrowSchema,
    initialValues: {
        due_date: due_date_iso // Khởi tạo ISO cho VeeValidate
    }
});

const { value: due_date } = useField("due_date", undefined, {
    initialValue: due_date_iso
});

const handleCreateBorrow = handleSubmit(async () => {
    try {
        const data = {
            user_id: user_id.value,
            book_id: book_id,
            borrow_date: borrow_date_iso,
            due_date: due_date.value, // Gửi YYYY-MM-DD lên Backend
            quantity: quantity.value
        };

        await borrowService.createBorrow(data);
        push.success("Tạo đơn mượn sách thành công");
        router.push("/");
    } catch (error) {
        console.log(error);
        if (error.response?.status === 422) {
            push.warning("Bạn đang mượn cuốn này và chưa trả");
        }
        else if (error.response?.status === 409) {
            push.warning("Bạn chỉ có thể mượn tối đa 3 quyển sách");
        }
        else {
            push.error("Đã có lỗi xảy ra trong quá trình tạo đơn mượn");
        }
    }
});

onMounted(async () => {
    try {
        const book_data = await bookService.getBook(book_id);
        book.value = book_data;
    } catch (error) {
        console.log(error);
    }
});
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Header></Header>
        <div class="flex flex-grow justify-center items-center">
            <form @submit.prevent="handleCreateBorrow">
                <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 text-base">
                    <legend class="fieldset-legend text-xl">Thêm đơn mượn sách</legend>

                    <label class="label" for="title">Tựa sách</label>
                    <input type="text" class="input" id="title" readonly :value="book.title" />

                    <label class="label" for="author">Tác giả</label>
                    <input type="text" class="input" id="author" readonly :value="book.author">

                    <label class="label" for="publisher">Tên nhà xuất bản</label>
                    <input type="text" class="input" id="publisher" readonly :value="book.publisher_id?.name">

                    <label class="label" for="quantity">Số quyển</label>
                    <input v-model="quantity" type="number" class="input" id="quantity" readonly value="1" />

                    <!-- Ngày mượn (Hiển thị dd/mm/yyyy) -->
                    <label class="label" for="borrow_date">Ngày mượn</label>
                    <input type="text" class="input" id="borrow_date" readonly :value="borrow_date_vn">

                    <label class="label" for="due_date">Hạn trả sách chậm nhất</label>
                    <input type="text" class="input bg-gray-100 font-semibold text-blue-600" id="due_date" readonly
                        :value="due_date_vn" />

                    <button type="submit" class="btn btn-neutral mt-4 hover:scale-[1.01] text-base">
                        Thêm phiếu mượn
                    </button>

                    <span class="mt-8">
                        <strong class="hover:underline">
                            <RouterLink to="/" class="text-base">Quay lại</RouterLink>
                        </strong>
                    </span>
                </fieldset>
            </form>
        </div>
        <Footer></Footer>
    </div>
</template>