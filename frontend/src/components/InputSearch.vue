<script setup>
import { watch } from 'vue';

// 1. v-model 2 chiều để liên kết văn bản hiển thị tức thì trên màn hình
const searchText = defineModel();

// 2. Định nghĩa emit sự kiện 'search' trả từ khóa đã debounce ra ngoài cho API Redis
const emit = defineEmits(['search']);

// Hàm Debounce tự dựng
function debounce(fn, delay = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Trì hoãn gửi sự kiện tìm kiếm
const debouncedEmitSearch = debounce((val) => {
    emit('search', val);
}, 400);

// Theo dõi thay đổi của v-model để tự động kích hoạt Debounce
watch(searchText, (newVal) => {
    debouncedEmitSearch(newVal);
});
</script>

<template>
    <label class="input">
        <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
            </g>
        </svg>
        <input v-model="searchText" type="search" placeholder="Nhập từ khóa để tìm kiếm..."
            @keydown.enter="emit('search', searchText)" />
    </label>
</template>