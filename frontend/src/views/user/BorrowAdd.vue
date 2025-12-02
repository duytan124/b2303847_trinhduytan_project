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
const book = ref([]);
const quantity = ref(1);

const { handleSubmit } = useForm({
    validationSchema: borrowSchema,
});

const { value: return_date, errorMessage: return_dateError } = useField("return_date");

const handleCreateBorrow = handleSubmit(async () => {
    try {
        const data = {
            user_id: user_id.value,
            book_id: book_id,
            return_date: return_date.value,
            quantity: quantity.value
        };

        await borrowService.createBorrow(data);
        push.success("Tạo đơn mượn sách thành công");
        router.push("/");
    } catch (error) {
        console.log(error);
        if (error.response.status === 422) {
            push.warning("Bạn đang mượn cuốn này và chưa trả");
        }
        else if (error.response.status === 409) {
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

                    <label class="label" for="borrow_date">Ngày mượn</label>
                    <input type="date" class="input" id="borrow_date" readonly
                        :value="new Date().toISOString().slice(0, 10)">

                    <label class="label" for="return_date">Ngày trả sách</label>
                    <input v-model="return_date" type="date" class="input" id="return_date" />
                    <span class="text-red-600 text-sm">{{ return_dateError }}</span>

                    <button type="submit" class="btn btn-neutral mt-4 hover:scale-[1.01] text-base">Thêm phiếu
                        mượn</button>

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