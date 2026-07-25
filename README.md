# Quản lý cho thuê xe

Ứng dụng quản lý dịch vụ cho thuê xe: tính chuyến (xe + tài xế + xăng dầu), tính theo ngày, chi phí hằng tháng, và lợi nhuận. Backend Node/Express + Postgres, frontend React (Vite).

## Cấu trúc dự án

```
fleet-app/
├── server/          # Express API + phục vụ frontend đã build
│   ├── index.js
│   └── db.js
├── client/          # React (Vite) frontend
│   └── src/
├── package.json     # script build & start ở gốc
└── railway.json
```

## 1. Đưa code lên GitHub

Trong thư mục `fleet-app`, chạy:

```bash
git init
git add .
git commit -m "Fleet rental app"
git branch -M main
git remote add origin https://github.com/<ten-tai-khoan>/<ten-repo>.git
git push -u origin main
```

Nếu chưa có repo, vào github.com → New repository → tạo repo trống (không tick thêm README) → copy URL vào lệnh `git remote add origin` ở trên.

## 2. Deploy lên Railway

1. Vào **railway.app** → **New Project** → **Deploy from GitHub repo** → chọn repo vừa tạo.
2. Railway sẽ tự nhận diện Node.js (Nixpacks), chạy `npm run build` (build frontend) rồi `npm start` (chạy server) — đã cấu hình sẵn trong `package.json`.
3. Thêm database: trong project → **New** → **Database** → **Add PostgreSQL**. Railway tự tạo biến `DATABASE_URL` và inject vào service backend — không cần cấu hình gì thêm.
4. Vào tab **Variables** của service backend, xác nhận `DATABASE_URL` đã có (Railway tự liên kết nếu 2 service cùng project).
5. Chờ deploy xong, Railway cấp cho bạn 1 domain dạng `xxx.up.railway.app` — mở lên là dùng được, dữ liệu lưu vĩnh viễn trong Postgres.

## 3. Đăng nhập

App được bảo vệ bằng tài khoản — chỉ ai đăng nhập mới xem/nhập được dữ liệu.

- **Tài khoản mặc định tạo tự động** khi database còn trống: `admin` / `admin123`
- **Đổi mật khẩu ngay** sau lần đăng nhập đầu tiên, ở tab **Tài khoản**
- Tài khoản `admin` có thể tạo thêm tài khoản cho nhân viên (tab **Tài khoản** → **Quản lý tài khoản**), phân quyền **Quản trị** hoặc **Nhân viên**
- Nhân viên (role `staff`) dùng được mọi tính năng nghiệp vụ nhưng không thấy mục quản lý tài khoản

### Biến môi trường quan trọng: `JWT_SECRET`

Trên Railway, vào tab **Variables** của service backend và thêm:

```
JWT_SECRET=<một chuỗi ngẫu nhiên dài, tuỳ ý đặt>
```

Nếu bỏ qua bước này, app vẫn chạy được nhưng mỗi lần Railway restart server, tất cả phiên đăng nhập sẽ bị huỷ (mọi người phải đăng nhập lại) vì khoá ký JWT được sinh ngẫu nhiên mỗi lần khởi động. Đặt `JWT_SECRET` cố định để tránh việc này.

## 4. Chạy thử ở máy local (tuỳ chọn)

Cần cài Node.js ≥ 18 và một Postgres (hoặc dùng Docker).

```bash
# cài đặt
npm install
cd client && npm install && cd ..

# tạo file .env từ mẫu, điền DATABASE_URL của bạn
cp .env.example .env

# build frontend rồi chạy server
npm run build
npm start
```

Mở `http://localhost:3000`.

Muốn code lại nhanh (hot reload) trong lúc phát triển:

```bash
npm run dev:server        # chạy backend, cửa sổ 1
npm run dev:client        # chạy Vite dev server, cửa sổ 2 — mở http://localhost:5173
```

## 5. Ghi chú

- Dữ liệu lưu trong Postgres trên Railway nên tồn tại lâu dài kể cả khi app được deploy lại.
- Nếu muốn nhiều người dùng cùng lúc (nhân viên nhập liệu từ nhiều máy), app này đã sẵn sàng vì mọi request đều qua backend chung, không phụ thuộc trình duyệt.
- Mỗi lần đổi code, chỉ cần `git push` — nếu đã kết nối GitHub với Railway, Railway tự động build & deploy lại.
