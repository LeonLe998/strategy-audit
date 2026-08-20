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
    TELEGRAM_BOT_TOKEN:  props.getProperty("TELEGRAM_BOT_TOKEN") || "8830720666:AAFYhM0dfTN-6bEaTNDKSlwhiQHMdS6dQDQ",
    TELEGRAM_CHAT_ID:    props.getProperty("TELEGRAM_CHAT_ID") || "5080412876",
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
  const action = e.parameter.action;
  
  if (action === 'getArticles') {
    return handleGetArticles();
  }
  
  if (action === 'verifyPasskey') {
    const passkey = e.parameter.passkey;
    return handleVerifyPasskey(passkey);
  }
  
  return jsonResponse({
    status: "ok",
    service: "QuantAudit Apps Script Backend & Database",
    version: "1.2",
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

    // A. Xử lý Lead Thư viện (Vault)
    if (data.source === 'library_vault') {
      var _ss = SpreadsheetApp.getActiveSpreadsheet();
      var _sh = _ss.getSheetByName('Leads_ThuVien');
      if (!_sh) {
        _sh = _ss.insertSheet('Leads_ThuVien');
        _sh.appendRow(['Thời gian', 'Nguồn', 'Họ tên', 'SĐT', 'Email']);
      }
      _sh.appendRow([new Date(), 'library_vault',
                     data.name || '', data.phone || '', data.email || '']);
      return jsonResponse({ ok: true });
    }

    // B. Xử lý lưu Bài viết (CMS)
    if (data.action === 'saveArticle') {
      return handleSaveArticle(data.id, data.articleContent);
    }

    // C. Xử lý xác thực Passkey VIP qua POST (nếu dùng)
    if (data.action === 'verifyPasskey') {
      return handleVerifyPasskey(data.passkey);
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
function handleGetArticles() {
  try {
    const sheet = getOrCreateSheetByName('articles', ['id', 'articleContent', 'updatedAt']);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return jsonResponse({
        success: true,
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
      data: articles
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      message: "Lỗi tải bài viết: " + err.toString()
    });
  }
}

// Kiểm tra tính hợp lệ của Passkey từ sheet "passkeys"
function handleVerifyPasskey(passkey) {
  try {
    if (!passkey) {
      return jsonResponse({
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
          description: data[i][4] || ""
        };
        break;
      }
    }
    
    if (!matchedRow) {
      return jsonResponse({
        success: true,
        valid: false,
        message: "Passkey không hợp lệ hoặc đã bị thu hồi."
      });
    }
    
    if (matchedRow.status !== 'active') {
      return jsonResponse({
        success: true,
        valid: false,
        message: "Passkey này đã bị tạm khóa."
      });
    }
    
    if (matchedRow.expiry) {
      const expiryStr = matchedRow.expiry.toString().trim();
      if (expiryStr !== "" && expiryStr.toLowerCase() !== "lifetime") {
        const expiryDate = new Date(matchedRow.expiry);
        const currentDate = new Date();
        
        expiryDate.setHours(23, 59, 59, 999);
        
        if (isNaN(expiryDate.getTime())) {
          console.warn("Định dạng ngày hết hạn không hợp lệ: " + matchedRow.expiry);
        } else if (currentDate > expiryDate) {
          return jsonResponse({
            success: true,
            valid: false,
            message: "Passkey này đã hết hạn sử dụng."
          });
        }
      }
    }
    
    return jsonResponse({
      success: true,
      valid: true,
      role: matchedRow.role,
      message: "Xác thực thành công!"
    });
    
  } catch (err) {
    return jsonResponse({
      success: false,
      message: "Lỗi xác thực passkey: " + err.toString()
    });
  }
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
  }
  return sheet;
}

// Khởi tạo passkey mặc định nếu trống
function checkAndInitDefaultPasskeys(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    const now = new Date();
    sheet.appendRow(['SA_ADMIN_2026', 'admin', 'active', 'lifetime', 'Master Admin Passkey mặc định', now]);
    sheet.appendRow(['VIP', 'vip', 'active', 'lifetime', 'VIP Passkey mặc định', now]);
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
function sendTelegram(text) {
  const cfg = getConfig();
  if (!cfg.TELEGRAM_BOT_TOKEN || !cfg.TELEGRAM_CHAT_ID) {
    return;
  }
  const url = "https://api.telegram.org/bot" + cfg.TELEGRAM_BOT_TOKEN + "/sendMessage";
  const payload = {
    chat_id: cfg.TELEGRAM_CHAT_ID,
    text: text,
    disable_web_page_preview: true,
  };
  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}
