// (Challenge) Lưu nháp form đăng ký vào localStorage: lỡ đóng tab thì mở lại vẫn còn chữ đã gõ.
// localStorage chỉ lưu CHUỖI → dùng JSON.stringify khi ghi, JSON.parse khi đọc.
const DRAFT_KEY = 'eduhub.registerDraft';

// Tuyệt đối không lưu mật khẩu: ai mở DevTools trên máy này cũng đọc được localStorage
const DRAFT_FIELDS = ['studentId', 'name', 'email'];

export function saveDraft(form) {
  const draft = {};
  for (const name of DRAFT_FIELDS) draft[name] = form.elements[name].value;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function restoreDraft(form) {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY)) ?? {};
    for (const name of DRAFT_FIELDS) {
      if (typeof draft[name] === 'string') form.elements[name].value = draft[name];
    }
  } catch {
    // Dữ liệu hỏng (ai đó sửa tay trong DevTools) → bỏ nháp, không làm hỏng trang
    clearDraft();
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
