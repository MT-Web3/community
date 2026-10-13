# MT-Web3 Community

Nền tảng quản lý chiến dịch cộng đồng Web3, frontend tĩnh trên GitHub Pages và backend Supabase Edge Functions/Postgres.

## Kiến trúc

- React + TypeScript + Vite: giao diện responsive, dark/light mode, GitHub Pages.
- Supabase Postgres: campaigns, applications, admin roles; RLS mặc định chặn dữ liệu cá nhân.
- Supabase Auth: magic link cho quản trị viên.
- Edge Functions: nhận hồ sơ, tra cứu qua mã băm, giới hạn tần suất và Turnstile.
- GitHub Actions: test, build và deploy Pages từ `main`.

Không có service-role key trong frontend. Chiến dịch FungoLabs được seed ở trạng thái `draft` và chưa nhận đăng ký.

## Chạy local

```bash
npm install
copy .env.example .env.local
npm run dev
```

Nếu chưa cấu hình Supabase, website vẫn chạy ở chế độ read-only và không hiển thị chiến dịch Draft.

Để dùng backend đã triển khai từ máy local, đặt URL và anon key của project trong `.env.local`, thêm `VITE_FUNCTIONS_URL=/backend/functions/v1`, rồi build lại. Vite chuyển tiếp các yêu cầu Edge Functions tới project đó. Đăng ký callback `http://127.0.0.1:4173/community/admin` trong Supabase Authentication → URL Configuration khi dùng preview mặc định. Không đặt `VITE_FUNCTIONS_URL` này trong bản GitHub Pages.

## Cấu hình backend

1. Tạo Supabase project (free tier phù hợp cho MVP).
2. Chạy migration trong `supabase/migrations` bằng Supabase CLI.
3. Thêm user quản trị vào `public.admin_users` bằng UUID từ Authentication:

```sql
insert into public.admin_users (user_id)
values ('AUTH_USER_UUID')
on conflict (user_id) do nothing;
```

Email được Supabase Auth quản lý trong `auth.users`; không lưu email hoặc role trong `public.admin_users`.
4. Đặt Edge Function secrets: `HASH_SECRET` (chuỗi ngẫu nhiên dài), `TURNSTILE_SECRET_KEY`, `ALLOWED_ORIGIN=https://mt-web3.github.io`.
5. Deploy hai functions: `submit-application` và `application-status`.
6. Thêm GitHub repository secrets từ `.env.example`. Anon key là public-by-design nhưng vẫn được bảo vệ bằng RLS.

## GitHub Pages

Trong repository Settings → Pages, chọn **GitHub Actions** làm nguồn. Workflow `.github/workflows/deploy.yml` tự động deploy khi push vào `main`.

## Vận hành

- Draft: chỉ admin xem, không nhận hồ sơ.
- Upcoming: hiển thị công khai nhưng chưa nhận hồ sơ.
- Active: nhận hồ sơ trong khoảng thời gian cấu hình.
- Ended: ngừng nhận hồ sơ, giữ dữ liệu theo `retention_days` (mặc định 180 ngày).
- Khi duyệt, chỉ cập nhật `pending` → `approved` hoặc `rejected`; không ghi thông tin nhạy cảm vào review note.
- Xuất CSV chỉ dành cho admin xác thực; file xuất cần được lưu và chia sẻ như dữ liệu nhạy cảm.
- Lập lịch xóa hồ sơ quá hạn bằng Supabase Cron theo truy vấn mẫu cuối migration.

## Kiểm thử

```bash
npm test
npm run build
```

## Chính sách an toàn

Không bao giờ yêu cầu private key/seed phrase. Không công khai submission. Không tuyên bố quyền sở hữu tài khoản X đã được xác minh chỉ dựa trên các URL do người dùng cung cấp.
