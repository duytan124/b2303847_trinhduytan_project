<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import UserService from '../services/user.service';
import StaffService from '../services/staff.service';
import { push } from 'notivue';
import { useForm, useField } from "vee-validate";
import { loginSchema } from '../validations/login.validation';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { googleTokenLogin } from 'vue3-google-login';
import axios from 'axios';

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
  'flex-1 rounded-full py-2 px-4 text-sm font-medium transition cursor-pointer',
  activeTab.value === tab
    ? 'bg-white shadow-inner text-indigo-700'
    : 'text-gray-700 hover:bg-white/60'
];

// Thông báo cho Header/App biết trạng thái đăng nhập vừa thay đổi
const notifyAuthChange = () => {
  window.dispatchEvent(new Event('auth-change'));
};

// Xử lý đăng nhập bằng Tài khoản / Mật khẩu
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
      sessionStorage.setItem("id", userData._id || userData.id);
      sessionStorage.setItem("role", userData.role);

      notifyAuthChange();
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

// REQ_ADA_01: Kích hoạt Popup Google Login với nút tùy chỉnh
const handleGoogleLogin = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  googleTokenLogin({
    clientId: clientId
  }).then(async (googleResponse) => {
    try {
      // ✅ CHỈ GỬI accessToken VỀ BACKEND
      const res = await axios.post('http://localhost:3000/api/user/google-login', {
        accessToken: googleResponse.access_token
      });

      const token = res.data?.accessToken || res.data?.token;
      if (token) {
        const userData = res.data.user;

        sessionStorage.setItem("authenticateToken", token);
        sessionStorage.setItem("username", userData.username);
        sessionStorage.setItem("id", userData._id || userData.id);
        sessionStorage.setItem("role", userData.role);

        notifyAuthChange();
        push.success("Đăng nhập Google thành công!");
        router.push("/");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      push.error(error.response?.data?.message || "Đăng nhập Google thất bại");
    }
  }).catch((error) => {
    console.error("Cửa sổ đăng nhập Google bị đóng hoặc lỗi:", error);
  });
};
</script>

<template>
  <Header></Header>

  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-gray-100">
        <h2 class="text-center text-gray-800 text-xl font-semibold">Đăng nhập</h2>
        <p class="text-center text-sm text-gray-500 mt-1">Chọn loại tài khoản của bạn</p>

        <!-- Tab chuyển đổi Độc giả / Nhân viên -->
        <div class="mt-6 bg-gray-200 rounded-full p-1 flex items-center gap-1">
          <button @click="setActive('reader')" :class="tabClass('reader')">Độc giả</button>
          <button @click="setActive('admin')" :class="tabClass('admin')">Nhân viên</button>
        </div>

        <!-- Form nhập thông thường -->
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

        <!-- Khối Đăng nhập Google Tùy chỉnh (Chỉ hiện ở Tab Độc giả) -->
        <div v-if="activeTab === 'reader'" class="mt-6">
          <div class="relative flex py-2 items-center">
            <div class="flex-grow border-t border-gray-200"></div>
            <span class="flex-shrink mx-4 text-gray-400 text-xs uppercase font-semibold">Hoặc</span>
            <div class="flex-grow border-t border-gray-200"></div>
          </div>

          <div class="mt-3">
            <button type="button" @click="handleGoogleLogin"
              class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition shadow-sm cursor-pointer">
              <!-- Icon Google SVG -->
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng nhập bằng Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer></Footer>
</template>