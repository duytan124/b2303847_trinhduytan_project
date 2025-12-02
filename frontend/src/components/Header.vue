<script setup>
import { ref } from "vue";
import { useAuth } from '../composables/useAuth';

const { logOut } = useAuth();
const username = ref(sessionStorage.getItem("username"));
const role = ref(sessionStorage.getItem("role"));
</script>

<template>
    <div class="navbar bg-base-100 shadow">
        <div class="navbar-start">
            <template v-if="role === 'user' || role === 'staff'">
                <div class="dropdown">
                    <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabindex="0"
                        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <template v-if="role === 'staff'">
                            <li>
                                <RouterLink to="/" class="text-base"
                                    exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                                    Danh mục sách</RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/borrowpending" class="text-base"
                                    exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">Đơn
                                    mượn sách
                                </RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/publishers" class="text-base"
                                    exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">Nhà
                                    xuất bản
                                </RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/users" class="text-base"
                                    exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                                    Người dùng
                                </RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/staffs" class="text-base"
                                    exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                                    Nhân viên
                                </RouterLink>
                            </li>
                        </template>
                        <template v-if="role === 'user'">
                            <li>
                                <RouterLink to="/" class="text-base"
                                    exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                                    Danh mục sách
                                </RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/borrowcheck" class="text-base"
                                    exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                                    Kiểm tra đơn mượn
                                    sách</RouterLink>
                            </li>
                        </template>
                    </ul>
                </div>
            </template>
            <RouterLink to="/" class="ml-2 text-base md:text-lg lg:text-xl font-bold hover:underline">CTU Library
            </RouterLink>
        </div>

        <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal px-1 text-base">

                <template v-if="role === 'staff'">
                    <li>
                        <RouterLink to="/" class="text-base hover:font-bold hover:underline"
                            exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                            Danh mục sách
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/borrowpending" class="text-base hover:font-bold hover:underline"
                            exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                            Đơn mượn sách</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/publishers" class="text-base hover:font-bold hover:underline"
                            exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                            Nhà xuất bản</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/users" class="text-base hover:font-bold hover:underline"
                            exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                            Người dùng</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/staffs" class="text-base hover:font-bold hover:underline"
                            exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                            Nhân viên</RouterLink>
                    </li>
                </template>

                <template v-if="role === 'user'">
                    <li>
                        <RouterLink to="/" class="text-base hover:font-bold hover:underline"
                            exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                            Danh mục sách</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/borrowcheck" class="text-base hover:font-bold hover:underline"
                            exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                            Kiểm tra đơn mượn sách</RouterLink>
                    </li>
                </template>
            </ul>
        </div>

        <div class="navbar-end">
            <template v-if="!username">
                <RouterLink to="/login" class="btn btn-neutral px-4 text-base mr-2 hover:scale-[1.02]">Đăng Nhập
                </RouterLink>
                <RouterLink to="/user/register" class="btn btn-white px-4 text-base shadow mr-2 hover:scale-[1.02]">Đăng
                    Kí
                </RouterLink>
            </template>
            <template v-if="role === 'user'">
                <div class="dropdown dropdown-end">
                    <label tabindex="0" class="cursor-pointer mr-5 text-base font-bold hover:underline">
                        Xin chào, {{ username }}
                    </label>

                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 z-[999]">
                        <li>
                            <RouterLink to="/user/profile" class="text-base hover:font-bold hover:underline"
                                exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                                Thông tin cá nhân</RouterLink>
                        </li>
                        <li>
                            <button @click="logOut">Đăng xuất</button>
                        </li>

                    </ul>
                </div>
            </template>
            <template v-if="role === 'staff'">
                <div class="dropdown dropdown-end">
                    <label tabindex="0" class="cursor-pointer mr-5 text-base font-bold hover:underline">
                        Xin chào, {{ username }}
                    </label>

                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 z-[999]">
                        <li>
                            <RouterLink to="/staff/profile" class="text-base hover:font-bold hover:underline"
                                exact-active-class="text-base font-bold transition-all duration-200 ease-in-out">
                                Thông tin cá nhân</RouterLink>
                        </li>
                        <li>
                            <button @click="logOut">Đăng xuất</button>
                        </li>
                    </ul>
                </div>
            </template>
        </div>
    </div>
</template>