<script setup>
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";
import InputSearch from "../../components/InputSearch.vue";
import BorrowCard from "../../components/BorrowCard.vue";
import { ref, computed, onMounted } from 'vue';
import BorrowService from "../../services/borrow.service";
const borrowService = new BorrowService();

const id = computed(() => sessionStorage.getItem("id"));

const borrows = ref([]);
const searchText = ref("");
const filteredStatus = ref("");
const filteredStatusText = ref("");

const fetchBorrows = async () => {
    try {
        const response = await borrowService.getAllBorrows();
        borrows.value = response.filter(borrow => borrow.user_id?._id === id.value);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        for (const borrow of borrows.value) {
            const returnDate = new Date(borrow.return_date).setHours(0, 0, 0, 0);
            if ((now > returnDate && borrow.status !== "returned" && borrow.status !== "rejected")) {
                await borrowService.updateBorrow(borrow._id, { status: "overdue" });
            }
        };
    } catch (error) {
        console.error(error);
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

const filteredBorrows = computed(() => {
    let result = borrows.value;

    if (filteredStatus.value) {
        return result.filter(borrow => borrow.status === filteredStatus.value);
    }

    if (searchText.value) {

        const keyword = searchText.value.toLowerCase();

        return borrows.value.filter(borrow => {
            const searchableText = [borrow.book_id?.title]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchableText.includes(keyword);
        });
    }

    return borrows.value;
});

onMounted(async () => {
    fetchBorrows();
    setInterval(() => {
        fetchBorrows();
    }, 3000);
});
</script>

<template>
    <div class="flex flex-col min-h-screen overflow-hidden">
        <Header></Header>
        <div class="flex-grow mx-8 sm:mx-16 lg:mx-24 my-8">
            <div class="flex flex-col sm:flex-row gap-2 justify-center mb-8 w-full">

                <div class="tooltip" data-tip="Tựa sách">
                    <InputSearch class="w-full" v-model="searchText"></InputSearch>
                </div>
                <div class="dropdown dropdown-center flex justify-center">
                    <div tabindex="0" role="button" class="btn bg-base-100 hover:bg-base-300">{{ filteredStatusText ||
                        "Tất cả sách" }}
                    </div>
                    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                        <li><a @click="handleFilterStatus('')">Tất cả sách</a></li>
                        <li><a @click="handleFilterStatus('pending')">Chờ duyệt</a></li>
                        <li><a @click="handleFilterStatus('borrowing')">Đang mượn</a></li>
                        <li><a @click="handleFilterStatus('return_pending')">Chờ duyệt trả</a></li>
                        <li><a @click="handleFilterStatus('returned')">Đã trả</a></li>
                        <li><a @click="handleFilterStatus('rejected')">Từ chối</a></li>
                        <li><a @click="handleFilterStatus('overdue')">Quá hạn</a></li>
                    </ul>
                </div>

            </div>
            <template v-if="filteredBorrows.length > 0">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    <BorrowCard v-for="borrow in filteredBorrows" :key="borrow._id" :borrow="borrow"
                        @fetchBorrows="fetchBorrows">
                    </BorrowCard>
                </div>
            </template>
            <template v-else>
                <div class="grid grid-cols-1 text-center">
                    <p class="py-6 font-bold">Hiện tại chưa có đơn mượn sách</p>
                </div>
            </template>
        </div>
        <Footer></Footer>
    </div>
</template>