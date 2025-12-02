import * as yup from "yup";

export const bookSchema = yup.object({
    title: yup.string().required("Vui lòng nhập tựa sách").min(3, "Vui lòng nhập ít nhất 3 ký tự").max(50, "Tên sách tối đa 50 ký tự"),
    genre: yup.string().required("Vui lòng chọn thể loại"),
    author: yup.string().required("Vui lòng nhập tác giả").min(3, "Vui lòng nhập ít nhất 3 ký tự").max(30, "Tên tác giả tối đa 30 ký tự"),
    quantity: yup.number().required("Vui lòng nhập số lượng").min(1, "Số lượng sách tối thiểu là 1 quyển").max(200, "Số lượng sách tối đa là 200 quyển").typeError("Vui lòng nhập số lượng sách"),
    publisher_id: yup.string().required("Vui lòng chọn nhà xuất bản"),
    price: yup.number().required("Vui lòng nhập đơn giá").min(0, "Đơn giá sách tối thiểu là 0đ").max(2000000, "Đơn giá sách tối đa là 2.000.000đ").typeError("Vui lòng nhập đơn giá"),
    published_year: yup.number().required("Vui lòng nhập năm xuất bản").min(0, "Năm xuất bản không hợp lệ").typeError("Vui lòng nhập năm xuất bản").min(1500, "Năm xuất bản không hợp lệ")
});