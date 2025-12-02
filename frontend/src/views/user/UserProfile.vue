<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import { ref, computed, onMounted } from "vue";
import UserService from '../../services/user.service';
import { useRouter } from 'vue-router';

const router = useRouter();
const userService = new UserService();
const user = ref({});
const user_id = computed(() => sessionStorage.getItem("id"));

const goToUserProfileEdit = async (user_id) => {
    router.push({ name: "userprofile.edit", params: { id: user_id } });
};

onMounted(async () => {
    try {
        const user_data = await userService.getUser(user_id.value);
        user.value = user_data;
    } catch (error) {
        console.log(error);
    }
})
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <Header></Header>
        <div class="lg:grid lg:place-items-center grid-rows-1 flex-grow">
            <div
                class="max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 md:grid md:grid-cols-1 md:items-center md:gap-4 lg:px-8 lg:py-32">
                <div class="flow-root">
                    <dl class="divide-y divide-gray-200 rounded border border-gray-200 text-sm *:even:bg-gray-50">
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-bold text-black text-xl">Thông tin người dùng</dt>
                        </div>
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Họ lót</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ user.first_name || "Không xác định" }}</dd>
                        </div>
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Tên</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ user.last_name || "Không xác định" }}</dd>
                        </div>
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Tên đăng nhập</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ user.username || "Không xác định" }}</dd>
                        </div>
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Ngày sinh</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ user.birthday ? new Date(user.birthday
                            ).toLocaleDateString(
                                'vi-VN') :
                                "Không xác định" }}</dd>
                        </div>
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Giới tính</dt>
                            <template v-if="user.gender === true">
                                <dd class="text-gray-700 sm:col-span-2">Nam</dd>
                            </template>
                            <template v-else-if="user.gender === false">
                                <dd class=" text-gray-700 sm:col-span-2">Nữ</dd>
                            </template>
                            <template v-else>
                                <dd class=" text-gray-700 sm:col-span-2">Không xác định</dd>
                            </template>
                        </div>
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Địa chỉ</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ user.address || "Không xác định" }}</dd>
                        </div>
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Số điện thoại</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ user.phone || "Không xác định" }}</dd>
                        </div>
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-4 sm:gap-4">
                            <button @click=" goToUserProfileEdit(user_id)"
                                class="btn btn-neutral hover:scale-[1.01]">Chỉnh
                                sửa</button>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
        <Footer></Footer>
    </div>
</template>