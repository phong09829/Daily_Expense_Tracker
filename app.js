/**
 * ExpenseFlow Pro - Progressive Web App (PWA) Quản lý Chi tiêu Cá nhân
 * Hỗ trợ Dual-Mode:
 *   1. Chế độ Ngoại tuyến (Local Storage) - Truy cập tức thì không cần tài khoản hay cấu hình
 *   2. Chế độ Đám mây (Google Firebase) - Đồng bộ thời gian thực đa thiết bị & Bảo mật cô lập dữ liệu
 */

// Import Firebase SDK v10 (Modular CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ==========================================================================
   1. CẤU HÌNH FIREBASE & LOCAL STORAGE KEYS
   ========================================================================== */
const STORAGE_KEYS = {
  LOCAL_TRANSACTIONS: "expenseflow_local_transactions_v2",
  CUSTOM_FIREBASE_CONFIG: "expenseflow_custom_firebase_config",
  ACTIVE_MODE: "expenseflow_active_mode" // 'local' | 'firebase'
};

// Cấu hình Firebase mặc định trong code (có thể để placeholder)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Lấy cấu hình từ LocalStorage (nếu người dùng đã cấu hình qua UI) hoặc dùng mặc định
function getActiveFirebaseConfig() {
  const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_FIREBASE_CONFIG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && !parsed.apiKey.includes("YOUR_API_KEY")) {
        return parsed;
      }
    } catch (e) {
      console.warn("Lỗi đọc custom firebase config:", e);
    }
  }
  return DEFAULT_FIREBASE_CONFIG;
}

const firebaseConfig = getActiveFirebaseConfig();

// Kiểm tra xem cấu hình có hợp lệ không
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes("YOUR_API_KEY") && 
  firebaseConfig.projectId && 
  !firebaseConfig.projectId.includes("YOUR_PROJECT_ID")
);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase SDK:", error);
  }
}

/* ==========================================================================
   2. CẤU HÌNH DANH MỤC & BIỂU ĐỒ
   ========================================================================== */
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
   3. DỮ LIỆU MẪU BAN ĐẦU (KHI DÙNG CHẾ ĐỘ LOCAL)
   ========================================================================== */
function getInitialSampleTransactions() {
  const currentMonthStr = getCurrentMonthString();
  return [
    {
      id: "sample-1",
      type: "income",
      amount: 22000000,
      category: "Tiền lương",
      date: `${currentMonthStr}-05`,
      note: "Lương tháng qua chuyển khoản",
      createdAt: new Date().toISOString()
    },
    {
      id: "sample-2",
      type: "expense",
      amount: 4500000,
      category: "Tiền nhà & Hóa đơn",
      date: `${currentMonthStr}-06`,
      note: "Tiền thuê nhà + điện nước",
      createdAt: new Date().toISOString()
    },
    {
      id: "sample-3",
      type: "expense",
      amount: 650000,
      category: "Ăn uống",
      date: `${currentMonthStr}-08`,
      note: "Đi siêu thị Vinmart cuối tuần",
      createdAt: new Date().toISOString()
    },
    {
      id: "sample-4",
      type: "expense",
      amount: 150000,
      category: "Di chuyển & Xăng xe",
      date: `${currentMonthStr}-10`,
      note: "Đổ xăng đầy bình",
      createdAt: new Date().toISOString()
    },
    {
      id: "sample-5",
      type: "expense",
      amount: 450000,
      category: "Mua sắm",
      date: `${currentMonthStr}-12`,
      note: "Mua đồ dùng cá nhân",
      createdAt: new Date().toISOString()
    },
    {
      id: "sample-6",
      type: "income",
      amount: 2000000,
      category: "Tiền thưởng & Thưởng lễ",
      date: `${currentMonthStr}-15`,
      note: "Thưởng hoàn thành dự án",
      createdAt: new Date().toISOString()
    }
  ];
}

/* ==========================================================================
   4. TRẠNG THÁI ỨNG DỤNG (STATE)
   ========================================================================== */
let isLocalMode = false;
let currentUser = null; // null | { uid, displayName, email, photoURL, isLocal: boolean }
let unsubscribeFirestore = null;
let allTransactions = [];
let expenseChartInstance = null;
let deferredPrompt = null; // Bắt sự kiện cài đặt PWA

const currentFilter = {
  month: getCurrentMonthString(),
  type: "all",
  category: "all",
  searchKeyword: ""
};

let transactionToDeleteId = null;

/* ==========================================================================
   5. DOM ELEMENTS
   ========================================================================== */
const DOM = {
  // PWA Elements
  pwaInstallBanner: document.getElementById("pwaInstallBanner"),
  pwaInstallActionBtn: document.getElementById("pwaInstallActionBtn"),
  pwaCloseBannerBtn: document.getElementById("pwaCloseBannerBtn"),
  headerInstallBtn: document.getElementById("headerInstallBtn"),
  navInstallBtn: document.getElementById("navInstallBtn"),
  iosInstallModal: document.getElementById("iosInstallModal"),
  closeIosInstallModalBtn: document.getElementById("closeIosInstallModalBtn"),

  // Navigation Mobile
  navOverviewBtn: document.getElementById("navOverviewBtn"),
  navChartBtn: document.getElementById("navChartBtn"),
  navHistoryBtn: document.getElementById("navHistoryBtn"),
  mobileAddFabBtn: document.getElementById("mobileAddFabBtn"),
  overviewSection: document.getElementById("overviewSection"),
  chartSection: document.getElementById("chartSection"),
  transactionsSection: document.getElementById("transactionsSection"),

  // Mode & Config Elements
  modeBadge: document.getElementById("modeBadge"),
  modeBadgeText: document.getElementById("modeBadgeText"),
  openCustomConfigBtn: document.getElementById("openCustomConfigBtn"),
  quickLocalBtn: document.getElementById("quickLocalBtn"),
  heroLocalBtn: document.getElementById("heroLocalBtn"),
  customConfigModal: document.getElementById("customConfigModal"),
  closeCustomConfigBtn: document.getElementById("closeCustomConfigBtn"),
  cancelCustomConfigBtn: document.getElementById("cancelCustomConfigBtn"),
  customConfigForm: document.getElementById("customConfigForm"),
  resetConfigBtn: document.getElementById("resetConfigBtn"),
  cfgApiKey: document.getElementById("cfgApiKey"),
  cfgProjectId: document.getElementById("cfgProjectId"),
  cfgAuthDomain: document.getElementById("cfgAuthDomain"),
  cfgAppId: document.getElementById("cfgAppId"),
  cfgStorageBucket: document.getElementById("cfgStorageBucket"),

  // Alert & Screens
  firebaseConfigAlert: document.getElementById("firebaseConfigAlert"),
  openConfigGuideBtn: document.getElementById("openConfigGuideBtn"),
  configGuideModal: document.getElementById("configGuideModal"),
  closeConfigGuideBtn: document.getElementById("closeConfigGuideBtn"),
  closeConfigGuideOkBtn: document.getElementById("closeConfigGuideOkBtn"),
  loadingScreen: document.getElementById("loadingScreen"),
  guestView: document.getElementById("guestView"),
  appView: document.getElementById("appView"),

  // Auth
  loginBtn: document.getElementById("loginBtn"),
  heroLoginBtn: document.getElementById("heroLoginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  userProfile: document.getElementById("userProfile"),
  userAvatar: document.getElementById("userAvatar"),
  userName: document.getElementById("userName"),

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

  // Lists & Charts
  transactionsList: document.getElementById("transactionsList"),
  noTransactionsState: document.getElementById("noTransactionsState"),
  expenseCategoryChart: document.getElementById("expenseCategoryChart"),
  chartEmptyState: document.getElementById("chartEmptyState"),
  categoryBreakdownList: document.getElementById("categoryBreakdownList"),

  // Modals
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

  // Toast
  toastContainer: document.getElementById("toastContainer")
};

/* ==========================================================================
   6. KHỞI TẠO ỨNG DỤNG & SERVICE WORKER (PWA)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Đăng ký Service Worker
  registerServiceWorker();

  // 2. Thiết lập PWA Install Prompt Listener
  setupPwaInstallPrompt();

  // 3. Khởi tạo phương thức xác thực hoặc tự động kích hoạt Local Mode
  initAppMode();

  // 4. Lắng nghe các sự kiện giao diện
  setupEventListeners();
  populateCategorySelect("expense");
  setDefaultModalDate();
  populateConfigInputs();
});

/**
 * Đăng ký Service Worker cho PWA
 */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker đăng ký thành công với scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Đăng ký Service Worker thất bại:", err);
        });
    });
  }
}

/**
 * Xử lý sự kiện beforeinstallprompt (Bấm nút là tải được App)
 */
function setupPwaInstallPrompt() {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (isStandalone) {
    console.log("[PWA] Đang chạy trong chế độ Standalone App.");
    return;
  }

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
    showToast("🎉 Chúc mừng! ExpenseFlow đã được cài đặt vào máy của bạn.", "success");
  });
}

/**
 * Kích hoạt hộp thoại cài đặt App khi người dùng bấm nút
 */
async function triggerPwaInstall() {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIos) {
    if (DOM.iosInstallModal) DOM.iosInstallModal.classList.remove("hidden");
    return;
  }

  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("[PWA] Lựa chọn của người dùng:", outcome);
    deferredPrompt = null;
    if (DOM.pwaInstallBanner) DOM.pwaInstallBanner.classList.add("hidden");
  } else {
    if (DOM.iosInstallModal) DOM.iosInstallModal.classList.remove("hidden");
  }
}

/* ==========================================================================
   7. APP MODE: LOCAL STORAGE FIRST & FIREBASE DUAL MODE
   ========================================================================== */
function initAppMode() {
  const savedMode = localStorage.getItem(STORAGE_KEYS.ACTIVE_MODE);

  if (savedMode === "firebase" && isFirebaseConfigured && auth) {
    // Người dùng trước đó chọn Firebase
    initFirebaseMode();
  } else if (savedMode === "local") {
    // Người dùng trước đó chọn Local Mode
    switchToLocalMode(false);
  } else {
    // Lần đầu vào web: Tự động kích hoạt Local Mode để mọi người có thể dùng ngay lập tức!
    switchToLocalMode(true);
  }
}

function initFirebaseMode() {
  if (!isFirebaseConfigured || !auth) {
    switchToLocalMode(false);
    return;
  }

  isLocalMode = false;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, "firebase");
  updateModeBadgeUI(false);

  onAuthStateChanged(auth, (user) => {
    DOM.loadingScreen.classList.add("hidden");

    if (user) {
      currentUser = user;
      updateAuthUI(true);
      showToast(`Chào mừng ${user.displayName || user.email}!`, "success");
      initFirestoreListener(user.uid);
    } else {
      currentUser = null;
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }
      allTransactions = [];
      updateAuthUI(false);
    }
  });
}

function switchToLocalMode(isFirstTime = false) {
  isLocalMode = true;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, "local");

  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }

  currentUser = {
    uid: "local-user",
    displayName: "Người dùng Thiết bị",
    email: "local@device",
    photoURL: "",
    isLocal: true
  };

  DOM.loadingScreen.classList.add("hidden");
  updateAuthUI(true);
  updateModeBadgeUI(true);

  // Nạp dữ liệu từ LocalStorage
  loadLocalTransactions(isFirstTime);

  if (isFirstTime) {
    showToast("✨ Đã kích hoạt Chế độ Ngoại tuyến: Lưu dữ liệu an toàn ngay trên máy của bạn!", "info", 5000);
  } else {
    showToast("Đã chuyển sang Chế độ Ngoại tuyến (Local).", "success");
  }
}

function updateModeBadgeUI(isLocal) {
  if (!DOM.modeBadge) return;
  DOM.modeBadge.classList.remove("hidden");
  DOM.modeBadge.classList.add("flex");

  if (isLocal) {
    DOM.modeBadge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80";
    DOM.modeBadge.querySelector("span").className = "w-2 h-2 rounded-full bg-amber-500 animate-pulse";
    DOM.modeBadgeText.textContent = "Bản Ngoại tuyến";
    DOM.modeBadge.title = "Dữ liệu được lưu trong trình duyệt của bạn";
  } else {
    DOM.modeBadge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80";
    DOM.modeBadge.querySelector("span").className = "w-2 h-2 rounded-full bg-emerald-500";
    DOM.modeBadgeText.textContent = "Firebase Cloud";
    DOM.modeBadge.title = "Đồng bộ thời gian thực qua Cloud Firestore";
  }
}

function updateAuthUI(isLoggedIn) {
  if (isLoggedIn && currentUser) {
    DOM.guestView.classList.add("hidden");
    DOM.appView.classList.remove("hidden");
    DOM.loginBtn.classList.add("hidden");
    DOM.quickLocalBtn.classList.add("hidden");
    DOM.userProfile.classList.remove("hidden");
    DOM.userProfile.classList.add("flex");

    DOM.userName.textContent = currentUser.displayName || (currentUser.isLocal ? "Khách Local" : "Bạn");
    DOM.userAvatar.src = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || "User")}&background=4f46e5&color=fff`;
  } else {
    DOM.guestView.classList.remove("hidden");
    DOM.appView.classList.add("hidden");
    DOM.loginBtn.classList.remove("hidden");
    DOM.loginBtn.classList.add("flex");
    DOM.quickLocalBtn.classList.remove("hidden");
    DOM.quickLocalBtn.classList.add("flex");
    DOM.userProfile.classList.add("hidden");
    DOM.userProfile.classList.remove("flex");
  }
}

/* ==========================================================================
   8. LOCAL STORAGE CRUD OPERATIONS
   ========================================================================== */
function loadLocalTransactions(seedIfEmpty = false) {
  const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_TRANSACTIONS);
  let list = [];

  if (raw) {
    try {
      list = JSON.parse(raw);
    } catch (e) {
      console.error("Lỗi parse LocalStorage:", e);
      list = [];
    }
  }

  if (list.length === 0 && seedIfEmpty) {
    list = getInitialSampleTransactions();
    saveLocalTransactions(list);
  }

  allTransactions = list;
  updateMonthFilterOptions();
  applyFiltersAndRender();
}

function saveLocalTransactions(list) {
  localStorage.setItem(STORAGE_KEYS.LOCAL_TRANSACTIONS, JSON.stringify(list));
}

/* ==========================================================================
   9. FIRESTORE REAL-TIME LISTENER
   ========================================================================== */
function initFirestoreListener(userId) {
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
  }

  const expensesRef = collection(db, "users", userId, "expenses");
  const q = query(expensesRef, orderBy("date", "desc"));

  unsubscribeFirestore = onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    allTransactions = list;
    updateMonthFilterOptions();
    applyFiltersAndRender();
  }, (error) => {
    console.error("Lỗi Firestore:", error);
    showToast("Lỗi đồng bộ: " + error.message, "error", 6000);
  });
}

/* ==========================================================================
   10. CRUD OPERATIONS (LOCAL & CLOUD)
   ========================================================================== */
async function handleSaveTransaction(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast("Vui lòng kích hoạt chế độ Ngoại tuyến hoặc Đăng nhập!", "warning");
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

  const origText = DOM.saveTransactionBtn.innerHTML;
  DOM.saveTransactionBtn.disabled = true;
  DOM.saveTransactionBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i><span>Đang lưu...</span>`;

  try {
    if (isLocalMode) {
      // Lưu vào LocalStorage
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
          id: "local-" + Date.now(),
          ...transactionData,
          createdAt: new Date().toISOString()
        };
        allTransactions.unshift(newItem);
        showToast("Đã thêm giao dịch mới!", "success");
      }

      saveLocalTransactions(allTransactions);
      updateMonthFilterOptions();
      applyFiltersAndRender();
      closeTransactionModal();
    } else {
      // Lưu vào Cloud Firestore
      if (editId) {
        const docRef = doc(db, "users", currentUser.uid, "expenses", editId);
        await updateDoc(docRef, { ...transactionData, updatedAt: serverTimestamp() });
        showToast("Cập nhật giao dịch đám mây thành công!", "success");
      } else {
        const colRef = collection(db, "users", currentUser.uid, "expenses");
        await addDoc(colRef, { ...transactionData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        showToast("Đã lưu giao dịch vào Firebase!", "success");
      }
      closeTransactionModal();
    }
  } catch (error) {
    console.error("Lỗi khi lưu giao dịch:", error);
    showToast("Lỗi lưu dữ liệu: " + error.message, "error", 5000);
  } finally {
    DOM.saveTransactionBtn.disabled = false;
    DOM.saveTransactionBtn.innerHTML = origText;
  }
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

async function handleConfirmDelete() {
  if (!currentUser || !transactionToDeleteId) return;

  DOM.confirmDeleteBtn.disabled = true;
  DOM.confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Xóa...`;

  try {
    if (isLocalMode) {
      allTransactions = allTransactions.filter(t => t.id !== transactionToDeleteId);
      saveLocalTransactions(allTransactions);
      updateMonthFilterOptions();
      applyFiltersAndRender();
      showToast("Đã xóa giao dịch thành công!", "success");
      closeDeleteModal();
    } else {
      const docRef = doc(db, "users", currentUser.uid, "expenses", transactionToDeleteId);
      await deleteDoc(docRef);
      showToast("Đã xóa giao dịch khỏi Firestore!", "success");
      closeDeleteModal();
    }
  } catch (error) {
    console.error("Lỗi xóa:", error);
    showToast("Không thể xóa: " + error.message, "error");
  } finally {
    DOM.confirmDeleteBtn.disabled = false;
    DOM.confirmDeleteBtn.textContent = "Xóa vĩnh viễn";
    transactionToDeleteId = null;
  }
}

/* ==========================================================================
   11. BỘ LỌC & HIỂN THỊ THỐNG KÊ
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
    const label = `Tháng ${parseInt(month)}/${year}`;
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
   12. EXPORT CSV (UTF-8 EXCEL)
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
   13. FIREBASE CONFIG MODAL & EVENT LISTENERS
   ========================================================================== */
function populateConfigInputs() {
  const cfg = getActiveFirebaseConfig();
  if (DOM.cfgApiKey && cfg.apiKey && !cfg.apiKey.includes("YOUR_API_KEY")) DOM.cfgApiKey.value = cfg.apiKey;
  if (DOM.cfgProjectId && cfg.projectId && !cfg.projectId.includes("YOUR_PROJECT_ID")) DOM.cfgProjectId.value = cfg.projectId;
  if (DOM.cfgAuthDomain && cfg.authDomain && !cfg.authDomain.includes("YOUR_PROJECT_ID")) DOM.cfgAuthDomain.value = cfg.authDomain;
  if (DOM.cfgAppId && cfg.appId && !cfg.appId.includes("YOUR_APP_ID")) DOM.cfgAppId.value = cfg.appId;
  if (DOM.cfgStorageBucket && cfg.storageBucket && !cfg.storageBucket.includes("YOUR_PROJECT_ID")) DOM.cfgStorageBucket.value = cfg.storageBucket;
}

function handleSaveCustomConfig(e) {
  e.preventDefault();
  const apiKey = DOM.cfgApiKey.value.trim();
  const projectId = DOM.cfgProjectId.value.trim();
  const authDomain = DOM.cfgAuthDomain.value.trim();
  const appId = DOM.cfgAppId.value.trim();
  const storageBucket = DOM.cfgStorageBucket.value.trim();

  if (!apiKey || !projectId) {
    showToast("Vui lòng nhập tối thiểu API Key và Project ID!", "warning");
    return;
  }

  const customCfg = {
    apiKey,
    projectId,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    appId: appId || "",
    storageBucket: storageBucket || `${projectId}.appspot.com`
  };

  localStorage.setItem(STORAGE_KEYS.CUSTOM_FIREBASE_CONFIG, JSON.stringify(customCfg));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, "firebase");
  showToast("Đã lưu cấu hình Firebase! Trang sẽ làm mới để kết nối...", "success", 2000);
  setTimeout(() => window.location.reload(), 1500);
}

function handleResetConfig() {
  if (confirm("Bạn có chắc muốn xóa cấu hình Firebase đã lưu trên trình duyệt?")) {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_FIREBASE_CONFIG);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, "local");
    showToast("Đã xóa cấu hình. Đang chuyển về chế độ Ngoại tuyến...", "info");
    setTimeout(() => window.location.reload(), 1200);
  }
}

async function handleGoogleLogin() {
  if (!isFirebaseConfigured) {
    if (DOM.customConfigModal) {
      DOM.customConfigModal.classList.remove("hidden");
    } else if (DOM.configGuideModal) {
      DOM.configGuideModal.classList.remove("hidden");
    }
    showToast("Vui lòng nhập thông tin Firebase để kích hoạt Đăng nhập Google!", "warning", 6000);
    return;
  }

  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Lỗi Google Sign-in:", error);
    let msg = "Đăng nhập thất bại. Vui lòng thử lại!";
    if (error.code === "auth/popup-closed-by-user") {
      msg = "Bạn vừa đóng cửa sổ đăng nhập.";
    } else if (error.code === "auth/unauthorized-domain") {
      msg = "Tên miền hiện tại chưa được cấp phép trong Firebase > Authorized Domains.";
    }
    showToast(msg, "error", 6000);
  }
}

async function handleLogout() {
  if (isLocalMode) {
    if (confirm("Bạn muốn đổi sang đăng nhập Firebase Google hay xóa dữ liệu trên máy?")) {
      DOM.guestView.classList.remove("hidden");
      DOM.appView.classList.add("hidden");
      DOM.userProfile.classList.add("hidden");
      DOM.loginBtn.classList.remove("hidden");
      DOM.quickLocalBtn.classList.remove("hidden");
      showToast("Đã chuyển về màn hình chính.", "info");
    }
    return;
  }

  if (!auth) return;
  try {
    await signOut(auth);
    showToast("Đã đăng xuất tài khoản an toàn.", "info");
  } catch (error) {
    console.error("Lỗi logout:", error);
  }
}

/* ==========================================================================
   14. SỰ KIỆN GIAO DIỆN & TIỆN ÍCH
   ========================================================================== */
function setupEventListeners() {
  // PWA Install Triggers
  if (DOM.pwaInstallActionBtn) DOM.pwaInstallActionBtn.addEventListener("click", triggerPwaInstall);
  if (DOM.headerInstallBtn) DOM.headerInstallBtn.addEventListener("click", triggerPwaInstall);
  if (DOM.navInstallBtn) DOM.navInstallBtn.addEventListener("click", triggerPwaInstall);
  if (DOM.pwaCloseBannerBtn) DOM.pwaCloseBannerBtn.addEventListener("click", () => DOM.pwaInstallBanner.classList.add("hidden"));
  if (DOM.closeIosInstallModalBtn) DOM.closeIosInstallModalBtn.addEventListener("click", () => DOM.iosInstallModal.classList.add("hidden"));

  // Nút Dùng Thử Ngay Local
  if (DOM.quickLocalBtn) DOM.quickLocalBtn.addEventListener("click", () => switchToLocalMode(false));
  if (DOM.heroLocalBtn) DOM.heroLocalBtn.addEventListener("click", () => switchToLocalMode(false));

  // Modal Custom Firebase Config
  if (DOM.openCustomConfigBtn) DOM.openCustomConfigBtn.addEventListener("click", () => DOM.customConfigModal.classList.remove("hidden"));
  if (DOM.closeCustomConfigBtn) DOM.closeCustomConfigBtn.addEventListener("click", () => DOM.customConfigModal.classList.add("hidden"));
  if (DOM.cancelCustomConfigBtn) DOM.cancelCustomConfigBtn.addEventListener("click", () => DOM.customConfigModal.classList.add("hidden"));
  if (DOM.customConfigForm) DOM.customConfigForm.addEventListener("submit", handleSaveCustomConfig);
  if (DOM.resetConfigBtn) DOM.resetConfigBtn.addEventListener("click", handleResetConfig);

  // Mobile Bottom Nav Triggers
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

  // Auth
  if (DOM.loginBtn) DOM.loginBtn.addEventListener("click", handleGoogleLogin);
  if (DOM.heroLoginBtn) DOM.heroLoginBtn.addEventListener("click", handleGoogleLogin);
  if (DOM.logoutBtn) DOM.logoutBtn.addEventListener("click", handleLogout);

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

  // Live currency formatting
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

  // Config Guide Modal
  if (DOM.openConfigGuideBtn) DOM.openConfigGuideBtn.addEventListener("click", () => DOM.configGuideModal.classList.remove("hidden"));
  if (DOM.closeConfigGuideBtn) DOM.closeConfigGuideBtn.addEventListener("click", () => DOM.configGuideModal.classList.add("hidden"));
  if (DOM.closeConfigGuideOkBtn) DOM.closeConfigGuideOkBtn.addEventListener("click", () => DOM.configGuideModal.classList.add("hidden"));

  // ESC key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTransactionModal();
      closeDeleteModal();
      if (DOM.configGuideModal) DOM.configGuideModal.classList.add("hidden");
      if (DOM.customConfigModal) DOM.customConfigModal.classList.add("hidden");
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

window._expenseApp = {
  editTransaction: openEditTransactionModal,
  deleteTransaction: openDeleteModal
};
