<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import UserService from "../../services/user.service";
import { useForm, useField } from "vee-validate";
import { userSchema } from "../../validations/user.validation";
import { push } from "notivue";
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';

const router = useRouter();
const userService = new UserService();

const { handleSubmit } = useForm({
    validationSchema: userSchema
});

const { value: first_name, errorMessage: first_nameError } = useField("first_name");
const { value: last_name, errorMessage: last_nameError } = useField("last_name");
const { value: username, errorMessage: usernameError } = useField("username");
const { value: password, errorMessage: passwordError } = useField("password");
const { value: birthday, errorMessage: birthdayError } = useField("birthday");
const { value: gender, errorMessage: genderError } = useField("gender");
const { value: address, errorMessage: addressError } = useField("address");
const { value: phone, errorMessage: phoneError } = useField("phone");


const handleUserRegister = handleSubmit(async (values) => {
    try {
        await userService.register(values);
        push.success("Đăng ký người dùng thành công");
        router.push("/user/login");
    } catch (error) {
        console.error(error);
        if (error.response?.status === 400) {
            push.error("Vui lòng điền đầy đủ thông tin");
        } else if (error.response?.status === 409) {
            push.error("Tên đăng nhập đã tồn tại");
        } else {
            push.error("Đăng ký thất bại, vui lòng thử lại");
        }
    }
});
</script>

<template>
    <Header></Header>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div class="max-w-3xl w-full">
            <div class="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-gray-100">
                <h2 class="text-center text-gray-800 text-2xl font-semibold">Đăng ký tài khoản</h2>
                <p class="text-center text-sm text-gray-500 mt-1 mb-6">Điền thông tin để tạo tài khoản</p>

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

                    <button type="submit"
                        class="w-full py-3 mt-2 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700">
                        Đăng ký
                    </button>

                    <p class="text-center text-sm text-gray-500 mt-4">
                        Đã có tài khoản?
                        <router-link to="/login" class="text-blue-600 hover:underline">Đăng nhập ngay</router-link>
                    </p>
                </form>
            </div>
        </div>
    </div>
    <Footer></Footer>
</template>
