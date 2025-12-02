<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import InputSearch from '../../components/InputSearch.vue';

import PublisherService from "../../services/publisher.service";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { push } from 'notivue';

const publisherService = new PublisherService();
const router = useRouter();
const publishers = ref([]);
const searchText = ref("");
const role = computed(() => sessionStorage.getItem("role"));

const props = defineProps({
    publisher: {
        type: Object,
        required: true
    }
});

const fetchPublishers = async () => {
    try {
        const response = await publisherService.getAllPublishers();
        publishers.value = response;
    } catch (error) {
        console.error(error);
    }
};

const searchFilteredPublishers = computed(() => {
    if (!searchText.value) return publishers.value;

    const keyword = searchText.value.toLowerCase();

    return publishers.value.filter(publisher => {
        const searchableText = [publisher.name, publisher.phone, publisher.address]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(keyword);
    });
});

const goToAddPublisher = () => {
    router.push({ name: "publisher.add" });
};

const handleDeleteAllPublishers = async () => {
    try {
        if (confirm("Xác nhận xóa tất cả nhà xuất bản?")) {
            await publisherService.deleteAllPublishers();
            push.success("Xóa tất cả nhà xuất bản thành công");
            fetchPublishers();
        }
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi xóa tất cả nhà xuất bản");
    }
};

const goToEditPublisher = (publisher_id) => {
    router.push({ name: "publisher.edit", params: { id: publisher_id } });
}

onMounted(async () => {
    if (role.value !== "staff") {
        router.push("/");
    }
    fetchPublishers();
});
</script>

<template>
    <div class="flex flex-col min-h-screen text-sm">
        <Header></Header>

        <section class="flex-grow mx-4 sm:mx-10 lg:mx-16 my-4">
            <div class="flex flex-col sm:flex-row gap-2 justify-center">
                <div class="tooltip" data-tip="Tên nhà xuất bản, số diện thoại, địa chỉ">
                    <InputSearch v-model="searchText" class="w-full h-9 text-sm"></InputSearch>
                </div>

                <template v-if="role === 'staff'">
                    <div class="grid grid-cols-2 gap-2">
                        <button class="btn btn-neutral btn-sm hover:btn-info hover:text-white"
                            @click="goToAddPublisher">
                            Thêm nhà xuất bản
                        </button>

                        <button class="btn btn-neutral btn-sm hover:btn-error hover:text-white"
                            @click="handleDeleteAllPublishers">
                            Xóa tất cả
                        </button>
                    </div>
                </template>
            </div>

            <!-- Table -->
            <template v-if="searchFilteredPublishers.length">
                <div class="mt-10 overflow-x-auto flex justify-center">
                    <table class="w-full max-w-4xl mx-auto border rounded-xl shadow-sm overflow-hidden text-[15px]">
                        <thead class="bg-slate-100 text-slate-700">
                            <tr>
                                <th class="px-3 py-2 text-left font-medium w-[25%]">Nhà xuất bản</th>
                                <th class="px-3 py-2 text-left font-medium w-[18%]">Liên hệ</th>
                                <th class="px-3 py-2 text-left  font-medium w-[35%]">Địa chỉ</th>
                                <th class="px-6 py-2 text-right font-medium w-[22%]">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-slate-200 bg-white">
                            <tr v-for="publisher in searchFilteredPublishers" :key="publisher._id"
                                class="hover:bg-slate-50 transition">
                                <td class="px-3 py-2">{{ publisher.name }}</td>
                                <td class="px-3 py-2">{{ publisher.phone }}</td>
                                <td class="px-3 py-2">{{ publisher.address }}</td>

                                <td class="px-3 py-2 text-right">
                                    <button
                                        class="px-2 py-1 border rounded-lg text-sm hover:bg-slate-200 transition mr-1"
                                        @click="goToEditPublisher(publisher._id)">
                                        Chỉnh sửa
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>

            <template v-else>
                <p class="text-center mt-6 py-4 font-semibold">Không tìm thấy nhà xuất bản</p>
            </template>
        </section>

        <Footer></Footer>
    </div>
</template>
