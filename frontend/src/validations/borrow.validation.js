import * as yup from "yup";

const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đầu ngày hôm nay
    return today;
};

// Lấy mốc cuối ngày của 7 ngày sau
const getMaxDueDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    maxDate.setHours(23, 59, 59, 999); // 📌 Tránh bị từ chối ngày thứ 7 do lệch giờ/phút
    return maxDate;
};

export const borrowSchema = yup.object({
    due_date: yup
        .date()
        .typeError("Vui lòng chọn hạn trả sách hợp lệ")
        .required("Vui lòng chọn hạn trả sách")
        .min(getToday(), "Hạn trả sách không được ở trong quá khứ")
        .max(getMaxDueDate(), "Chỉ được mượn sách tối đa 7 ngày kể từ hôm nay"),
});