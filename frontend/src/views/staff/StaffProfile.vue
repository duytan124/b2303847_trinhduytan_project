<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import { ref, computed, onMounted } from "vue";
import StaffService from '../../services/staff.service';
import { useRouter } from 'vue-router';

const staffService = new StaffService();
const staff_id = computed(() => sessionStorage.getItem("id"));
const role = computed(() => sessionStorage.getItem("role"));
const staff = ref({});
const router = useRouter();

const goToStaffProfileEdit = (staff_id) => {
    router.push({ name: "staffprofile.edit", params: { id: staff_id } });
};


onMounted(async () => {
    if (role.value !== "staff") {
        router.push("/");
    }
    try {
        staff.value = await staffService.getStaff(staff_id.value);
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
                            <dt class="font-bold text-black text-xl">Thông tin nhân viên</dt>
                        </div>

                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Họ và tên</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ staff.name || "Không xác định" }}</dd>
                        </div>

                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Tên đăng nhập</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ staff.username || "Không xác định" }}</dd>
                        </div>

                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Địa chỉ</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ staff.address || "Không xác định" }}</dd>
                        </div>
                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                            <dt class="font-medium text-gray-900">Số điện thoại</dt>
                            <dd class="text-gray-700 sm:col-span-2">{{ staff.phone || "Không xác định" }}</dd>
                        </div>

                        <div class="grid grid-cols-1 gap-1 p-3 sm:grid-cols-4 sm:gap-4">
                            <button @click=" goToStaffProfileEdit(staff_id)"
                                class="btn btn-neutral hover:scale-[1.01]">Chỉnh sửa</button>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
        <Footer></Footer>
    </div>
</template>