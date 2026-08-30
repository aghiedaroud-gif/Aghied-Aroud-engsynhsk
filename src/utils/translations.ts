export type Language = 'ar' | 'ku' | 'en';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.gs': 'الدراسة العامة (GS)',
    'nav.sc': 'عقد الإشراف (SC)',
    'nav.bs': 'دراسة البياني (BS)',
    'nav.co': 'السلامة الإنشائية (CO)',
    'nav.express_q': 'حاسبة Express_q',
    'nav.categories': 'تصنيف المشاريع والتقارير',
    'nav.databases': 'دفتر الأستاذ والسجلات',
    'nav.engineers': 'سجل المهندسين',
    'nav.archive': 'الأرشيف والتوثيق',
    'nav.ai_audit': 'المدقق الذكي Gemini',

    // Header & Telemetry
    'header.title': 'نقابة المهندسين - فرع الجزيرة',
    'header.subtitle': 'قسم الحسابات والشؤون المالية والمصرفية',
    'header.branch_seals': 'أختام الفروع',
    'header.fx_rate': 'سعر الصرف:',
    'header.branch': 'الفرع:',
    'header.role': 'الصلاحية:',
    'header.online': 'متصل // مخزن',
    'header.offline': 'وضع عدم الاتصال',

    // Roles
    'role.accountant': 'محاسب الوحدة (Accountant)',
    'role.archive_officer': 'مسؤول الأرشيف (Archive Officer)',
    'role.branch_auditor': 'مدقق الفرع (Branch Auditor)',
    'role.hub_auditor': 'مدقق مركزي عام (Hub Auditor)',

    // Branches
    'branch.has': 'وحدة الحسكة (HAS)',
    'branch.qam': 'وحدة القامشلي (QAM)',
    'branch.der': 'وحدة ديريك (DER)',

    // Actions & Buttons
    'btn.print': 'طباعة',
    'btn.save': 'حفظ',
    'btn.close': 'إغلاق',
    'btn.issue': 'إصدار المستند',
    'btn.search': 'بحث...',
    'btn.export': 'تصدير',
    'btn.import': 'استيراد',
    'btn.calculate': 'حساب',
    'btn.cancel': 'إلغاء',
    'btn.backup': 'نسخة احتياطية مشفرة',

    // Document Modal & Quadruplicate
    'doc.title': 'معاينة وطباعة المستند الرسمي',
    'doc.single': 'نسخة مفردة واحدة (Single Copy)',
    'doc.4set': 'طقم النسخ الأربع (4-Set Quadruplicate)',
    'doc.copy1': '1. نسخة صاحب العلاقة / المستفيد',
    'doc.copy2': '2. نسخة الدائرة المالية والفرع',
    'doc.copy3': '3. نسخة هيئة الرقابة والتدقيق',
    'doc.copy4': '4. نسخة الأرشيف والسجل العقاري',
    'doc.print_single': 'طباعة المستند الرسمي (Print 1 Copy)',
    'doc.print_4set': 'طباعة طقم النسخ الأربع',

    // Common labels
    'common.client_name': 'اسم صاحب العلاقة',
    'common.total_amount': 'المجموع الكلي',
    'common.currency': 'ل.س',
    'common.status': 'الحالة',
    'common.actions': 'الإجراءات',
    'common.date': 'التاريخ',
    'common.engineer': 'المهندس',
    'common.discipline': 'الاختصاص',
    'common.fees': 'الرسوم والأتعاب',

    // GS & SC Model specific labels
    'model.client_name': 'اسم صاحب العلاقة / المستفيد',
    'model.parcels': 'أرقام العقارات',
    'model.total_area': 'المساحة الإجمالية (م²)',
    'model.built_area': 'المساحة الطابقية (م²)',
    'model.floors': 'عدد الطوابق',
    'model.elevators': 'عدد المصاعد',
    'model.elec_capacity': 'استطاعة المحولة الكهربائية (KVA)',
    'model.reset': 'إعادة تعيين',
    'model.calculate_fees': 'حساب الرسوم والأتعاب',
    'model.issued_invoices': 'المستندات والفواتير المصدرة',
    'model.engineers_matrix': 'مصفوفة اختيار المهندسين (دراسة، تدريب، تدقيق)',
    'model.output_engineers': 'صافي أتعاب المهندسين والمدربين (EPO)',
    'model.output_syndicate': 'صافي إيرادات النقابة (Invoice)',
    'model.output_deposit': 'تأمين النقابة ومساهمة الصندوق (SFD)'
  },
  ku: {
    // Navigation
    'nav.gs': 'Lêkolîna Giştî (GS)',
    'nav.sc': 'Peymana Çavdêriyê (SC)',
    'nav.bs': 'Lêkolîna Diyarî (BS)',
    'nav.co': 'Ewlehiya Avakirinê (CO)',
    'nav.express_q': 'Hesabkerê Express_q',
    'nav.categories': 'Polên Projeyan û Raporan',
    'nav.databases': 'Deftera Hesab û Tomaran',
    'nav.engineers': 'Tomara Endezyaran',
    'nav.archive': 'Arşîv û Belgekirin',
    'nav.ai_audit': 'Pشكkêşê Zîrek Gemini',

    // Header & Telemetry
    'header.title': 'Yekîtiya Endezyaran - Lqya Cizîrê',
    'header.subtitle': 'Beşa Hesabkarî û Karên Aborî',
    'header.branch_seals': 'Mohrên Lqan',
    'header.fx_rate': 'Buhayê Serve:',
    'header.branch': 'Lqa:',
    'header.role': 'Erk / Desthilat:',
    'header.online': 'Girêdayî // Hilîstî',
    'header.offline': 'Rewşa Bê Têkiliyê',

    // Roles
    'role.accountant': 'Hesabkarê Yekîneyê (Accountant)',
    'role.archive_officer': 'Berpirsê Arşîvê (Archive Officer)',
    'role.branch_auditor': 'Pشكkêşê Lqê (Branch Auditor)',
    'role.hub_auditor': 'Pشكkêşê Giştî (Hub Auditor)',

    // Branches
    'branch.has': 'Yekîneya Hesekê (HAS)',
    'branch.qam': 'Yekîneya Qamişlo (QAM)',
    'branch.der': 'Yekîneya Dêrikê (DER)',

    // Actions & Buttons
    'btn.print': 'Çapkirin',
    'btn.save': 'Tomarkirin',
    'btn.close': 'Girtin',
    'btn.issue': 'Derxistina Belgeyê',
    'btn.search': 'Lêgerîn...',
    'btn.export': 'Hinardekirin',
    'btn.import': 'Anîna Hundir',
    'btn.calculate': 'Hesabkirin',
    'btn.cancel': 'Betalkirin',
    'btn.backup': 'Kopiya Ewle ya Parastî',

    // Document Modal & Quadruplicate
    'doc.title': 'Pêşdîtin û Çapkirina Belgeya Fermî',
    'doc.single': 'Kopiyek Tenê (Single Copy)',
    'doc.4set': 'Koma 4 Kopiyan (Quadruplicate)',
    'doc.copy1': '1. Kopiya Xwediyê Projeyê',
    'doc.copy2': '2. Kopiya Beşa Aborî',
    'doc.copy3': '3. Kopiya Lijneya Çavdêriyê',
    'doc.copy4': '4. Kopiya Arşîva Navendî',
    'doc.print_single': 'Çapkirina Belgeya Fermî (Print 1 Copy)',
    'doc.print_4set': 'Çapkirina Koma 4 Kopiyan',

    // Common labels
    'common.client_name': 'Navê Xwediyê Projeyê',
    'common.total_amount': 'Buhayê Giştî',
    'common.currency': 'S.P',
    'common.status': 'Rewş',
    'common.actions': 'Cîbicîkirin',
    'common.date': 'Dîrok',
    'common.engineer': 'Endezyar',
    'common.discipline': 'Pisporî',
    'common.fees': 'Baja û Xerc',

    // GS & SC Model specific labels
    'model.client_name': 'Navê Xwediyê Projeyê',
    'model.parcels': 'Hejmarên Emlakê',
    'model.total_area': 'Rوbera Giştî (m²)',
    'model.built_area': 'Rوbera Avakirî (m²)',
    'model.floors': 'Hejmara Qatan',
    'model.elevators': 'Hejmara Asansoran',
    'model.elec_capacity': 'Kapasîteya Veguheztina Elektrîkê (KVA)',
    'model.reset': 'Ji nû ve sazkirin',
    'model.calculate_fees': 'Hesabkirina Xerc û Buhayan',
    'model.issued_invoices': 'Belge û Fatureyên Derketî',
    'model.engineers_matrix': 'Matrîsa Hilbijartina Endezyaran',
    'model.output_engineers': 'Neteya Xercên Endezyaran (EPO)',
    'model.output_syndicate': 'Neteya Dahata Sendîkayê (Invoice)',
    'model.output_deposit': 'Depozîta Temînata Sendîkayê (SFD)'
  },
  en: {
    // Navigation
    'nav.gs': 'General Study (GS)',
    'nav.sc': 'Supervision Contract (SC)',
    'nav.bs': 'Statement Study (BS)',
    'nav.co': 'Structural Safety (CO)',
    'nav.express_q': 'Express_q Calculator',
    'nav.categories': 'Project Categories & Reports',
    'nav.databases': 'General Ledger & Records',
    'nav.engineers': 'Engineers Directory',
    'nav.archive': 'Archive & Documentation',
    'nav.ai_audit': 'Gemini Smart Auditor',

    // Header & Telemetry
    'header.title': 'Engineers Syndicate - Jazira Branch',
    'header.subtitle': 'Financial Accounts & Banking Affairs Department',
    'header.branch_seals': 'Branch Seals',
    'header.fx_rate': 'FX Rate:',
    'header.branch': 'Branch:',
    'header.role': 'Role:',
    'header.online': 'Online // Cached',
    'header.offline': 'Offline Mode',

    // Roles
    'role.accountant': 'Unit Accountant (Accountant)',
    'role.archive_officer': 'Archive Officer (Archive Officer)',
    'role.branch_auditor': 'Branch Auditor (Branch Auditor)',
    'role.hub_auditor': 'Central Hub Auditor (Hub Auditor)',

    // Branches
    'branch.has': 'Hasakah Unit (HAS)',
    'branch.qam': 'Qamishlo Unit (QAM)',
    'branch.der': 'Derik Unit (DER)',

    // Actions & Buttons
    'btn.print': 'Print',
    'btn.save': 'Save',
    'btn.close': 'Close',
    'btn.issue': 'Issue Document',
    'btn.search': 'Search...',
    'btn.export': 'Export',
    'btn.import': 'Import',
    'btn.calculate': 'Calculate',
    'btn.cancel': 'Cancel',
    'btn.backup': 'Encrypted Backup',

    // Document Modal & Quadruplicate
    'doc.title': 'Official Document Preview & Print',
    'doc.single': 'Single Official Copy',
    'doc.4set': 'Quadruplicate (4-Set)',
    'doc.copy1': '1. Client / Beneficiary Copy',
    'doc.copy2': '2. Finance Dept & Treasury Copy',
    'doc.copy3': '3. Central Audit & Control Copy',
    'doc.copy4': '4. Cadastre & Archive Copy',
    'doc.print_single': 'Print Official Document (1 Copy)',
    'doc.print_4set': 'Print 4-Set Quadruplicate',

    // Common labels
    'common.client_name': 'Client Name',
    'common.total_amount': 'Total Amount',
    'common.currency': 'SYP',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.date': 'Date',
    'common.engineer': 'Engineer',
    'common.discipline': 'Discipline',
    'common.fees': 'Fees & Dues',
    
    // GS & SC Model specific labels
    'model.client_name': 'Client / Beneficiary Name',
    'model.parcels': 'Real Estate Parcels (أرقام العقارات)',
    'model.total_area': 'Total Area (م²)',
    'model.built_area': 'Built-up Area (م²)',
    'model.floors': 'Number of Floors',
    'model.elevators': 'Elevators Count',
    'model.elec_capacity': 'Electrical Transformer Capacity (KVA)',
    'model.reset': 'Reset Form',
    'model.calculate_fees': 'Calculate Fees & Pipeline',
    'model.issued_invoices': 'Issued Invoices & Documents',
    'model.engineers_matrix': 'Engineering Selection Matrix (Study, Coaching, Audit)',
    'model.output_engineers': 'Net Engineers & Coaches Fees (EPO)',
    'model.output_syndicate': 'Syndicate Net Revenue (Invoice)',
    'model.output_deposit': 'Syndicate Guarantee Deposit (SFD)'
  }
};
