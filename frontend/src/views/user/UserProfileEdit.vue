<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';

import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted } from "vue";
import { push } from 'notivue';
import { userSchema } from '../../validations/user.validation';
import UserService from '../../services/user.service';
import { useForm, useField } from "vee-validate";

const userService = new UserService();
const router = useRouter();
const route = useRoute();
const userId = computed(() => sessionStorage.getItem("id"));
const role = computed(() => sessionStorage.getItem("role"));

const { handleSubmit, resetForm } = useForm({
    validationSchema: userSchema,
});

const user_id = route.params.id;

const handleUserProfileEdit = handleSubmit(async (values) => {
    try {
        await userService.updateUser(user_id, values);
        if (user_id === userId.value) {
            const refreshed = await userService.getUser(user_id);
            sessionStorage.setItem("username", refreshed.username);
        }
        push.success("Cập nhật thông tin nhân viên thành công");
        if (user_id === userId.value) {
            router.push("/user/profile");
        } else {
            router.push("/users");
        }
    } catch (error) {
        if (error.response.status === 409) {
            push.error("Tên đăng nhập đã tồn tại");
        } else {
            push.error("Đã xảy ra lỗi khi cập nhật thông tin nhân viên");
        } console.log(error);
    }
});

const handleUserProfileDelete = async (user_id) => {
    try {
        if (confirm("Xác nhận xóa người dùng?")) {
            await userService.deleteUser(user_id);
            push.success("Xóa người dùng thành công");
            router.push("/users");
        }
    } catch (error) {
        push.error("Đã xảy ra lỗi khi xóa người dùng");
    }
};

const { value: first_name, errorMessage: first_nameError } = useField("first_name");
const { value: last_name, errorMessage: last_nameError } = useField("last_name");
const { value: username, errorMessage: usernameError } = useField("username");
const { value: password, errorMessage: passwordError } = useField("password");
const { value: birthday, errorMessage: birthdayError } = useField("birthday");
const { value: gender, errorMessage: genderError } = useField("gender");
const { value: address, errorMessage: addressError } = useField("address");
const { value: phone, errorMessage: phoneError } = useField("phone");

onMounted(async () => {
    const userData = await userService.getUser(user_id);
    console.log();
    resetForm({
        values: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            gender: userData.gender,
            address: userData.address,
            birthday: new Date(userData.birthday).toISOString().slice(0, 10),
            phone: userData.phone,
            username: userData.username,
        }
    });
});
</script>

<template>
    <Header></Header>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div class="max-w-3xl w-full">
            <div class="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-gray-100">
                <h2 class="text-center text-gray-800 text-2xl font-semibold">Cập nhật thông tin cá nhân</h2>

                <form @submit.prevent="handleUserRegister" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Họ lót</label>
                            <input v-model="last_name" type="text" placeholder="Nhập họ lót"
                                class="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                            <span class="text-red-600 text-sm">{{ last_nameError }}</span>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Tên</label>
                            <input v-model="first_name" type="text" placeholder="Nhập tên"
                                class="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                            <span class="text-red-600 text-sm">{{ first_nameError }}</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Ngày sinh</label>
                            <input v-model="birthday" type="date"
                                class="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                            <span class="text-red-600 text-sm">{{ birthdayError }}</span>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Giới tính</label>
                            <div class="flex gap-4 mt-1">
                                <label class="inline-flex items-center">
                                    <input type="radio" v-model="gender" :value="true" class="form-radio mr-2" />Nam
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" v-model="gender" :value="false" class="form-radio mr-2" />Nữ
                                </label>
                            </div>
                            <span class="text-red-600 text-sm">{{ genderError }}</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Địa chỉ</label>
                            <input v-model="address" type="text" placeholder="Nhập địa chỉ"
                                class="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                            <span class="text-red-600 text-sm">{{ addressError }}</span>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input v-model="phone" type="text" placeholder="Nhập số điện thoại"
                                class="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                            <span class="text-red-600 text-sm">{{ phoneError }}</span>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                        <input v-model="username" type="text" placeholder="Nhập tên đăng nhập"
                            class="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                        <span class="text-red-600 text-sm">{{ usernameError }}</span>
                    </div>

                    <div class="relative">
                        <label class="block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input v-model="password" type="password" placeholder="Nhập mật khẩu"
                            class="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                        <span class="text-red-600 text-sm">{{ passwordError }}</span>
                    </div>

                    <template v-if="role === 'staff'">
                        <div class="grid grid-cols-2 gap-2">
                            <button class="btn btn-neutral mt-4 hover:scale-[1.01] text-base"
                                @click=" handleUserProfileEdit(user_id)">Lưu thay đổi</button>
                            <button class="btn btn-neutral mt-4 hover:scale-[1.01] text-base"
                                @click=" handleUserProfileDelete(user_id)">Xóa</button>
                        </div>
                    </template>
                    <template v-else>
                        <div class="grid grid-cols-1 gap-2">
                            <button class="btn btn-neutral mt-4 hover:scale-[1.01] text-base"
                                @click=" handleUserProfileEdit(user_id)">Lưu thay đổi</button>
                        </div>
                    </template>
                    <span class="mt-4">
                        <strong class="hover:underline">
                            <template v-if="role === 'staff'">
                                <RouterLink to="/users" class="text-base">Quay lại</RouterLink>
                            </template>
                            <template v-else>
                                <RouterLink to="/user/profile" class="text-base">Quay lại</RouterLink>
                            </template>
                        </strong>
                    </span>
                </form>
            </div>
        </div>
    </div>
    <Footer></Footer>
</template>