import * as yup from "yup";

export const publisherSchema = yup.object({
    name: yup.string().required("Vui lòng nhập tên").min(3, "Vui lòng nhập ít nhất 3 ký tự").max(30, "Tên người dùng tối đa 30 ký tự"),
    phone: yup.string().required("Vui lòng nhập số điện thoại").matches(/^(09|03|07|08|05)/, "Đầu số điện thoại phải bắt đầu bằng 09, 03, 07, 08, 05.")
    .min(10, "Số điện thoại phải có 10 chữ số").max(10, "Số điện thoại phải có 10 chữ số"),
    address: yup.string().required("Vui lòng nhập địa chỉ").min(3, "Vui lòng nhập ít nhất 3 ký tự").max(100, "Địa chỉ tối đa 100 ký tự."),
});