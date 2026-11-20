/* =======================================================
 * Enhancements: i18n (UZ/RU/EN)
 * Self-contained, no dependencies. Loaded at end of <body>,
 * after creative.js / vcard.js.
 * ======================================================= */
(function () {
  "use strict";

  /* ===================================================
   * 1) i18n — UZ / RU / EN (full content)
   *
   *  - Keyed layer: elements carrying [data-i18n] (hero, nav,
   *    section titles, about role/lead) — translated by key,
   *    because other scripts (blur-in, scramble) touch them.
   *  - Walker layer: every other static text node, keyed by its
   *    normalized English text via DICT. English is the baseline
   *    captured from the DOM; only UZ + RU are declared.
   * =================================================== */
  (function i18n() {
    var KEY = "site-lang";

    /* ---- Keyed translations (elements with data-i18n) ---- */
    var HTML_KEYS = { hero_sub: true }; // these set innerHTML (keep inline <span>)
    var keyed = {
      uz: {
        nav_home: "Bosh sahifa", nav_about: "Men haqimda", nav_resume: "Rezyume",
        nav_certs: "Sertifikatlar", nav_contact: "Aloqa",
        hero_sub: "Men Toshkentlik <span>IT loyiha menejeri</span>man",
        about_h: "Men haqimda", about_p: "Men haqimda batafsil",
        about_role: "IT loyiha menejeri & Java backend dasturchi",
        about_lead: "Men aviatsiya sohasidagi IT loyiha menejeriman va zamonaviy yechimlarni joriy etaman. Hozirda Toshkent xalqaro aeroportida Awery Aero dasturini joriy etish ustida ishlayapman. Avval O'zbekistondagi Majburiy ijro byurosi (MIB) monitoring va hisobga olish bo'limida mutaxassis bo'lib ishlaganman.",
        about_lead2: "Men aviatsiya sohasidagi IT loyiha menejeriman. Hozirda Toshkent xalqaro aeroportida raqamlashtirish loyihalarini boshqaraman — biometrik darvozalar, aqlli bagaj tizimlari, SITA va Amadeus integratsiyasi. Avval Uzbekistan Airports Cargo'da Awery ERP tizimini joriy etganman, undan oldin esa Majburiy ijro byurosida (MIB) monitoring va hisobga olish bo'limida ishlaganman.",
        skills_h: "Ko'nikmalar", radar_h: "Asosiy kompetensiyalar", radar2_h: "Boshqaruv kompetensiyalari",
        interests_h: "QIZIQISHLAR va HOBBI",
        resume_h: "Rezyume", resume_p: "Rezyumemni ko'ring",
        certs_h: "Sertifikatlar", certs_p: "Sertifikatlarim va yutuqlarim",
        contact_h: "Aloqa", contact_p: "Men bilan bog'laning"
      },
      ru: {
        nav_home: "Главная", nav_about: "Обо мне", nav_resume: "Резюме",
        nav_certs: "Сертификаты", nav_contact: "Контакты",
        hero_sub: "Я <span>IT проектный менеджер</span> из Ташкента",
        about_h: "Обо мне", about_p: "Узнайте больше обо мне",
        about_role: "IT проектный менеджер & Java backend разработчик",
        about_lead: "Я IT проектный менеджер в авиационной отрасли, внедряю современные решения. В настоящее время работаю над внедрением ПО Awery Aero в Ташкентском международном аэропорту. Ранее работал специалистом в отделе мониторинга и учёта Бюро принудительного исполнения (БПИ) Узбекистана.",
        about_lead2: "Я IT проектный менеджер в авиационной отрасли. Сейчас руковожу проектами цифровизации в Ташкентском международном аэропорту — биометрические ворота, умные системы багажа, интеграция SITA и Amadeus. Ранее внедрил Awery ERP в Uzbekistan Airports Cargo, а до этого работал в отделе мониторинга и учёта Бюро принудительного исполнения (БПИ).",
        skills_h: "Навыки", radar_h: "Ключевые компетенции", radar2_h: "Управленческие компетенции",
        interests_h: "ИНТЕРЕСЫ и ХОББИ",
        resume_h: "Резюме", resume_p: "Моё резюме",
        certs_h: "Сертификаты", certs_p: "Мои сертификаты и достижения",
        contact_h: "Контакты", contact_p: "Связаться со мной"
      }
    };

    var keyedNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
    var keyedEn = {};
    keyedNodes.forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (k in keyedEn) return;
      keyedEn[k] = HTML_KEYS[k] ? el.innerHTML.trim() : (el.textContent || "").replace(/\s+/g, " ").trim();
    });

    /* ---- DICT: normalized English -> { uz, ru } for the walker ---- */
    var DICT = {
      // About — labels & values
      "Birthday:": { uz: "Tug'ilgan kun:", ru: "Дата рождения:" },
      "28 January 1997": { uz: "28-yanvar 1997", ru: "28 января 1997" },
      "Website:": { uz: "Veb-sayt:", ru: "Веб-сайт:" },
      "Phone:": { uz: "Telefon:", ru: "Телефон:" },
      "City:": { uz: "Shahar:", ru: "Город:" },
      "Tashkent, Uzbekistan": { uz: "Toshkent, O'zbekiston", ru: "Ташкент, Узбекистан" },
      "Marital status:": { uz: "Oilaviy holati:", ru: "Семейное положение:" },
      "Single": { uz: "Bo'ydoq", ru: "Холост" },
      "Degree:": { uz: "Daraja:", ru: "Степень:" },
      "Bachelor": { uz: "Bakalavr", ru: "Бакалавр" },
      "Email:": { uz: "Email:", ru: "Эл. почта:" },
      "Freelance:": { uz: "Frilans:", ru: "Фриланс:" },
      "Available": { uz: "Mavjud", ru: "Доступен" },
      "Languages:": { uz: "Tillar:", ru: "Языки:" },
      "Uzbek, English, Russian": { uz: "O'zbek, ingliz, rus", ru: "Узбекский, английский, русский" },
      "My passion for the guitar since childhood has made me a devoted fan of rock music. I have a deep passion for hiking and football, as they energize me and brighten my mood.": {
        uz: "Bolaligimdan gitaraga bo'lgan ishtiyoqim meni rok musiqasining sodiq muxlisiga aylantirgan. Men piyoda sayohat va futbolni juda yaxshi ko'raman, chunki ular menga kuch bag'ishlaydi va kayfiyatimni ko'taradi.",
        ru: "Моя страсть к гитаре с детства сделала меня преданным поклонником рок-музыки. Я очень люблю пеший туризм и футбол, ведь они заряжают меня энергией и поднимают настроение."
      },

      // Interests
      "Football": { uz: "Futbol", ru: "Футбол" },
      "Reading (Self-help books)": { uz: "Kitob o'qish (shaxsiy rivojlanish)", ru: "Чтение (книги по саморазвитию)" },
      "Economic and Political research": { uz: "Iqtisodiy va siyosiy tadqiqotlar", ru: "Экономические и политические исследования" },
      "Graphic and Montion design": { uz: "Grafik va motion dizayn", ru: "Графический и моушн-дизайн" },
      "Artificial Intelligence": { uz: "Sun'iy intellekt", ru: "Искусственный интеллект" },
      "Hiking": { uz: "Piyoda sayohat", ru: "Пеший туризм" },
      "Historical research and reading": { uz: "Tarixiy tadqiqot va mutolaa", ru: "Исторические исследования и чтение" },
      "Singing": { uz: "Qo'shiq aytish", ru: "Пение" },
      "Playing an instrument (guitar, piano)": { uz: "Cholg'u chalish (gitara, pianino)", ru: "Игра на инструментах (гитара, фортепиано)" },
      "Outdoor Activities": { uz: "Ochiq havodagi mashg'ulotlar", ru: "Активный отдых на природе" },

      // Resume — headings & items
      "Education": { uz: "Ta'lim", ru: "Образование" },
      "Java Backend Developer": { uz: "Java Backend dasturchi", ru: "Java Backend разработчик" },
      "PDP ACADEMY, Tashkent": { uz: "PDP ACADEMY, Toshkent", ru: "PDP ACADEMY, Ташкент" },
      "Bachelor of Technology & Technolog, Engineer, Service Technician": {
        uz: "Texnologiya bakalavri, muhandis, servis texnigi",
        ru: "Бакалавр технологий, инженер, сервисный техник"
      },
      "Tashkent State Technical University named after Islam Karimov, Tashkent": {
        uz: "Islom Karimov nomidagi Toshkent davlat texnika universiteti, Toshkent",
        ru: "Ташкентский государственный технический университет имени Ислама Каримова, Ташкент"
      },
      "Professional Experience": { uz: "Professional tajriba", ru: "Профессиональный опыт" },
      "IT Project Manager": { uz: "IT loyiha menejeri", ru: "IT проектный менеджер" },
      "2025.12 - Present": { uz: "2025.12 - hozirgacha", ru: "2025.12 - настоящее время" },
      "Tashkent International Airport, Tashkent, Uzbekistan": {
        uz: "Toshkent xalqaro aeroporti, Toshkent, O'zbekiston",
        ru: "Ташкентский международный аэропорт, Ташкент, Узбекистан"
      },
      "Project Planning and Strategic Lifecycle Management": {
        uz: "Loyihani rejalashtirish va strategik hayot-tsiklni boshqarish",
        ru: "Планирование проектов и управление стратегическим жизненным циклом"
      },
      "Leading digitalization projects from conception to completion (e.g., implementing Biometric Gates, Smart Baggage Systems, or Airport Collaborative Decision Making).": {
        uz: "Raqamlashtirish loyihalarini g'oyadan to yakuniga qadar boshqarish (masalan, Biometrik darvozalar, Aqlli bagaj tizimlari yoki Airport Collaborative Decision Making joriy etish).",
        ru: "Руководство проектами цифровизации от идеи до завершения (например, внедрение биометрических ворот, умных систем багажа или Airport Collaborative Decision Making)."
      },
      "Defining project scopes, managing budgets, setting milestones, and ensuring strict adherence to deadlines.": {
        uz: "Loyiha doirasini belgilash, byudjetlarni boshqarish, bosqichlarni rejalashtirish va muddatlarga qat'iy rioya qilinishini ta'minlash.",
        ru: "Определение объёма проектов, управление бюджетами, постановка контрольных точек и обеспечение строгого соблюдения сроков."
      },
      "Systems Integration and Global Standards": {
        uz: "Tizimlar integratsiyasi va global standartlar",
        ru: "Интеграция систем и глобальные стандарты"
      },
      "Integrating international aviation platforms (such as SITA or Amadeus) with the airports internal management systems.": {
        uz: "Xalqaro aviatsiya platformalarini (masalan, SITA yoki Amadeus) aeroportning ichki boshqaruv tizimlari bilan integratsiya qilish.",
        ru: "Интеграция международных авиационных платформ (таких как SITA или Amadeus) с внутренними системами управления аэропорта."
      },
      "Ensuring seamless data synchronization across all passenger terminals and ground handling units.": {
        uz: "Barcha yo'lovchi terminallari va yerdagi xizmat ko'rsatish bo'linmalari o'rtasida uzluksiz ma'lumotlar sinxronizatsiyasini ta'minlash.",
        ru: "Обеспечение бесперебойной синхронизации данных между всеми пассажирскими терминалами и наземными службами."
      },
      "Adaptation of the latest technologies to solve business problems.": {
        uz: "Biznes muammolarini hal qilish uchun eng so'nggi texnologiyalarni moslashtirish.",
        ru: "Адаптация новейших технологий для решения бизнес-задач."
      },
      "Integration of cloud solutions, improvement of performance and security.": {
        uz: "Bulutli yechimlarni integratsiya qilish, unumdorlik va xavfsizlikni oshirish.",
        ru: "Интеграция облачных решений, повышение производительности и безопасности."
      },
      "Developing Technical Specifications": {
        uz: "Texnik topshiriqlarni ishlab chiqish",
        ru: "Разработка технических заданий"
      },
      "Drafting comprehensive Technical Requirements for software developers and external vendors.": {
        uz: "Dasturiy ta'minot ishlab chiquvchilari va tashqi yetkazib beruvchilar uchun batafsil texnik talablarni tayyorlash.",
        ru: "Составление подробных технических требований для разработчиков ПО и внешних подрядчиков."
      },
      "Translating operational airport needs (security, logistics, passenger flow) into functional IT solutions, particularly incorporating AI and IoT.": {
        uz: "Aeroportning operatsion ehtiyojlarini (xavfsizlik, logistika, yo'lovchilar oqimi) funksional IT yechimlarga aylantirish, xususan AI va IoT'ni jalb qilish.",
        ru: "Преобразование операционных потребностей аэропорта (безопасность, логистика, пассажиропоток) в функциональные ИТ-решения, в частности с применением ИИ и IoT."
      },
      "Stakeholder and Vendor Management": {
        uz: "Manfaatdor tomonlar va yetkazib beruvchilarni boshqarish",
        ru: "Управление заинтересованными сторонами и подрядчиками"
      },
      "Supervising external IT contractors and internal technical teams to ensure deliverables meet quality standards.": {
        uz: "Tashqi IT pudratchilari va ichki texnik jamoalarni nazorat qilib, natijalar sifat standartlariga mos kelishini ta'minlash.",
        ru: "Контроль внешних ИТ-подрядчиков и внутренних технических команд для соответствия результатов стандартам качества."
      },
      "Serving as the primary bridge between airport administration, airlines, and technical engineering departments.": {
        uz: "Aeroport ma'muriyati, aviakompaniyalar va texnik muhandislik bo'limlari o'rtasida asosiy ko'prik vazifasini bajarish.",
        ru: "Выполнение роли основного связующего звена между администрацией аэропорта, авиакомпаниями и техническими инженерными отделами."
      },
      "Compliance, Security, and Quality Assurance": {
        uz: "Muvofiqlik, xavfsizlik va sifat nazorati",
        ru: "Соответствие требованиям, безопасность и контроль качества"
      },
      "Ensuring all IT projects comply with international aviation regulations (ICAO and IATA) and local cybersecurity laws.": {
        uz: "Barcha IT loyihalari xalqaro aviatsiya qoidalariga (ICAO va IATA) hamda mahalliy kiberxavfsizlik qonunlariga muvofiqligini ta'minlash.",
        ru: "Обеспечение соответствия всех ИТ-проектов международным авиационным нормам (ICAO и IATA) и местным законам о кибербезопасности."
      },
      "Overseeing the protection of sensitive passenger data and the resilience of the airport's critical network infrastructure.": {
        uz: "Yo'lovchilarning maxfiy ma'lumotlari himoyasi va aeroportning kritik tarmoq infratuzilmasi barqarorligini nazorat qilish.",
        ru: "Надзор за защитой конфиденциальных данных пассажиров и устойчивостью критической сетевой инфраструктуры аэропорта."
      },
      "IT specialist & PM": { uz: "IT mutaxassisi va loyiha menejeri", ru: "IT-специалист и проектный менеджер" },
      "Uzbekistan Airports Cargo LLC, Tashkent, Uzbekistan": {
        uz: "Uzbekistan Airports Cargo LLC, Toshkent, O'zbekiston",
        ru: "Uzbekistan Airports Cargo LLC, Ташкент, Узбекистан"
      },
      "Implementation Awery ERP": { uz: "Awery ERP joriy etish", ru: "Внедрение Awery ERP" },
      "Implementation Awery ERP - aviation business management software.": {
        uz: "Awery ERP - aviatsiya biznesini boshqarish dasturini joriy etish.",
        ru: "Внедрение Awery ERP — программы управления авиационным бизнесом."
      },
      "Software Technician specialist": { uz: "Dasturiy ta'minot texnik mutaxassisi", ru: "Специалист по программному обеспечению" },
      "Designing network infrastructure": { uz: "Tarmoq infratuzilmasini loyihalash", ru: "Проектирование сетевой инфраструктуры" },
      "Building and configuring networks for corporate use.": {
        uz: "Korporativ foydalanish uchun tarmoqlarni qurish va sozlash.",
        ru: "Построение и настройка сетей для корпоративного использования."
      },
      "Ensuring security and monitoring network operations": {
        uz: "Xavfsizlikni ta'minlash va tarmoq ishlarini monitoring qilish",
        ru: "Обеспечение безопасности и мониторинг работы сети"
      },
      "Developing backup schemes to prevent data loss": {
        uz: "Ma'lumotlar yo'qolishining oldini olish uchun zaxira nusxa sxemalarini ishlab chiqish",
        ru: "Разработка схем резервного копирования для предотвращения потери данных"
      },
      "Training and technical support": { uz: "O'qitish va texnik yordam", ru: "Обучение и техническая поддержка" },
      "Conducting training for employees and users on working with software.": {
        uz: "Xodimlar va foydalanuvchilar uchun dasturiy ta'minot bilan ishlash bo'yicha treninglar o'tkazish.",
        ru: "Проведение обучения сотрудников и пользователей работе с программным обеспечением."
      },
      "Constant technical support for clients and prompt resolution of their requests.": {
        uz: "Mijozlarga doimiy texnik yordam va ularning so'rovlarini tezkor hal qilish.",
        ru: "Постоянная техническая поддержка клиентов и оперативное решение их запросов."
      },
      "Developing documentation for the effective use of the created software.": {
        uz: "Yaratilgan dasturiy ta'minotdan samarali foydalanish uchun hujjatlar ishlab chiqish.",
        ru: "Разработка документации для эффективного использования созданного ПО."
      },
      "Support and optimization of server systems": {
        uz: "Server tizimlarini qo'llab-quvvatlash va optimallashtirish",
        ru: "Поддержка и оптимизация серверных систем"
      },
      "Diagnostics and troubleshooting of server systems.": {
        uz: "Server tizimlarini diagnostika qilish va nosozliklarni bartaraf etish.",
        ru: "Диагностика и устранение неисправностей серверных систем."
      },
      "Optimization and configuration of systems to increase productivity.": {
        uz: "Unumdorlikni oshirish uchun tizimlarni optimallashtirish va sozlash.",
        ru: "Оптимизация и настройка систем для повышения производительности."
      },
      "Ensuring uninterrupted operation and updating software.": {
        uz: "Uzluksiz ishlashni ta'minlash va dasturiy ta'minotni yangilash.",
        ru: "Обеспечение бесперебойной работы и обновление программного обеспечения."
      },
      "Software Engineer (Online Intern Developer)": {
        uz: "Dasturiy injener (onlayn intern dasturchi)",
        ru: "Инженер-программист (онлайн стажёр-разработчик)"
      },
      "Itransition Group LTD , Decatur, Georgia": {
        uz: "Itransition Group LTD, Dekatur, Jorjiya",
        ru: "Itransition Group LTD, Декейтер, Джорджия (США)"
      },
      "Employee at monitoring and accounting department": {
        uz: "Monitoring va hisobga olish bo'limi xodimi",
        ru: "Сотрудник отдела мониторинга и учёта"
      },
      "BUREAU OF COMPULSORY ENFORCEMENT UNDER THE GENERAL PROSECUTION OF THE REPUBLIC OF UZBEKISTAN (BCE), Tashkent, Uzbekistan": {
        uz: "O'ZBEKISTON RESPUBLIKASI BOSH PROKURATURASI HUZURIDAGI MAJBURIY IJRO BYUROSI (MIB), Toshkent, O'zbekiston",
        ru: "БЮРО ПРИНУДИТЕЛЬНОГО ИСПОЛНЕНИЯ ПРИ ГЕНЕРАЛЬНОЙ ПРОКУРАТУРЕ РЕСПУБЛИКИ УЗБЕКИСТАН (БПИ), Ташкент, Узбекистан"
      },
      "Data Analysis and Oversight: Monitoring the \"MIB-Portal\" and billing systems in real-time to track collected funds and the status of enforcement documents.": {
        uz: "Ma'lumotlarni tahlil qilish va nazorat: yig'ilgan mablag'lar va ijro hujjatlari holatini kuzatish uchun \"MIB-Portal\" va billing tizimlarini real vaqtda monitoring qilish.",
        ru: "Анализ данных и контроль: мониторинг «MIB-Portal» и биллинговых систем в реальном времени для отслеживания собранных средств и статуса исполнительных документов."
      },
      "Compliance Control: Analyzing whether field inspectors are meeting their daily targets and following legal procedures.": {
        uz: "Muvofiqlik nazorati: dala inspektorlari kunlik rejalarini bajarayotgani va qonuniy tartiblarga rioya qilayotganini tahlil qilish.",
        ru: "Контроль соответствия: анализ выполнения полевыми инспекторами дневных норм и соблюдения юридических процедур."
      },
      "Discrepancy Identification: Detecting gaps (losses) between utility consumption and actual payments to pinpoint problematic areas.": {
        uz: "Nomuvofiqliklarni aniqlash: muammoli sohalarni aniqlash uchun kommunal iste'mol va haqiqiy to'lovlar o'rtasidagi farqlarni (yo'qotishlarni) topish.",
        ru: "Выявление расхождений: обнаружение разрывов (потерь) между потреблением коммунальных услуг и фактическими платежами для определения проблемных зон."
      },
      "Reporting: Preparing daily, weekly, and monthly statistical reports for the management.": {
        uz: "Hisobot: rahbariyat uchun kunlik, haftalik va oylik statistik hisobotlarni tayyorlash.",
        ru: "Отчётность: подготовка ежедневных, еженедельных и ежемесячных статистических отчётов для руководства."
      },
      "Performance Evaluation (KPI): Measuring the efficiency of state inspectors tracking how many cases were closed and the volume of funds recovered.": {
        uz: "Samaradorlikni baholash (KPI): davlat inspektorlari samaradorligini o'lchash — qancha ish yopilgani va undirilgan mablag' hajmini kuzatish.",
        ru: "Оценка эффективности (KPI): измерение эффективности государственных инспекторов — отслеживание количества закрытых дел и объёма взысканных средств."
      },
      "Database Management: Reconciling (verifying) data received from utility supply companies with the Bureaus internal database.": {
        uz: "Ma'lumotlar bazasini boshqarish: kommunal ta'minot kompaniyalaridan olingan ma'lumotlarni Byuroning ichki ma'lumotlar bazasi bilan solishtirish (tekshirish).",
        ru: "Управление базой данных: сверка (проверка) данных, полученных от коммунальных компаний, с внутренней базой данных Бюро."
      },
      "State Inspector": { uz: "Davlat inspektori", ru: "Государственный инспектор" },
      "Collected and reduced debts of consumers": {
        uz: "Iste'molchilarning qarzlarini undirgan va kamaytirgan",
        ru: "Взыскивал и сокращал задолженности потребителей"
      },
      "Specialist at inspection department": { uz: "Tekshiruv bo'limi mutaxassisi", ru: "Специалист отдела инспекции" },
      "\"Hududgaz Poytaxt\" GTF, Tashkent, Uzbekistan": {
        uz: "\"Hududgaz Poytaxt\" GTF, Toshkent, O'zbekiston",
        ru: "«Hududgaz Poytaxt» GTF, Ташкент, Узбекистан"
      },
      "Dealt with customers complaints and did researchs on it": {
        uz: "Mijozlarning shikoyatlari bilan ishlagan va ular bo'yicha tadqiqotlar olib borgan",
        ru: "Работал с жалобами клиентов и проводил по ним исследования"
      },
      "Calculated all debts in balance sheets and prepayments.": {
        uz: "Balans hisobotlaridagi barcha qarzlar va oldindan to'lovlarni hisoblagan.",
        ru: "Рассчитывал все задолженности в балансах и предоплаты."
      },

      // Skills datasheet (design R1)
      "Datasheet · Skills": { uz: "Ko'nikmalar pasporti", ru: "Паспорт навыков" },
      "JM · IT PM & Java Backend": { uz: "JM · IT PM va Java Backend", ru: "JM · IT PM и Java Backend" },
      "Stack": { uz: "Texnologiyalar", ru: "Стек" },
      "Backend": { uz: "Backend", ru: "Бэкенд" },
      "Data": { uz: "Ma'lumotlar", ru: "Данные" },
      "Frontend": { uz: "Frontend", ru: "Фронтенд" },
      "Cloud & DevOps": { uz: "Bulut va DevOps", ru: "Облако и DevOps" },
      "API & AI tools": { uz: "API va AI vositalari", ru: "API и ИИ-инструменты" },
      "Project Mgmt": { uz: "Loyiha boshqaruvi", ru: "Управление проектами" },
      "Technical": { uz: "Texnik", ru: "Технические" },
      "Leadership": { uz: "Boshqaruv", ru: "Управленческие" },
      "Programming Proficiency": { uz: "Dasturlash mahorati", ru: "Владение программированием" },
      "System Design": { uz: "Tizim dizayni", ru: "Проектирование систем" },
      "API Integration": { uz: "API integratsiyasi", ru: "Интеграция API" },
      "Database Management": { uz: "Ma'lumotlar bazasini boshqarish", ru: "Управление базами данных" },
      "Debugging Skills": { uz: "Xatolarni tuzatish", ru: "Отладка" },
      "Code Testing": { uz: "Kodni testlash", ru: "Тестирование кода" },
      "Version Control": { uz: "Versiyalarni boshqarish", ru: "Контроль версий" },
      "Basic Security Knowledge": { uz: "Xavfsizlik asoslari", ru: "Основы безопасности" },
      "Prompt Engineering": { uz: "Prompt muhandisligi", ru: "Промпт-инжиниринг" },
      "Stakeholder Communication": { uz: "Manfaatdor tomonlar bilan muloqot", ru: "Коммуникация со стейкхолдерами" },
      "Requirements Analysis": { uz: "Talablar tahlili", ru: "Анализ требований" },
      "Risk Management": { uz: "Risklarni boshqarish", ru: "Управление рисками" },
      "Technical Documentation": { uz: "Texnik hujjatlashtirish", ru: "Техническая документация" },
      "Problem Solving": { uz: "Muammolarni hal qilish", ru: "Решение проблем" },

      // Interests (design Y17)
      "I recharge in the mountains, think in books and history,": {
        uz: "Tog'larda kuch to'playman, kitoblar va tarix bilan fikrlayman,",
        ru: "Я восстанавливаюсь в горах, размышляю над книгами и историей"
      },
      "and unwind with a guitar and a rock playlist.": {
        uz: "va gitara hamda rok qo'shiqlari bilan dam olaman.",
        ru: "и отдыхаю с гитарой под рок-плейлист."
      },
      "Mind": { uz: "Aql", ru: "Разум" },
      "Body": { uz: "Tana", ru: "Тело" },
      "Creative": { uz: "Ijod", ru: "Творчество" },

      // Corrected spellings used by index-fixed.html (old keys above stay for index.html)
      "Graphic and Motion design": { uz: "Grafik va motion dizayn", ru: "Графический и моушн-дизайн" },
      "Bachelor of Technology, Engineer, Service Technician": {
        uz: "Texnologiya bakalavri, muhandis, servis texnigi",
        ru: "Бакалавр технологий, инженер, сервисный техник"
      },
      "Integrating international aviation platforms (such as SITA or Amadeus) with the airport's internal management systems.": {
        uz: "Xalqaro aviatsiya platformalarini (masalan, SITA yoki Amadeus) aeroportning ichki boshqaruv tizimlari bilan integratsiya qilish.",
        ru: "Интеграция международных авиационных платформ (таких как SITA или Amadeus) с внутренними системами управления аэропорта."
      },
      "Implementation of Awery ERP": { uz: "Awery ERP joriy etish", ru: "Внедрение Awery ERP" },
      "Implemented Awery ERP — aviation business management software.": {
        uz: "Awery ERP — aviatsiya biznesini boshqarish dasturini joriy etgan.",
        ru: "Внедрил Awery ERP — программу управления авиационным бизнесом."
      },
      "Software Technician Specialist": { uz: "Dasturiy ta'minot texnik mutaxassisi", ru: "Специалист по программному обеспечению" },
      "Ensuring security and monitoring network operations.": {
        uz: "Xavfsizlikni ta'minlash va tarmoq ishlarini monitoring qilish.",
        ru: "Обеспечение безопасности и мониторинг работы сети."
      },
      "Developing backup schemes to prevent data loss.": {
        uz: "Ma'lumotlar yo'qolishining oldini olish uchun zaxira nusxa sxemalarini ishlab chiqish.",
        ru: "Разработка схем резервного копирования для предотвращения потери данных."
      },
      "Performance Evaluation (KPI): Measuring the efficiency of state inspectors — tracking how many cases were closed and the volume of funds recovered.": {
        uz: "Samaradorlikni baholash (KPI): davlat inspektorlari samaradorligini o'lchash — qancha ish yopilgani va undirilgan mablag' hajmini kuzatish.",
        ru: "Оценка эффективности (KPI): измерение эффективности государственных инспекторов — отслеживание количества закрытых дел и объёма взысканных средств."
      },
      "Database Management: Reconciling (verifying) data received from utility supply companies with the Bureau's internal database.": {
        uz: "Ma'lumotlar bazasini boshqarish: kommunal ta'minot kompaniyalaridan olingan ma'lumotlarni Byuroning ichki ma'lumotlar bazasi bilan solishtirish (tekshirish).",
        ru: "Управление базой данных: сверка (проверка) данных, полученных от коммунальных компаний, с внутренней базой данных Бюро."
      },
      "Collected and reduced consumer debts.": {
        uz: "Iste'molchilarning qarzlarini undirgan va kamaytirgan.",
        ru: "Взыскивал и сокращал задолженности потребителей."
      },
      "Handled customer complaints and researched each case.": {
        uz: "Mijozlarning shikoyatlari bilan ishlagan va har bir holatni o'rgangan.",
        ru: "Работал с жалобами клиентов и изучал каждый случай."
      },

      // Certificates
      "AIRPORT MANAGEMENT": { uz: "AEROPORT BOSHQARUVI", ru: "УПРАВЛЕНИЕ АЭРОПОРТОМ" },
      "Airport Management Course for Young Leaders": {
        uz: "Yosh yetakchilar uchun aeroport boshqaruvi kursi",
        ru: "Курс управления аэропортом для молодых лидеров"
      },
      "Incheon Airport Aviation Academy (South Korea) • 2025": {
        uz: "Incheon Airport Aviation Academy (Janubiy Koreya) • 2025",
        ru: "Incheon Airport Aviation Academy (Южная Корея) • 2025"
      },
      "Certified in Airport Management Course for Young Leaders by Incheon Airport Aviation Academy (December 2025). Focused on modern airport operations and global aviation leadership.": {
        uz: "Incheon Airport Aviation Academy tomonidan \"Yosh yetakchilar uchun aeroport boshqaruvi kursi\" sertifikati (2025-yil dekabr). Zamonaviy aeroport operatsiyalari va global aviatsiya yetakchiligiga qaratilgan.",
        ru: "Сертификат «Курс управления аэропортом для молодых лидеров» от Incheon Airport Aviation Academy (декабрь 2025). Посвящён современным операциям аэропорта и глобальному лидерству в авиации."
      },
      "Java Backend Developer Certificate": {
        uz: "Java Backend dasturchi sertifikati",
        ru: "Сертификат Java Backend разработчика"
      },
      "Professional Java development training covering Spring Framework, Spring Boot, RESTful APIs, database design, and microservices architecture.": {
        uz: "Spring Framework, Spring Boot, RESTful API, ma'lumotlar bazasini loyihalash va mikroservis arxitekturasini qamrab olgan professional Java dasturlash kursi.",
        ru: "Профессиональный курс Java-разработки, охватывающий Spring Framework, Spring Boot, RESTful API, проектирование баз данных и архитектуру микросервисов."
      },
      "SQL (Structured Query Language) Database": {
        uz: "SQL (Structured Query Language) ma'lumotlar bazasi",
        ru: "База данных SQL (Structured Query Language)"
      },
      "SQL Course Certificate by Sololearn (January 2022). Demonstrated theoretical and practical understanding of database management, relational databases, and data querying.": {
        uz: "Sololearn tomonidan SQL kursi sertifikati (2022-yil yanvar). Ma'lumotlar bazasini boshqarish, relyatsion ma'lumotlar bazalari va ma'lumotlarni so'rovlash bo'yicha nazariy va amaliy bilimlarni namoyish etgan.",
        ru: "Сертификат курса SQL от Sololearn (январь 2022). Подтвердил теоретическое и практическое понимание управления базами данных, реляционных баз данных и запросов к данным."
      },
      "Java Object-Oriented Programming (OOP)": {
        uz: "Java obyektga yo'naltirilgan dasturlash (OOP)",
        ru: "Объектно-ориентированное программирование на Java (ООП)"
      },
      "Java Course Certificate by Sololearn (November 2021). Confirmed theoretical and practical understanding of Java programming language and Object-Oriented Programming (OOP) concepts.": {
        uz: "Sololearn tomonidan Java kursi sertifikati (2021-yil noyabr). Java dasturlash tili va obyektga yo'naltirilgan dasturlash (OOP) tushunchalari bo'yicha nazariy va amaliy bilimlarni tasdiqlagan.",
        ru: "Сертификат курса Java от Sololearn (ноябрь 2021). Подтвердил теоретическое и практическое понимание языка Java и концепций объектно-ориентированного программирования (ООП)."
      },
      "PROGRAMMING FOUNDATION": { uz: "DASTURLASH ASOSLARI", ru: "ОСНОВЫ ПРОГРАММИРОВАНИЯ" },
      "Programming Foundations": { uz: "Dasturlash asoslari", ru: "Основы программирования" },
      "Foundation Course Certificate by PDP Academy (August 2021). Confirmed theoretical and practical understanding of programming fundamentals, algorithmic thinking, and core problem-solving methodologies.": {
        uz: "PDP Academy tomonidan asosiy kurs sertifikati (2021-yil avgust). Dasturlash asoslari, algoritmik fikrlash va muammolarni hal qilishning asosiy metodologiyalari bo'yicha nazariy va amaliy bilimlarni tasdiqlagan.",
        ru: "Сертификат базового курса от PDP Academy (август 2021). Подтвердил теоретическое и практическое понимание основ программирования, алгоритмического мышления и ключевых методологий решения задач."
      },

      // Contact
      "My Address": { uz: "Mening manzilim", ru: "Мой адрес" },
      "Shaykhontohur District, Tashkent, Uzbekistan 100027": {
        uz: "Shayxontohur tumani, Toshkent, O'zbekiston 100027",
        ru: "Шайхантахурский район, Ташкент, Узбекистан 100027"
      },
      "Social Profiles": { uz: "Ijtimoiy tarmoqlar", ru: "Социальные сети" },
      "E-mail (WORK)": { uz: "E-mail (ish)", ru: "E-mail (рабочий)" },
      "Phone Number (WORK)": { uz: "Telefon raqam (ish)", ru: "Телефон номер (рабочий)" },
      "Save My Contact": { uz: "Kontaktimni saqlang", ru: "Сохранить мой контакт" },
      "Add me to your phone in one tap — or scan the QR code to save my details instantly.": {
        uz: "Meni bir teginishda telefoningizga qo'shing — yoki ma'lumotlarimni darhol saqlash uchun QR kodni skanerlang.",
        ru: "Добавьте меня в телефон одним касанием — или отсканируйте QR-код, чтобы мгновенно сохранить мои данные."
      },
      "Save Contact (.vcf)": { uz: "Kontaktni saqlash (.vcf)", ru: "Сохранить контакт (.vcf)" },
      "Send me an anonymous message": { uz: "Menga anonim xabar yuboring", ru: "Отправьте мне анонимное сообщение" },
      "No name, no email — your message is 100% anonymous. Say anything 🤫": {
        uz: "Ism yo'q, email yo'q — xabaringiz 100% anonim. Xohlagan narsangizni yozing 🤫",
        ru: "Без имени, без email — ваше сообщение на 100% анонимно. Пишите что угодно 🤫"
      },
      "Type your anonymous message…": { uz: "Anonim xabaringizni yozing…", ru: "Введите ваше анонимное сообщение…" },
      "Telegram or email (optional)": {
        uz: "Telegram yoki email (ixtiyoriy)",
        ru: "Telegram или email (необязательно)"
      },
      "Send anonymously": { uz: "Anonim yuborish", ru: "Отправить анонимно" },
      "Chat with me anonymously on Telegram": {
        uz: "Telegram'da men bilan anonim suhbatlashing",
        ru: "Анонимный чат со мной в Telegram"
      },
      "No username needed — open the bot, write anonymously, and I can reply to you right there.": {
        uz: "Username shart emas — botni oching, anonim yozing, men o'sha yerda javob beraman.",
        ru: "Имя пользователя не нужно — откройте бота, пишите анонимно, и я смогу ответить вам прямо там."
      },
      "Open anonymous chat": { uz: "Anonim chatni ochish", ru: "Открыть анонимный чат" },
      "Share my location": { uz: "Joylashuvimni ulashish", ru: "Поделиться местоположением" },
      "Optional — tap to share your exact location.": {
        uz: "Ixtiyoriy — aniq joylashuvingizni ulashish uchun bosing.",
        ru: "Необязательно — нажмите, чтобы поделиться точным местоположением."
      }
    };

    function norm(s) { return (s || "").replace(/\s+/g, " ").trim(); }

    /* ---- Collect static text nodes for the walker ---- */
    var SKIP_SEL = "#uiControls, #hero-term, #vcardQr, #visitorCount, #messageContainer, [data-i18n], [data-no-i18n]";
    function isSkipped(node) {
      var p = node.parentElement;
      if (!p) return true;
      var tag = p.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "CANVAS" || tag === "SVG") return true;
      if (p.closest(SKIP_SEL)) return true;
      return false;
    }
    var walkNodes = [];
    (function collect() {
      var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      var n;
      while ((n = tw.nextNode())) {
        var raw = n.nodeValue;
        if (!raw || !/\S/.test(raw)) continue;
        if (!/[A-Za-z]/.test(raw)) continue;       // skip pure numbers/symbols/emoji
        if (isSkipped(n)) continue;
        if (!DICT[norm(raw)]) continue;            // only nodes we can translate
        walkNodes.push({ node: n, original: raw });
      }
    })();

    /* ---- Placeholder (attribute) ---- */
    var phInput = document.getElementById("feedbackMessage");
    var phOriginal = phInput ? phInput.getAttribute("placeholder") : null;

    function setLang(lang) {
      var kd = keyed[lang]; // undefined for "en"

      // 1) Keyed elements
      keyedNodes.forEach(function (el) {
        var k = el.getAttribute("data-i18n");
        var val = kd ? kd[k] : keyedEn[k];
        if (val === undefined) val = keyedEn[k];
        if (val === undefined) return;
        if (HTML_KEYS[k]) el.innerHTML = val;
        else el.textContent = val;
        // keep scramble effect (.section-title p) in sync
        if (el.dataset && el.matches && el.matches(".section-title p")) el.dataset.txt = val;
        // keep nav hover label in sync
        var navLink = el.closest ? el.closest("#navbar .nav-link") : null;
        if (navLink) navLink.setAttribute("data-label", val);
      });

      // 2) Walker nodes
      walkNodes.forEach(function (item) {
        var entry = DICT[norm(item.original)];
        if (lang !== "uz" && lang !== "ru") { item.node.nodeValue = item.original; return; }
        var t = entry && entry[lang];
        if (t === undefined) { item.node.nodeValue = item.original; return; }
        var lead = (item.original.match(/^\s*/) || [""])[0];
        var trail = (item.original.match(/\s*$/) || [""])[0];
        item.node.nodeValue = lead + t + trail;
      });

      // 3) Placeholder
      if (phInput) {
        var pe = DICT[norm(phOriginal)];
        phInput.setAttribute("placeholder", (pe && pe[lang]) ? pe[lang] : phOriginal);
      }

      // 4) UI state
      document.documentElement.setAttribute("lang", lang);
      document.querySelectorAll(".lang-btn").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-lang") === lang);
      });
      try { localStorage.setItem(KEY, lang); } catch (e) {}
    }

    var start = null;
    try { start = localStorage.getItem(KEY); } catch (e) {}
    setLang(start === "uz" || start === "ru" ? start : "en");

    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    });
  })();

})();
