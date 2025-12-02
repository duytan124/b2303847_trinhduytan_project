<script setup>
import { useRouter } from "vue-router";
import { ref, computed } from 'vue';
import { push } from "notivue";

const role = computed(() => sessionStorage.getItem("role"));
const router = useRouter();

const props = defineProps({
    book: {
        type: Object,
        required: true
    }
});

const loading = ref(true);

const goToBorrowBook = (book_id) => {
    if (props.book?.quantity <= 0) {
        push.error("Không thể mượn sách do sách đã hết");
        return;
    }
    router.push({ name: "borrow.add", params: { id: book_id } });
};

const goToEditBook = (book_id) => {
    router.push({ name: "book.edit", params: { id: book_id } });
};

const goToLogin = () => {
    push.info("Vui lòng đăng nhập trước khi mượn sách!!")
    router.push('/login');
}

const goToBookDetail = (book_id) => {
    router.push({ name: "book.detail", params: { id: book_id } })
}

</script>

<template>
    <div
        class="flex flex-col bg-white rounded-xl shadow-md overflow-hidden transition-transform transform md:hover:shadow-xl">

        <div class="relative h-48 w-full bg-gray-100">
            <div v-if="loading" class="absolute inset-0 animate-pulse bg-gray-200"></div>
            <img :src="`https://picsum.photos/seed/${encodeURIComponent(props.book?.title)}/800`" alt="Book cover"
                @load="loading = false" @error="loading = false"
                :class="['h-full w-full object-cover transition-opacity duration-300', loading ? 'opacity-0' : 'opacity-100']" />
        </div>

        <div class="p-4 flex-1 flex flex-col justify-between">
            <div class="space-y-2">
                <h3 class="text-lg font-semibold text-gray-900 truncate">{{ props.book?.title || "Không xác định" }}
                </h3>
                <p class="text-sm text-gray-500 truncate">thể loại: {{ props.book?.genre || "Không xác định" }}</p>
                <p class="text-sm mb-1 text-gray-600 truncate">tác giả: {{ props.book?.author || "Không xác định" }}</p>
            </div>
            <div>
                <template v-if="props.book?.quantity >= 1">
                    <dd class="text-emerald-600 font-bold sm:col-span-2 truncate">còn {{ props.book?.quantity || "Không xác định" }} quyển sách
                    </dd>
                </template>
                <template v-else>
                    <dd class="text-stone-600 font-bold sm:col-span-2 truncate">Đã hết sách</dd>
                </template>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
                <button v-if="role === 'staff'" @click="goToEditBook(props.book?._id)"
                    class="flex-1 min-w-[120px] py-2 px-4 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition">
                    Chỉnh sửa
                </button>
                <button v-else-if="role === 'user'" @click="goToBorrowBook(props.book?._id)"
                    class="flex-1 min-w-[120px] py-2 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition">
                    Mượn sách
                </button>
                <button v-else @click="goToLogin"
                    class="flex-1 min-w-[120px] py-2 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition">
                    Mượn sách
                </button>
                <button @click="goToBookDetail(props.book?._id)"
                    class="flex-1 min-w-[120px] py-2 px-4 rounded-lg bg-gray-400 text-white font-medium hover:bg-gray-500 transition">
                    Xem chi tiết
                </button>
            </div>  
        </div>
    </div>
</template>