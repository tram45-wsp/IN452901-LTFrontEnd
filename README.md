# EduHub Web — Ch03 (solution)

Bản mẫu chương 3 môn **IN4529 — Lập trình Front End**: giao diện Ch02 được nối với **mock API EduHub** bằng JavaScript thuần (ES modules, DOM, `fetch`), đóng gói bằng **Vite 8**, kiểm lỗi bằng **ESLint 10**, và một tệp **TypeScript** nhập môn.

- `events.html` — danh sách sự kiện tải từ `GET /api/events`; tìm theo tên (chờ 300 ms sau khi ngừng gõ), lọc theo CLB, bộ lọc ghi lên URL, có trạng thái đang tải / không có kết quả / lỗi + nút "Thử lại", huỷ request cũ bằng `AbortController`.
- `event-detail.html?id=…` — chi tiết một sự kiện, báo "Không tìm thấy" khi API trả 404.
- `register.html` — tạo tài khoản thành viên bằng `POST /api/auth/register`; kiểm dữ liệu ở trình duyệt, hiện lỗi 400 dưới từng ô, lỗi 409 (email đã dùng) ở ô email. Bài challenge: lưu nháp vào `localStorage`.
- `index.html` — giữ nguyên Ch02 (trang tĩnh).

## Yêu cầu

Node.js 22 trở lên (khuyến nghị Node 24 LTS). Kiểm tra: `node -v`.

## Chạy

Mở **hai** cửa sổ terminal trong thư mục này:

```bash
npm install        # lần đầu
npm run api        # terminal 1: mock API ở http://localhost:4000
npm run dev        # terminal 2: trang web ở http://localhost:5173
```

Mở <http://localhost:5173/events.html>. Muốn thấy trạng thái "Đang tải…" và lỗi, chạy mock API với cờ:

```bash
node mock-api/server.mjs --delay=800 --fail-rate=0.3
```

### Địa chỉ API

`src/config.js` đọc biến `VITE_API_URL`, mặc định `http://localhost:4000`. Đổi địa chỉ: chép `.env.example` thành `.env.local` rồi sửa (khởi động lại `npm run dev`).

### Cổng 5173 và CORS

Mock API chỉ cho trang ở `http://localhost:5173` gọi tới (biến `CORS_ORIGINS`, xem `mock-api/README.md`). Vì vậy `vite.config.js` cho cả `npm run dev` lẫn `npm run preview` dùng cổng **5173**. Nếu báo *Port 5173 is already in use*: tắt tiến trình đang chiếm cổng, hoặc chạy

```bash
CORS_ORIGINS=http://localhost:4173 npm run api
npx vite preview --port 4173
```

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy thử, tự tải lại khi sửa code |
| `npm run build` | Đóng gói vào `dist/` (đủ 4 trang) |
| `npm run preview` | Xem bản `dist/` như khi deploy |
| `npm run api` | Mock API EduHub cổng 4000 |
| `npm run lint` | ESLint kiểm lỗi JavaScript |
| `npm run typecheck` | `tsc --noEmit` kiểm kiểu `src/utils/format.ts` |

Kiểm tra đầy đủ: `npm ci && npm run lint && npm run typecheck && npm run build`.

## Cấu trúc

```
solution/
├── index.html, events.html, event-detail.html, register.html
├── css/                    # CSS của Ch02 + mục "Ch03" cuối components.css (bộ lọc, trạng thái, thông báo)
├── assets/                 # Ảnh SVG; ảnh CLB được import trong src/club-images.js
├── public/assets/og-image.png  # Chép nguyên vào dist/ (ảnh Open Graph)
├── src/
│   ├── config.js           # API_URL từ VITE_API_URL
│   ├── api.js              # fetch + ApiError: getEvents, getEvent, getClubs, getClub, registerMember
│   ├── render.js           # Tạo DOM an toàn bằng textContent: card, nhãn chỗ, hộp trạng thái
│   ├── club-images.js      # id CLB → ảnh
│   ├── events-page.js      # Trang danh sách: tìm, lọc, URL, AbortController
│   ├── event-detail-page.js
│   ├── register-page.js    # FormData, kiểm dữ liệu, hiện lỗi 400/409
│   ├── register-draft.js   # (challenge) nháp form trong localStorage
│   └── utils/
│       ├── format.ts       # Tệp TypeScript: định dạng ngày giờ, số chỗ
│       └── debounce.js
├── mock-api/               # Bản chép từ 02_Projects/mock-api — không sửa ở đây
├── vite.config.js          # Multi-page: build.rolldownOptions.input
├── eslint.config.js        # ESLint 10 flat config
├── tsconfig.json
├── TASKS.md                # Danh sách nhiệm vụ ch3-T1…T7 (cho giảng viên)
└── README.md
```

## Ghi chú

- Dữ liệu từ server chỉ được gắn vào trang bằng `textContent` / `setAttribute`, không dùng `innerHTML` (tránh XSS).
- `index.html` vẫn là trang tĩnh của Ch02; link card trên trang chủ trỏ về `events.html` vì các sự kiện mẫu ở đó không có trong mock API.
- So với Ch02: `events.html` bỏ 8 card tĩnh và bảng "Lịch tổng hợp" (thay bằng danh sách từ API); `event-detail.html` thành khung trống để JS điền; form `register.html` chỉ giữ các trường API nhận (`studentId`, `name`, `email`, `password`) + "Nhập lại mật khẩu" + ô đồng ý nội quy.
- Deploy GitHub Pages: `vite.config.js` đặt `base: './'`; đặt `VITE_API_URL` trỏ tới mock API công khai của giảng viên trước khi `npm run build`, rồi đưa thư mục `dist/` lên Pages.
