<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

import { ref, onMounted } from 'vue';
import BookService from '../services/book.service';
import { useRoute } from 'vue-router';

const bookService = new BookService();
const route = useRoute();
const book = ref({});
const book_id = route.params.id;

onMounted(async () => {
    try {
        const bookData = await bookService.getBook(book_id);
        book.value = bookData;
        console.log(book.value);
    } catch (error) {
        console.error(error);
    }
});
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Header />
        <main class="flex-grow container mx-auto py-10 px-4">
            <div v-if="loading" class="flex justify-center items-center h-96">
                <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-green-400"></div>
            </div>

            <!-- Book detail -->
            <div v-else class="bg-white rounded-2xl shadow-lg overflow-hidden p-6 lg:p-8">
                <div class="grid lg:grid-cols-[300px_1fr] gap-8 items-start">

                    <!-- Book cover -->
                    <div class="flex justify-center">
                        <img :src="`https://picsum.photos/seed/${encodeURIComponent(book?.title || 'default')}/600/900`"
                            :alt="book.title"
                            class="w-full max-w-[300px] aspect-[2/3] object-cover rounded-xl shadow-lg" />
                    </div>

                    <!-- Book info -->
                    <div class="space-y-6">
                        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900">{{ book.title }}</h1>

                        <div class="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                            <div class="flex justify-between p-4 hover:bg-gray-50">
                                <span class="text-gray-600 font-medium">Tác giả</span>
                                <span class="text-gray-900">{{ book?.author || 'Chưa xác định' }}</span>
                            </div>
                            <div class="flex justify-between p-4 hover:bg-gray-50">
                                <span class="text-gray-600 font-medium">Thể loại</span>
                                <span class="text-gray-900">{{ book?.genre || 'Chưa xác định' }}</span>
                            </div>
                            <div class="flex justify-between p-4 hover:bg-gray-50">
                                <span class="text-gray-600 font-medium">Nhà xuất bản</span>
                                <span class="text-gray-900">{{ book?.publisher_id?.name || 'Chưa xác định' }}</span>
                            </div>
                            <div class="flex justify-between p-4 hover:bg-gray-50">
                                <span class="text-gray-600 font-medium">Năm xuất bản</span>
                                <span class="text-gray-900">{{ book?.published_year || 'Chưa xác định' }}</span>
                            </div>
                            <div class="flex justify-between p-4 hover:bg-gray-50">
                                <span class="text-gray-600 font-medium">Số lượng</span>
                                <span class="text-gray-900">{{ book?.quantity || 'Chưa xác định' }}</span>
                            </div>
                            <div class="flex justify-between p-4 hover:bg-gray-50">
                                <span class="text-gray-600 font-medium">Giá tiền</span>
                                <span class="text-gray-900 font-semibold">{{ book?.price || 'Chưa xác định' }}$</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
</template>
