import {
  Complaint,
  ComplaintHistoryEntry,
  PortalContent,
  DevelopmentWork,
  GramSabhaEntry,
  GalleryItem,
  PortalSettings,
  Category,
  Officer,
  AdminAuditLog
} from '../src/types/index.ts';

// Tab 5: Categories
export const initialCategories: Category[] = [
  {
    category_id: 'CAT-01',
    category_name: 'पेयजल एवं जल आपूर्ति',
    description: 'हैंडपंप खराबी, नल-जल योजना पाइपलाइन लीकेज, पेयजल संकट',
    default_department: 'लोक स्वास्थ्य यांत्रिकी विभाग (PHE) / ग्राम पंचायत',
    default_officer_id: 'OFF-02',
    active: true,
    display_order: 1
  },
  {
    category_id: 'CAT-02',
    category_name: 'सड़क एवं निर्माण कार्य',
    description: 'सी.सी. रोड क्षति, खड़ंजा मरम्मत, मुख्य मार्ग गड्ढे',
    default_department: 'ग्रामीण यांत्रिकी सेवा (RES) / ग्राम पंचायत',
    default_officer_id: 'OFF-02',
    active: true,
    display_order: 2
  },
  {
    category_id: 'CAT-03',
    category_name: 'नाली एवं सफाई व्यवस्था',
    description: 'नालियों का अवरोध, कचरा निस्तारण, सार्वजनिक स्वच्छता',
    default_department: 'स्वच्छ भारत मिशन (ग्रामीण) / ग्राम पंचायत',
    default_officer_id: 'OFF-02',
    active: true,
    display_order: 3
  },
  {
    category_id: 'CAT-04',
    category_name: 'स्ट्रीट लाइट एवं विद्युत',
    description: 'सोलर लाइट खराबी, ग्राम विद्युत पोल खराबी, अंधेरा',
    default_department: 'मध्य क्षेत्र विद्युत वितरण / ग्राम पंचायत',
    default_officer_id: 'OFF-02',
    active: true,
    display_order: 4
  },
  {
    category_id: 'CAT-05',
    category_name: 'प्रधानमंत्री आवास योजना (ग्रामीण)',
    description: 'किश्त विलंब, जियो-टैगिंग समस्या, सूची सत्यापन',
    default_department: 'पंचायत एवं ग्रामीण विकास विभाग',
    default_officer_id: 'OFF-02',
    active: true,
    display_order: 5
  },
  {
    category_id: 'CAT-06',
    category_name: 'मनरेगा (MGNREGA)',
    description: 'जॉब कार्ड, काम की माँग, मजदूरी भुगतान विलंब',
    default_department: 'जनपद पंचायत दतिया / ग्राम रोजगार सहायक',
    default_officer_id: 'OFF-03',
    active: true,
    display_order: 6
  },
  {
    category_id: 'CAT-07',
    category_name: 'राशन एवं सार्वजनिक वितरण (PDS)',
    description: 'राशन पर्ची, खाद्यान्न वितरण, उचित मूल्य दुकान समय',
    default_department: 'खाद्य एवं नागरिक आपूर्ति विभाग',
    default_officer_id: 'OFF-04',
    active: true,
    display_order: 7
  },
  {
    category_id: 'CAT-08',
    category_name: 'पेंशन एवं सामाजिक सुरक्षा',
    description: 'वृद्धावस्था, विधवा, दिव्यांग पेंशन, समग्र आईडी त्रुटि',
    default_department: 'सामाजिक न्याय विभाग / ग्राम पंचायत',
    default_officer_id: 'OFF-02',
    active: true,
    display_order: 8
  },
  {
    category_id: 'CAT-09',
    category_name: 'पंचायत भवन एवं सार्वजनिक संपत्ति',
    description: 'सार्वजनिक चबूतरा, सामुदायिक भवन, अतिक्रमण',
    default_department: 'ग्राम पंचायत सैदौरा',
    default_officer_id: 'OFF-01',
    active: true,
    display_order: 9
  },
  {
    category_id: 'CAT-10',
    category_name: 'अन्य समस्या',
    description: 'सामान्य स्थानीय समस्याएँ एवं सुझाव',
    default_department: 'ग्राम पंचायत सैदौरा',
    default_officer_id: 'OFF-01',
    active: true,
    display_order: 10
  }
];

// Tab 6: Officers
export const initialOfficers: Officer[] = [
  {
    officer_id: 'OFF-01',
    officer_name: 'मिराज परिहार',
    designation: 'सरपंच',
    department: 'ग्राम पंचायत सैदौरा',
    public_contact: 'कार्यालय ग्राम पंचायत सैदौरा (सत्यापन लंबित)',
    active: true,
    verification_status: 'सत्यापन लंबित (यूजर इनपुट)',
    last_verified: '2026-10-01'
  },
  {
    officer_id: 'OFF-02',
    officer_name: 'अखिलेश रावत',
    designation: 'पंचायत सचिव',
    department: 'पंचायत एवं ग्रामीण विकास विभाग, म.प्र.',
    public_contact: 'कार्यालय ग्राम पंचायत सैदौरा (सत्यापन लंबित)',
    active: true,
    verification_status: 'सत्यापन लंबित (यूजर इनपुट)',
    last_verified: '2026-10-01'
  },
  {
    officer_id: 'OFF-03',
    officer_name: 'पद रिक्त / सत्यापन आवश्यक',
    designation: 'ग्राम रोजगार सहायक (GRS)',
    department: 'मनरेगा शाखा, जनपद पंचायत दतिया',
    public_contact: 'जानकारी उपलब्ध नहीं',
    active: true,
    verification_status: 'जानकारी उपलब्ध नहीं',
    last_verified: '2026-10-01'
  },
  {
    officer_id: 'OFF-04',
    officer_name: 'उचित मूल्य दुकान प्रभारी',
    designation: 'विक्रेता / राशन वितरण प्रभारी',
    department: 'खाद्य एवं नागरिक आपूर्ति विभाग, दतिया',
    public_contact: 'सैदौरा शासकीय राशन दुकान (सत्यापन लंबित)',
    active: true,
    verification_status: 'सत्यापन लंबित (यूजर इनपुट)',
    last_verified: '2026-10-01'
  }
];

// Tab 7: Complaints
export const initialComplaints: Complaint[] = [
  {
    complaint_id: 'SDGP-2026-000101',
    created_at: '2026-10-02T10:30:00.000Z',
    updated_at: '2026-10-04T15:20:00.000Z',
    citizen_user_id: 'USR-CITIZEN-01',
    citizen_name: 'रामप्रसाद कुशवाहा',
    verified_mobile_reference: '98******10',
    village: 'सैदौरा',
    ward_or_mohalla: 'वार्ड क्रमांक 03 (कुशवाहा मोहल्ला)',
    address: 'प्राथमिक शाला के पास, सैदौरा',
    category: 'पेयजल एवं जल आपूर्ति',
    subject: 'प्राथमिक शाला के निकट सार्वजनिक हैंडपंप में पानी कम आना',
    description: 'वार्ड 3 में स्थित सरकारी हैंडपंप का सिलिंडर खराब हो गया है जिससे बच्चों और ग्रामीणों को पीने के पानी के लिए दूर जाना पड़ रहा है। कृपया नया वाशर डलवाकर मरम्मत कराई जाए।',
    assigned_department: 'लोक स्वास्थ्य यांत्रिकी विभाग (PHE) / ग्राम पंचायत',
    assigned_officer_id: 'OFF-02',
    location: 'प्राथमिक शाला के पास, वार्ड 3, सैदौरा',
    status: 'कार्रवाई प्रगति पर',
    public_remark: 'शिकायत का संज्ञान लेकर PHE मिस्त्री को हैंडपंप की चेन और वॉशर बदलने के निर्देश जारी कर दिए गए हैं। आगामी 48 घंटे में समाधान सुनिश्चित होगा।',
    internal_remark: 'सचिव द्वारा PHE उपयंत्री को सूचित किया गया। मिस्त्री दौरा 06 अक्टूबर को तय।',
    reopened_count: 0
  },
  {
    complaint_id: 'SDGP-2026-000102',
    created_at: '2026-09-24T09:15:00.000Z',
    updated_at: '2026-09-29T11:45:00.000Z',
    citizen_user_id: 'USR-CITIZEN-02',
    citizen_name: 'सुनीता देवी परिहार',
    verified_mobile_reference: '94******85',
    village: 'सैदौरा',
    ward_or_mohalla: 'वार्ड क्रमांक 05 (माता मंदिर मार्ग)',
    address: 'माता मंदिर के समीप, सैदौरा',
    category: 'स्ट्रीट लाइट एवं विद्युत',
    subject: 'माता मंदिर तिराहे की सोलर स्ट्रीट लाइट बंद पड़ी होना',
    description: 'पिछले दो सप्ताह से माता मंदिर तिराहे की सोलर लाइट नहीं जल रही है। शाम के समय श्रद्धालुओं और राहगीरों को आवागमन में परेशानी होती है।',
    assigned_department: 'ग्राम पंचायत सैदौरा',
    assigned_officer_id: 'OFF-01',
    location: 'माता मंदिर तिराहा, सैदौरा',
    status: 'निराकरण दर्ज',
    public_remark: 'तकनीकी दल द्वारा सोलर लाइट की बैटरी और फोटो-सेंसर की मरम्मत कर लाइट को पुनः चालू कर दिया गया है। कार्य पूर्ण।',
    internal_remark: 'वारंटी एजेंसी के टेक्नीशियन ने 29 सितंबर को फॉल्ट ठीक किया। बिल पंचायत रिकॉर्ड में संलग्न।',
    resolved_at: '2026-09-29T11:45:00.000Z',
    citizen_feedback: 'धन्यवाद, लाइट अब रात्रि में नियमित रूप से चालू है।',
    reopened_count: 0
  },
  {
    complaint_id: 'SDGP-2026-000103',
    created_at: '2026-10-06T14:10:00.000Z',
    updated_at: '2026-10-07T10:00:00.000Z',
    citizen_user_id: 'USR-CITIZEN-03',
    citizen_name: 'महेश कुमार रजक',
    verified_mobile_reference: '97******42',
    village: 'सैदौरा',
    ward_or_mohalla: 'वार्ड क्रमांक 02',
    address: 'पंचायत भवन मुख्य गली, सैदौरा',
    category: 'नाली एवं सफाई व्यवस्था',
    subject: 'मुख्य गली की पक्की नाली में कचरा जमा होने से जलभराव',
    description: 'पंचायत भवन के सामने वाली मुख्य नाली में गाद जमा होने के कारण गंदा पानी सड़क पर बह रहा है। स्वच्छता अभियान के तहत सफाई कर्मी भेजा जाए।',
    assigned_department: 'स्वच्छ भारत मिशन (ग्रामीण) / ग्राम पंचायत',
    assigned_officer_id: 'OFF-02',
    location: 'पंचायत भवन के सामने, वार्ड 2, सैदौरा',
    status: 'संबंधित अधिकारी को भेजी गई',
    public_remark: 'सफाई कर्मी को नाली की डीसिल्टिंग और ब्लीचिंग छिड़काव के लिए निर्देशित किया गया है।',
    internal_remark: 'रोस्टर के अनुसार बुधवार को विशेष सफाई कार्य होगा।',
    reopened_count: 0
  }
];

// Tab 8: ComplaintHistory
export const initialComplaintHistory: ComplaintHistoryEntry[] = [
  {
    history_id: 'HIST-001',
    complaint_id: 'SDGP-2026-000101',
    timestamp: '2026-10-02T10:30:00.000Z',
    old_status: 'कोई नहीं',
    new_status: 'प्राप्त हुई',
    action_by: 'नागरिक (रामप्रसाद कुशवाहा)',
    public_comment: 'शिकायत पोर्टल पर सफलतापूर्वक दर्ज की गई।'
  },
  {
    history_id: 'HIST-002',
    complaint_id: 'SDGP-2026-000101',
    timestamp: '2026-10-03T11:00:00.000Z',
    old_status: 'प्राप्त हुई',
    new_status: 'प्रारंभिक जाँच',
    action_by: 'प्रशासक (नोडल ऑपरेटर)',
    public_comment: 'शिकायत का सत्यापन किया गया और संबंधित तकनीकी विभाग को अग्रेषित किया गया।'
  },
  {
    history_id: 'HIST-003',
    complaint_id: 'SDGP-2026-000101',
    timestamp: '2026-10-04T15:20:00.000Z',
    old_status: 'प्रारंभिक जाँच',
    new_status: 'कार्रवाई प्रगति पर',
    action_by: 'पंचायत सचिव (अखिलेश रावत)',
    public_comment: 'PHE मिस्त्री को हैंडपंप की चेन और वॉशर बदलने के निर्देश जारी कर दिए गए हैं।'
  },
  {
    history_id: 'HIST-004',
    complaint_id: 'SDGP-2026-000102',
    timestamp: '2026-09-24T09:15:00.000Z',
    old_status: 'कोई नहीं',
    new_status: 'प्राप्त हुई',
    action_by: 'नागरिक (सुनीता देवी)',
    public_comment: 'शिकायत पोर्टल पर प्राप्त हुई।'
  },
  {
    history_id: 'HIST-005',
    complaint_id: 'SDGP-2026-000102',
    timestamp: '2026-09-29T11:45:00.000Z',
    old_status: 'कार्रवाई प्रगति पर',
    new_status: 'निराकरण दर्ज',
    action_by: 'प्रशासक / सरपंच (मिराज परिहार)',
    public_comment: 'सोलर लाइट की बैटरी और फोटो-सेंसर मरम्मत पूर्ण कर लाइट पुनः चालू की गई।'
  },
  {
    history_id: 'HIST-006',
    complaint_id: 'SDGP-2026-000103',
    timestamp: '2026-10-06T14:10:00.000Z',
    old_status: 'कोई नहीं',
    new_status: 'प्राप्त हुई',
    action_by: 'नागरिक (महेश कुमार)',
    public_comment: 'शिकायत दर्ज की गई।'
  },
  {
    history_id: 'HIST-007',
    complaint_id: 'SDGP-2026-000103',
    timestamp: '2026-10-07T10:00:00.000Z',
    old_status: 'प्राप्त हुई',
    new_status: 'संबंधित अधिकारी को भेजी गई',
    action_by: 'प्रशासक',
    public_comment: 'सफाई कर्मी को नाली सफाई और ब्लीचिंग छिड़काव के निर्देश भेजे गए।'
  }
];

// Tab 1: PortalContent (News, Schemes, Notices)
export const initialPortalContent: PortalContent[] = [
  {
    content_id: 'NEWS-01',
    content_type: 'पंचायत की खबर',
    title: 'सैदौरा ग्राम पंचायत में आगामी रबी सीजन हेतु खाद-बीज उपलब्धता समीक्षा',
    description: 'ग्राम पंचायत सैदौरा के कृषकों के लिए जनपद कृषि विभाग के सहयोग से डीएपी व यूरिया की स्थानीय वितरण व्यवस्था पर विचार-विमर्श किया गया। किसान भाइयों से अनुरोध है कि अपनी खतौनी और आधार कार्ड साथ रखें।',
    category: 'कृषि एवं विकास',
    publish_date: '2026-10-05',
    status: 'सक्रिय',
    display_order: 1,
    published: true,
    source: 'ग्राम पंचायत सूचना पट्ट / किसान मित्र',
    last_updated: '2026-10-05',
    updated_by: 'प्रशासक'
  },
  {
    content_id: 'NEWS-02',
    content_type: 'पंचायत की खबर',
    title: 'स्वच्छता ही सेवा अभियान के तहत सैदौरा में सार्वजनिक स्थलों की विशेष सफाई',
    description: 'गाँव के मुख्य चौक, स्कूल परिसर और माता मंदिर के समीप ग्रामवासियों और स्वच्छाग्रहियों द्वारा जनभागीदारी से सफाई कार्य आयोजित किया गया। प्लास्टिक कचरा संग्रहण पर विशेष ध्यान दिया गया।',
    category: 'स्वच्छता अभियान',
    publish_date: '2026-09-28',
    status: 'सक्रिय',
    display_order: 2,
    published: true,
    source: 'स्वच्छ भारत मिशन ग्रामीण, दतिया',
    last_updated: '2026-09-28',
    updated_by: 'प्रशासक'
  },
  {
    content_id: 'SCH-01',
    content_type: 'सरकारी योजना',
    title: 'मुख्यमंत्री लाड़ली बहना योजना (म.प्र.)',
    description: 'मध्य प्रदेश शासन द्वारा महिलाओं के आर्थिक स्वावलंबन, स्वास्थ्य एवं पोषण स्तर में सुधार हेतु प्रति माह ₹1,250 की प्रत्यक्ष वित्तीय सहायता।',
    category: 'महिला कल्याण एवं सामाजिक सहायता',
    eligibility: '21 से 60 वर्ष आयु वर्ग की विवाहित, विधवा, तलाकशुदा महिलाएँ, परिवार की वार्षिक आय ₹2.5 लाख से कम, समग्र ई-केवाईसी अनिवार्य।',
    required_documents: 'समग्र आईडी, आधार कार्ड, बैंक खाता (आधार लिंक एवं डीबीटी सक्रिय), मोबाइल नंबर।',
    official_link: 'https://cmladlibahna.mp.gov.in/',
    publish_date: '2026-01-01',
    status: 'सक्रिय',
    display_order: 3,
    published: true,
    source: 'महिला एवं बाल विकास विभाग, म.प्र. शासन (सत्यापित आधिकारिक पोर्टल)',
    last_updated: '2026-10-01',
    updated_by: 'प्रशासक'
  },
  {
    content_id: 'SCH-02',
    content_type: 'सरकारी योजना',
    title: 'प्रधानमंत्री आवास योजना - ग्रामीण (PMAY-G)',
    description: 'ग्रामीण क्षेत्रों के बेघर और कच्चे मकान में रहने वाले परिवारों को पक्का मकान निर्माण हेतु ₹1,20,000 की वित्तीय सहायता + शौचालय प्रोत्साहन + 90 दिन की मनरेगा मजदूरी।',
    category: 'आवास योजना',
    eligibility: 'SECC 2011 आवास प्लस सर्वे में सूचीबद्ध पात्र परिवार, जिनके पास पक्का मकान नहीं है।',
    required_documents: 'आधार कार्ड, बैंक पासबुक, जॉब कार्ड संख्या, जमीन का प्रमाण/सहमति पत्र।',
    official_link: 'https://pmayg.nic.in/',
    publish_date: '2026-01-01',
    status: 'सक्रिय',
    display_order: 4,
    published: true,
    source: 'ग्रामीण विकास मंत्रालय, भारत सरकार (सत्यापित)',
    last_updated: '2026-10-01',
    updated_by: 'प्रशासक'
  },
  {
    content_id: 'SCH-03',
    content_type: 'सरकारी योजना',
    title: 'समग्र सामाजिक सुरक्षा पेंशन योजना (म.प्र.)',
    description: 'वृद्धावस्था (60 वर्ष से अधिक), कल्याणी (विधवा) एवं दिव्यांग नागरिकों के लिए प्रतिमाह आर्थिक सहायता।',
    category: 'सामाजिक सुरक्षा',
    eligibility: 'बीपीएल परिवार अथवा शासन द्वारा निर्धारित पात्रता श्रेणी के वरिष्ठ नागरिक, दिव्यांग एवं निराश्रित महिलाएँ।',
    required_documents: 'समग्र आईडी, आयु प्रमाण पत्र, आधार कार्ड, दिव्यांगता प्रमाण पत्र (यदि लागू हो), बैंक पासबुक।',
    official_link: 'https://socialsecurity.mp.gov.in/',
    publish_date: '2026-01-01',
    status: 'सक्रिय',
    display_order: 5,
    published: true,
    source: 'सामाजिक न्याय एवं दिव्यांगजन सशक्तिकरण विभाग, म.प्र.',
    last_updated: '2026-10-01',
    updated_by: 'प्रशासक'
  }
];

// Tab 2: DevelopmentWorks (Dedicated tab)
export const initialDevelopmentWorks: DevelopmentWork[] = [
  {
    work_id: 'WRK-01',
    work_name: 'सी.सी. सड़क एवं ढकी हुई नाली निर्माण (वार्ड क्र. 4)',
    location: 'वार्ड क्रमांक 04, सैदौरा',
    description: 'वार्ड 4 के मुख्य आवासीय मार्ग पर 250 मीटर लंबाई में कंक्रीट सड़क एवं दोनों ओर पक्की नाली का निर्माण कार्य। बरसात में जलभराव से मुक्ति हेतु।',
    scheme_source: '15वाँ वित्त आयोग (अनुदान)',
    budget_allocated: '₹ 4,85,000 (स्वीकृत/सत्यापन लंबित)',
    budget_spent: '₹ 2,10,000 (प्रगतिरत मूल्यांकन)',
    start_date: '2026-08-15',
    target_end_date: '2026-11-15',
    current_status: 'प्रगतिरत',
    source_of_data: '15वाँ वित्त आयोग कार्य अभिलेख',
    last_updated: '2026-10-03',
    published: true,
    display_order: 1
  },
  {
    work_id: 'WRK-02',
    work_name: 'अमृत सरोवर तालाब गहरीकरण एवं सुरक्षा दीवार (चतुर्थ चरण)',
    location: 'गाँव की पूर्वी सीमा, सैदौरा',
    description: 'गाँव के पुराने तालाब के जल संचयन क्षमता विस्तार हेतु गहरीकरण, इनलेट-आउटलेट चैनल सुदृढ़ीकरण एवं पौधारोपण।',
    scheme_source: 'मनरेगा एवं जल शक्ति अभियान',
    budget_allocated: 'सत्यापन लंबित (आधिकारिक डेटा अपेक्षित)',
    budget_spent: 'सत्यापन लंबित',
    start_date: '2026-07-01',
    target_end_date: '2026-12-30',
    current_status: 'प्रगतिरत',
    source_of_data: 'मनरेगा वार्षिक कार्ययोजना',
    last_updated: '2026-09-30',
    published: true,
    display_order: 2
  },
  {
    work_id: 'WRK-03',
    work_name: 'नवीन सोलर स्ट्रीट लाइट संयंत्र स्थापना (15 पोल)',
    location: 'समस्त मुख्य चौराहे, सैदौरा',
    description: 'गाँव के मुख्य चौराहों, प्राथमिक शाला और मंदिर तिराहों पर 15 अत्याधुनिक सोलर एलईडी स्ट्रीट लाइटें स्थापित की गईं। स्वचालित ऑन/ऑफ सुविधा।',
    scheme_source: 'राज्य वित्त आयोग',
    budget_allocated: '₹ 2,40,000 (सत्यापन लंबित)',
    budget_spent: '₹ 2,40,000',
    start_date: '2026-05-10',
    target_end_date: '2026-06-25',
    current_status: 'पूर्ण',
    source_of_data: 'ग्राम पंचायत भौतिक सत्यापन पंजी',
    last_updated: '2026-07-05',
    published: true,
    display_order: 3
  }
];

// Tab 3: GramSabha (Dedicated tab)
export const initialGramSabha: GramSabhaEntry[] = [
  {
    meeting_id: 'GS-01',
    meeting_type: 'आगामी ग्राम सभा सूचना',
    meeting_date: '2026-10-20',
    meeting_time: 'सुबह 11:00 बजे',
    venue: 'पंचायत भवन प्रांगण, सैदौरा',
    agenda: 'वित्तीय वर्ष कार्ययोजना अनुमोदन, पेयजल व्यवस्था एवं मनरेगा सामाजिक अंकेक्षण',
    description: 'ग्राम पंचायत सैदौरा के समस्त मतदाताओं और नागरिकों को सूचित किया जाता है कि गाँव के विकास कार्यों के चयन और सामाजिक अंकेक्षण हेतु विशेष ग्राम सभा आयोजित की जाएगी। सभी नागरिक अपनी उपस्थिति सुनिश्चित करें।',
    status: 'निर्धारित',
    source: 'कार्यालय ग्राम पंचायत सैदौरा (सूचना पट्ट)',
    last_updated: '2026-10-05',
    published: true,
    display_order: 1
  },
  {
    meeting_id: 'GS-02',
    meeting_type: 'विगत बैठक कार्यवाही एवं निर्णय',
    meeting_date: '2026-08-15',
    venue: 'पंचायत भवन, सैदौरा',
    agenda: 'पेयजल सुरक्षा, स्वच्छता एवं वृक्षारोपण',
    description: 'विगत स्वतंत्रता दिवस ग्राम सभा में सर्वसम्मति से निर्णय लिया गया कि पुराने कुओं की सफाई कराई जाएगी, हर घर नल-जल योजना के नल कनेक्शनों की सुरक्षा सुनिश्चित की जाएगी एवं खुले में कचरा फेंकने पर प्रतिबंध रहेगा।',
    resolution_summary: 'प्रस्ताव क्रमांक 04/2026 सर्वसम्मति से पारित। जल संरक्षण समिति का पुनर्गठन।',
    status: 'सम्पन्न',
    source: 'ग्राम सभा कार्यवाही पंजी, पृष्ठ संख्या 48',
    last_updated: '2026-08-20',
    published: true,
    display_order: 2
  }
];

// Tab 4: Gallery (Dedicated tab with Google Drive support)
export const initialGallery: GalleryItem[] = [
  {
    image_id: 'GAL-01',
    title: 'ग्राम पंचायत सैदौरा - परिदृश्य एवं पंचायत भवन',
    description: 'स्वच्छ ग्राम सैदौरा, पक्की सड़कें एवं हरित परिवेश की झलक।',
    image_url: '/src/assets/images/saidoura_panchayat_hero_1791525758362.jpg',
    category: 'गाँव का परिदृश्य',
    upload_date: '2026-10-08',
    published: true,
    display_order: 1,
    source: 'सामुदायिक योगदान'
  },
  {
    image_id: 'GAL-02',
    title: 'हर घर नल से जल एवं सोलर प्रकाश व्यवस्था',
    description: 'शुद्ध पेयजल स्टैंड एवं ऊर्जा बचत हेतु स्थापित सौर ऊर्जा लाइट।',
    image_url: '/src/assets/images/panchayat_development_solar_1791525770209.jpg',
    category: 'विकास कार्य',
    upload_date: '2026-10-08',
    published: true,
    display_order: 2,
    source: 'विकास कार्य अभिलेख'
  },
  {
    image_id: 'GAL-03',
    title: 'ग्राम सभा चौपाल चर्चा',
    description: 'ग्रामीणों एवं जन-प्रतिनिधियों द्वारा विकास पर खुली परिचर्चा।',
    image_url: '/src/assets/images/gram_sabha_meeting_1791525784982.jpg',
    category: 'सामुदायिक सहभागिता',
    upload_date: '2026-10-08',
    published: true,
    display_order: 3,
    source: 'सामुदायिक अभिलेख'
  }
];

// Tab 9: Settings
export const initialSettings: PortalSettings = {
  portal_title_hi: 'सैदौरा जन-सेवा पोर्टल',
  portal_title_en: 'Saidoura Jan-Seva Portal',
  tagline_hi: 'हमारा गाँव, हमारी भागीदारी, हमारा विकास।',
  tagline_en: 'Our Village, Our Participation, Our Development.',
  panchayat_name: 'सैदौरा',
  block_janpad: 'दतिया',
  district: 'दतिया',
  state: 'मध्य प्रदेश',
  marquee_notice: 'विशेष ग्राम सभा बैठक: 20 अक्टूबर 2026, प्रातः 11:00 बजे पंचायत भवन सैदौरा में। समस्त ग्रामवासी सादर आमंत्रित हैं।',
  cm_helpline: '181',
  emergency_helpline: '112',
  panchayat_contact: 'कार्यालय ग्राम पंचायत सैदौरा, जनपद पंचायत दतिया (म.प्र.)'
};

export const initialAuditLogs: AdminAuditLog[] = [
  {
    audit_id: 'AUD-001',
    timestamp: '2026-10-08T08:00:00.000Z',
    actor_id: 'SYSTEM_BOOT',
    action_type: 'PORTAL_INITIALIZE',
    record_type: 'SYSTEM',
    record_id: 'SAIDOURA_PORTAL',
    change_summary: 'सैदौरा जन-सेवा पोर्टल का 9-टैब डेटाबेस सुरक्षित रूप से लोड किया गया।'
  },
  {
    audit_id: 'AUD-002',
    timestamp: '2026-10-08T09:15:00.000Z',
    actor_id: 'ADMIN_01',
    action_type: 'CATEGORY_VERIFY',
    record_type: 'CATEGORIES',
    record_id: 'ALL',
    change_summary: '10 आधिकारिक जन-शिकायत श्रेणियों की मैपिंग सत्यापित की गई।'
  }
];
