// Tệp TypeScript duy nhất của Ch03: các hàm định dạng dữ liệu để hiển thị.
// Kiểu giúp tsc báo lỗi TRƯỚC khi chạy, ví dụ gọi formatSeats(event) mà event thiếu capacity.

/** Phần dữ liệu sự kiện cần để tính số chỗ — chỉ 2 trường, không cần cả EventDto. */
export interface SeatInfo {
  capacity: number;
  registeredCount: number;
}

/** Union type: tình trạng chỗ chỉ có thể là một trong ba chuỗi này. */
export type SeatStatus = 'available' | 'almost-full' | 'full';

// Còn dưới 20% chỗ thì coi là "Sắp hết chỗ" (giống quy ước ở Ch02)
const ALMOST_FULL_RATIO = 0.2;

// Server lưu giờ UTC; sinh viên ở Việt Nam nên luôn hiển thị theo giờ Việt Nam
const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** "2026-10-17T00:30:00.000Z" → "07:30 Thứ Bảy, 17/10/2026" */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function getSeatsLeft(seat: SeatInfo): number {
  // Math.max: phòng khi dữ liệu lỗi làm số đăng ký vượt sức chứa
  return Math.max(0, seat.capacity - seat.registeredCount);
}

export function getSeatStatus(seat: SeatInfo): SeatStatus {
  const left = getSeatsLeft(seat);
  if (left === 0) return 'full';
  if (left < seat.capacity * ALMOST_FULL_RATIO) return 'almost-full';
  return 'available';
}

/** { capacity: 60, registeredCount: 48 } → "Còn 12/60 chỗ" */
export function formatSeats(seat: SeatInfo): string {
  if (getSeatStatus(seat) === 'full') return `Đã đủ ${seat.capacity} chỗ`;
  return `Còn ${getSeatsLeft(seat)}/${seat.capacity} chỗ`;
}

// Định nghĩa kiểu StatusKind chỉ chấp nhận 3 giá trị cố định
type StatusKind = 'loading' | 'empty' | 'error';

// Viết hàm label nhận vào tham số kiểu StatusKind và trả về kiểu string (tiếng Việt)
function label(kind: StatusKind): string {
  switch (kind) {
    case 'loading':
      return 'Đang tải...';
    case 'empty':
      return 'Không có dữ liệu';
    case 'error':
      return 'Đã xảy ra lỗi';
    default:
      return 'Không xác định';
  }
}

// Thử gọi hàm với giá trị hợp lệ:
console.log(label('loading')); // Chạy bình thường, in ra "Đang tải..."

// Thử gọi hàm với giá trị KHÔNG hợp lệ (Ví dụ: 'done') để xem TypeScript báo lỗi:
//console.log(label('done'));

// Viết generic function nhận vào mảng kiểu T[], trả về phần tử kiểu T hoặc undefined
function first<T>(items: T[]): T | undefined {
 return items[0];
}
const n = first([40, 60]);
// T = number → n: number | undefined
const s = first(['Tin học']);
// T = string → s: string | undefined
