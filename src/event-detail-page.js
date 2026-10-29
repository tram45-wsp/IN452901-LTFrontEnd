// Trang chi tiết: đọc id từ URL (event-detail.html?id=…), tải sự kiện và điền vào khung HTML có sẵn.
import { getClub, getEvent } from './api.js';
import { getClubImage } from './club-images.js';
import { createEventMeta, createTime, renderStatus } from './render.js';
import { getSeatsLeft, getSeatStatus } from './utils/format.ts';

const statusBox = document.querySelector('#detail-status');
const article = document.querySelector('#event-detail');

/** Phần tử có data-field="…" trong khung chi tiết */
function field(name) {
  return article.querySelector(`[data-field="${name}"]`);
}

function getEventIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function describeCallToAction(event) {
  if (getSeatStatus(event) === 'full') return 'Sự kiện đã đủ chỗ — theo dõi các sự kiện khác nhé.';
  return `Còn ${getSeatsLeft(event)} chỗ. Đăng ký tham gia cần tài khoản thành viên.`;
}

function fillDetail(event, clubName) {
  // Tiêu đề tab trình duyệt đổi theo sự kiện
  document.title = `${event.name} · EduHub Web`;

  field('meta').replaceWith(createEventMeta(event, clubName));
  field('name').textContent = event.name;
  field('club').textContent = clubName;
  field('time').replaceChildren(createTime(event.startTime));
  field('location').textContent = event.location;
  field('seats').textContent = `${event.capacity} (còn ${getSeatsLeft(event)} chỗ)`;
  field('description').textContent = event.description;
  field('cta').textContent = describeCallToAction(event);

  const image = field('image');
  image.src = getClubImage(event.clubId);
  image.alt = `Biểu tượng ${clubName}`;

  statusBox.replaceChildren();
  article.hidden = false;
}

async function loadDetail() {
  const id = getEventIdFromUrl();
  if (!id) {
    renderStatus(statusBox, 'empty', 'Đường dẫn thiếu mã sự kiện. Hãy chọn một sự kiện trong lịch.');
    return;
  }

  renderStatus(statusBox, 'loading', 'Đang tải sự kiện…');
  try {
    const event = await getEvent(id);
    // Tên CLB chỉ để hiển thị: lỗi thì dùng chữ chung, không làm hỏng cả trang
    const club = await getClub(event.clubId).catch(() => null);
    fillDetail(event, club?.name ?? 'Câu lạc bộ');
  } catch (error) {
    if (error.status === 404) {
      renderStatus(statusBox, 'empty', 'Không tìm thấy sự kiện này. Có thể sự kiện đã bị xoá.');
    } else {
      renderStatus(statusBox, 'error', error.message, { label: 'Thử lại', onClick: loadDetail });
    }
  }
}

loadDetail();
