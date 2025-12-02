<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';

import { useRouter, useRoute } from 'vue-router';
import { onMounted, computed } from "vue";
import PublisherService from '../../services/publisher.service';
import { push } from 'notivue';
import { publisherSchema } from "../../validations/publisher.validation";
import { useForm, useField } from "vee-validate";

const publisherService = new PublisherService();
const router = useRouter();
const route = useRoute();
const publisher_id = route.params.id;
const role = computed(() => sessionStorage.getItem("role"));

const { handleSubmit, resetForm } = useForm({
    validationSchema: publisherSchema,
});

const handlePublisherProfileEdit = handleSubmit(async (values) => {
    try {
        await publisherService.updatePublisher(publisher_id, values);
        push.success("Cập nhật thông tin nhà xuất bản thành công");
        router.push("/publishers");
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi cập nhật thông tin nhà xuất bản");
    }
});

const handlePublisherProfileDelete = async (publisher_id) => {
    try {
        if (confirm("Xác nhận xóa nhà xuất bản?")) {
            await publisherService.deletePublisher(publisher_id);
            push.success("Xóa nhà xuất bản thành công");
            router.push("/publishers");
        }
    } catch (error) {
        push.error("Đã xảy ra lỗi khi xóa nhà xuất bản");
        console.log(error);
    }
};

const { value: name, errorMessage: nameError } = useField("name");
const { value: phone, errorMessage: phoneError } = useField("phone");
const { value: address, errorMessage: addressError } = useField("address");

onMounted(async () => {
    if (role.value !== "staff") {
        router.push("/");
    }
    try {
        const publisherData = await publisherService.getPublisherById(publisher_id);
        resetForm({
            values: {
                name: publisherData.name,
                phone: publisherData.phone,
                address: publisherData.address
            }
        });
    } catch (error) {
        console.log(error);
    }
});
console.log(publisher_id);
</script>

<template>
    <div class="flex min-h-screen flex-col">
        <Header></Header>
        <div class="flex justify-center items-center flex-grow">
            <form @submit.prevent class="mb-24">
                <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 text-base">
                    <legend class="fieldset-legend text-xl">Chỉnh sửa nhà xuất bản</legend>

                    <label class="label" for="name">Tên nhà xuất bản</label>
                    <input v-model="name" type="text" class="input w-full" id="name"
                        placeholder="Nhập tên nhà xuất bản" />
                    <span class="text-sm text-red-600">{{ nameError }}</span>

                    <label class="label" for="phone">Số điện thoại</label>
                    <input v-model="phone" type="text" class="input w-full" id="phone" placeholder="Nhập số điện thoại" />
                    <span class="text-sm text-red-600">{{ phoneError }}</span>

                    <label class="label" for="address">Địa chỉ</label>
                    <input v-model="address" type="text" class="input w-full" id="address" placeholder="Nhập địa chỉ" />
                    <span class="text-sm text-red-600">{{ addressError }}</span>

                    <div class="grid grid-cols-2 gap-2">
                        <button @click=" handlePublisherProfileEdit(publisher_id)"
                            class="btn btn-neutral mt-4 hover:scale-[1.01] text-base">Cập nhật</button>
                        <button @click=" handlePublisherProfileDelete(publisher_id)"
                            class="btn btn-neutral mt-4 hover:scale-[1.01] text-base">Xóa</button>
                    </div>

                    <span class="mt-8">
                        <strong class="hover:underline">
                            <RouterLink to="/publishers" class="text-base">Quay lại</RouterLink>
                        </strong>
                    </span>
                </fieldset>
            </form>
        </div>
        <Footer></Footer>
    </div>
</template>