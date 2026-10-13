# MT-Web3 Community

Nền tảng quản lý chiến dịch cộng đồng Web3, frontend tĩnh trên GitHub Pages và backend Supabase Edge Functions/Postgres.

## Kiến trúc

- React + TypeScript + Vite: giao diện responsive, dark/light mode, GitHub Pages.
- Supabase Postgres: campaigns, applications, admin roles; RLS mặc định chặn dữ liệu cá nhân.
- Supabase Auth: GitHub và magic link cho quản trị viên.
- Edge Functions: nhận hồ sơ, tra cứu trạng thái bằng handle X (hỗ trợ mã cũ), giới hạn tần suất trong database.
- GitHub Actions: test, build và deploy Pages từ `main`.

Không có service-role key trong frontend. Migration ban đầu seed FungoLabs ở trạng thái `draft`; admin quản lý trạng thái thực tế trong database.

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
4. Đặt Edge Function secrets: `HASH_SECRET` (chuỗi ngẫu nhiên dài), `ALLOWED_ORIGIN=https://mt-web3.github.io`. `TURNSTILE_SECRET_KEY` chỉ bật khi frontend đã có bộ cấp token chống bot tương ứng.
5. Deploy hai functions: `submit-application` và `application-status`.
6. Thêm GitHub repository secrets từ `.env.example`. Anon key là public-by-design nhưng vẫn được bảo vệ bằng RLS.

Khi nâng cấp bản đã triển khai, áp dụng migration `202610140001_handle_lookup.sql` trước khi deploy hai functions. Migration thêm chỉ mục handle và bộ giới hạn yêu cầu nguyên tử; chỉ service role được gọi bộ giới hạn. Không mở quyền đọc bảng hồ sơ cho anonymous hoặc authenticated user thông thường.

Nếu deploy bằng editor trên dashboard, chạy `node scripts/bundle-functions.mjs` rồi dùng source tương ứng trong `.supabase-bundles`. Script chỉ ghép các module local vào một file; không chứa thông tin kết nối hay credentials. Supabase CLI có thể deploy trực tiếp source trong `supabase/functions`.

## GitHub Pages

Trong repository Settings → Pages, chọn **GitHub Actions** làm nguồn. Workflow `.github/workflows/deploy.yml` tự động deploy khi push vào `main`.

## Vận hành

- Draft: chỉ admin xem, không nhận hồ sơ.
- Upcoming: hiển thị công khai nhưng chưa nhận hồ sơ.
- Active: nhận hồ sơ trong khoảng thời gian cấu hình.
- Ended: ngừng nhận hồ sơ, giữ dữ liệu theo `retention_days` (mặc định 180 ngày).
- Khi duyệt, chỉ cập nhật `pending` → `approved` hoặc `rejected`; không ghi thông tin nhạy cảm vào review note.
- Xuất CSV chỉ dành cho admin xác thực; file xuất cần được lưu và chia sẻ như dữ liệu nhạy cảm.
- Dashboard đọc chiến dịch từ database. Tạo chiến dịch hỗ trợ tên, dự án, mô tả, giveaway/allowlist, phần thưởng, số suất, ngày giờ, task theo dòng và ví EVM tùy chọn. Form hiện dùng handle X và hai link bài viết; task được xét duyệt thủ công, không tự kiểm tra follow hoặc chọn người thắng.
- Xuất CSV lấy toàn bộ hồ sơ theo bộ lọc đang chọn, có BOM UTF-8 cho tiếng Việt và vô hiệu hóa giá trị có thể bị spreadsheet diễn giải thành công thức.
- Form tự dựng URL profile từ handle, chấp nhận `x.com/.../status/...` không có `https://`, chuẩn hóa về HTTPS và kiểm tra trùng ID bài viết. ID chỉ được dùng nội bộ trong database. Không hiển thị ID trên trang tra cứu, thông báo gửi đơn, danh sách admin hoặc CSV; người dùng chỉ cần handle.
- Tra cứu handle hiển thị tên chiến dịch, trạng thái và thời gian cập nhật. ID trong phản hồi chỉ dùng làm khóa nội bộ, không render lên giao diện. Bất kỳ ai biết handle có thể xem trạng thái; giao diện nêu rõ điều này trước khi gửi đơn. Không trả ví, minh chứng hay review note.
- Giao diện là workspace cố định trong viewport, chuyển màn hình qua điều hướng/tab. Nội dung dài cuộn trong khung riêng; desktop và mobile không cuộn toàn bộ document. Thiết kế lấy cảm hứng từ cách xử lý typography và chuyển động của Hello Monday: typography lớn, nhân vật người dùng cung cấp, đường nét Canvas biến dạng, parallax theo con trỏ, phản hồi chạm và chuyển cảnh CSS. Tôn trọng giảm chuyển động, không gọi dịch vụ AI.
- Lập lịch xóa hồ sơ quá hạn bằng Supabase Cron theo truy vấn mẫu cuối migration.

## Kiểm thử

```bash
npm test
npm run build
```

## Chính sách an toàn

Không bao giờ yêu cầu private key/seed phrase. Không công khai nội dung hồ sơ; chỉ trạng thái tối thiểu có thể được tra cứu bằng handle. Không tuyên bố quyền sở hữu tài khoản X đã được xác minh chỉ dựa trên các URL do người dùng cung cấp.

## Ngôn ngữ và lịch chiến dịch

- VI/EN có bộ chọn trên header, lưu lựa chọn local và cập nhật ngôn ngữ HTML. Nhãn, thông báo, control, ngày giờ và CSV theo ngôn ngữ đã chọn. Bản tiếng Anh của nội dung chiến dịch được lưu trong `form_config.translations.en`; thiếu bản dịch thì giữ nguyên nội dung gốc. Chuỗi giao diện tiếng Anh ở `src/locales/en.json`.
- Bắt buộc chọn ngày/giờ bắt đầu, kể cả bản nháp. Hạn kết thúc tùy chọn và được ghi rõ là không đặt hạn. Calendar dialog chọn ngày theo ô, tháng/năm bằng control và giờ/phút bằng danh sách; không có ô nhập từng phần tháng/ngày/năm.
- Áp dụng migration `202610140002_campaign_start.sql` để database cũng chặn chiến dịch mới/cập nhật thiếu ngày bắt đầu. Những bản nháp cũ được giữ nguyên, nhưng cần chọn ngày khi lưu lần tiếp theo.
