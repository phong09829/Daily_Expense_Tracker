/**
 * ExpenseFlow Pro - Progressive Web App (PWA) Quản lý Chi tiêu Cá nhân
 * Xác thực bảo mật bằng Mã PIN 6 số riêng biệt cho từng tài khoản Gmail
 * Cô lập dữ liệu riêng tư cho từng cá nhân (Multi-User Data Isolation)
 */

/* ==========================================================================
   1. HẰNG SỐ & KHÓA LƯU TRỮ
   ========================================================================== */
const STORAGE_KEYS = {
  CURRENT_SESSION: "expenseflow_auth_session",
  USER_DATA_PREFIX: "expenseflow_txs_",
  PIN_PREFIX: "expenseflow_pin_v3_"
};

const CATEGORIES = {
  expense: [
    { id: "food", name: "Ăn uống", icon: "fa-utensils", color: "#f97316" },
    { id: "transport", name: "Di chuyển & Xăng xe", icon: "fa-car", color: "#3b82f6" },
    { id: "housing", name: "Tiền nhà & Hóa đơn", icon: "fa-house", color: "#8b5cf6" },
    { id: "shopping", name: "Mua sắm", icon: "fa-bag-shopping", color: "#ec4899" },
    { id: "entertainment", name: "Giải trí & Du lịch", icon: "fa-gamepad", color: "#06b6d4" },
    { id: "health", name: "Sức khỏe & Y tế", icon: "fa-heart-pulse", color: "#ef4444" },
    { id: "education", name: "Học tập & Sách", icon: "fa-graduation-cap", color: "#eab308" },
    { id: "other_expense", name: "Chi tiêu khác", icon: "fa-ellipsis", color: "#64748b" }
  ],
  income: [
    { id: "salary", name: "Tiền lương", icon: "fa-money-bill-wave", color: "#10b981" },
    { id: "bonus", name: "Tiền thưởng & Thưởng lễ", icon: "fa-gift", color: "#14b8a6" },
    { id: "investment", name: "Đầu tư / Lãi ngân hàng", icon: "fa-chart-line", color: "#6366f1" },
    { id: "business", name: "Kinh doanh & Bán lẻ", icon: "fa-store", color: "#f59e0b" },
    { id: "other_income", name: "Thu nhập khác", icon: "fa-coins", color: "#84cc16" }
  ]
};

const CHART_PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", 
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", 
  "#ec4899", "#64748b"
];

/* ==========================================================================
   2. TRẠNG THÁI ỨNG DỤNG (STATE)
   ========================================================================== */
let currentUser = null; // { email, displayName, avatar, loginAt }
let allTransactions = [];
let expenseChartInstance = null;
let deferredPrompt = null;
let transactionToDeleteId = null;

// Trạng thái xác thực tài khoản đang xử lý
let pendingAuth = {
  email: "",
  isNewAccount: false,
  isHeroPinVisible: false,
  isModalPinVisible: false
};

const currentFilter = {
  month: getCurrentMonthString(),
  type: "all",
  category: "all",
  searchKeyword: ""
};

/* ==========================================================================
   3. DOM ELEMENTS
   ========================================================================== */
const DOM = {
  // PWA
  pwaInstallBanner: document.getElementById("pwaInstallBanner"),
  pwaInstallActionBtn: document.getElementById("pwaInstallActionBtn"),
  pwaCloseBannerBtn: document.getElementById("pwaCloseBannerBtn"),
  headerInstallBtn: document.getElementById("headerInstallBtn"),
  navInstallBtn: document.getElementById("navInstallBtn"),
  iosInstallModal: document.getElementById("iosInstallModal"),
  closeIosInstallModalBtn: document.getElementById("closeIosInstallModalBtn"),

  // Views & Screen
  loadingScreen: document.getElementById("loadingScreen"),
  guestView: document.getElementById("guestView"),
  appView: document.getElementById("appView"),

  // Header & Auth
  openLoginModalBtn: document.getElementById("openLoginModalBtn"),
  userProfile: document.getElementById("userProfile"),
  userAvatar: document.getElementById("userAvatar"),
  userName: document.getElementById("userName"),
  userEmailTag: document.getElementById("userEmailTag"),
  logoutBtn: document.getElementById("logoutBtn"),

  // Hero PIN Elements (Guest View)
  heroPinStepEmail: document.getElementById("heroPinStepEmail"),
  heroEmailForm: document.getElementById("heroEmailForm"),
  heroGmailInput: document.getElementById("heroGmailInput"),
  heroEmailSubmitBtn: document.getElementById("heroEmailSubmitBtn"),
  heroPinStepVerify: document.getElementById("heroPinStepVerify"),
  heroPinTitle: document.getElementById("heroPinTitle"),
  heroPinSubtitle: document.getElementById("heroPinSubtitle"),
  heroTargetEmailDisplay: document.getElementById("heroTargetEmailDisplay"),
  heroChangeEmailBtn: document.getElementById("heroChangeEmailBtn"),
  heroPinInputWrapper: document.getElementById("heroPinInputWrapper"),
  heroPinRealInput: document.getElementById("heroPinRealInput"),
  heroPinBoxes: document.querySelectorAll(".hero-pin-box"),
  heroTogglePinVisibilityBtn: document.getElementById("heroTogglePinVisibilityBtn"),
  heroPinEyeIcon: document.getElementById("heroPinEyeIcon"),
  heroPinEyeText: document.getElementById("heroPinEyeText"),
  heroResetPinBtn: document.getElementById("heroResetPinBtn"),
  heroVerifyPinBtn: document.getElementById("heroVerifyPinBtn"),
  heroVerifyPinBtnText: document.getElementById("heroVerifyPinBtnText"),

  // Modal PIN Elements (Header Button)
  loginModal: document.getElementById("loginModal"),
  loginModalBackdrop: document.getElementById("loginModalBackdrop"),
  closeLoginModalBtn: document.getElementById("closeLoginModalBtn"),
  modalPinStepEmail: document.getElementById("modalPinStepEmail"),
  modalEmailForm: document.getElementById("modalEmailForm"),
  modalGmailInput: document.getElementById("modalGmailInput"),
  modalEmailSubmitBtn: document.getElementById("modalEmailSubmitBtn"),
  modalPinStepVerify: document.getElementById("modalPinStepVerify"),
  modalPinTitle: document.getElementById("modalPinTitle"),
  modalPinSubtitle: document.getElementById("modalPinSubtitle"),
  modalTargetEmailDisplay: document.getElementById("modalTargetEmailDisplay"),
  modalChangeEmailBtn: document.getElementById("modalChangeEmailBtn"),
  modalPinInputWrapper: document.getElementById("modalPinInputWrapper"),
  modalPinRealInput: document.getElementById("modalPinRealInput"),
  modalPinBoxes: document.querySelectorAll(".modal-pin-box"),
  modalTogglePinVisibilityBtn: document.getElementById("modalTogglePinVisibilityBtn"),
  modalPinEyeIcon: document.getElementById("modalPinEyeIcon"),
  modalPinEyeText: document.getElementById("modalPinEyeText"),
  modalResetPinBtn: document.getElementById("modalResetPinBtn"),
  modalVerifyPinBtn: document.getElementById("modalVerifyPinBtn"),
  modalVerifyPinBtnText: document.getElementById("modalVerifyPinBtnText"),

  // Mobile Bottom Navigation
  navOverviewBtn: document.getElementById("navOverviewBtn"),
  navChartBtn: document.getElementById("navChartBtn"),
  navHistoryBtn: document.getElementById("navHistoryBtn"),
  mobileAddFabBtn: document.getElementById("mobileAddFabBtn"),
  overviewSection: document.getElementById("overviewSection"),
  chartSection: document.getElementById("chartSection"),
  transactionsSection: document.getElementById("transactionsSection"),

  // KPIs
  totalIncome: document.getElementById("totalIncome"),
  totalExpense: document.getElementById("totalExpense"),
  netBalance: document.getElementById("netBalance"),
  incomeCount: document.getElementById("incomeCount"),
  expenseCount: document.getElementById("expenseCount"),
  balanceStatus: document.getElementById("balanceStatus"),

  // Controls & Filters
  monthFilter: document.getElementById("monthFilter"),
  resetMonthBtn: document.getElementById("resetMonthBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  typeFilterBtns: document.querySelectorAll(".type-filter-btn"),
  filteredCountBadge: document.getElementById("filteredCountBadge"),

  // Transactions & Charts
  transactionsList: document.getElementById("transactionsList"),
  noTransactionsState: document.getElementById("noTransactionsState"),
  expenseCategoryChart: document.getElementById("expenseCategoryChart"),
  chartEmptyState: document.getElementById("chartEmptyState"),
  categoryBreakdownList: document.getElementById("categoryBreakdownList"),

  // Modal Giao Dịch
  openAddModalBtn: document.getElementById("openAddModalBtn"),
  transactionModal: document.getElementById("transactionModal"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelModalBtn: document.getElementById("cancelModalBtn"),
  transactionForm: document.getElementById("transactionForm"),
  modalTitle: document.getElementById("modalTitle"),
  modalIcon: document.getElementById("modalIcon"),
  modalIconContainer: document.getElementById("modalIconContainer"),
  editTransactionId: document.getElementById("editTransactionId"),
  amountInput: document.getElementById("amountInput"),
  amountWords: document.getElementById("amountWords"),
  categorySelect: document.getElementById("categorySelect"),
  dateInput: document.getElementById("dateInput"),
  noteInput: document.getElementById("noteInput"),
  saveTransactionBtn: document.getElementById("saveTransactionBtn"),

  // Delete Modal
  deleteModal: document.getElementById("deleteModal"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

  // Toast Container
  toastContainer: document.getElementById("toastContainer")
};

/* ==========================================================================
   4. KHỞI CHẠY ỨNG DỤNG
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // 0. Reset toàn bộ mã PIN cũ của tất cả tài khoản theo yêu cầu
  resetAllExistingPins();

  // 1. Đăng ký Service Worker (PWA)
  registerServiceWorker();

  // 2. Lắng nghe Install Prompt
  setupPwaInstallPrompt();

  // 3. Khôi phục phiên đăng nhập (nếu đã lưu)
  restoreUserSession();

  // 4. Lắng nghe sự kiện giao diện
  setupEventListeners();
  setupPinInputHandlers();
  populateCategorySelect("expense");
  setDefaultModalDate();
});

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then((reg) => console.log("[PWA] Service Worker đăng ký thành công:", reg.scope))
        .catch((err) => console.warn("[PWA] Đăng ký Service Worker thất bại:", err));
    });
  }
}

function setupPwaInstallPrompt() {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (isStandalone) return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (DOM.pwaInstallBanner) DOM.pwaInstallBanner.classList.remove("hidden");
    if (DOM.headerInstallBtn) {
      DOM.headerInstallBtn.classList.remove("hidden");
      DOM.headerInstallBtn.classList.add("flex");
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (DOM.pwaInstallBanner) DOM.pwaInstallBanner.classList.add("hidden");
    if (DOM.headerInstallBtn) DOM.headerInstallBtn.classList.add("hidden");
    showToast("🎉 ExpenseFlow đã được cài đặt vào máy của bạn!", "success");
  });
}

async function triggerPwaInstall() {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIos) {
    if (DOM.iosInstallModal) DOM.iosInstallModal.classList.remove("hidden");
    return;
  }

  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (DOM.pwaInstallBanner) DOM.pwaInstallBanner.classList.add("hidden");
  } else {
    if (DOM.iosInstallModal) DOM.iosInstallModal.classList.remove("hidden");
  }
}

/* ==========================================================================
   5. XÁC THỰC BẢO MẬT BẰNG MÃ PIN 6 SỐ RIÊNG BIỆT CHO TỪNG GMAIL
   ========================================================================== */
function getCleanEmail(email) {
  return (email || "").trim().toLowerCase();
}

function getPinStorageKey(email) {
  const safe = encodeURIComponent(getCleanEmail(email)).replace(/[^a-zA-Z0-9_]/g, "_");
  return `${STORAGE_KEYS.PIN_PREFIX}${safe}`;
}

function hasUserPin(email) {
  return Boolean(localStorage.getItem(getPinStorageKey(email)));
}

async function hashPin(pin) {
  const buffer = new TextEncoder().encode("EXPENSEFLOW_SALT_PIN_" + pin);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function saveUserPin(email, pin) {
  const hashed = await hashPin(pin);
  localStorage.setItem(getPinStorageKey(email), hashed);
}

async function verifyUserPin(email, pin) {
  const savedHash = localStorage.getItem(getPinStorageKey(email));
  if (!savedHash) return false;
  const currentHash = await hashPin(pin);
  return currentHash === savedHash;
}

function restoreUserSession() {
  const rawSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  if (DOM.loadingScreen) DOM.loadingScreen.classList.add("hidden");

  if (rawSession) {
    try {
      const session = JSON.parse(rawSession);
      if (session && session.email) {
        loginUserSuccess(session, false);
        return;
      }
    } catch (e) {
      console.error("Lỗi đọc session:", e);
    }
  }

  // Nếu chưa đăng nhập: Hiển thị màn hình Guest
  showGuestView();
}

function showGuestView() {
  currentUser = null;
  if (DOM.guestView) DOM.guestView.classList.remove("hidden");
  if (DOM.appView) DOM.appView.classList.add("hidden");
  if (DOM.openLoginModalBtn) {
    DOM.openLoginModalBtn.classList.remove("hidden");
    DOM.openLoginModalBtn.classList.add("flex");
  }
  if (DOM.userProfile) {
    DOM.userProfile.classList.add("hidden");
    DOM.userProfile.classList.remove("flex");
  }

  resetPinFlow();
}

function resetAllExistingPins() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("expenseflow_pin_") || k.startsWith("expenseflow_otp_"))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn("Lỗi reset mã PIN cũ:", e);
  }
}

function resetPinFlow() {
  // Hero
  if (DOM.heroPinStepEmail) DOM.heroPinStepEmail.classList.remove("hidden");
  if (DOM.heroPinStepVerify) DOM.heroPinStepVerify.classList.add("hidden");
  if (DOM.heroPinRealInput) DOM.heroPinRealInput.value = "";
  setPinVisibility("hero", false);
  syncPinDisplay("hero");

  // Modal
  if (DOM.modalPinStepEmail) DOM.modalPinStepEmail.classList.remove("hidden");
  if (DOM.modalPinStepVerify) DOM.modalPinStepVerify.classList.add("hidden");
  if (DOM.modalPinRealInput) DOM.modalPinRealInput.value = "";
  setPinVisibility("modal", false);
  syncPinDisplay("modal");

  pendingAuth.email = "";
  pendingAuth.isNewAccount = false;
}

function openLoginModal() {
  if (DOM.loginModal) {
    DOM.loginModal.classList.remove("hidden");
    resetPinFlow();
    if (DOM.modalGmailInput) DOM.modalGmailInput.focus();
  }
}

function closeLoginModal() {
  if (DOM.loginModal) {
    DOM.loginModal.classList.add("hidden");
  }
}

/**
 * Xử lý Bước 1: Người dùng nhập email và bấm Tiếp tục
 */
function handleEmailSubmit(emailInput, scope) {
  const email = getCleanEmail(emailInput.value);

  if (!email || !validateEmail(email)) {
    showToast("Vui lòng nhập địa chỉ Gmail hợp lệ (ví dụ: yourname@gmail.com)!", "warning");
    emailInput.focus();
    return;
  }

  pendingAuth.email = email;
  pendingAuth.isNewAccount = !hasUserPin(email);

  if (scope === "hero") {
    DOM.heroPinStepEmail.classList.add("hidden");
    DOM.heroPinStepVerify.classList.remove("hidden");
    DOM.heroTargetEmailDisplay.textContent = email;

    if (pendingAuth.isNewAccount) {
      DOM.heroPinTitle.textContent = "Thiết lập Mã PIN mới";
      DOM.heroPinSubtitle.innerHTML = `Tài khoản mới: Đặt <b>Mã PIN 6 số bí mật</b> để bảo vệ sổ chi tiêu của:<br><span class="font-bold text-indigo-600 font-mono">${email}</span>`;
      DOM.heroVerifyPinBtnText.textContent = "Tạo Mã PIN & Vào sổ chi tiêu";
      showToast("💡 Tài khoản mới: Vui lòng nhập 6 số bất kỳ để đặt Mã PIN bảo vệ tài khoản này!", "info", 5000);
    } else {
      DOM.heroPinTitle.textContent = "Nhập Mã PIN bảo mật";
      DOM.heroPinSubtitle.innerHTML = `Nhập mã PIN 6 số của tài khoản:<br><span class="font-bold text-indigo-600 font-mono">${email}</span>`;
      DOM.heroVerifyPinBtnText.textContent = "Mở khóa sổ chi tiêu";
    }

    if (DOM.heroPinRealInput) {
      DOM.heroPinRealInput.value = "";
      syncPinDisplay("hero");
      setTimeout(() => DOM.heroPinRealInput.focus(), 100);
    }
  } else {
    DOM.modalPinStepEmail.classList.add("hidden");
    DOM.modalPinStepVerify.classList.remove("hidden");
    DOM.modalTargetEmailDisplay.textContent = email;

    if (pendingAuth.isNewAccount) {
      DOM.modalPinTitle.textContent = "Thiết lập Mã PIN mới";
      DOM.modalPinSubtitle.innerHTML = `Tài khoản mới: Đặt <b>Mã PIN 6 số bí mật</b> để bảo vệ sổ chi tiêu của:<br><span class="font-bold text-indigo-600 font-mono">${email}</span>`;
      DOM.modalVerifyPinBtnText.textContent = "Tạo Mã PIN & Vào sổ chi tiêu";
      showToast("💡 Tài khoản mới: Vui lòng nhập 6 số bất kỳ để đặt Mã PIN bảo vệ tài khoản này!", "info", 5000);
    } else {
      DOM.modalPinTitle.textContent = "Nhập Mã PIN bảo mật";
      DOM.modalPinSubtitle.innerHTML = `Nhập mã PIN 6 số của tài khoản:<br><span class="font-bold text-indigo-600 font-mono">${email}</span>`;
      DOM.modalVerifyPinBtnText.textContent = "Mở khóa sổ chi tiêu";
    }

    if (DOM.modalPinRealInput) {
      DOM.modalPinRealInput.value = "";
      syncPinDisplay("modal");
      setTimeout(() => DOM.modalPinRealInput.focus(), 100);
    }
  }
}

/**
 * Đồng bộ giá trị từ input ẩn sang 6 ô hiển thị trực quan (Single Input Pattern)
 * Ngăn chặn 100% lỗi nhảy số, lỗi thêm số hoặc nhảy cóc ô
 */
function syncPinDisplay(scope) {
  const realInput = scope === "hero" ? DOM.heroPinRealInput : DOM.modalPinRealInput;
  const boxes = scope === "hero" ? DOM.heroPinBoxes : DOM.modalPinBoxes;
  if (!realInput || !boxes || boxes.length === 0) return;

  const isVisible = scope === "hero" ? pendingAuth.isHeroPinVisible : pendingAuth.isModalPinVisible;
  const val = realInput.value.replace(/\D/g, "").slice(0, 6);
  realInput.value = val;

  const isInputFocused = document.activeElement === realInput;
  const activeIdx = Math.min(val.length, boxes.length - 1);

  boxes.forEach((box, i) => {
    box.classList.remove("pin-box-active", "pin-box-filled", "pin-error");
    if (i < val.length) {
      box.textContent = isVisible ? val[i] : "●";
      box.classList.add("pin-box-filled");
    } else {
      box.textContent = "";
      if (i === activeIdx && isInputFocused) {
        box.classList.add("pin-box-active");
      }
    }
  });

  // Tự động kiểm tra xác thực khi nhập đủ 6 chữ số
  if (val.length === 6) {
    setTimeout(() => {
      if (realInput.value.length === 6) {
        handleVerifyPin(scope);
      }
    }, 120);
  }
}

/**
 * Cài đặt xử lý gõ 6 ô PIN (chống nhảy số tuyệt đối qua Single Real Input)
 */
function setupPinInputHandlers() {
  // Hero PIN
  if (DOM.heroPinRealInput) {
    DOM.heroPinRealInput.addEventListener("input", () => syncPinDisplay("hero"));
    DOM.heroPinRealInput.addEventListener("focus", () => syncPinDisplay("hero"));
    DOM.heroPinRealInput.addEventListener("blur", () => syncPinDisplay("hero"));
    DOM.heroPinRealInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleVerifyPin("hero");
      }
    });
  }
  if (DOM.heroPinInputWrapper && DOM.heroPinRealInput) {
    DOM.heroPinInputWrapper.addEventListener("click", () => {
      DOM.heroPinRealInput.focus();
      syncPinDisplay("hero");
    });
  }

  // Modal PIN
  if (DOM.modalPinRealInput) {
    DOM.modalPinRealInput.addEventListener("input", () => syncPinDisplay("modal"));
    DOM.modalPinRealInput.addEventListener("focus", () => syncPinDisplay("modal"));
    DOM.modalPinRealInput.addEventListener("blur", () => syncPinDisplay("modal"));
    DOM.modalPinRealInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleVerifyPin("modal");
      }
    });
  }
  if (DOM.modalPinInputWrapper && DOM.modalPinRealInput) {
    DOM.modalPinInputWrapper.addEventListener("click", () => {
      DOM.modalPinRealInput.focus();
      syncPinDisplay("modal");
    });
  }
}

/**
 * Ẩn / Hiện mã PIN
 */
function setPinVisibility(scope, isVisible) {
  if (scope === "hero") {
    pendingAuth.isHeroPinVisible = isVisible;
    if (DOM.heroPinEyeIcon) DOM.heroPinEyeIcon.className = isVisible ? "fa-regular fa-eye-slash text-sm" : "fa-regular fa-eye text-sm";
    if (DOM.heroPinEyeText) DOM.heroPinEyeText.textContent = isVisible ? "Ẩn mã PIN" : "Hiện mã PIN";
    syncPinDisplay("hero");
  } else {
    pendingAuth.isModalPinVisible = isVisible;
    if (DOM.modalPinEyeIcon) DOM.modalPinEyeIcon.className = isVisible ? "fa-regular fa-eye-slash text-sm" : "fa-regular fa-eye text-sm";
    if (DOM.modalPinEyeText) DOM.modalPinEyeText.textContent = isVisible ? "Ẩn mã PIN" : "Hiện mã PIN";
    syncPinDisplay("modal");
  }
}

/**
 * Đặt lại (Reset) Mã PIN cho tài khoản hiện tại
 */
function handleResetPin(scope) {
  const email = pendingAuth.email;
  if (!email) {
    showToast("Vui lòng nhập email trước!", "warning");
    return;
  }

  localStorage.removeItem(getPinStorageKey(email));
  pendingAuth.isNewAccount = true;

  const realInput = scope === "hero" ? DOM.heroPinRealInput : DOM.modalPinRealInput;
  if (realInput) {
    realInput.value = "";
    syncPinDisplay(scope);
    setTimeout(() => realInput.focus(), 60);
  }

  if (scope === "hero") {
    DOM.heroPinTitle.textContent = "Thiết lập Mã PIN mới";
    DOM.heroPinSubtitle.innerHTML = `Đã reset: Nhập <b>Mã PIN 6 số mới</b> để bảo vệ sổ chi tiêu của:<br><span class="font-bold text-indigo-600 font-mono">${email}</span>`;
    DOM.heroVerifyPinBtnText.textContent = "Tạo Mã PIN & Vào sổ chi tiêu";
  } else {
    DOM.modalPinTitle.textContent = "Thiết lập Mã PIN mới";
    DOM.modalPinSubtitle.innerHTML = `Đã reset: Nhập <b>Mã PIN 6 số mới</b> để bảo vệ sổ chi tiêu của:<br><span class="font-bold text-indigo-600 font-mono">${email}</span>`;
    DOM.modalVerifyPinBtnText.textContent = "Tạo Mã PIN & Vào sổ chi tiêu";
  }

  showToast(`🔄 Đã reset mã PIN cho ${email}! Hãy nhập 6 số mới bất kỳ để tạo lại mã.`, "info", 5000);
}

/**
 * Xử lý Bước 2: Xác thực Mã PIN hoặc Lưu Mã PIN mới
 */
async function handleVerifyPin(scope) {
  const realInput = scope === "hero" ? DOM.heroPinRealInput : DOM.modalPinRealInput;
  const boxes = scope === "hero" ? DOM.heroPinBoxes : DOM.modalPinBoxes;
  const enteredPin = (realInput ? realInput.value : "").replace(/\D/g, "").slice(0, 6);
  const email = pendingAuth.email;

  if (!email) {
    showToast("Vui lòng nhập lại địa chỉ Gmail!", "warning");
    resetPinFlow();
    return;
  }

  if (enteredPin.length < 6) {
    showToast("Vui lòng nhập đủ 6 chữ số Mã PIN!", "warning");
    if (realInput) realInput.focus();
    return;
  }

  // Trường hợp A: Tạo Mã PIN mới cho tài khoản lần đầu đăng nhập hoặc sau khi reset
  if (pendingAuth.isNewAccount) {
    await saveUserPin(email, enteredPin);
    showToast("🎉 Đã thiết lập Mã PIN 6 số thành công! Hãy ghi nhớ mã này.", "success", 5000);
    completeAccountLogin(email, true);
    return;
  }

  // Trường hợp B: Xác thực Mã PIN của tài khoản đã tồn tại
  const isMatch = await verifyUserPin(email, enteredPin);

  if (!isMatch) {
    showToast("❌ Mã PIN không chính xác! Vui lòng thử lại hoặc bấm 'Đặt lại mã PIN'.", "error", 4500);
    boxes.forEach(b => b.classList.add("pin-error"));
    setTimeout(() => {
      boxes.forEach(b => b.classList.remove("pin-error"));
      if (realInput) {
        realInput.value = "";
        syncPinDisplay(scope);
        realInput.focus();
      }
    }, 700);
    return;
  }

  // Đúng mã PIN: Đăng nhập thành công!
  completeAccountLogin(email, false);
}

function completeAccountLogin(email, isBrandNew = false) {
  const namePart = email.split("@")[0];
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  const session = {
    email: email,
    displayName: displayName,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff&bold=true`,
    loginAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  closeLoginModal();
  loginUserSuccess(session, true);
}

function loginUserSuccess(session, isNewLogin = false) {
  currentUser = session;

  // Cập nhật giao diện Header & View
  if (DOM.guestView) DOM.guestView.classList.add("hidden");
  if (DOM.appView) DOM.appView.classList.remove("hidden");
  
  if (DOM.openLoginModalBtn) {
    DOM.openLoginModalBtn.classList.add("hidden");
    DOM.openLoginModalBtn.classList.remove("flex");
  }
  
  if (DOM.userProfile) {
    DOM.userProfile.classList.remove("hidden");
    DOM.userProfile.classList.add("flex");
  }

  if (DOM.userName) DOM.userName.textContent = session.displayName;
  if (DOM.userEmailTag) DOM.userEmailTag.textContent = session.email;
  if (DOM.userAvatar) DOM.userAvatar.src = session.avatar;

  // Nạp dữ liệu riêng biệt của tài khoản Gmail này
  loadUserData(session.email);

  if (isNewLogin) {
    showToast(`Chào mừng ${session.displayName} đăng nhập thành công!`, "success");
  }
}

function handleLogout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    showGuestView();
    allTransactions = [];
    showToast("Đã đăng xuất tài khoản an toàn.", "info");
  }
}

/* ==========================================================================
   6. CÔ LẬP DỮ LIỆU RIÊNG TƯ THEO TỪNG GMAIL (MULTI-USER ISOLATION)
   ========================================================================== */
function getUserStorageKey(email) {
  const safeEmail = encodeURIComponent(email).replace(/[^a-zA-Z0-9_]/g, "_");
  return `${STORAGE_KEYS.USER_DATA_PREFIX}${safeEmail}`;
}

function loadUserData(email) {
  const key = getUserStorageKey(email);
  const rawData = localStorage.getItem(key);
  let list = [];

  if (rawData) {
    try {
      list = JSON.parse(rawData);
    } catch (e) {
      console.error("Lỗi parse data:", e);
      list = [];
    }
  }

  // Nếu tài khoản mới chưa có dữ liệu: Tự động nạp dữ liệu mẫu ban đầu
  if (list.length === 0) {
    list = generateSampleTransactions();
    saveUserData(email, list);
  }

  allTransactions = list;
  updateMonthFilterOptions();
  applyFiltersAndRender();
}

function saveUserData(email, list) {
  const key = getUserStorageKey(email);
  localStorage.setItem(key, JSON.stringify(list));
}

function generateSampleTransactions() {
  const m = getCurrentMonthString();
  return [
    {
      id: "tx-" + Date.now() + "-1",
      type: "income",
      amount: 25000000,
      category: "Tiền lương",
      date: `${m}-05`,
      note: "Lương tháng chuyển khoản ngân hàng",
      createdAt: new Date().toISOString()
    },
    {
      id: "tx-" + Date.now() + "-2",
      type: "expense",
      amount: 4500000,
      category: "Tiền nhà & Hóa đơn",
      date: `${m}-06`,
      note: "Tiền thuê nhà + tiền điện nước",
      createdAt: new Date().toISOString()
    },
    {
      id: "tx-" + Date.now() + "-3",
      type: "expense",
      amount: 680000,
      category: "Ăn uống",
      date: `${m}-08`,
      note: "Đi siêu thị mua thực phẩm tuần",
      createdAt: new Date().toISOString()
    },
    {
      id: "tx-" + Date.now() + "-4",
      type: "expense",
      amount: 150000,
      category: "Di chuyển & Xăng xe",
      date: `${m}-10`,
      note: "Đổ xăng xe máy",
      createdAt: new Date().toISOString()
    },
    {
      id: "tx-" + Date.now() + "-5",
      type: "expense",
      amount: 320000,
      category: "Mua sắm",
      date: `${m}-12`,
      note: "Đồ dùng cá nhân",
      createdAt: new Date().toISOString()
    },
    {
      id: "tx-" + Date.now() + "-6",
      type: "income",
      amount: 3000000,
      category: "Tiền thưởng & Thưởng lễ",
      date: `${m}-15`,
      note: "Thưởng KPI xuất sắc",
      createdAt: new Date().toISOString()
    }
  ];
}

/* ==========================================================================
   7. CRUD GIAO DỊCH THU CHI
   ========================================================================== */
function handleSaveTransaction(e) {
  e.preventDefault();

  if (!currentUser) {
    showToast("Vui lòng đăng nhập để lưu giao dịch!", "warning");
    return;
  }

  const editId = DOM.editTransactionId.value.trim();
  const type = DOM.transactionForm.elements["type"].value;
  const rawAmount = parseCurrencyNumber(DOM.amountInput.value);
  const category = DOM.categorySelect.value;
  const date = DOM.dateInput.value;
  const note = DOM.noteInput.value.trim();

  if (isNaN(rawAmount) || rawAmount <= 0) {
    showToast("Vui lòng nhập số tiền hợp lệ (> 0 VNĐ)!", "warning");
    DOM.amountInput.focus();
    return;
  }

  if (!date) {
    showToast("Vui lòng chọn ngày giao dịch!", "warning");
    DOM.dateInput.focus();
    return;
  }

  const transactionData = {
    type,
    amount: rawAmount,
    category,
    date,
    note: note || (type === "expense" ? "Khoản chi" : "Khoản thu")
  };

  if (editId) {
    const idx = allTransactions.findIndex(t => t.id === editId);
    if (idx !== -1) {
      allTransactions[idx] = {
        ...allTransactions[idx],
        ...transactionData,
        updatedAt: new Date().toISOString()
      };
      showToast("Đã cập nhật giao dịch thành công!", "success");
    }
  } else {
    const newItem = {
      id: "tx-" + Date.now(),
      ...transactionData,
      createdAt: new Date().toISOString()
    };
    allTransactions.unshift(newItem);
    showToast("Đã thêm giao dịch mới!", "success");
  }

  // Lưu trữ dữ liệu vào kho riêng của tài khoản Gmail này
  saveUserData(currentUser.email, allTransactions);
  updateMonthFilterOptions();
  applyFiltersAndRender();
  closeTransactionModal();
}

function openEditTransactionModal(id) {
  const item = allTransactions.find((t) => t.id === id);
  if (!item) return;

  DOM.modalTitle.textContent = "Chỉnh sửa giao dịch";
  DOM.modalIcon.className = "fa-solid fa-pen-to-square";
  DOM.modalIconContainer.className = "w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center";
  DOM.editTransactionId.value = item.id;

  const typeRadios = DOM.transactionForm.elements["type"];
  typeRadios.value = item.type;
  populateCategorySelect(item.type, item.category);

  DOM.amountInput.value = formatCurrencyInput(item.amount);
  updateAmountWords(item.amount);
  DOM.dateInput.value = item.date;
  DOM.noteInput.value = item.note || "";

  DOM.transactionModal.classList.remove("hidden");
  DOM.amountInput.focus();
}

function handleConfirmDelete() {
  if (!currentUser || !transactionToDeleteId) return;

  allTransactions = allTransactions.filter(t => t.id !== transactionToDeleteId);
  saveUserData(currentUser.email, allTransactions);
  updateMonthFilterOptions();
  applyFiltersAndRender();
  showToast("Đã xóa giao dịch thành công!", "success");
  closeDeleteModal();
}

/* ==========================================================================
   8. BỘ LỌC, THỐNG KÊ & BIỂU ĐỒ
   ========================================================================== */
function updateMonthFilterOptions() {
  const monthsSet = new Set();
  monthsSet.add(getCurrentMonthString());

  allTransactions.forEach((t) => {
    if (t.date && t.date.length >= 7) {
      monthsSet.add(t.date.substring(0, 7));
    }
  });

  const sortedMonths = Array.from(monthsSet).sort().reverse();

  let html = `<option value="all">Tất cả các tháng</option>`;
  sortedMonths.forEach((m) => {
    const [year, month] = m.split("-");
    const label = `Tháng ${parseInt(month, 10)}/${year}`;
    const selected = (m === currentFilter.month) ? "selected" : "";
    html += `<option value="${m}" ${selected}>${label}</option>`;
  });

  DOM.monthFilter.innerHTML = html;
  updateCategoryFilterDropdown();
}

function updateCategoryFilterDropdown() {
  const currentCategoryVal = DOM.categoryFilter.value || "all";
  const allCatNames = new Set();

  CATEGORIES.expense.forEach(c => allCatNames.add(c.name));
  CATEGORIES.income.forEach(c => allCatNames.add(c.name));

  let html = `<option value="all">Tất cả danh mục</option>`;
  allCatNames.forEach(cat => {
    const selected = (cat === currentCategoryVal) ? "selected" : "";
    html += `<option value="${cat}" ${selected}>${cat}</option>`;
  });

  DOM.categoryFilter.innerHTML = html;
}

function applyFiltersAndRender() {
  const filtered = allTransactions.filter((item) => {
    if (currentFilter.month !== "all") {
      if (!item.date || !item.date.startsWith(currentFilter.month)) return false;
    }
    if (currentFilter.type !== "all" && item.type !== currentFilter.type) {
      return false;
    }
    if (currentFilter.category !== "all" && item.category !== currentFilter.category) {
      return false;
    }
    if (currentFilter.searchKeyword) {
      const kw = currentFilter.searchKeyword.toLowerCase();
      const matchNote = item.note && item.note.toLowerCase().includes(kw);
      const matchCat = item.category && item.category.toLowerCase().includes(kw);
      if (!matchNote && !matchCat) return false;
    }
    return true;
  });

  calculateKPIs(filtered);
  renderTransactionList(filtered);
  renderCategoryDoughnutChart(filtered);
}

function calculateKPIs(transactions) {
  let incomeTotal = 0;
  let incomeCount = 0;
  let expenseTotal = 0;
  let expenseCount = 0;

  transactions.forEach((item) => {
    const amt = Number(item.amount) || 0;
    if (item.type === "income") {
      incomeTotal += amt;
      incomeCount++;
    } else {
      expenseTotal += amt;
      expenseCount++;
    }
  });

  const balance = incomeTotal - expenseTotal;

  DOM.totalIncome.textContent = formatVNMoney(incomeTotal);
  DOM.incomeCount.textContent = `${incomeCount} giao dịch`;

  DOM.totalExpense.textContent = formatVNMoney(expenseTotal);
  DOM.expenseCount.textContent = `${expenseCount} giao dịch`;

  DOM.netBalance.textContent = formatVNMoney(balance);

  if (balance > 0) {
    DOM.netBalance.className = "text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-600 font-mono tracking-tight";
    DOM.balanceStatus.textContent = "Thặng dư tài chính tốt";
  } else if (balance < 0) {
    DOM.netBalance.className = "text-xl sm:text-2xl lg:text-3xl font-extrabold text-rose-600 font-mono tracking-tight";
    DOM.balanceStatus.textContent = "Cảnh báo: Bội chi ngân sách";
  } else {
    DOM.netBalance.className = "text-xl sm:text-2xl lg:text-3xl font-extrabold text-indigo-600 font-mono tracking-tight";
    DOM.balanceStatus.textContent = "Cân bằng thu chi";
  }
}

function renderTransactionList(transactions) {
  DOM.filteredCountBadge.textContent = `${transactions.length} giao dịch`;

  if (transactions.length === 0) {
    DOM.transactionsList.innerHTML = "";
    DOM.noTransactionsState.classList.remove("hidden");
    return;
  }

  DOM.noTransactionsState.classList.add("hidden");

  let html = "";
  transactions.forEach((item) => {
    const isExpense = item.type === "expense";
    const sign = isExpense ? "-" : "+";
    const amountColorClass = isExpense ? "text-rose-600" : "text-emerald-600";
    const iconMeta = getCategoryMeta(item.type, item.category);

    html += `
      <div class="transaction-item p-3 flex items-center justify-between gap-2.5 rounded-xl hover:bg-slate-50 transition">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-xs" 
               style="background-color: ${iconMeta.color}15; color: ${iconMeta.color};">
            <i class="fa-solid ${iconMeta.icon}"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-800 truncate">${escapeHtml(item.category)}</span>
              <span class="text-[9px] font-semibold text-slate-400 shrink-0">${formatDisplayDate(item.date)}</span>
            </div>
            <p class="text-[11px] text-slate-500 truncate mt-0.5" title="${escapeHtml(item.note || "")}">
              ${escapeHtml(item.note || "(Không có ghi chú)")}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="font-mono font-bold text-xs sm:text-sm ${amountColorClass}">
            ${sign}${formatVNMoney(item.amount)}
          </span>
          <div class="flex items-center gap-0.5">
            <button onclick="window._expenseApp.editTransaction('${item.id}')" title="Sửa" 
              class="p-1 w-6 h-6 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center">
              <i class="fa-solid fa-pencil text-[11px]"></i>
            </button>
            <button onclick="window._expenseApp.deleteTransaction('${item.id}')" title="Xóa" 
              class="p-1 w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition flex items-center justify-center">
              <i class="fa-solid fa-trash-can text-[11px]"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  DOM.transactionsList.innerHTML = html;
}

function renderCategoryDoughnutChart(transactions) {
  const expenseItems = transactions.filter((t) => t.type === "expense");

  if (expenseItems.length === 0) {
    if (expenseChartInstance) {
      expenseChartInstance.destroy();
      expenseChartInstance = null;
    }
    DOM.chartEmptyState.classList.remove("hidden");
    DOM.expenseCategoryChart.classList.add("hidden");
    DOM.categoryBreakdownList.innerHTML = `<p class="text-[11px] text-slate-400 text-center py-2">Không có khoản chi để phân tích</p>`;
    return;
  }

  DOM.chartEmptyState.classList.add("hidden");
  DOM.expenseCategoryChart.classList.remove("hidden");

  const categoryTotals = {};
  let totalExpenseAll = 0;

  expenseItems.forEach((item) => {
    const amt = Number(item.amount) || 0;
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amt;
    totalExpenseAll += amt;
  });

  const sortedCategories = Object.keys(categoryTotals)
    .map((cat) => ({
      category: cat,
      amount: categoryTotals[cat],
      percent: ((categoryTotals[cat] / totalExpenseAll) * 100).toFixed(1)
    }))
    .sort((a, b) => b.amount - a.amount);

  const labels = sortedCategories.map((c) => c.category);
  const data = sortedCategories.map((c) => c.amount);
  const backgroundColors = sortedCategories.map((_, idx) => CHART_PALETTE[idx % CHART_PALETTE.length]);

  if (expenseChartInstance) {
    expenseChartInstance.destroy();
  }

  const ctx = DOM.expenseCategoryChart.getContext("2d");
  expenseChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              const pct = ((val / totalExpenseAll) * 100).toFixed(1);
              return ` ${context.label}: ${formatVNMoney(val)} (${pct}%)`;
            }
          }
        }
      },
      cutout: "70%"
    }
  });

  let breakdownHtml = "";
  sortedCategories.forEach((cat, idx) => {
    const color = backgroundColors[idx];
    breakdownHtml += `
      <div class="flex items-center justify-between text-[11px] py-1">
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${color}"></span>
          <span class="text-slate-700 font-medium truncate">${escapeHtml(cat.category)}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-slate-400 font-mono">${cat.percent}%</span>
          <span class="font-mono font-bold text-slate-800">${formatVNMoney(cat.amount)}</span>
        </div>
      </div>
    `;
  });

  DOM.categoryBreakdownList.innerHTML = breakdownHtml;
}

/* ==========================================================================
   9. XUẤT CSV (UTF-8 EXCEL)
   ========================================================================== */
function exportTransactionsToCSV() {
  if (allTransactions.length === 0) {
    showToast("Không có giao dịch nào để xuất!", "info");
    return;
  }

  const headers = ["ID", "Ngày", "Loại", "Danh mục", "Số tiền (VNĐ)", "Ghi chú"];
  const rows = allTransactions.map((t) => [
    t.id,
    t.date,
    t.type === "expense" ? "Chi tiêu" : "Thu nhập",
    `"${(t.category || "").replace(/"/g, '""')}"`,
    t.amount,
    `"${(t.note || "").replace(/"/g, '""')}"`
  ]);

  let csvContent = "\uFEFF" + headers.join(",") + "\n";
  rows.forEach((r) => {
    csvContent += r.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ExpenseFlow_${getCurrentMonthString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Đã tải xuống file CSV thành công!", "success");
}

/* ==========================================================================
   10. TIỆN ÍCH & SỰ KIỆN GIAO DIỆN
   ========================================================================== */
function setupEventListeners() {
  // PWA Triggers
  if (DOM.pwaInstallActionBtn) DOM.pwaInstallActionBtn.addEventListener("click", triggerPwaInstall);
  if (DOM.headerInstallBtn) DOM.headerInstallBtn.addEventListener("click", triggerPwaInstall);
  if (DOM.navInstallBtn) DOM.navInstallBtn.addEventListener("click", triggerPwaInstall);
  if (DOM.pwaCloseBannerBtn) DOM.pwaCloseBannerBtn.addEventListener("click", () => DOM.pwaInstallBanner.classList.add("hidden"));
  if (DOM.closeIosInstallModalBtn) DOM.closeIosInstallModalBtn.addEventListener("click", () => DOM.iosInstallModal.classList.add("hidden"));

  // Đăng nhập / Đăng xuất
  if (DOM.openLoginModalBtn) DOM.openLoginModalBtn.addEventListener("click", openLoginModal);
  if (DOM.closeLoginModalBtn) DOM.closeLoginModalBtn.addEventListener("click", closeLoginModal);
  if (DOM.loginModalBackdrop) DOM.loginModalBackdrop.addEventListener("click", closeLoginModal);
  if (DOM.logoutBtn) DOM.logoutBtn.addEventListener("click", handleLogout);

  // Hero PIN Triggers (Guest View)
  if (DOM.heroEmailForm) {
    DOM.heroEmailForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleEmailSubmit(DOM.heroGmailInput, "hero");
    });
  }

  if (DOM.heroChangeEmailBtn) {
    DOM.heroChangeEmailBtn.addEventListener("click", () => {
      DOM.heroPinStepVerify.classList.add("hidden");
      DOM.heroPinStepEmail.classList.remove("hidden");
      DOM.heroGmailInput.focus();
    });
  }

  if (DOM.heroTogglePinVisibilityBtn) {
    DOM.heroTogglePinVisibilityBtn.addEventListener("click", () => {
      setPinVisibility("hero", !pendingAuth.isHeroPinVisible);
    });
  }

  if (DOM.heroResetPinBtn) {
    DOM.heroResetPinBtn.addEventListener("click", () => handleResetPin("hero"));
  }

  if (DOM.heroVerifyPinBtn) {
    DOM.heroVerifyPinBtn.addEventListener("click", () => handleVerifyPin("hero"));
  }

  // Modal PIN Triggers (Header Button)
  if (DOM.modalEmailForm) {
    DOM.modalEmailForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleEmailSubmit(DOM.modalGmailInput, "modal");
    });
  }

  if (DOM.modalChangeEmailBtn) {
    DOM.modalChangeEmailBtn.addEventListener("click", () => {
      DOM.modalPinStepVerify.classList.add("hidden");
      DOM.modalPinStepEmail.classList.remove("hidden");
      DOM.modalGmailInput.focus();
    });
  }

  if (DOM.modalTogglePinVisibilityBtn) {
    DOM.modalTogglePinVisibilityBtn.addEventListener("click", () => {
      setPinVisibility("modal", !pendingAuth.isModalPinVisible);
    });
  }

  if (DOM.modalResetPinBtn) {
    DOM.modalResetPinBtn.addEventListener("click", () => handleResetPin("modal"));
  }

  if (DOM.modalVerifyPinBtn) {
    DOM.modalVerifyPinBtn.addEventListener("click", () => handleVerifyPin("modal"));
  }

  // Mobile Bottom Navigation
  if (DOM.mobileAddFabBtn) DOM.mobileAddFabBtn.addEventListener("click", () => openAddTransactionModal());
  if (DOM.navOverviewBtn) {
    DOM.navOverviewBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveMobileNav(DOM.navOverviewBtn);
    });
  }
  if (DOM.navChartBtn) {
    DOM.navChartBtn.addEventListener("click", () => {
      DOM.chartSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveMobileNav(DOM.navChartBtn);
    });
  }
  if (DOM.navHistoryBtn) {
    DOM.navHistoryBtn.addEventListener("click", () => {
      DOM.transactionsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveMobileNav(DOM.navHistoryBtn);
    });
  }

  // Modal Thêm/Sửa Giao Dịch
  if (DOM.openAddModalBtn) DOM.openAddModalBtn.addEventListener("click", () => openAddTransactionModal());
  if (DOM.closeModalBtn) DOM.closeModalBtn.addEventListener("click", closeTransactionModal);
  if (DOM.cancelModalBtn) DOM.cancelModalBtn.addEventListener("click", closeTransactionModal);
  if (DOM.modalBackdrop) DOM.modalBackdrop.addEventListener("click", closeTransactionModal);
  if (DOM.transactionForm) DOM.transactionForm.addEventListener("submit", handleSaveTransaction);

  const typeRadios = DOM.transactionForm.elements["type"];
  if (typeRadios) {
    for (const radio of typeRadios) {
      radio.addEventListener("change", (e) => {
        populateCategorySelect(e.target.value);
      });
    }
  }

  // Live Currency Formatting
  DOM.amountInput.addEventListener("input", (e) => {
    const rawVal = parseCurrencyNumber(e.target.value);
    if (!isNaN(rawVal) && rawVal > 0) {
      e.target.value = formatCurrencyInput(rawVal);
      updateAmountWords(rawVal);
    } else {
      DOM.amountWords.textContent = "";
    }
  });

  // Modal Xóa
  if (DOM.cancelDeleteBtn) DOM.cancelDeleteBtn.addEventListener("click", closeDeleteModal);
  if (DOM.confirmDeleteBtn) DOM.confirmDeleteBtn.addEventListener("click", handleConfirmDelete);

  // Filters
  DOM.monthFilter.addEventListener("change", (e) => {
    currentFilter.month = e.target.value;
    applyFiltersAndRender();
  });

  DOM.resetMonthBtn.addEventListener("click", () => {
    currentFilter.month = getCurrentMonthString();
    DOM.monthFilter.value = currentFilter.month;
    applyFiltersAndRender();
  });

  DOM.typeFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type-filter");
      currentFilter.type = type;
      DOM.typeFilterBtns.forEach((b) => {
        b.className = "type-filter-btn px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900";
      });
      btn.className = "type-filter-btn px-2.5 py-1 rounded-lg bg-white text-indigo-600 font-bold shadow-xs";
      applyFiltersAndRender();
    });
  });

  DOM.categoryFilter.addEventListener("change", (e) => {
    currentFilter.category = e.target.value;
    applyFiltersAndRender();
  });

  DOM.searchInput.addEventListener("input", (e) => {
    currentFilter.searchKeyword = e.target.value.trim();
    applyFiltersAndRender();
  });

  DOM.exportCsvBtn.addEventListener("click", exportTransactionsToCSV);

  // Phím ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTransactionModal();
      closeDeleteModal();
      closeLoginModal();
      if (DOM.iosInstallModal) DOM.iosInstallModal.classList.add("hidden");
    }
  });
}

function setActiveMobileNav(btn) {
  [DOM.navOverviewBtn, DOM.navChartBtn, DOM.navHistoryBtn, DOM.navInstallBtn].forEach(b => {
    if (b) b.className = "flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 font-semibold text-[10px] w-14";
  });
  if (btn) btn.className = "flex flex-col items-center gap-1 text-indigo-600 font-bold text-[10px] w-14";
}

function openAddTransactionModal() {
  DOM.modalTitle.textContent = "Thêm giao dịch mới";
  DOM.modalIcon.className = "fa-solid fa-plus";
  DOM.modalIconContainer.className = "w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center";
  DOM.editTransactionId.value = "";
  DOM.transactionForm.reset();
  
  DOM.transactionForm.elements["type"].value = "expense";
  populateCategorySelect("expense");
  setDefaultModalDate();
  DOM.amountWords.textContent = "";

  DOM.transactionModal.classList.remove("hidden");
  DOM.amountInput.focus();
}

function closeTransactionModal() {
  DOM.transactionModal.classList.add("hidden");
}

function openDeleteModal(id) {
  transactionToDeleteId = id;
  DOM.deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
  DOM.deleteModal.classList.add("hidden");
  transactionToDeleteId = null;
}

function populateCategorySelect(type, selectedCategory = "") {
  const cats = CATEGORIES[type] || [];
  let html = "";
  cats.forEach((cat) => {
    const isSelected = (cat.name === selectedCategory) ? "selected" : "";
    html += `<option value="${cat.name}" ${isSelected}>${cat.name}</option>`;
  });
  DOM.categorySelect.innerHTML = html;
}

function setDefaultModalDate() {
  const today = new Date().toISOString().split("T")[0];
  DOM.dateInput.value = today;
}

function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseCurrencyNumber(str) {
  if (!str) return 0;
  const clean = String(str).replace(/[^\d]/g, "");
  return parseInt(clean, 10) || 0;
}

function formatCurrencyInput(num) {
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
}

function formatVNMoney(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(num);
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function getCategoryMeta(type, categoryName) {
  const list = CATEGORIES[type] || [];
  const found = list.find((c) => c.name === categoryName);
  if (found) return found;
  return {
    icon: type === "expense" ? "fa-credit-card" : "fa-sack-dollar",
    color: type === "expense" ? "#ef4444" : "#10b981"
  };
}

function updateAmountWords(amount) {
  if (!amount || amount < 1000) {
    DOM.amountWords.textContent = "";
    return;
  }
  if (amount >= 1000000000) {
    const ty = (amount / 1000000000).toFixed(2);
    DOM.amountWords.textContent = `~ ${ty} tỷ VNĐ`;
  } else if (amount >= 1000000) {
    const tr = (amount / 1000000).toFixed(1);
    DOM.amountWords.textContent = `~ ${tr} triệu VNĐ`;
  } else if (amount >= 1000) {
    const k = (amount / 1000).toFixed(0);
    DOM.amountWords.textContent = `~ ${k} nghìn VNĐ`;
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showToast(message, type = "info", duration = 4000) {
  const toast = document.createElement("div");
  toast.className = "toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold max-w-xs sm:max-w-sm border transition-all";

  let icon = "fa-circle-info";
  if (type === "success") {
    toast.className += " bg-emerald-600 text-white border-emerald-500";
    icon = "fa-circle-check";
  } else if (type === "error") {
    toast.className += " bg-rose-600 text-white border-rose-500";
    icon = "fa-triangle-exclamation";
  } else if (type === "warning") {
    toast.className += " bg-amber-500 text-white border-amber-400";
    icon = "fa-bell";
  } else {
    toast.className += " bg-slate-800 text-white border-slate-700";
  }

  toast.innerHTML = `
    <i class="fa-solid ${icon} text-base shrink-0"></i>
    <span class="flex-1 leading-snug">${escapeHtml(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("toast-enter");
    toast.classList.add("toast-exit");
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, duration);
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Gắn các hàm thao tác giao dịch toàn cục cho các nút inline onclick
window._expenseApp = {
  editTransaction: openEditTransactionModal,
  deleteTransaction: openDeleteModal
};
