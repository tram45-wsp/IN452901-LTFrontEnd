// Form tạo tài khoản thành viên: kiểm dữ liệu ở trình duyệt, gửi POST /api/auth/register,
// rồi hiện kết quả. Lỗi của trình duyệt và lỗi server (400, 409) hiện cùng một chỗ: dưới từng ô.
import { ApiError, registerMember } from './api.js';
import { clearDraft, restoreDraft, saveDraft } from './register-draft.js';
import { el } from './render.js';

const form = document.querySelector('#register-form');
const alertBox = document.querySelector('#form-alert');
const submitButton = form.querySelector('button[type="submit"]');

const STUDENT_ID_PATTERN = /^\d{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/** FormData đọc mọi ô theo thuộc tính name — không cần querySelector từng ô */
function readForm() {
  const data = new FormData(form);
  return {
    studentId: data.get('studentId').trim(),
    name: data.get('name').trim(),
    email: data.get('email').trim(),
    password: data.get('password'),
    passwordConfirm: data.get('passwordConfirm'),
    agree: data.has('agree'), // checkbox chưa tích thì không có trong FormData
  };
}

/**
 * Kiểm dữ liệu trước khi gửi. Trả về lỗi theo đúng dạng `errors` server gửi về
 * ({ email: ['…'] }) để dùng chung hàm showFieldErrors. Object rỗng = hợp lệ.
 */
function validate(values) {
  const errors = {};
  if (!STUDENT_ID_PATTERN.test(values.studentId)) errors.studentId = ['Mã số sinh viên gồm đúng 10 chữ số.'];
  if (values.name.length < 2) errors.name = ['Họ và tên cần ít nhất 2 ký tự.'];
  if (!EMAIL_PATTERN.test(values.email)) errors.email = ['Email chưa đúng dạng, ví dụ mssv@sv.dthu.edu.vn.'];
  if (values.password.length < MIN_PASSWORD_LENGTH) errors.password = [`Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`];
  if (values.passwordConfirm !== values.password) errors.passwordConfirm = ['Hai lần nhập mật khẩu chưa khớp.'];
  if (!values.agree) errors.agree = ['Bạn cần đồng ý với nội quy để tạo tài khoản.'];
  return errors;
}

// ---- Hiện thông báo ----

function clearMessages() {
  alertBox.replaceChildren();
  for (const box of form.querySelectorAll('[data-error-for]')) box.textContent = '';
  for (const input of form.querySelectorAll('[aria-invalid]')) input.removeAttribute('aria-invalid');
}

function showFieldErrors(errors) {
  for (const [fieldName, messages] of Object.entries(errors)) {
    const box = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (box) box.textContent = messages.join(' ');
    // aria-invalid: trình đọc màn hình đọc "không hợp lệ" khi người dùng vào ô này
    form.elements[fieldName]?.setAttribute('aria-invalid', 'true');
  }
  // Đưa con trỏ tới ô lỗi đầu tiên để sửa ngay
  form.querySelector('[aria-invalid="true"]')?.focus();
}

function showAlert(kind, message) {
  const role = kind === 'error' ? 'alert' : 'status';
  alertBox.replaceChildren(el('p', { className: `alert alert--${kind}`, text: message, attrs: { role } }));
}

function setSubmitting(isSubmitting) {
  // Khoá nút khi đang gửi: bấm hai lần sẽ gửi hai request
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? 'Đang gửi…' : 'Tạo tài khoản';
}

// ---- Gửi form ----

function showRegisterError(error) {
  if (error instanceof ApiError && error.status === 409) {
    showFieldErrors({ email: [error.message] });
    showAlert('error', 'Email này đã có tài khoản. Hãy dùng email khác.');
  } else if (error instanceof ApiError && error.status === 400) {
    showFieldErrors(error.fieldErrors);
    showAlert('error', 'Thông tin chưa hợp lệ — xem lỗi ngay dưới từng ô.');
  } else {
    showAlert('error', error.message);
  }
}

async function handleSubmit(event) {
  event.preventDefault(); // không để trình duyệt tự gửi form và tải lại trang
  clearMessages();

  const values = readForm();
  const errors = validate(values);
  if (Object.keys(errors).length > 0) {
    showFieldErrors(errors);
    return;
  }

  setSubmitting(true);
  try {
    const member = await registerMember(values);
    form.reset();
    showAlert('success', `Đã tạo tài khoản cho ${member.name} (${member.email}). Chào mừng bạn đến với EduHub!`);
  } catch (error) {
    showRegisterError(error);
  } finally {
    setSubmitting(false);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('reset', () => {
  clearMessages();
  clearDraft();
});

// (Challenge ch3-T7) nháp tự lưu mỗi lần gõ, tự điền lại khi mở trang
form.addEventListener('input', () => saveDraft(form));
restoreDraft(form);
