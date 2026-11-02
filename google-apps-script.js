/**
 * ================================================================
 * QuantAudit - Apps Script Backend (Web App POST handler & Database)
 * ================================================================
 * Kien truc:
 *   [Antigravity Website] --POST JSON--> [Apps Script Web App URL]
 *   --> [Sheet append row / Lead / Articles / Passkeys]
 *   --> [Drive: tao file YAML chuan QuantAudit]
 *   --> [Telegram alert]
 *   --> [Return JSON status cho website]
 *
 * Setup:
 *   1. Mo Google Sheet rong (hoac sheet co san co cot header)
 *   2. Extensions > Apps Script > paste toan bo file nay
 *   3. Project Settings > Script Properties: add 4 key (xem ben duoi)
 *   4. Deploy > New deployment > Web app > Execute as: ME, Access: ANYONE
 *   5. Copy Web App URL > paste vao backend Antigravity (POST endpoint)
 *
 * Script Properties can co:
 *   - DRIVE_FOLDER_ID         (folder QuantAudit_Intake tren Drive)
 *   - SHEET_NAME              (mac dinh: "Form Responses 1")
 *   - TELEGRAM_BOT_TOKEN      (token bot Telegram)
 *   - TELEGRAM_CHAT_ID        (chat ID nhan alert)
 * ================================================================
 */

// =====================================================================
// CONFIG - Sua tai Script Properties (Project Settings)
// =====================================================================
function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    DRIVE_FOLDER_ID:     props.getProperty("DRIVE_FOLDER_ID") || "16-krCcAjnbwOmYPgedyxXd5WcHp-Ez4j",
    SHEET_NAME:          props.getProperty("SHEET_NAME") || "Form Responses 1",
    TELEGRAM_BOT_TOKEN:  props.getProperty("TELEGRAM_BOT_TOKEN") || "",
    TELEGRAM_CHAT_ID:    props.getProperty("TELEGRAM_CHAT_ID") || "",
  };
}

// =====================================================================
// HEADERS - Cot tren Sheet (auto-create lan dau)
// =====================================================================
const SHEET_HEADERS = [
  "Timestamp", "Customer ID", "Status",
  "Họ tên", "Email", "Số điện thoại", "Nhóm khách", "Vốn (USD)", "Mục tiêu",
  "Tên hệ thống", "Entry rule", "Money mgmt", "Trade mgmt",
  "Symbol", "Timeframe", "Risk/lệnh (%)", "SL/TP type", "Daily stop rule", "Audit period",
  "Prop firm", "Challenge size", "Daily DD limit", "Overall DD limit", "Profit target",
  "Gói dịch vụ", "Ngôn ngữ", "Co-branding",
  "VIP Multi-variant", "VIP Multi-symbol", "VIP MC regime", "VIP Export code"
];

// =====================================================================
// ENUM MAPPERS
// =====================================================================
const SEGMENT_MAP = {
  "Cá nhân": "retail", "Retail trader cá nhân": "retail",
  "Prop firm": "propfirm", "Người chinh phục prop firm": "propfirm", "Đang/sắp thi Quỹ Cấp Vốn (Prop Firm)": "propfirm",
  "IB": "ib", "IB / Affiliate broker": "ib",
  "Course seller": "course", "Người bán signal / khóa học": "course",
};
const PROP_MAP = {
  "Hola Prime": "hola_prime", "Hola": "hola_prime",
  "FTMO": "ftmo", "MFF": "mff", "MyForexFunds": "mff",
  "FundedNext": "fundednext",
};
const TIER_MAP = {
  "Trải Nghiệm": "free", "Free": "free", "Miễn phí": "free", "Gói Trải Nghiệm (2.500.000 VNĐ)": "free", "Kiểm Định Tiêu Chuẩn (1.500.000 VNĐ)": "free",
  "Cơ Bản": "basic", "Basic": "basic", "Cơ bản": "basic", "Gói Chuyên Gia (5.000.000 VNĐ)": "basic", "Tối Ưu Chuyên Sâu (3.500.000 VNĐ)": "basic", "Kiểm Thử Rủi Ro (5.500.000 VNĐ)": "basic",
  "Nâng Cao": "vip", "VIP": "vip", "Nâng cao": "vip", "Gói Săn Quỹ (9.000.000 VNĐ)": "vip", "Gói Đặc Quyền Tổ Chức (96.000.000 VNĐ/năm)": "vip",
};
const LANG_MAP = {
  "Tiếng Việt": "vi", "Vietnamese": "vi", "VI": "vi",
  "English": "en", "Tiếng Anh": "en", "EN": "en",
  "中文": "cn", "Tiếng Trung": "cn", "Chinese": "cn", "CN": "cn",
};
const LOOKBACK_MAP = {
  "90 ngày": 90, "90": 90,
  "180 ngày": 180, "180": 180,
  "365 ngày": 365, "1 năm": 365, "365": 365,
};
const YESNO_MAP = {
  "Có": true, "Yes": true, "Có cần": true, true: true,
  "Không": false, "No": false, "Không cần": false, false: false,
};

// =====================================================================
// MAIN HANDLER - doGet
// =====================================================================
function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = params.action;
  
  // Toàn bộ bài viết: cho phép Passkey hợp lệ (vip / admin) hoặc SERVER_KEY
  if (action === 'getArticles') {
    if (isServerKey(params.key)) {
      return handleGetArticles('admin');
    }
    const auth = checkPasskey(params.passkey);
    if (!auth.valid) {
      return jsonResponse({
        success: false,
        authenticated: false,
        message: auth.message || 'Từ chối truy cập: Cần passkey VIP hoặc Quản trị viên hợp lệ.',
        data: {}
      });
    }
    return handleGetArticles(auth.role);
  }

  // Một bài viết cụ thể theo ID: cho phép Passkey hợp lệ (vip / admin) hoặc SERVER_KEY
  if (action === 'getArticle') {
    if (isServerKey(params.key)) {
      return handleGetArticle(params.id, 'admin');
    }
    const auth = checkPasskey(params.passkey);
    if (!auth.valid) {
      return jsonResponse({
        success: false,
        authenticated: false,
        message: auth.message || 'Từ chối truy cập: Cần passkey VIP hợp lệ để xem bài viết này.'
      });
    }
    return handleGetArticle(params.id, auth.role);
  }
  
  if (action === 'verifyPasskey') {
    return handleVerifyPasskey(params.passkey);
  }

  // Quản lý danh sách Passkey (chỉ Admin hoặc SERVER_KEY)
  if (action === 'getPasskeys') {
    if (!isServerKey(params.key) && !isAdminPasskey(params.passkey)) {
      return jsonResponse({ success: false, message: 'Không có quyền Admin.' });
    }
    return handleGetPasskeys();
  }
  
  return jsonResponse({
    status: "ok",
    service: "QuantAudit Apps Script Backend & Database",
    version: "1.5",
    timestamp: new Date().toISOString(),
  });
}

// =====================================================================
// MAIN HANDLER - doPost (entry tu website Antigravity)
// =====================================================================
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", message: "No POST body" });
    }

    const data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== "object") {
      return jsonResponse({ status: "error", message: "Invalid JSON" });
    }

    // A0. Xử lý kết quả tự đánh giá Sáu ô -> Ghi Sheet + Báo ngay về Telegram
    if (data.source === 'sauo') {
      const sauO = getOrCreateSheetByName('SAU_O', [
        'Thời gian', 'Tên', 'Zalo', 'Quy mô tài khoản', 'Số ô điền',
        'Ô1 Lối đánh', 'Ô2 Chỗ vào', 'Ô3 Chỗ thoát',
        'Ô4 Nhịp', 'Ô5 Giờ', 'Ô6 Số lệnh', 'Nguồn'
      ]);
      sauO.appendRow([
        data.thoi_gian || new Date(), data.ten || '', data.zalo || '',
        data.quy_mo || '', data.so_o_dien || '',
        data.o1_loi_danh || '', data.o2_cho_vao || '', data.o3_cho_thoat || '',
        data.o4_nhip || '', data.o5_gio || '', data.o6_so_lenh || '', data.nguon || ''
      ]);
      try {
        const msg =
          "🎯 [SÁU Ô] Khách vừa hoàn thành tự kiểm tra!\n" +
          "• Tên: " + (data.ten || "—") + "\n" +
          "• Zalo/SĐT: " + (data.zalo || "—") + "\n" +
          "• Số ô mô tả rõ: " + (data.so_o_dien ?? "—") + " / 6\n" +
          "• Ô1 (Lối đánh): " + oneLine(data.o1_loi_danh || "—") + "\n" +
          "• Ô2 (Điểm vào): " + oneLine(data.o2_cho_vao || "—") + "\n" +
          "• Ô3 (Điểm thoát): " + oneLine(data.o3_cho_thoat || "—") + "\n" +
          "• Ô4 (Nhịp/Khung): " + oneLine(data.o4_nhip || "—") + "\n" +
          "• Ô5 (Giờ giao dịch): " + oneLine(data.o5_gio || "—") + "\n" +
          "• Ô6 (Số lệnh): " + oneLine(data.o6_so_lenh || "—") + "\n" +
          "• Nguồn: " + (data.nguon || "truc-tiep");
        sendTelegram(msg);
      } catch (tgErr) {}
      return jsonResponse({ ok: true });
    }

    // A1. Ghi yêu cầu tham gia thành viên -> Ghi Sheet + Báo ngay về Telegram
    if (data.source === 'member_interest') {
      if (!data.name || !data.contact || data.consent !== true) {
        return jsonResponse({ status: 'error', message: 'Thiếu thông tin liên hệ hoặc sự đồng ý.' });
      }
      const members = getOrCreateSheetByName('Leads_ThanhVien', [
        'Thời gian', 'Nguồn', 'Tên', 'Liên hệ', 'Gói thành viên', 'Đồng ý', 'Trạng thái'
      ]);
      members.appendRow([
        new Date(), 'member_interest', data.name || '', data.contact || '',
        '50 USD tháng đầu; 100 USD từ tháng thứ hai', 'Có', 'Chờ xác nhận chuyển khoản'
      ]);
      try {
        const msg =
          "💎 [THÀNH VIÊN] Khách mới đăng ký Membership!\n" +
          "• Họ tên: " + (data.name || "—") + "\n" +
          "• Liên hệ (Zalo/Email): " + (data.contact || "—") + "\n" +
          "• Trạng thái: Chờ tư vấn / xác nhận";
        sendTelegram(msg);
      } catch (tgErr) {}
      return jsonResponse({ ok: true });
    }

    // A. Xử lý Lead Thư viện / Hồ sơ nghiên cứu (Vault) -> Ghi Sheet + Báo ngay về Telegram
    if (data.source === 'library_vault') {
      var _ss = SpreadsheetApp.getActiveSpreadsheet();
      var _sh = _ss.getSheetByName('Leads_ThuVien');
      if (!_sh) {
        _sh = _ss.insertSheet('Leads_ThuVien');
        _sh.appendRow(['Thời gian', 'Nguồn', 'Họ tên', 'SĐT', 'Email']);
      }
      _sh.appendRow([new Date(), 'library_vault',
                     data.name || '', data.phone || '', data.email || '']);
      try {
        const msg =
          "📚 [HỒ SƠ NGHIÊN CỨU] Khách mới tải bộ PDF!\n" +
          "• Họ tên: " + (data.name || "—") + "\n" +
          "• SĐT/Zalo: " + (data.phone || "—") + "\n" +
          "• Email: " + (data.email || "—");
        sendTelegram(msg);
      } catch (tgErr) {}
      return jsonResponse({ ok: true });
    }

    // B. Xử lý lưu Bài viết (CMS)
    if (data.action === 'saveArticle') {
      if (!isAdminPasskey(data.passkey)) {
        return jsonResponse({ success: false, message: 'Không có quyền Admin.' });
      }
      return handleSaveArticle(data.id, data.articleContent);
    }

    // C. Xử lý xác thực Passkey VIP qua POST (nếu dùng)
    if (data.action === 'verifyPasskey') {
      return handleVerifyPasskey(data.passkey);
    }

    // D. Quản lý Passkey từ Web Admin (thêm / sửa dropdown role, status, expiry / xóa)
    if (data.action === 'savePasskey') {
      if (!isAdminPasskey(data.passkey)) {
        return jsonResponse({ success: false, message: 'Không có quyền Admin.' });
      }
      return handleSavePasskey(data.item || data);
    }

    if (data.action === 'deletePasskey') {
      if (!isAdminPasskey(data.passkey)) {
        return jsonResponse({ success: false, message: 'Không có quyền Admin.' });
      }
      return handleDeletePasskey(data.targetPasskey);
    }

    if (data.action === 'setupPasskeySheet') {
      if (!isAdminPasskey(data.passkey)) {
        return jsonResponse({ success: false, message: 'Không có quyền Admin.' });
      }
      const msg = setupPasskeySheet();
      return jsonResponse({ success: true, message: msg });
    }

    // E. Cấu hình & Kiểm tra Telegram trực tiếp từ trang Web Admin (/admin)
    if (data.action === 'saveTelegramConfig') {
      if (!isAdminPasskey(data.passkey)) {
        return jsonResponse({ success: false, message: 'Không có quyền Admin.' });
      }
      const props = PropertiesService.getScriptProperties();
      if (data.botToken && String(data.botToken).trim()) {
        props.setProperty('TELEGRAM_BOT_TOKEN', String(data.botToken).trim());
      }
      if (data.chatId && String(data.chatId).trim()) {
        props.setProperty('TELEGRAM_CHAT_ID', String(data.chatId).trim());
      }
      const testRes = sendTelegramWithStatus('✅ [Strategy Audit] Đã kết nối Telegram Bot thành công! Từ giờ mọi khách nhập liệu (Sáu Ô, Thành Viên, Hồ Sơ Nghiên Cứu) sẽ báo ngay về đây.');
      return jsonResponse({
        success: testRes.ok,
        message: testRes.ok
          ? 'Đã lưu cấu hình & gửi tin nhắn thử về Telegram thành công!'
          : 'Đã lưu nhưng chưa gửi được Telegram: ' + testRes.error,
      });
    }

    if (data.action === 'testTelegram') {
      if (!isAdminPasskey(data.passkey)) {
        return jsonResponse({ success: false, message: 'Không có quyền Admin.' });
      }
      const testRes = sendTelegramWithStatus('🔔 [Strategy Audit] Tin nhắn kiểm tra kết nối Telegram từ trang Quản Trị Admin!');
      return jsonResponse({
        success: testRes.ok,
        message: testRes.ok
          ? 'Đã gửi tin nhắn thử về Telegram thành công! Anh kiểm tra điện thoại nhé.'
          : 'Chưa gửi được Telegram: ' + testRes.error,
      });
    }

    // --- Dưới đây là logic đăng ký Intake Form gốc ---
    // 1. Validate basic fields
    if (!data.q1 || !data.q2) {
      return jsonResponse({
        status: "error",
        message: "Thiếu họ tên (q1) hoặc email (q2)"
      });
    }
    if (!isValidEmail(data.q2)) {
      return jsonResponse({
        status: "error",
        message: "Email không hợp lệ: " + data.q2
      });
    }

    // 2. Gen customer ID
    const customerId = generateCustomerId();

    // 3. Append to sheet
    const sheet = getOrCreateSheet();
    const timestamp = new Date();
    sheet.appendRow([
      timestamp, customerId, "QUEUED",
      data.q1 || "", data.q2 || "", data.q2_2 || "", data.q3 || "",
      data.q4 || "", data.q5 || "",
      data.q6 || "", data.q7 || "", data.q7_2 || "", data.q7_3 || "",
      data.q8 || "", data.q9 || "", data.q10 || "", data.q11 || "", data.q12 || "", data.q13 || "",
      data.q14 || "", data.q15 || "", data.q16 || "", data.q17 || "", data.q18 || "",
      data.q19 || "", data.q20 || "", data.q21 || "",
      data.vip1 || "", data.vip2 || "", data.vip3 || "", data.vip4 || ""
    ]);

    // 4. Build YAML + push to Drive
    let yamlPushed = false;
    let yamlError = "";
    try {
      const yamlText = buildYaml(data, customerId, timestamp);
      pushYamlToDrive(customerId, data.q1, yamlText);
      yamlPushed = true;
    } catch (yamlErr) {
      yamlError = String(yamlErr);
    }

    // 5. Telegram alert
    let tgSent = false;
    try {
      const tier = TIER_MAP[data.q19] || data.q19 || "?";
      const msg = "[QuantAudit] Khách mới: " + (data.q1 || "?") +
                  "\n  Mã: " + customerId +
                  "\n  Email: " + (data.q2 || "?") +
                  "\n  Gói: " + tier +
                  "\n  Symbol: " + (data.q8 || "?") +
                  "\n  Vốn: " + (data.q4 || "?") + " USD" +
                  (yamlPushed ? "" : "\n  WARN: YAML LOI - " + yamlError.substring(0, 80));
      sendTelegram(msg);
      tgSent = true;
    } catch (tgErr) {
      // Khong fail
    }

    return jsonResponse({
      status: "success",
      customer_id: customerId,
      message: "Đăng ký thành công. Anh/chị sẽ nhận báo cáo qua email trong 24 giờ.",
      yaml_pushed: yamlPushed,
      telegram_sent: tgSent,
    });

  } catch (err) {
    // Try send error notif
    try {
      sendTelegram("[QuantAudit] doPost LỖI: " + String(err).substring(0, 300));
    } catch (e2) {}
    return jsonResponse({
      status: "error",
      message: String(err).substring(0, 500)
    });
  }
}

// =====================================================================
// NEW FUNCTIONS - Articles & Passkeys Database Management
// =====================================================================

// Lấy tất cả bài viết từ sheet "articles"
function handleGetArticles(role) {
  try {
    const sheet = getOrCreateSheetByName('articles', ['id', 'articleContent', 'updatedAt']);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return jsonResponse({
        success: true,
        authenticated: true,
        role: role || 'vip',
        data: {}
      });
    }
    
    const articles = {};
    for (let i = 1; i < data.length; i++) {
      const id = data[i][0];
      const content = data[i][1];
      if (id) {
        articles[id] = {
          articleContent: content || ""
        };
      }
    }
    
    return jsonResponse({
      success: true,
      authenticated: true,
      role: role || 'vip',
      data: articles
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      message: "Lỗi tải bài viết: " + err.toString()
    });
  }
}

// Các lựa chọn Dropdown chuẩn cho sheet "passkeys"
const PASSKEY_ROLES = ['vip', 'admin'];
const PASSKEY_STATUSES = ['active', 'inactive'];
const PASSKEY_EXPIRY_OPTIONS = ['lifetime', '14 ngày', '30 ngày', '90 ngày', '365 ngày'];

// Tự động tạo menu trên Google Sheet để Leon bấm 1 nút là cài xong Dropdown & Passkey
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('🔐 Strategy Audit')
      .addItem('1. Cài đặt Dropdown & Khóa mã cũ (VIP / SA_ADMIN_2026)', 'setupPasskeySheet')
      .addItem('2. Tạo nhanh 1 mã VIP 14 ngày (Gói trải nghiệm)', 'quickCreateVip14Days')
      .addItem('3. Tạo nhanh 1 mã VIP 30 ngày (Gói 1 tháng)', 'quickCreateVip30Days')
      .addItem('4. Tạo nhanh 1 mã VIP Vĩnh viễn (lifetime)', 'quickCreateVipLifetime')
      .addToUi();
  } catch (err) {}
}

// Khi Leon đổi Dropdown (role, status, expiry) trực tiếp trên Google Sheet -> tự động cập nhật cột updatedAt để Web kích hoạt ngay
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (!sheet || sheet.getName() !== 'passkeys') return;
    const row = e.range.getRow();
    const col = e.range.getColumn();
    if (row <= 1 || col > 5) return;
    sheet.getRange(row, 6).setValue(new Date());
  } catch (err) {}
}

// Kẻ sẵn Dropdown chọn cho cột role (B), status (C), expiry (D) trên Google Sheet
function applyPasskeyDropdowns(sheet) {
  try {
    const maxRows = Math.max(sheet.getLastRow() + 30, 50);
    const roleRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(PASSKEY_ROLES, true)
      .setAllowInvalid(false)
      .build();
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(PASSKEY_STATUSES, true)
      .setAllowInvalid(false)
      .build();
    // Cho phép chọn từ dropdown ('lifetime', '14 ngày', '30 ngày', '90 ngày', '365 ngày') HOẶC tự gõ ngày YYYY-MM-DD
    const expiryRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(PASSKEY_EXPIRY_OPTIONS, true)
      .setAllowInvalid(true)
      .build();

    sheet.getRange(2, 2, maxRows, 1).setDataValidation(roleRule);
    sheet.getRange(2, 3, maxRows, 1).setDataValidation(statusRule);
    sheet.getRange(2, 4, maxRows, 1).setDataValidation(expiryRule);
  } catch (err) {
    console.warn('Không thể gán dropdown:', err);
  }
}

// Giải mã cột expiry: hỗ trợ cả 'lifetime', '14 ngày', '30 ngày', '90 ngày', '365 ngày' và ngày cụ thể YYYY-MM-DD
function evaluatePasskeyExpiry(expiryRaw, updatedAtRaw) {
  if (expiryRaw === null || expiryRaw === undefined) {
    return { expired: false, expiryLabel: 'lifetime', expiresAt: null };
  }
  const expiryStr = String(expiryRaw).trim();
  const lower = expiryStr.toLowerCase();
  if (
    expiryStr === '' ||
    lower === 'lifetime' ||
    lower === 'vĩnh viễn' ||
    lower === 'vinh vien' ||
    lower === 'forever'
  ) {
    return { expired: false, expiryLabel: 'lifetime', expiresAt: null };
  }

  // Khớp định dạng số ngày từ dropdown: "14 ngày", "30 ngày", "90 ngày", "365 ngày", "14_days", "30d"...
  const dayMatch = lower.match(/^(\d+)\s*(?:ngày|ngay|days?|d|_days?)$/i);
  if (dayMatch) {
    const days = parseInt(dayMatch[1], 10);
    const baseDate = updatedAtRaw ? new Date(updatedAtRaw) : new Date();
    const startMs = isNaN(baseDate.getTime()) ? Date.now() : baseDate.getTime();
    const expDate = new Date(startMs + days * 24 * 60 * 60 * 1000);
    expDate.setHours(23, 59, 59, 999);
    return {
      expired: new Date() > expDate,
      expiryLabel: days + ' ngày',
      expiresAt: expDate.toISOString().slice(0, 10),
    };
  }

  // Ngày cụ thể (Date object hoặc chuỗi YYYY-MM-DD)
  const expDate = expiryRaw instanceof Date ? new Date(expiryRaw.getTime()) : new Date(expiryStr);
  if (!isNaN(expDate.getTime())) {
    expDate.setHours(23, 59, 59, 999);
    return {
      expired: new Date() > expDate,
      expiryLabel: expDate.toISOString().slice(0, 10),
      expiresAt: expDate.toISOString().slice(0, 10),
    };
  }

  return { expired: false, expiryLabel: expiryStr, expiresAt: null };
}

// Kiểm tra tính hợp lệ của Passkey từ sheet "passkeys"
function checkPasskey(passkey) {
  try {
    if (!passkey) {
      return ({
        success: true,
        valid: false,
        message: "Chưa nhập passkey."
      });
    }
    
    const cleanPasskey = passkey.trim();
    const sheet = getOrCreateSheetByName('passkeys', ['passkey', 'role', 'status', 'expiry', 'description', 'updatedAt']);
    
    checkAndInitDefaultPasskeys(sheet);
    
    const data = sheet.getDataRange().getValues();
    let matchedRow = null;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() === cleanPasskey) {
        matchedRow = {
          passkey: data[i][0].toString().trim(),
          role: data[i][1] ? data[i][1].toString().trim().toLowerCase() : 'vip',
          status: data[i][2] ? data[i][2].toString().trim().toLowerCase() : 'active',
          expiry: data[i][3],
          description: data[i][4] || "",
          updatedAt: data[i][5] || null
        };
        break;
      }
    }
    
    if (!matchedRow) {
      return ({
        success: true,
        valid: false,
        message: "Passkey không hợp lệ hoặc đã bị thu hồi."
      });
    }
    
    if (matchedRow.status !== 'active') {
      return ({
        success: true,
        valid: false,
        message: "Passkey này đã bị tạm khóa (inactive)."
      });
    }
    
    const expInfo = evaluatePasskeyExpiry(matchedRow.expiry, matchedRow.updatedAt);
    if (expInfo.expired) {
      return ({
        success: true,
        valid: false,
        message: "Passkey này đã hết hạn sử dụng (" + (expInfo.expiresAt || expInfo.expiryLabel) + ")."
      });
    }
    
    return ({
      success: true,
      valid: true,
      role: matchedRow.role,
      expiry: expInfo.expiryLabel,
      expiresAt: expInfo.expiresAt,
      message: "Xác thực thành công!"
    });
    
  } catch (err) {
    return ({
      success: false,
      message: "Lỗi xác thực passkey: " + err.toString()
    });
  }
}

// Lấy toàn bộ danh sách Passkeys cho trang Web Admin (/admin)
function handleGetPasskeys() {
  try {
    const sheet = getOrCreateSheetByName('passkeys', ['passkey', 'role', 'status', 'expiry', 'description', 'updatedAt']);
    applyPasskeyDropdowns(sheet);
    const data = sheet.getDataRange().getValues();
    const list = [];
    for (let i = 1; i < data.length; i++) {
      const pk = data[i][0] ? data[i][0].toString().trim() : '';
      if (!pk || pk === '(thêm passkey ở dòng dưới)') continue;
      const role = data[i][1] ? data[i][1].toString().trim().toLowerCase() : 'vip';
      const status = data[i][2] ? data[i][2].toString().trim().toLowerCase() : 'active';
      const expiryRaw = data[i][3];
      const description = data[i][4] ? data[i][4].toString() : '';
      const updatedAt = data[i][5] ? new Date(data[i][5]).toISOString() : '';
      const expInfo = evaluatePasskeyExpiry(expiryRaw, data[i][5]);
      list.push({
        passkey: pk,
        role: role,
        status: status,
        expiry: expiryRaw instanceof Date ? expInfo.expiryLabel : (String(expiryRaw || 'lifetime').trim() || 'lifetime'),
        expiresAt: expInfo.expiresAt,
        expired: expInfo.expired,
        description: description,
        updatedAt: updatedAt,
      });
    }
    const cfg = getConfig();
    return jsonResponse({
      success: true,
      passkeys: list,
      expiryOptions: PASSKEY_EXPIRY_OPTIONS,
      telegram: {
        configured: Boolean(cfg.TELEGRAM_BOT_TOKEN && cfg.TELEGRAM_CHAT_ID),
        chatId: cfg.TELEGRAM_CHAT_ID || '',
        hasToken: Boolean(cfg.TELEGRAM_BOT_TOKEN),
      },
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      message: 'Lỗi tải danh sách passkey: ' + err.toString(),
    });
  }
}

// Thêm hoặc cập nhật Passkey từ trang Web Admin (/admin) hoặc hàm nội bộ
function handleSavePasskey(item) {
  try {
    const targetKey = (item.passkey || '').toString().trim();
    const lookupKey = (item.oldPasskey || targetKey).toString().trim();
    if (!targetKey) {
      return jsonResponse({ success: false, message: 'Passkey không được để trống.' });
    }
    const role = (item.role || 'vip').toString().trim().toLowerCase() === 'admin' ? 'admin' : 'vip';
    const status = (item.status || 'active').toString().trim().toLowerCase() === 'inactive' ? 'inactive' : 'active';
    const expiry = (item.expiry || 'lifetime').toString().trim() || 'lifetime';
    const description = (item.description || '').toString().trim();
    const now = new Date();

    const sheet = getOrCreateSheetByName('passkeys', ['passkey', 'role', 'status', 'expiry', 'description', 'updatedAt']);
    const data = sheet.getDataRange().getValues();
    let foundRow = -1;
    for (let i = 1; i < data.length; i++) {
      const currentKey = data[i][0] ? data[i][0].toString().trim() : '';
      if (currentKey === lookupKey) {
        foundRow = i + 1;
        break;
      }
    }

    if (foundRow > -1) {
      sheet.getRange(foundRow, 1, 1, 6).setValues([[targetKey, role, status, expiry, description, now]]);
    } else {
      sheet.appendRow([targetKey, role, status, expiry, description, now]);
    }
    applyPasskeyDropdowns(sheet);

    return jsonResponse({
      success: true,
      message: 'Đã lưu Passkey và đồng bộ Dropdown trên Google Sheet.',
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      message: 'Lỗi lưu passkey: ' + err.toString(),
    });
  }
}

// Xóa một Passkey từ trang Web Admin (/admin)
function handleDeletePasskey(targetPasskey) {
  try {
    const clean = (targetPasskey || '').toString().trim();
    if (!clean) {
      return jsonResponse({ success: false, message: 'Thiếu mã passkey cần xóa.' });
    }
    const sheet = getOrCreateSheetByName('passkeys', ['passkey', 'role', 'status', 'expiry', 'description', 'updatedAt']);
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] && data[i][0].toString().trim() === clean) {
        sheet.deleteRow(i + 1);
        return jsonResponse({ success: true, message: 'Đã xóa passkey ' + clean });
      }
    }
    return jsonResponse({ success: false, message: 'Không tìm thấy passkey ' + clean });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Lỗi xóa passkey: ' + err.toString() });
  }
}

// Hàm chạy 1 lần trong Apps Script (hoặc từ menu Google Sheet / nút trên trang Web Admin) để:
// 1. Tạo Dropdown cho cột role, status, expiry
// 2. Chuyển dòng VIP và SA_ADMIN_2026 sang inactive
// 3. Tạo sẵn mã Admin mới và mã VIP mới nếu chưa có
function setupPasskeySheet() {
  const sheet = getOrCreateSheetByName('passkeys', ['passkey', 'role', 'status', 'expiry', 'description', 'updatedAt']);
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  let hasActiveAdmin = false;
  let hasActiveVip = false;

  for (let i = 1; i < data.length; i++) {
    const pk = data[i][0] ? data[i][0].toString().trim() : '';
    const role = data[i][1] ? data[i][1].toString().trim().toLowerCase() : 'vip';
    const status = data[i][2] ? data[i][2].toString().trim().toLowerCase() : 'active';
    if (pk === 'VIP' || pk === 'SA_ADMIN_2026') {
      sheet.getRange(i + 1, 3).setValue('inactive');
      sheet.getRange(i + 1, 5).setValue('Mã mặc định cũ - Đã khóa bảo mật');
      sheet.getRange(i + 1, 6).setValue(now);
    } else if (status === 'active') {
      if (role === 'admin') hasActiveAdmin = true;
      if (role === 'vip') hasActiveVip = true;
    }
  }

  const randCode = () => Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(10 + Math.random() * 90);
  if (!hasActiveAdmin) {
    sheet.appendRow(['LEON-ADMIN-' + randCode(), 'admin', 'active', 'lifetime', 'Master Key Admin của Leon', now]);
  }
  if (!hasActiveVip) {
    sheet.appendRow(['SA-VIP-' + randCode(), 'vip', 'active', '30 ngày', 'Mã thành viên VIP (30 ngày)', now]);
  }

  applyPasskeyDropdowns(sheet);
  return 'Đã cài đặt Dropdown (role, status, expiry) và khóa mã mặc định cũ thành công!';
}

function quickCreateVip14Days() {
  const sheet = getOrCreateSheetByName('passkeys', ['passkey', 'role', 'status', 'expiry', 'description', 'updatedAt']);
  const code = 'SA-14D-' + Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(10 + Math.random() * 90);
  sheet.appendRow([code, 'vip', 'active', '14 ngày', 'Gói trải nghiệm 14 ngày', new Date()]);
  applyPasskeyDropdowns(sheet);
}

function quickCreateVip30Days() {
  const sheet = getOrCreateSheetByName('passkeys', ['passkey', 'role', 'status', 'expiry', 'description', 'updatedAt']);
  const code = 'SA-VIP-' + Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(10 + Math.random() * 90);
  sheet.appendRow([code, 'vip', 'active', '30 ngày', 'Gói thành viên 30 ngày', new Date()]);
  applyPasskeyDropdowns(sheet);
}

function quickCreateVipLifetime() {
  const sheet = getOrCreateSheetByName('passkeys', ['passkey', 'role', 'status', 'expiry', 'description', 'updatedAt']);
  const code = 'SA-LIFE-' + Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(10 + Math.random() * 90);
  sheet.appendRow([code, 'vip', 'active', 'lifetime', 'Gói Vĩnh viễn', new Date()]);
  applyPasskeyDropdowns(sheet);
}

function handleVerifyPasskey(passkey) {
  return jsonResponse(checkPasskey(passkey));
}

function isAdminPasskey(passkey) {
  const r = checkPasskey(passkey);
  return r.success && r.valid && r.role === 'admin';
}

// Khoá bí mật dùng chung với Netlify Function (Script Properties → SERVER_KEY)
function isServerKey(key) {
  const k = PropertiesService.getScriptProperties().getProperty('SERVER_KEY');
  return Boolean(k) && key === k;
}

// Một bài viết theo id — trả kèm authenticated: true để tương thích cả Web trực tiếp lẫn Netlify Function
function handleGetArticle(id, role) {
  if (!id) {
    return jsonResponse({
      success: false,
      authenticated: true,
      message: 'Thiếu ID chiến lược.'
    });
  }
  const cleanId = String(id).trim();
  const sheet = getOrCreateSheetByName('articles', ['id', 'articleContent', 'updatedAt']);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim() === cleanId) {
      return jsonResponse({
        success: true,
        authenticated: true,
        role: role || 'vip',
        id: cleanId,
        articleContent: data[i][1] || ''
      });
    }
  }
  return jsonResponse({
    success: false,
    authenticated: true,
    notFound: true,
    id: cleanId,
    articleContent: ''
  });
}

// Lưu bài viết
function handleSaveArticle(id, articleContent) {
  try {
    if (!id) {
      return jsonResponse({
        success: false,
        message: "Thiếu ID chiến lược."
      });
    }
    
    const sheet = getOrCreateSheetByName('articles', ['id', 'articleContent', 'updatedAt']);
    const data = sheet.getDataRange().getValues();
    let foundRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() === id.trim()) {
        foundRowIndex = i + 1;
        break;
      }
    }
    
    const now = new Date();
    if (foundRowIndex > -1) {
      sheet.getRange(foundRowIndex, 2).setValue(articleContent);
      sheet.getRange(foundRowIndex, 3).setValue(now);
    } else {
      sheet.appendRow([id.trim(), articleContent, now]);
    }
    
    return jsonResponse({
      success: true,
      message: "Đã lưu bài viết thành công."
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      message: "Lỗi ghi dữ liệu: " + err.toString()
    });
  }
}

// Tạo sheet theo tên nếu chưa có
function getOrCreateSheetByName(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#F3F4F6');
    sheet.setFrozenRows(1);
    if (name === 'passkeys') {
      applyPasskeyDropdowns(sheet);
    }
  }
  return sheet;
}

// Khởi tạo passkey mặc định nếu trống
function checkAndInitDefaultPasskeys(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    const now = new Date();
    // Không tạo passkey mặc định nữa (mã dễ đoán). Admin tự thêm dòng vào sheet "passkeys".
    sheet.appendRow(['(thêm passkey ở dòng dưới)', 'vip', 'inactive', 'lifetime', 'Ghi chú', now]);
    applyPasskeyDropdowns(sheet);
  }
}

// =====================================================================
// EMAIL VALIDATION
// =====================================================================
function isValidEmail(s) {
  if (!s || typeof s !== "string") return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(s.trim());
}

// =====================================================================
// CUSTOMER ID - QA-YYYY-NNNN auto increment
// =====================================================================
function generateCustomerId() {
  const year = new Date().getFullYear();
  const props = PropertiesService.getScriptProperties();
  const key = "last_seq_" + year;
  const last = parseInt(props.getProperty(key) || "0", 10);
  const next = last + 1;
  props.setProperty(key, String(next));
  return "QA-" + year + "-" + String(next).padStart(4, "0");
}

// =====================================================================
// GET OR CREATE SHEET (auto-add header row lan dau)
// =====================================================================
function getOrCreateSheet() {
  const cfg = getConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(cfg.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(cfg.SHEET_NAME);
  }
  // Auto header
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length)
         .setFontWeight("bold")
         .setBackground("#1B3A5C")
         .setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// =====================================================================
// BUILD YAML CHUAN QuantAudit
// =====================================================================
function buildYaml(data, customerId, timestamp) {
  const v = (key, dflt) => (data[key] !== undefined && data[key] !== "")
    ? data[key] : (dflt !== undefined ? dflt : "");

  const segment   = SEGMENT_MAP[v("q3")] || "retail";
  const tier      = TIER_MAP[v("q19")] || "basic";
  const lang      = LANG_MAP[v("q20")] || "vi";
  const lookback  = LOOKBACK_MAP[String(v("q13", "90 ngày"))] || 90;
  const propName  = PROP_MAP[v("q14")];
  const propEnabled = !!propName;
  const cobrand   = !!YESNO_MAP[v("q21")];
  const accountUsd = parseFloat(v("q4", 0)) || 0;
  const riskPct   = (parseFloat(v("q10", 0)) || 0) / 100;

  const template = "naked_pivot";

  const vipMV  = !!YESNO_MAP[v("vip1")];
  const vipMS  = !!YESNO_MAP[v("vip2")];
  const vipMC  = !!YESNO_MAP[v("vip3")];
  const vipEXP = !!YESNO_MAP[v("vip4")];

  const ts = timestamp.toISOString();
  const todayISO = ts.slice(0, 10);

  const lines = [
    "# Auto-generated tu Antigravity Form - " + ts,
    "# Customer ID: " + customerId,
    "",
    "customer:",
    "  id: \"" + customerId + "\"",
    "  name: \"" + esc(v("q1")) + "\"",
    "  email: \"" + esc(v("q2")) + "\"",
    "  phone: \"" + esc(v("q2_2")) + "\"",
    "  segment: \"" + segment + "\"",
    "  account_size_usd: " + accountUsd,
    "  goal_oneliner: \"" + esc(v("q5")) + "\"",
    "",
    "strategy:",
    "  display_name: \"" + esc(v("q6")) + "\"",
    "  template: \"" + template + "\"",
    "  description: |",
    "    Entry: " + oneLine(v("q7")),
    "    Money mgmt: " + oneLine(v("q7_2")),
    "    Trade mgmt: " + oneLine(v("q7_3")),
    "  params:",
    "    ema: 20",
    "    pivot_p: 2",
    "    tp1_r: 2.0",
    "    tp2_r: 4.0",
    "    risk_pct: " + riskPct,
    "    daily_stop_pct: 2.0",
    "",
    "market:",
    "  symbol: \"" + (v("q8", "XAUUSD")) + "\"",
    "  timeframe: \"" + (v("q9", "M5")) + "\"",
    "  lookback_days: " + lookback,
    "  initial_capital_usd: " + accountUsd,
    "  data_source: \"mt5\"",
    "",
    "prop_firm:",
    "  enabled: " + propEnabled,
    "  name: " + (propName ? ("\"" + propName + "\"") : "null"),
    "  challenge_size_usd: " + (parseFloat(v("q15", 0)) || 0),
    "  daily_dd_limit_pct: " + (parseFloat(v("q16", 0)) || "null"),
    "  overall_dd_limit_pct: " + (parseFloat(v("q17", 0)) || "null"),
    "  profit_target_pct: " + (parseFloat(v("q18", 0)) || "null"),
    "",
    "cost_assumptions:",
    "  spread_per_unit_usd: 0.30",
    "  commission_per_lot_usd: 0.0",
    "  slippage_per_unit_usd: 0.0",
    "",
    "robustness_tests:",
    "  walk_forward: { enabled: true, train_pct: 0.67 }",
    "  monte_carlo: { enabled: true, n_simulations: 1000, confidence_levels: [5, 25, 50, 75, 95] }",
    "  stress_test: { enabled: true, spread_levels_usd: [0.0, 0.15, 0.30, 0.50] }",
    "  parameter_sensitivity: { enabled: " + (tier === "vip" || vipMV) + " }",
    "",
    "delivery:",
    "  tier: \"" + tier + "\"",
    "  language: \"" + lang + "\"",
    "  formats: " + (tier === "vip" ? "[\"pdf\", \"xlsx\", \"pptx\"]" : "[\"pdf\"]"),
    "  co_branding:",
    "    enabled: " + cobrand,
    "",
    "meta:",
    "  request_date: \"" + todayISO + "\"",
    "  staff_in_charge: \"Leon\"",
    "  source: \"antigravity_form\"",
    "  vip_addons:",
    "    multi_variant: " + vipMV,
    "    multi_symbol: " + vipMS,
    "    mc_regime_split: " + vipMC,
    "    export_code: " + vipEXP,
    "  raw_entry_rule: |",
    "    " + (v("q7") || "").replace(/\n/g, "\n    "),
    "  raw_money_mgmt: |",
    "    " + (v("q7_2") || "").replace(/\n/g, "\n    "),
    "  raw_trade_mgmt: |",
    "    " + (v("q7_3") || "").replace(/\n/g, "\n    "),
    "  sl_tp_type: \"" + esc(v("q11")) + "\"",
    "  daily_stop_rule_raw: \"" + esc(v("q12")) + "\"",
    "",
  ];

  return lines.join("\n");
}

function esc(s) {
  return String(s || "").replace(/"/g, '\\"').replace(/\r/g, "").replace(/\n/g, " ").trim();
}

function oneLine(s) {
  return String(s || "").replace(/\r/g, "").replace(/\n/g, " ").trim();
}

// =====================================================================
// PUSH YAML TO DRIVE
// =====================================================================
function pushYamlToDrive(customerId, customerName, yamlText) {
  const cfg = getConfig();
  if (!cfg.DRIVE_FOLDER_ID) {
    throw new Error("Thieu DRIVE_FOLDER_ID trong Script Properties");
  }
  const folder = DriveApp.getFolderById(cfg.DRIVE_FOLDER_ID);
  const safeName = String(customerName || "unknown")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 30);
  const fileName = customerId + "_" + safeName + ".yaml";
  folder.createFile(fileName, yamlText, MimeType.PLAIN_TEXT);
  return fileName;
}

// =====================================================================
// TELEGRAM SEND
// =====================================================================
function sendTelegramWithStatus(text) {
  const cfg = getConfig();
  if (!cfg.TELEGRAM_BOT_TOKEN || !cfg.TELEGRAM_CHAT_ID) {
    return {
      ok: false,
      error: 'Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong Script Properties.',
    };
  }
  const url = "https://api.telegram.org/bot" + cfg.TELEGRAM_BOT_TOKEN + "/sendMessage";
  const payload = {
    chat_id: cfg.TELEGRAM_CHAT_ID,
    text: text,
    disable_web_page_preview: true,
  };
  try {
    const res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
    const code = res.getResponseCode();
    if (code >= 200 && code < 300) {
      return { ok: true };
    }
    return { ok: false, error: 'HTTP ' + code + ': ' + res.getContentText() };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function sendTelegram(text) {
  sendTelegramWithStatus(text);
}

// Helper to return JSON output in Apps Script Web App
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
