import * as yup from "yup";

export const loginSchema = yup.object({
    username: yup.string().required("Vui lòng nhập tên đăng nhập").min(3, "Vui lòng nhập ít nhất 3 ký tự").max(30, "Tên đăng nhập tối đa 30 ký tự"),
    password: yup.string().required("Vui lòng nhập mật khẩu").min(3, "Vui lòng nhập ít nhất 3 ký tự").max(30, "Mật khẩu tối đa 30 ký tự"),
});