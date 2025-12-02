<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import UserService from '../services/user.service';
import StaffService from '../services/staff.service';
import { push } from 'notivue';
import { useForm, useField } from "vee-validate";
import { loginSchema } from '../validations/login.validation';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

const userService = new UserService();
const staffService = new StaffService();

const router = useRouter();

const { handleSubmit, resetForm } = useForm({
  validationSchema: loginSchema
});

const { value: username, errorMessage: usernameError } = useField("username");
const { value: password, errorMessage: passwordError } = useField("password");

const activeTab = ref('reader');

const setActive = (tab) => {
  activeTab.value = tab;
  resetForm();
};


const tabClass = (tab) => [
  'flex-1 rounded-full py-2 px-4 text-sm font-medium transition',
  activeTab.value === tab
    ? 'bg-white shadow-inner text-indigo-700'
    : 'text-gray-700 hover:bg-white/60'
];


const handleLogin = handleSubmit(async () => {
  try {
    let response;
    if (activeTab.value === 'reader') {
      response = await userService.login(username.value, password.value);
    } else {
      response = await staffService.login(username.value, password.value);
    }

    if (response?.data?.token) {
      const userData = activeTab.value === 'reader'
        ? response.data.user
        : response.data.staff;

      sessionStorage.setItem("authenticateToken", response.data.token);
      sessionStorage.setItem("username", userData.username);
      sessionStorage.setItem("id", userData.id);
      sessionStorage.setItem("role", userData.role);
      push.success("Đăng nhập thành công!");
      router.push("/");
    }
  } catch (error) {
    console.error(error);

    if (error.response?.status === 400) {
      push.error("Vui lòng điền đầy đủ thông tin");
    } else if (error.response?.status === 401) {
      push.error("Mật khẩu không chính xác");
    } else if (error.response?.status === 404) {
      push.error("Tài khoản không tồn tại");
    } else {
      push.error("Đăng nhập thất bại, vui lòng thử lại");
    }
  }
});
</script>

<template>
  <Header></Header>

  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-gray-100">
        <h2 class="text-center text-gray-800 text-xl font-semibold">Đăng nhập</h2>
        <p class="text-center text-sm text-gray-500 mt-1">Chọn loại tài khoản của bạn</p>

        <div class="mt-6 bg-gray-200 rounded-full p-1 flex items-center gap-1">
          <button @click="setActive('reader')" :class="tabClass('reader')">Độc giả</button>
          <button @click="setActive('admin')" :class="tabClass('admin')">Nhân viên</button>
        </div>

        <form class="mt-6 space-y-5" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <div class="mt-2 relative">
              <input v-model="username"  type="text" placeholder="Vui lòng nhập tên đăng nhập"
                class="w-full pl-5 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              <span class="text-red-600 text-sm">{{ usernameError }}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <div class="mt-2 relative">
              <input v-model="password" type="password" placeholder="Vui lòng nhập mật khẩu"
                class="w-full pl-5 pr-10 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              <span class="text-red-600 text-sm">{{ passwordError }}</span>
            </div>
          </div>

          <button type="submit"
            class="w-full mb-5 mt-3 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  </div>

  <Footer></Footer>
</template>
