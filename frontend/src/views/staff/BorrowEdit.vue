<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BorrowService from '../../services/borrow.service';
import { push } from 'notivue';
import { useForm, useField } from "vee-validate";
import { borrowSchema } from '../../validations/borrow.validation';

const borrowService = new BorrowService();

const route = useRoute();
const router = useRouter();

const borrowId = route.params.id;
const borrow = ref({});

const borrowDate = ref(undefined);

const { handleSubmit, resetForm } = useForm({
    validationSchema: borrowSchema,
});

const { value: return_date, errorMessage: return_dateError } = useField("return_date");

const handleUpdateBorrow = handleSubmit(async (values) => {
    try {
        await borrowService.updateBorrow(borrowId, values);
        push.success("Cập nhật đơn mượn sách thành công");
        router.push("/borrowpending");
    } catch (error) {
        console.log(error);
    }
});

const handleDeleteBorrow = async (borrowId) => {
    try {
        if (confirm("Xác nhận xóa đơn mượn sách?")) {
            if (borrow.value.status === 'borrowing' || borrow.value.status === 'return_pending') {
                push.error({ message: "Không thể xóa đơn mượn do người dùng đang mượn hoặc đang chờ duyệt trả sách", duration: 4000 });
                return;
            }
            await borrowService.deleteBorrow(borrowId);
            push.info("Xóa đơn mượn sách thành công");
            router.push("/borrowpending");
        }
    } catch (error) {
        console.log(error);
        push.error("Đã xảy ra lỗi khi xóa đơn mượn sách");
    }
};

onMounted(async () => {
    try {
        const borrow_data = await borrowService.getBorrowById(borrowId);
        borrow.value = borrow_data;
        borrowDate.value = new Date(borrow.value.borrow_date).toISOString().slice(0, 10);
        resetForm({
            values: {
                return_date: new Date(borrow.value.return_date).toISOString().slice(0, 10)
            }
        });
    } catch (error) {
        console.log(error);
        push.error("Đã có lỗi xảy ra khi try cập thông tin đơn mượn sách");
    }
});
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Header></Header>
        <div class="flex flex-grow justify-center items-center">
            <form @submit.prevent>
                <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 text-base">
                    <legend class="fieldset-legend text-xl">Cập nhật đơn mượn sách</legend>

                    <label class="label" for="user_id">Người mượn</label>
                    <input type="text" class="input" id="user_id" readonly
                        :value="borrow.user_id?.last_name + ' ' + borrow.user_id?.first_name" />

                    <label class="label" for="title">Tựa sách</label>
                    <input type="text" class="input" id="title" readonly :value="borrow.book_id?.title" />

                    <label class="label" for="staff_id">Nhân viên duyệt</label>
                    <input type="text" class="input" id="staff_id" readonly
                        :value="borrow.staff_id?.name || 'Không xác định'">

                    <label class="label" for="borrow_date">Ngày mượn</label>
                    <input type="date" class="input" id="borrow_date" readonly :value="borrowDate" />

                    <label class="label" for="return_date">Ngày trả sách</label>
                    <input v-model="return_date" type="date" class="input" id="return_date" />
                    <span class="text-red-600 text-sm">{{ return_dateError }}</span>
                    <button @click=" handleUpdateBorrow(borrowId)"
                    class="btn btn-neutral mt-4 hover:scale-[1.01] hover:btn-info hover:text-white text-base">Cập nhật</button>

                    <span class="mt-8">
                        <strong class="hover:underline">
                            <RouterLink to="/borrowpending" class="text-base">Quay lại</RouterLink>
                        </strong>
                    </span>
                </fieldset>
            </form>
        </div>
        <Footer></Footer>
    </div>
</template>