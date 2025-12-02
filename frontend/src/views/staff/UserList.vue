<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import InputSearch from '../../components/InputSearch.vue';

import UserService from "../../services/user.service";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { push } from 'notivue';

const userService = new UserService();
const router = useRouter();
const users = ref([]);
const searchText = ref("");
const role = computed(() => sessionStorage.getItem("role"));

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
});

const fetchUsers = async () => {
    try {
        const response = await userService.getAllUsers();
        users.value = response;
    } catch (error) {
        console.error(error);
    }
};

const searchFilteredUsers = computed(() => {
    if (!searchText.value) return users.value;

    const keyword = searchText.value.toLowerCase();

    return users.value.filter(user => {
        const searchableText = [user.name, user.phone, user.address]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(keyword);
    });
});

const goToAddUser = () => {
    router.push({ name: "register" });
};

const handleDeleteAllUsers = async () => {
    try {
        if (confirm("Xác nhận xóa tất cả nhà xuất bản?")) {
            await userService.deleteAllUsers();
            push.success("Xóa tất cả nhà xuất bản thành công");
            fetchUsers();
        }
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi xóa tất cả nhà xuất bản");
    }
};

const goToEditUser = (user_id) => {
    router.push({ name: "userprofile.edit", params: { id: user_id } });
};

onMounted(async () => {
    if (role.value !== "staff") {
        router.push("/");
    }
    fetchUsers();
});
</script>

<template>
    <div class="flex flex-col min-h-screen text-sm">
        <Header></Header>

        <section class="flex-grow mx-4 sm:mx-10 lg:mx-16 my-4">
            <div class="flex flex-col sm:flex-row gap-2 justify-center">
                <div class="tooltip" data-tip="Tên nhà xuất bản, địa chỉ">
                    <InputSearch v-model="searchText" class="w-full h-9 text-sm"></InputSearch>
                </div>

                <template v-if="role === 'staff'">
                    <div class="grid grid-cols-2 gap-2">
                        <button class="btn btn-neutral btn-sm hover:btn-info hover:text-white" @click="goToAddUser">
                            Thêm người dùng
                        </button>

                        <button class="btn btn-neutral btn-sm hover:btn-error hover:text-white"
                            @click="handleDeleteAllUsers">
                            Xóa tất cả
                        </button>
                    </div>
                </template>
            </div>

            <!-- Table -->
            <template v-if="searchFilteredUsers.length">
                <div class="mt-10 overflow-x-auto flex justify-center">
                    <table class="w-full max-w-5xl mx-auto border rounded-xl shadow-sm overflow-hidden text-[15px]">
                        <thead class="bg-slate-100 text-slate-700">
                            <tr>
                                <th class="px-3 py-2 text-left font-medium w-[20%]">Họ tên</th>
                                <th class="px-3 py-2 text-left font-medium w-[15%]">Giới tính</th>
                                <th class="px-3 py-2 text-left font-medium w-[15%]">Ngày sinh</th>
                                <th class="px-3 py-2 text-left font-medium w-[15%]">Liên hệ</th>
                                <th class="px-3 py-2 text-left font-medium w-[23%]">Địa chỉ</th>
                                <th class="px-7 py-2 text-right font-medium w-[12%]">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-slate-200 bg-white">
                            <tr v-for="user in searchFilteredUsers" :key="user._id"
                                class="hover:bg-slate-50 transition">

                                <td class="px-3 py-2">
                                    <div class="font-semibold">{{ user.last_name }} {{ user.first_name }}</div>
                                    <div class="text-xs text-gray-500">@{{ user.username }}</div>
                                </td>

                                <td class="px-3 py-2 capitalize">
                                    <template v-if="user.gender === true">
                                        <dd class="text-gray-800 sm:col-span-2 truncate">Nam</dd>
                                    </template>
                                    <template v-else-if="user.gender === false">
                                        <dd class=" text-gray-800 sm:col-span-2 truncate">Nữ</dd>
                                    </template>
                                    <template v-else>
                                        <dd class=" text-gray-800 sm:col-span-2 truncate">Không xác định</dd>
                                    </template>
                                </td>


                                <td class="px-3 py-2 capitalize">
                                    <dd class="text-gray-800 sm:col-span-2 truncate">{{ user.birthday ? new Date(
                                        user.birthday
                                    ).toLocaleDateString(
                                        'vi-VN') :
                                        "Không xác định" }}</dd>
                                </td>

                                <td class="px-3 py-2">{{ user.phone }}</td>

                                <td class="px-3 py-2">{{ user.address }}</td>

                                <td class="px-3 py-2 text-right">
                                    <button
                                        class="px-2 py-1 border rounded-lg text-sm hover:bg-slate-200 transition mr-1"
                                        @click="goToEditUser(user._id)">
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
