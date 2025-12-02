import * as yup from "yup";

const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + 7);

export const borrowSchema = yup.object({
    return_date: yup.date().required("Vui lòng chọn ngày trả").min(new Date(), "Ngày trả phải sau ngày mượn").max(maxDate, "Chỉ được mượn sách tối đa 7 ngày").typeError("Vui lòng chọn ngày trả"),
});
