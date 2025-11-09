# 🚀 Backend - Ứng dụng Quản lý Công việc (Task Management)

Đây là API backend cho đồ án Xây dựng Ứng dụng Quản lý Công việc. Project này sử dụng Node.js, Express, Sequelize và MySQL.

## ✨ Tính năng chính
* **Authentication:** Đăng ký, Đăng nhập (JWT), Đổi mật khẩu, Quên mật khẩu (Email/OTP).
* **User:** Phân quyền (Admin/User), Cập nhật profile.
* **Projects:** CRUD (Tạo, Đọc, Cập nhật, Xóa) Project, quản lý thành viên (Thêm/Xóa).
* **Tasks:** CRUD Task, quản lý thành viên, gán task con, filter (trạng thái, deadline).
* **Stats (Thống kê):** API cho 4 biểu đồ (Tổng quan, Tiến độ, Trạng thái, Hiệu suất).
* **Export:** Xuất danh sách task ra file Excel (có filter).

---

## 🔧 Cài đặt và Chạy Local

Hướng dẫn để chạy project này trên máy của bạn.

### 1. Yêu cầu
* [Node.js](https://nodejs.org/) (v18+)
* [XAMPP](https://www.apachefriends.org/) (hoặc một server MySQL)

### 2. Hướng dẫn cài đặt

**1. Clone Repo**
Mở terminal và clone kho code này về:
```bash
git clone https://github.com/HaiTrieu186/TaskManagement_Backend.git

cd [TÊN-THƯ-MỤC-PROJECT-] cái vừa clone về
npm install