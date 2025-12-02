<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import PublisherService from '../../services/publisher.service';
import { useRouter } from 'vue-router';
import { onMounted, computed } from 'vue';
import { useForm, useField } from 'vee-validate';
import { publisherSchema } from '../../validations/publisher.validation';
import { push } from 'notivue';

const publisherService = new PublisherService();
const router = useRouter();
const role = computed(() => sessionStorage.getItem("role"));

const { handleSubmit } = useForm({
    validationSchema: publisherSchema,
});

const handleCreatePublisher = handleSubmit(async (values) => {
    try {
        await publisherService.createPublisher(values);
        push.success("Thêm nahf xuất bản thành công");
        router.push("/publishers");
    } catch (error) {
        console.log(error);
        push.error("Đã có lỗi xảy ra khi thêm nhà xuất bản mới");
    }
});

const { value: name, errorMessage: nameError } = useField("name");
const { value: phone, errorMessage: phoneError } = useField("phone");
const { value: address, errorMessage: addressError } = useField("address");

onMounted(() => {
    if (role.value !== "staff")
        router.push("/");
})
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Header></Header>
        <div class="flex flex-grow justify-center items-center">
            <form @submit.prevent="handleCreatePublisher" mb-24>
                <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 text-base">
                    <legend class="fieldset-legend text-xl">Thêm nhà xuất bản mới</legend>
                    <label class="label" for="name">Tên nhà xuất bản</label>
                    <input v-model="name" type="text" class="input" id="name" placeholder="Nhập tên nhà xuất bản" />
                    <span class="text-sm text-red-600">{{ nameError }}</span>

                    <label class="label" for="phone">Số điện thoại</label>
                    <input v-model="phone" type="text" class="input" id="phone"
                        placeholder="Nhập số điện thoại" />
                    <span class="text-sm text-red-600">{{ phoneError }}</span>

                    <label class="label" for="address">Địa chỉ</label>
                    <input v-model="address" type="text" class="input" id="address"
                        placeholder="Nhập địa chỉ" />
                    <span class="text-sm text-red-600">{{ addressError }}</span>

                    <button type="submit"
                        class="btn btn-neutral mt-4 hover:scale-[1.01] hover:btn-info hover:text-white text-base">Thêm
                        nhà xuất bản</button>

                    <span class="mt-4">
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