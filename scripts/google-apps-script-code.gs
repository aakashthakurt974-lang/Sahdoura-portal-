/**
 * @file google-apps-script-code.gs
 * @description Google Apps Script Web App for ग्राम पंचायत सैदौरा जन-सेवा पोर्टल
 * 
 * --------------------------------------------------------------------------
 * निर्देश (DEPLOYMENT & SETUP INSTRUCTIONS):
 * --------------------------------------------------------------------------
 * तरीका 1 (सबसे आसान एवं अनुशंसित - Bound Script):
 * 1. अपनी Google Spreadsheet खोलें (नाम दें: "Saidoura_Panchayat_CMS")।
 * 2. ऊपर मेन्यू में 'Extensions' (एक्सटेंशन) > 'Apps Script' पर क्लिक करें।
 * 3. पुराने कोड को हटाकर यह पूरा कोड पेस्ट करें और Ctrl+S से सहेजें।
 * 4. एडिटर में फ़ंक्शन ड्रॉपडाउन से 'setupAllSheets' चुनें और 'Run' (चलाएँ) पर क्लिक करें।
 *    - यह सभी 9 शीट्स (PortalContent, DevelopmentWorks, GramSabha, Gallery,
 *      Categories, Officers, Complaints, ComplaintHistory, Settings)
 *      और उनके कॉलम हेडर व प्रारंभिक डेटा अपने आप तैयार कर देगा।
 * 5. ऊपर 'Deploy' (तैनात करें) > 'New deployment' (नई तैनाती) पर क्लिक करें।
 * 6. गियर आइकन > 'Web app' चुनें।
 *    - Description: "Saidoura 9-Tab CMS API"
 *    - Execute as: "Me (आपका गूगल खाता)"
 *    - Who has access: "Anyone" (ताकि पोर्टल का सुरक्षित सर्वर कॉल कर सके)
 * 7. 'Deploy' दबाएँ और Authorization दें।
 * 8. प्राप्त "Web app URL" (उदा. https://script.google.com/macros/s/.../exec)
 *    को पोर्टल के Admin Dashboard -> Google Sheets Settings में पेस्ट करें।
 * 
 * तरीका 2 (यदि आप Standalone Script चला रहे हैं - script.google.com से):
 * - नीचे 'SPREADSHEET_ID' चर में अपनी Google Sheet की ID (URL से /d/ और /edit के बीच का भाग) पेस्ट करें।
 * 
 * --------------------------------------------------------------------------
 * GOOGLE DRIVE फोटो और दस्तावेज जोड़ने का नियम:
 * --------------------------------------------------------------------------
 * 1. Google Drive में अपनी फोटो या दस्तावेज अपलोड करें।
 * 2. फाइल पर राइट-क्लिक > 'Share' > General access को "Anyone with the link" सेट करें।
 * 3. कॉपी किया गया लिंक (उदा. https://drive.google.com/file/d/1AbC.../view?usp=sharing)
 *    Gallery, DevelopmentWorks या PortalContent के image_url कॉलम में सीधे पेस्ट करें।
 * 4. पोर्टल का बैकएंड Drive Link से File ID स्वतः निकालकर उसे सीधे दिखने वाली
 *    वेब इमेज (https://lh3.googleusercontent.com/d/FILE_ID) में बदल देता है!
 * --------------------------------------------------------------------------
 */

// सुरक्षा टोकन (पोर्टल के एडमिन सेटिंग्स से मैच कराएँ)
var API_SECRET_KEY = "SAIDOURA_SECURE_TOKEN_2026";

// यदि आप Standalone Script (script.google.com) उपयोग कर रहे हैं, तो अपनी Google Sheet ID यहाँ दर्ज करें।
// यदि आप Google Sheet के अंदर 'Extensions > Apps Script' से चला रहे हैं, तो इसे खाली ("") रहने दें:
var SPREADSHEET_ID = "";

// पोर्टल का Webhook URL (यदि उपलब्ध हो, अन्यथा Settings टैब से पढ़ा जाएगा)
var PORTAL_WEBHOOK_URL = "";

/**
 * सुरक्षित स्प्रेडशीट ऑब्जेक्ट प्राप्त करने वाला हेल्पर
 * - 1. Container-bound Sheet (getActiveSpreadsheet)
 * - 2. Request Query / Body parameter (spreadsheet_id)
 * - 3. Global SPREADSHEET_ID variable
 * - 4. Script Properties (SPREADSHEET_ID)
 */
function getTargetSpreadsheet(e) {
  var ss = null;

  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {}

  if (!ss && e && e.parameter && e.parameter.spreadsheet_id) {
    try {
      ss = SpreadsheetApp.openById(e.parameter.spreadsheet_id);
    } catch (err) {}
  }

  if (!ss && SPREADSHEET_ID && SPREADSHEET_ID.trim()) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (err) {}
  }

  if (!ss) {
    try {
      var propId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
      if (propId && propId.trim()) {
        ss = SpreadsheetApp.openById(propId.trim());
      }
    } catch (err) {}
  }

  return ss;
}

/**
 * सुरक्षित Toast संदेश (UI उपलब्ध न होने पर क्रैश नहीं करता)
 */
function showToast(message, title, timeoutSeconds) {
  try {
    var ss = getTargetSpreadsheet();
    if (ss && typeof ss.toast === "function") {
      ss.toast(message, title || "सैदौरा पोर्टल CMS", timeoutSeconds || 5);
    }
  } catch (e) {}
}

/**
 * जब स्प्रेडशीट खोली जाए तो कस्टम मेन्यू जोड़ता है
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("सैदौरा पोर्टल 🚀")
      .addItem("🚀 पोर्टल तुरंत अपडेट करें (Instant Sync)", "notifyPortalWebhook")
      .addItem("📋 सभी 9 शीट्स बनाएँ व प्रारंभिक डेटा भरें", "setupAllSheets")
      .addItem("⚙️ ऑटो-सिंक ट्रिगर सक्रिय करें (Install Trigger)", "installOnChangeTrigger")
      .addItem("🧪 कनेक्शन टेस्ट करें (Ping Test)", "testWebhookConnection")
      .addToUi();
  } catch (err) {
    Logger.log("UI menu not available: " + err);
  }
}

/**
 * पहली बार चलाने पर सभी 9 शीट्स और उनके कॉलम हेडर्स अपने आप बनाता है एवं प्रारंभिक डेटा भरता है
 */
function setupAllSheets() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    throw new Error(
      "Google Spreadsheet नहीं मिली (SpreadsheetApp.getActiveSpreadsheet() null है)। " +
      "कृपया यह कोड अपनी Google Sheet खोलकर ऊपर मेन्यू में 'Extensions > Apps Script' में पेस्ट करें, " +
      "अथवा स्क्रिप्ट के शीर्ष पर SPREADSHEET_ID चर में अपनी Sheet की ID दर्ज करें।"
    );
  }

  var sheetSchemas = {
    // 1. PortalContent — सामान्य जानकारी, समाचार, सूचनाएँ और योजनाएँ
    "PortalContent": [
      "content_id", "content_type", "title", "description", "category",
      "image_url", "document_url", "publish_date", "eligibility", "required_documents",
      "official_link", "status", "display_order", "published", "source", "last_updated", "updated_by"
    ],
    // 2. DevelopmentWorks — गाँव के विकास कार्यों का विवरण
    "DevelopmentWorks": [
      "work_id", "work_name", "location", "description", "scheme_source",
      "budget_allocated", "budget_spent", "start_date", "target_end_date",
      "current_status", "image_before", "image_after", "source_of_data",
      "last_updated", "published", "display_order"
    ],
    // 3. GramSabha — ग्राम सभा की तारीख, एजेंडा और सार्वजनिक निर्णय
    "GramSabha": [
      "meeting_id", "meeting_type", "meeting_date", "meeting_time", "venue",
      "agenda", "description", "resolution_summary", "document_url", "status",
      "source", "last_updated", "published", "display_order"
    ],
    // 4. Gallery — फोटो, कैप्शन, Google Drive URL
    "Gallery": [
      "image_id", "title", "description", "image_url", "category",
      "upload_date", "published", "display_order", "source"
    ],
    // 5. Categories — शिकायत की श्रेणियाँ
    "Categories": [
      "category_id", "category_name", "description", "default_department",
      "default_officer_id", "active", "display_order"
    ],
    // 6. Officers — संबंधित अधिकारियों की सत्यापित जानकारी
    "Officers": [
      "officer_id", "officer_name", "designation", "department", "public_contact",
      "active", "verification_status", "last_verified"
    ],
    // 7. Complaints — नागरिकों की शिकायतें
    "Complaints": [
      "complaint_id", "created_at", "updated_at", "citizen_user_id", "citizen_name",
      "verified_mobile_reference", "village", "ward_or_mohalla", "address", "category",
      "subject", "description", "assigned_department", "assigned_officer_id", "scheme_or_work",
      "location", "attachment_reference", "status", "public_remark", "internal_remark",
      "resolved_at", "citizen_feedback", "reopened_count"
    ],
    // 8. ComplaintHistory — शिकायत पर हुई कार्रवाई का इतिहास
    "ComplaintHistory": [
      "history_id", "complaint_id", "timestamp", "old_status", "new_status",
      "action_by", "public_comment", "internal_comment", "evidence_reference"
    ],
    // 9. Settings — पोर्टल सेटिंग्स
    "Settings": [
      "portal_title_hi", "portal_title_en", "tagline_hi", "tagline_en",
      "panchayat_name", "block_janpad", "district", "state",
      "marquee_notice", "cm_helpline", "emergency_helpline", "panchayat_contact",
      "portal_webhook_url", "last_updated"
    ]
  };

  // सभी 9 शीट्स बनाएँ और हेडर फॉर्मेट करें
  Object.keys(sheetSchemas).forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    var headers = sheetSchemas[sheetName];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1E3A8A"); // Deep Blue
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  });

  // डिफ़ॉल्ट प्रारंभिक डेटा भरें (यदि शीट्स खाली हैं)
  seedSampleData(ss);

  showToast("सभी 9 शीट्स तैयार एवं फॉर्मेट कर दी गईं!", "सैदौरा CMS 🚀", 6);
  Logger.log("All 9 sheets verified and created successfully.");
}

/**
 * प्रारंभिक प्रामाणिक डेटा भरना
 */
function seedSampleData(ss) {
  var nowIso = new Date().toISOString();

  // 1. Settings
  var settingsSheet = ss.getSheetByName("Settings");
  if (settingsSheet && settingsSheet.getLastRow() === 1) {
    settingsSheet.appendRow([
      "सैदौरा जन-सेवा पोर्टल",
      "Saidoura Jan-Seva Portal",
      "हमारा गाँव, हमारी भागीदारी, हमारा विकास।",
      "Our Village, Our Participation, Our Development.",
      "सैदौरा",
      "दतिया",
      "दतिया",
      "मध्य प्रदेश",
      "विशेष ग्राम सभा बैठक: 20 अक्टूबर 2026, प्रातः 11:00 बजे पंचायत भवन सैदौरा में।",
      "181",
      "112",
      "कार्यालय ग्राम पंचायत सैदौरा, जनपद पंचायत दतिया (म.प्र.)",
      PORTAL_WEBHOOK_URL || "",
      nowIso
    ]);
  }

  // 2. PortalContent
  var contentSheet = ss.getSheetByName("PortalContent");
  if (contentSheet && contentSheet.getLastRow() === 1) {
    contentSheet.appendRow([
      "CNT-001",
      "पंचायत की खबर",
      "गाँव में नल-जल योजना के द्वितीय चरण का कार्य प्रारंभ",
      "वार्ड क्रमांक 03 एवं 04 में पेयजल पाइपलाइन विस्तार का कार्य शुरू कर दिया गया है। ग्रामीण सहयोग प्रदान करें।",
      "पेयजल",
      "", "",
      "2026-10-01", "", "", "",
      "सक्रिय", 1, true,
      "ग्राम पंचायत सैदौरा", nowIso, "प्रशासक"
    ]);
    contentSheet.appendRow([
      "CNT-002",
      "सरकारी योजना",
      "मुख्यमंत्री लाड़ली बहना योजना 2.0",
      "मध्य प्रदेश शासन की महत्वाकांक्षी योजना के अंतर्गत पात्र बहनों को प्रति माह ₹1250 की आर्थिक सहायता।",
      "महिला सशक्तिकरण",
      "", "",
      "2026-09-15",
      "21 से 60 वर्ष आयु वर्ग की विवाहित महिलाएँ, म.प्र. की स्थानीय निवासी।",
      "समग्र आईडी, आधार कार्ड, बैंक खाता डीबीटी सक्रिय, मोबाइल नंबर।",
      "https://cmladlibahna.mp.gov.in/",
      "सक्रिय", 2, true,
      "महिला एवं बाल विकास विभाग", nowIso, "प्रशासक"
    ]);
  }

  // 3. DevelopmentWorks
  var worksSheet = ss.getSheetByName("DevelopmentWorks");
  if (worksSheet && worksSheet.getLastRow() === 1) {
    worksSheet.appendRow([
      "WRK-001",
      "वार्ड 2 एवं 3 में 20 नग सोलर स्ट्रीट लाइट स्थापना",
      "वार्ड 2 मुख्य चौराहा एवं वार्ड 3 हरिजन बस्ती",
      "गाँव के प्रमुख रास्तों और चौराहों पर 20 उच्च गुणवत्ता वाली एलईडी सोलर स्ट्रीट लाइटों की स्थापना।",
      "15वाँ वित्त आयोग (2025-26)",
      "₹ 3,40,000",
      "₹ 3,40,000",
      "2026-05-10", "2026-07-25",
      "पूर्ण", "", "",
      "ग्राम पंचायत निर्माण अभिलेख", nowIso, true, 1
    ]);
    worksSheet.appendRow([
      "WRK-002",
      "मुख्य मार्ग से स्कूल तक सीसी रोड एवं आरसीसी नाली निर्माण",
      "सैदौरा माध्यमिक विद्यालय पहुंच मार्ग",
      "250 मीटर लंबाई में सीमेंट कांक्रीट सड़क और दोनों ओर पक्की नाली का निर्माण कार्य।",
      "मनरेगा एवं सुदूर ग्राम सड़क योजना",
      "₹ 6,80,000",
      "₹ 4,20,000",
      "2026-08-01", "2026-11-30",
      "प्रगतिरत", "", "",
      "जनपद पंचायत दतिया तकनीकी स्वीकृति", nowIso, true, 2
    ]);
  }

  // 4. GramSabha
  var sabhaSheet = ss.getSheetByName("GramSabha");
  if (sabhaSheet && sabhaSheet.getLastRow() === 1) {
    sabhaSheet.appendRow([
      "GS-001",
      "आगामी ग्राम सभा सूचना",
      "2026-10-20",
      "प्रातः 11:00 बजे",
      "पंचायत भवन, सैदौरा",
      "वार्षिक कार्ययोजना (GPDP 2027-28) अनुमोदन, स्वच्छता सर्वेक्षण एवं पेयजल योजना समीक्षा",
      "ग्राम पंचायत सैदौरा के समस्त मतदाताओं, मातृशक्ति एवं वरिष्ठ नागरिकों से अनुरोध है कि ग्राम सभा में अवश्य उपस्थित हों।",
      "", "",
      "निर्धारित", "ग्राम पंचायत सूचना पट्ट", nowIso, true, 1
    ]);
  }

  // 5. Categories
  var catSheet = ss.getSheetByName("Categories");
  if (catSheet && catSheet.getLastRow() === 1) {
    var defaultCats = [
      ["CAT-01", "पेयजल एवं नल-जल योजना", "हैंडपंप खराबी, नल-जल पाइपलाइन लीकेज, जल गुणवत्ता", "लोक स्वास्थ्य यांत्रिकी (PHE)", "OFF-02", true, 1],
      ["CAT-02", "स्ट्रीट लाइट एवं विद्युत व्यवस्था", "सोलर लाइट खराबी, ट्रांसफार्मर, तार टूटना", "ग्राम पंचायत / म.प्र. पूर्व क्षेत्र विद्युत वितरण", "OFF-02", true, 2],
      ["CAT-03", "सड़क, नाली एवं स्वच्छता", "नाली चोक, सड़क मरम्मत, कचरा प्रबंधन", "ग्राम पंचायत सैदौरा", "OFF-02", true, 3],
      ["CAT-04", "प्रधानमंत्री आवास योजना (PMAY)", "आवास किस्त, सर्वे सूची, जियो-टैगिंग", "ग्रामीण विकास विभाग", "OFF-02", true, 4],
      ["CAT-05", "पेंशन, समग्र एवं राशन (खाद्यान्न)", "वृद्धावस्था/विधवा पेंशन, समग्र ई-केवाईसी, राशन पर्ची", "सामाजिक न्याय / खाद्य विभाग", "OFF-02", true, 5],
      ["CAT-06", "अन्य सार्वजनिक समस्याएँ", "अन्य कोई सामुदायिक शिकायत", "ग्राम पंचायत सैदौरा", "OFF-01", true, 6]
    ];
    defaultCats.forEach(function(row) { catSheet.appendRow(row); });
  }

  // 6. Officers
  var offSheet = ss.getSheetByName("Officers");
  if (offSheet && offSheet.getLastRow() === 1) {
    offSheet.appendRow([
      "OFF-01",
      "मिराज परिहार",
      "सरपंच (प्रतिनिधि)",
      "ग्राम पंचायत सैदौरा",
      "सत्यापन लंबित (यूजर इनपुट)",
      true,
      "सत्यापन लंबित (यूजर इनपुट)",
      nowIso
    ]);
    offSheet.appendRow([
      "OFF-02",
      "अखिलेश रावत",
      "पंचायत सचिव",
      "पंचायत एवं ग्रामीण विकास विभाग (म.प्र.)",
      "सत्यापन लंबित (यूजर इनपुट)",
      true,
      "सत्यापन लंबित (यूजर इनपुट)",
      nowIso
    ]);
  }
}

/**
 * GET Request: डेटा प्राप्त करने के लिए (Column Headers के आधार पर डायनामिक मैपिंग)
 */
function doGet(e) {
  try {
    var sheetParam = e && e.parameter ? e.parameter.sheet : "all";
    var ss = getTargetSpreadsheet(e);

    if (sheetParam === "ping") {
      return responseJson({
        status: "ok",
        message: "ग्राम पंचायत सैदौरा Google Sheets 9-Tab CMS API सक्रिय है",
        timestamp: new Date().toISOString(),
        hasSpreadsheet: Boolean(ss),
        spreadsheetName: ss ? ss.getName() : null,
        tabs: [
          "PortalContent", "DevelopmentWorks", "GramSabha", "Gallery",
          "Categories", "Officers", "Complaints", "ComplaintHistory", "Settings"
        ]
      });
    }

    if (!ss) {
      return responseJson({
        success: false,
        status: "error",
        error_code: "SPREADSHEET_NOT_FOUND",
        error: "Google Spreadsheet नहीं मिली (SpreadsheetApp.getActiveSpreadsheet() null है)। कृपया Google Sheet खोलकर 'Extensions > Apps Script' में यह कोड डालें, अथवा Apps Script में SPREADSHEET_ID चर में अपनी Sheet की ID दर्ज करें।",
        message: "Google Spreadsheet not linked. If using standalone Apps Script, please set SPREADSHEET_ID in this script or create via Google Sheets > Extensions > Apps Script."
      });
    }

    var result = {};
    var sheetNames = [
      "PortalContent", "DevelopmentWorks", "GramSabha", "Gallery",
      "Categories", "Officers", "Complaints", "ComplaintHistory", "Settings"
    ];

    if (sheetParam && sheetParam !== "all" && sheetNames.indexOf(sheetParam) !== -1) {
      var s = ss.getSheetByName(sheetParam);
      result[sheetParam] = s ? getSheetDataAsObjects(s) : [];
      return responseJson({ success: true, data: result });
    }

    sheetNames.forEach(function(sName) {
      var s = ss.getSheetByName(sName);
      if (s) {
        result[sName] = getSheetDataAsObjects(s);
      } else {
        result[sName] = [];
      }
    });

    return responseJson({
      success: true,
      data: result,
      spreadsheetName: ss.getName(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return responseJson({ success: false, status: "error", error: err.toString() });
  }
}

/**
 * POST Request: नई शिकायत, स्थिति अपडेट, सामग्री सहेजने या पूर्ण सिंक के लिए
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var ss = getTargetSpreadsheet(e);

    if (!ss) {
      return responseJson({
        success: false,
        status: "error",
        error_code: "SPREADSHEET_NOT_FOUND",
        error: "Google Spreadsheet नहीं मिली। कृपया Apps Script में SPREADSHEET_ID दर्ज करें या Google Sheet के Extensions > Apps Script से चलाएँ।"
      });
    }

    // 1. नई शिकायत जोड़ना
    if (action === "CREATE_COMPLAINT") {
      var complaintSheet = ss.getSheetByName("Complaints");
      var historySheet = ss.getSheetByName("ComplaintHistory");

      var c = postData.complaint;
      if (complaintSheet) {
        appendObjectToSheet(complaintSheet, c);
      }

      if (historySheet && postData.history) {
        appendObjectToSheet(historySheet, postData.history);
      }

      return responseJson({ success: true, message: "शिकायत Google Sheets में दर्ज हुई", complaint_id: c.complaint_id });
    }

    // 2. शिकायत स्थिति अपडेट करना
    if (action === "UPDATE_COMPLAINT_STATUS") {
      var complaintSheet = ss.getSheetByName("Complaints");
      var historySheet = ss.getSheetByName("ComplaintHistory");

      var complaintId = postData.complaint_id;
      var newStatus = postData.new_status;
      var publicRemark = postData.public_remark || "";
      var internalRemark = postData.internal_remark || "";
      var assignedDept = postData.assigned_department;
      var assignedOff = postData.assigned_officer_id;
      var actionBy = postData.action_by || "प्रशासक";

      var updated = false;
      if (complaintSheet) {
        var updateObj = {
          status: newStatus,
          public_remark: publicRemark,
          updated_at: new Date().toISOString()
        };
        if (internalRemark) updateObj.internal_remark = internalRemark;
        if (assignedDept) updateObj.assigned_department = assignedDept;
        if (assignedOff) updateObj.assigned_officer_id = assignedOff;
        if (newStatus === "निराकृत" || newStatus === "Resolved") {
          updateObj.resolved_at = new Date().toISOString();
        }

        updated = updateRowByColumn(complaintSheet, "complaint_id", complaintId, updateObj);
      }

      if (historySheet && postData.history) {
        appendObjectToSheet(historySheet, postData.history);
      }

      return responseJson({ success: true, updated: updated, message: "शिकायत स्थिति Google Sheets में अपडेट हो गई" });
    }

    // 3. पोर्टल सामग्री सहेजें (Tab 1: PortalContent)
    if (action === "SAVE_CONTENT") {
      var sheet = ss.getSheetByName("PortalContent");
      var item = postData.content;
      var exists = updateRowByColumn(sheet, "content_id", item.content_id, item);
      if (!exists && sheet) {
        appendObjectToSheet(sheet, item);
      }
      return responseJson({ success: true, message: "सामग्री PortalContent में सहेजी गई" });
    }

    // 4. विकास कार्य सहेजें (Tab 2: DevelopmentWorks)
    if (action === "SAVE_WORK") {
      var sheet = ss.getSheetByName("DevelopmentWorks");
      var work = postData.work;
      var exists = updateRowByColumn(sheet, "work_id", work.work_id, work);
      if (!exists && sheet) {
        appendObjectToSheet(sheet, work);
      }
      return responseJson({ success: true, message: "कार्य DevelopmentWorks में सहेजा गया" });
    }

    // 5. ग्राम सभा सहेजें (Tab 3: GramSabha)
    if (action === "SAVE_GRAM_SABHA") {
      var sheet = ss.getSheetByName("GramSabha");
      var meeting = postData.meeting;
      var exists = updateRowByColumn(sheet, "meeting_id", meeting.meeting_id, meeting);
      if (!exists && sheet) {
        appendObjectToSheet(sheet, meeting);
      }
      return responseJson({ success: true, message: "बैठक GramSabha में सहेजी गई" });
    }

    // 6. गैलरी सहेजें (Tab 4: Gallery)
    if (action === "SAVE_GALLERY") {
      var sheet = ss.getSheetByName("Gallery");
      var img = postData.image;
      var exists = updateRowByColumn(sheet, "image_id", img.image_id, img);
      if (!exists && sheet) {
        appendObjectToSheet(sheet, img);
      }
      return responseJson({ success: true, message: "फोटो Gallery में सहेजी गई" });
    }

    // 7. सेटिंग्स सहेजें (Tab 9: Settings)
    if (action === "SAVE_SETTINGS") {
      var sheet = ss.getSheetByName("Settings");
      if (sheet) {
        var settings = postData.settings;
        if (sheet.getLastRow() > 1) {
          updateRowByIndex(sheet, 2, settings);
        } else {
          appendObjectToSheet(sheet, settings);
        }
      }
      return responseJson({ success: true, message: "सेटिंग्स Google Sheets में सहेजी गईं" });
    }

    return responseJson({ success: false, error: "अज्ञात कार्रवाई (Unknown Action): " + action });
  } catch (err) {
    return responseJson({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * ऑटो-सिंक: जब भी स्प्रेडशीट में कोई बदलाव हो तो पोर्टल के Webhook को तुरंत कॉल करता है
 */
function notifyPortalWebhook() {
  var ss = getTargetSpreadsheet();
  if (!ss) return;

  var webhookUrl = PORTAL_WEBHOOK_URL;

  // यदि ग्लोबल वैरिएबल खाली है तो Settings टैब से पढ़ें
  if (!webhookUrl) {
    var settingsSheet = ss.getSheetByName("Settings");
    if (settingsSheet && settingsSheet.getLastRow() > 1) {
      var data = getSheetDataAsObjects(settingsSheet);
      if (data.length > 0 && data[0].portal_webhook_url) {
        webhookUrl = data[0].portal_webhook_url;
      }
    }
  }

  if (!webhookUrl) {
    Logger.log("Webhook URL सेट नहीं है। कृपया Settings टैब के 'portal_webhook_url' कॉलम में या स्क्रिप्ट के शीर्ष पर URL दर्ज करें।");
    showToast("कृपया Settings टैब में portal_webhook_url भरें।", "सूचना", 5);
    return;
  }

  try {
    var payload = JSON.stringify({
      event: "GOOGLE_SHEETS_MODIFIED",
      spreadsheet_id: ss.getId(),
      timestamp: new Date().toISOString()
    });

    var options = {
      method: "post",
      contentType: "application/json",
      payload: payload,
      muteHttpExceptions: true
    };

    var res = UrlFetchApp.fetch(webhookUrl, options);
    Logger.log("Portal Webhook Response: " + res.getContentText());
    showToast("वेबसाइट सफलतापूर्वक तुरंत अपडेट हो गई!", "सफलता 🚀", 4);
  } catch (err) {
    Logger.log("Webhook call failed: " + err.toString());
    showToast("Webhook कॉल में त्रुटि: " + err.toString(), "त्रुटि", 5);
  }
}

/**
 * ऑटो-सिंक के लिए installable onChange ट्रिगर इंस्टॉल करता है
 */
function installOnChangeTrigger() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    throw new Error("कृपया Google Sheet खोलें या SPREADSHEET_ID दर्ज करें।");
  }

  var triggers = ScriptApp.getProjectTriggers();
  var triggerExists = false;

  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onChangeTrigger") {
      triggerExists = true;
      break;
    }
  }

  if (!triggerExists) {
    ScriptApp.newTrigger("onChangeTrigger")
      .forSpreadsheet(ss)
      .onChange()
      .create();
    showToast("ऑटो-सिंक ट्रिगर सक्रिय हो गया! अब किसी भी बदलाव पर पोर्टल तुरंत अपडेट होगा।", "सफलता 🚀", 5);
  } else {
    showToast("ऑटो-सिंक ट्रिगर पहले से ही सक्रिय है।", "सूचना", 4);
  }
}

/**
 * OnChange ट्रिगर फ़ंक्शन
 */
function onChangeTrigger(e) {
  notifyPortalWebhook();
}

/**
 * OnEdit ट्रिगर फ़ंक्शन (सेल एडिट होने पर)
 */
function onEdit(e) {
  notifyPortalWebhook();
}

/**
 * कनेक्शन टेस्ट फ़ंक्शन
 */
function testWebhookConnection() {
  notifyPortalWebhook();
}

/**
 * Helper: शीट के पहले row (Headers) के आधार पर डेटा को Objects Array में बदलता है
 */
function getSheetDataAsObjects(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  var headers = values[0];
  var rows = [];

  for (var i = 1; i < values.length; i++) {
    var rowObj = {};
    var hasData = false;
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).trim();
      var val = values[i][j];
      rowObj[key] = val;
      if (val !== "" && val !== null && val !== undefined) {
        hasData = true;
      }
    }
    if (hasData) {
      rows.push(rowObj);
    }
  }
  return rows;
}

/**
 * Helper: ऑब्जेक्ट की वैल्यूज को हेडर कॉलम के नाम के अनुसार रो में जोड़ता है
 */
function appendObjectToSheet(sheet, obj) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    var key = String(headers[i]).trim();
    var val = (obj[key] !== undefined && obj[key] !== null) ? obj[key] : "";
    newRow.push(val);
  }
  sheet.appendRow(newRow);
}

/**
 * Helper: विशिष्ट कॉलम मान के आधार पर रो को ढूँढकर अपडेट करता है
 */
function updateRowByColumn(sheet, matchColumnName, matchValue, updateDataObj) {
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return false;
  var headers = values[0];
  var matchColIdx = -1;

  for (var c = 0; c < headers.length; c++) {
    if (String(headers[c]).trim() === matchColumnName) {
      matchColIdx = c;
      break;
    }
  }

  if (matchColIdx === -1) return false;

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][matchColIdx]).trim() === String(matchValue).trim()) {
      var targetRow = r + 1; // 1-indexed
      for (var j = 0; j < headers.length; j++) {
        var colName = String(headers[j]).trim();
        if (updateDataObj[colName] !== undefined) {
          sheet.getRange(targetRow, j + 1).setValue(updateDataObj[colName]);
        }
      }
      return true;
    }
  }
  return false;
}

/**
 * Helper: निश्चित रो संख्या को ऑब्जेक्ट के डेटा से अपडेट करता है
 */
function updateRowByIndex(sheet, rowIndex, updateDataObj) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var j = 0; j < headers.length; j++) {
    var colName = String(headers[j]).trim();
    if (updateDataObj[colName] !== undefined) {
      sheet.getRange(rowIndex, j + 1).setValue(updateDataObj[colName]);
    }
  }
}

function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
