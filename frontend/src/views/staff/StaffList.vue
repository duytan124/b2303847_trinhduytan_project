<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import InputSearch from '../../components/InputSearch.vue';

import StaffService from "../../services/staff.service";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { push } from 'notivue';

const staffService = new StaffService();
const router = useRouter();
const staffs = ref([]);
const searchText = ref("");
const role = computed(() => sessionStorage.getItem("role"));

const props = defineProps({
    staff: {
        type: Object,
        required: true
    }
});

const fetchStaffs = async () => {
    try {
        const response = await staffService.getAllStaffs();
        staffs.value = response;
    } catch (error) {
        console.error(error);
    }
};

const searchFilteredStaffs = computed(() => {
    if (!searchText.value) return staffs.value;

    const keyword = searchText.value.toLowerCase();

    return staffs.value.filter(staff => {
        const searchableText = [staff.name, staff.phone, staff.address]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(keyword);
    });
});

const goToAddStaff = () => {
    router.push({ name: "staff.add" });
};

const handleDeleteAllStaffs = async () => {
    try {
        if (confirm("Xác nhận xóa tất cả nhà xuất bản?")) {
            await staffService.deleteAllStaffs();
            push.success("Xóa tất cả nhà xuất bản thành công");
            fetchStaffs();
        }
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi xóa tất cả nhà xuất bản");
    }
};

const goToEditStaff = (staff_id) => {
    router.push({ name: "staffprofile.edit", params: { id: staff_id } });
};

onMounted(async () => {
    if (role.value !== "staff") {
        router.push("/");
    }
    fetchStaffs();
});
</script>

<template>
    <div class="flex flex-col min-h-screen text-sm">
        <Header></Header>

        <section class="flex-grow mx-4 sm:mx-10 lg:mx-16 my-4">
            <div class="flex flex-col sm:flex-row gap-2 justify-center">
                <div class="tooltip" data-tip="Tên nhân viên, số diện thoại, địa chỉ">
                    <InputSearch v-model="searchText" class="w-full h-9 text-sm"></InputSearch>
                </div>

                <template v-if="role === 'staff'">
                    <div class="grid grid-cols-2 gap-2">
                        <button class="btn btn-neutral btn-sm hover:btn-info hover:text-white" @click="goToAddStaff">
                            Thêm nhân viên
                        </button>

                        <button class="btn btn-neutral btn-sm hover:btn-error hover:text-white"
                            @click="handleDeleteAllStaffs">
                            Xóa tất cả
                        </button>
                    </div>
                </template>
            </div>

            <!-- Table -->
            <template v-if="searchFilteredStaffs.length">
                <div class="mt-10 overflow-x-auto flex justify-center">
                    <table class="w-full max-w-5xl mx-auto border rounded-xl shadow-sm overflow-hidden text-[15px]">
                        <thead class="bg-slate-100 text-slate-700">
                            <tr>
                                <th class="px-3 py-2 text-left font-medium w-[20%]">Họ tên</th>
                                <th class="px-3 py-2 text-left font-medium w-[15%]">Liên hệ</th>
                                <th class="px-3 py-2 text-left font-medium w-[23%]">Địa chỉ</th>
                                <th class="px-7 py-2 text-right font-medium w-[12%]">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-slate-200 bg-white">
                            <tr v-for="staff in searchFilteredStaffs" :key="staff._id"
                                class="hover:bg-slate-50 transition">

                                <td class="px-3 py-2">
                                    <div class="font-semibold">{{ staff.name }}</div>
                                    <div class="text-xs text-gray-500">@{{ staff.username }}</div>
                                </td>

                                <td class="px-3 py-2">{{ staff.phone }}</td>

                                <td class="px-3 py-2">{{ staff.address }}</td>

                                <td class="px-3 py-2 text-right">
                                    <button
                                        class="px-2 py-1 border rounded-lg text-sm hover:bg-slate-200 transition mr-1"
                                        @click="goToEditStaff(staff._id)">
                                        Chỉnh sửa
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>

            <template v-else>
                <p class="text-center mt-6 py-4 font-semibold">Không tìm thấy người dùng</p>
            </template>
        </section>

        <Footer></Footer>
    </div>
</template>
