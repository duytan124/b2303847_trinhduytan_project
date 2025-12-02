<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';

import PublisherService from '../../services/publisher.service';
import BookService from "../../services/book.service";
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { push } from 'notivue';
import { useForm, useField } from "vee-validate";
import { bookSchema } from '../../validations/book.validation';

const bookService = new BookService();
const publisherService = new PublisherService();
const router = useRouter();
const role = computed(() => sessionStorage.getItem("role"));

const { handleSubmit } = useForm({
    validationSchema: bookSchema,
    initialValues: {
        title: "",
        genre: "",
        author: "",
        price: undefined,
        published_year: undefined,
        quantity: undefined,
        publisher_id: "",
    }
});

const { value: title, errorMessage: titleError } = useField("title");
const { value: author, errorMessage: authorError } = useField("author");
const { value: genre, errorMessage: genreError } = useField("genre");
const { value: price, errorMessage: priceError } = useField("price");
const { value: published_year, errorMessage: published_yearError } = useField("published_year");
const { value: publisher_id, errorMessage: publisher_idError } = useField("publisher_id");
const { value: quantity, errorMessage: quantityError } = useField("quantity");

const publishers = ref([]);

const fetchPublishers = async () => {
    try {
        const publishers_data = await publisherService.getAllPublishers();
        publishers.value = publishers_data;
    } catch (error) {
        console.log(error);
    }
};

const handleCreateBook = handleSubmit(async (values) => {
    try {
        await bookService.createBook(values);
        push.success("Thêm sách thành công");
        router.push("/");
    } catch (error) {
        console.log(error);
        if (error.response.status === 400) {
            push.error("Vui lòng điền thông tin");
            return;
        } else {
            push.error("Đã xảy ra lỗi khi thêm sách");
        }
    }
});

onMounted(async () => {
    if (role.value !== "staff") {
        router.push("/");
    }
    fetchPublishers();
});
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Header></Header>
        <div class="flex flex-grow justify-center items-center">
            <form @submit.prevent="handleCreateBook">
                <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 text-base">
                    <legend class="fieldset-legend text-xl">Thêm mới sách</legend>
                    <label class="label" for="title">Tựa sách</label>
                    <input v-model="title" type="text" class="input" id="title" placeholder="Nhập tựa sách" />
                    <span class="text-sm text-red-600">{{ titleError }}</span>

                    <label class="label" for="author">Tác giả</label>
                    <input v-model="author" type="text" class="input" id="author" placeholder="Nhập tác giả" />
                    <span class="text-sm text-red-600">{{ authorError }}</span>

                    <label class="label" for="genre">Thể loại</label>
                    <select v-model="genre" class="select" id="genre">
                        <option disabled value="">Chọn thể loại</option>
                        <option value="Văn học">Văn học</option>
                        <option value="Khoa học">Khoa học</option>
                        <option value="Kinh tế">Kinh tế</option>
                        <option value="Lịch sử">Lịch sử</option>
                    </select>
                    <span class="text-sm text-red-600">{{ genreError }}</span>

                    <label class="label" for="publisher">Nhà xuất bản</label>
                    <select v-model="publisher_id" class="select" id="publisher">
                        <option disabled value="">Chọn nhà xuất bản</option>
                        <option v-for="publisher in publishers" :key="publisher._id" :value="publisher._id">
                            {{ publisher.name }}
                        </option>
                    </select>
                    <span class="text-sm text-red-600">{{ publisher_idError }}</span>

                    <label class="label" for="published_year">Năm xuất bản</label>
                    <input v-model="published_year" type="number" class="input" id="published_year"
                        placeholder="Nhập năm xuất bản" />
                    <span class="text-sm text-red-600">{{ published_yearError }}</span>

                    <label class="label" for="price">Đơn giá</label>
                    <input v-model="price" type="number" class="input" id="price" placeholder="Nhập đơn giá" />
                    <span class="text-sm text-red-600">{{ priceError }}</span>

                    <label class="label" for="quantity">Số lượng</label>
                    <input v-model="quantity" type="number" class="input" id="quantity" placeholder="Nhập số lượng" />
                    <span class="text-sm text-red-600">{{ quantityError }}</span>

                    <button type="submit"
                        class="btn btn-neutral mt-4 hover:scale-[1.01] hover:btn-info hover:text-white text-base">Thêm
                        sách</button>

                    <span class="mt-4">
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