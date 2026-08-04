/* ==========================================================================
   Arda Canbakış — portfolio (v2, "yin-yang")
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CONFIGURATION
   -------------------------------------------------------------------------- */

/** WhatsApp number in international format, digits only (no +, no spaces). */
const WHATSAPP_NUMBER = "905469660256";

/**
 * Which prefilled opening message the WhatsApp button uses. Set to "blank" to
 * open an empty chat. Each style is translated, so the message follows
 * whatever language the visitor is browsing in.
 */
const WHATSAPP_STYLE = "quote";

const WHATSAPP_MESSAGES = {
  project: {
    en: "Hi Arda! I saw your portfolio and I'd like to talk about a project.",
    tr: "Merhaba Arda! Portfolyonu gördüm ve bir proje hakkında konuşmak istiyorum.",
    es: "¡Hola Arda! Vi tu portafolio y me gustaría hablar sobre un proyecto.",
  },
  quote: {
    en: "Hi Arda! I'd like to get a quote for a website / web app.",
    tr: "Merhaba Arda! Bir web sitesi / web uygulaması için teklif almak istiyorum.",
    es: "¡Hola Arda! Me gustaría solicitar un presupuesto para un sitio o aplicación web.",
  },
  casual: {
    en: "Hello Arda 👋 Coming from ardacanbakis.com — I have a question.",
    tr: "Merhaba Arda 👋 ardacanbakis.com üzerinden yazıyorum — bir sorum var.",
    es: "¡Hola Arda! 👋 Vengo de ardacanbakis.com — tengo una pregunta.",
  },
  hiring: {
    en: "Hi Arda! I'd like to talk to you about a role / collaboration.",
    tr: "Merhaba Arda! Bir pozisyon / iş birliği hakkında konuşmak istiyorum.",
    es: "¡Hola Arda! Me gustaría hablar contigo sobre un puesto o colaboración.",
  },
};

/**
 * The colour each tone reports to the browser chrome. The palettes themselves
 * live in styles.css — this is only what `theme-color` is set to as the page
 * turns over, so the phone's status bar keeps up.
 */
const TONE_THEME_COLOR = { yin: "#0b0d0e", yang: "#edede9" };

/* --------------------------------------------------------------------------
   2. TRANSLATIONS
   -------------------------------------------------------------------------- */

const translations = {
  en: {
    skipLink: "Skip to content",
    navHome: "Home",
    navCraft: "Craft",
    navProjects: "Projects",
    navAbout: "About",
    navServices: "Services",
    navContact: "Contact",

    greeting: "Hello!",
    heroName: "Arda Canbakış",
    heroFrontend: "Frontend",
    heroBackend: "Backend",
    heroSub:
      "A full-stack developer who builds both halves — the surface people touch and the system underneath it.",
    ctaWork: "See the work",
    ctaTalk: "Start a conversation",
    scrollHint: "Scroll — the light follows",

    dualityTitle: "Two halves of one thing",
    dualityLede:
      "Interfaces are only half the job. What makes them work is everything behind them — and I build both.",
    yinTag: "Yin — the surface",
    yinTitle: "Frontend & Design",
    yinBody:
      "The part people actually touch. Interfaces that respond, animate and stay legible on every screen, built to feel effortless even when the thing underneath is not.",
    yangTag: "Yang — the structure",
    yangTitle: "Backend & Systems",
    yangBody:
      "The part nobody sees and everybody depends on. Data models that stay correct, APIs that hold up, and native code when the browser cannot reach far enough.",

    projectsTitle: "Selected work",
    projectsLede:
      "Nine projects — browser 3D, audio DSP, financial modelling, native desktop tools and client sites.",
    liveDemo: "Live demo",
    sourceCode: "Code",
    codeMacos: "macOS code",
    codeWindows: "Windows code",
    viewStory: "Our story",
    moreOnGithub: "See all repositories on GitHub",

    projGridsmith:
      "A parametric Gridfinity studio that runs entirely in the browser. Design bins, baseplates, drill-bit and screw organizers with a live 3D preview powered by Manifold CSG, then export STL, 3MF or STEP.",
    projMusicviz:
      "An ambient audio-reactive visualiser driven by live microphone input. A custom DSP pipeline — log-spaced bands, spectral-flux onset detection and tempo estimation — feeds WebGL shader modes, with optional Spotify album-art palette extraction.",
    projBudgetsim:
      "A multi-currency household budget app holding TRY, USD, EUR, BTC and gram gold in one ledger, with live FX rates, planned-to-completed payment tracking, loan simulation and a 24-month cashflow projector. Balances are always derived server-side, so every device agrees.",
    projStlsmith:
      "Nine generators that turn text, links and photos into print-ready STL files without any software: QR plates, nameplates, Spotify codes, WiFi cards, barcodes, lithophanes and image silhouettes — all rendered and exported client-side.",
    projDigitalmuseum:
      "A walkable 3D virtual art museum built with React Three Fiber, hung with artworks pulled live from Wikipedia and Wikimedia Commons.",
    projHushbar:
      "A menu-bar microphone mute that flips the actual hardware mute flag, so every app sees it at once. Customisable badge shapes, twelve presets and a global shortcut. Built natively twice — Swift and CoreAudio on macOS, C# on Windows.",
    projWedding:
      "A bilingual wedding platform: unguessable per-guest invitation links with RSVP, a login-protected admin dashboard with WhatsApp templates and headcount tracking, and an animated scroll-through story and timeline site. Static export, with Postgres row-level security doing the enforcing.",
    projVetapp:
      "A comprehensive web application with a React frontend and a Spring Boot backend, providing a complete management solution for any veterinary clinic.",
    projGym:
      "A responsive gym website with features like a BMI calculator, dynamic class schedules, and e-commerce functionality.",

    aboutTitle: "About me",
    aboutBody1:
      "I am a versatile developer proficient in both front-end and back-end technologies. My passion for coding is matched only by my desire to learn and adapt to new challenges. I thrive in dynamic environments and am always ready to tackle complex problems with innovative solutions.",
    aboutBody2:
      "Away from the keyboard I am learning new languages, chasing extreme sports, building things by hand and spending as much time outdoors as I can. The same balance that runs through this page runs through the rest of it.",
    downloadCv: "Download my CV",

    servicesTitle: "What I can build for you",
    servicesLede:
      "Four ways I work with clients — from a first sketch to something running in production.",
    serviceWebTitle: "Web Development",
    webDevelopmentDescription:
      "From concept to deployment, I offer comprehensive web development services to bring your vision to life. Whether you need a simple website or a complex web application, I have the skills and experience to deliver high-quality solutions.",
    serviceUiTitle: "UI/UX Design",
    uiUxDesignDescription:
      "Creating user-friendly and aesthetically pleasing interfaces is my specialty. I focus on crafting designs that provide a seamless user experience, ensuring that your users can navigate your site with ease and enjoy the process.",
    service3dTitle: "3D & Parametric Tools",
    threeDDescription:
      "Browser-based 3D configurators and print-ready model generators — the kind of thing behind gridSmith and stlSmith. Real-time geometry, live preview and STL, 3MF or STEP export, with no software for your customers to install.",
    serviceAppTitle: "App & Desktop Development",
    mobileAppDescription:
      "Responsive mobile experiences and native desktop utilities alike. From progressive web apps to menu-bar tools written in Swift and C#, I build software that feels at home on whatever device it runs on.",

    contactTitle: "Start a conversation",
    contactLede:
      "Have a project in mind, or just want to say hello? Send a message and I'll get back to you.",
    formName: "Your name",
    formEmail: "Email address",
    formSubject: "Subject",
    formMessage: "Message",
    formSend: "Send message",
    errName: "Please enter your name.",
    errEmail: "Please enter a valid email address.",
    errMessage: "Please write a message.",
    formSending: "Sending…",
    formSuccess: "Thanks! Your message is on its way — I'll reply soon.",
    formError: "Something went wrong. Please email me directly instead.",
    formNotConfigured:
      "The form isn't connected yet. Please email dev.ardacanbakis@gmail.com for now.",

    directTitle: "Or reach me directly",
    whatsappRow: "Chat on WhatsApp",
    allLinks: "All my links",
    whatsappTooltip: "Chat on WhatsApp",

    createdWith: "Created with",
    by: "by",
  },

  tr: {
    skipLink: "İçeriğe geç",
    navHome: "Ana Sayfa",
    navCraft: "Yaklaşım",
    navProjects: "Projeler",
    navAbout: "Hakkımda",
    navServices: "Hizmetler",
    navContact: "İletişim",

    greeting: "Merhaba!",
    heroName: "Arda Canbakış",
    heroFrontend: "Frontend",
    heroBackend: "Backend",
    heroSub:
      "Her iki yarıyı da inşa eden bir full-stack geliştirici — insanların dokunduğu yüzeyi ve onun altındaki sistemi.",
    ctaWork: "Projelere göz at",
    ctaTalk: "Bir sohbet başlat",
    scrollHint: "Kaydır — ışık seni takip etsin",

    dualityTitle: "Bir bütünün iki yarısı",
    dualityLede:
      "Arayüzler işin sadece yarısı. Onları çalışır kılan, arkalarındaki her şey — ve ben ikisini de kuruyorum.",
    yinTag: "Yin — yüzey",
    yinTitle: "Frontend ve Tasarım",
    yinBody:
      "İnsanların gerçekten dokunduğu kısım. Her ekranda tepki veren, canlanan ve okunaklı kalan arayüzler; alttaki yapı karmaşık olsa bile zahmetsiz hissettirecek şekilde kurulmuş.",
    yangTag: "Yang — yapı",
    yangTitle: "Backend ve Sistemler",
    yangBody:
      "Kimsenin görmediği ama herkesin bağımlı olduğu kısım. Doğruluğunu koruyan veri modelleri, yük altında ayakta kalan API'ler ve tarayıcının yetmediği yerde native kod.",

    projectsTitle: "Seçilmiş çalışmalar",
    projectsLede:
      "Dokuz proje — tarayıcıda 3B, ses işleme, finansal modelleme, native masaüstü araçları ve müşteri siteleri.",
    liveDemo: "Canlı demo",
    sourceCode: "Kod",
    codeMacos: "macOS kodu",
    codeWindows: "Windows kodu",
    viewStory: "Hikâyemiz",
    moreOnGithub: "Tüm repoları GitHub'da gör",

    projGridsmith:
      "Tamamen tarayıcıda çalışan parametrik bir Gridfinity stüdyosu. Kutular, taban plakaları, matkap ucu ve vida düzenleyicileri tasarlayın; Manifold CSG ile canlı 3B önizleme alın ve STL, 3MF veya STEP olarak dışa aktarın.",
    projMusicviz:
      "Canlı mikrofon girişiyle çalışan, ortam odaklı ses tepkili bir görselleştirici. Özel bir DSP hattı — logaritmik bantlar, spektral akış tabanlı vuruş algılama ve tempo tahmini — WebGL shader modlarını besliyor; isteğe bağlı olarak Spotify albüm kapağından renk paleti çıkarıyor.",
    projBudgetsim:
      "TRY, USD, EUR, BTC ve gram altını tek defterde tutan çok para birimli bir bütçe uygulaması. Canlı kur bilgisi, planlanandan tamamlanana ödeme takibi, kredi simülasyonu ve 24 aylık nakit akışı projeksiyonu sunuyor. Bakiyeler her zaman sunucu tarafında hesaplandığı için tüm cihazlar aynı rakamı gösteriyor.",
    projStlsmith:
      "Metin, bağlantı ve fotoğrafları hiçbir yazılıma ihtiyaç duymadan baskıya hazır STL dosyalarına dönüştüren dokuz üretici: QR plakaları, isimlikler, Spotify kodları, WiFi kartları, barkodlar, litofanlar ve görsel siluetleri — tamamı istemci tarafında işleniyor ve dışa aktarılıyor.",
    projDigitalmuseum:
      "React Three Fiber ile geliştirilen, içinde gezilebilen 3B sanal sanat müzesi. Eserler Wikipedia ve Wikimedia Commons'tan canlı olarak çekiliyor.",
    projHushbar:
      "Donanımın kendi sessize alma bayrağını değiştirdiği için tüm uygulamaların aynı anda gördüğü bir menü çubuğu mikrofon susturucusu. Özelleştirilebilir rozet biçimleri, on iki hazır ayar ve global kısayol. İki kez native olarak geliştirildi — macOS'ta Swift ve CoreAudio, Windows'ta C#.",
    projWedding:
      "İki dilli bir düğün platformu: her davetliye özel, tahmin edilemez davetiye bağlantıları ve RSVP; WhatsApp şablonları ve kişi sayısı takibi olan girişle korumalı yönetim paneli; kaydırmalı animasyonlu hikâye ve zaman tüneli sitesi. Statik export, kuralları Postgres satır düzeyi güvenlik uyguluyor.",
    projVetapp:
      "Bir veteriner kliniği için eksiksiz bir yönetim çözümü sunan, React frontend ve Spring Boot backend'e sahip kapsamlı bir web uygulaması.",
    projGym:
      "BMI hesaplayıcı, dinamik ders programları ve e-ticaret işlevselliği gibi özelliklere sahip responsive bir spor salonu web sitesi.",

    aboutTitle: "Hakkımda",
    aboutBody1:
      "Hem front-end hem de back-end teknolojilerinde yetkin, çok yönlü bir yazılımcıyım. Kodlama tutkum, yeni zorluklara öğrenme ve uyum sağlama arzumla yarışır. Karmaşık sorunlara yenilikçi çözümlerle yaklaşmaya hazırım.",
    aboutBody2:
      "Klavyeden uzaktayken yeni diller öğreniyor, ekstrem sporların peşinden gidiyor, elimle bir şeyler yapıyor ve mümkün olduğunca çok vakti dışarıda geçiriyorum. Bu sayfadaki denge, hayatımın geri kalanında da geçerli.",
    downloadCv: "Özgeçmişimi indir",

    servicesTitle: "Sizin için neler yapabilirim",
    servicesLede:
      "Müşterilerle çalışmamın dört yolu — ilk eskizden yayında çalışan bir ürüne kadar.",
    serviceWebTitle: "Web Geliştirme",
    webDevelopmentDescription:
      "Fikirden dağıtıma kadar, vizyonunuzu hayata geçirmek için kapsamlı web geliştirme hizmetleri sunuyorum. İster basit bir web sitesi ister karmaşık bir web uygulaması olsun, yüksek kaliteli çözümler sunmak için gerekli beceri ve deneyime sahibim.",
    serviceUiTitle: "UI/UX Tasarım",
    uiUxDesignDescription:
      "Kullanıcı dostu ve estetik açıdan hoş arayüzler oluşturmak benim uzmanlık alanım. Kullanıcılarınızın sitenizde kolayca gezinebilmesini ve süreçten keyif almasını sağlayan tasarımlar yaratmaya odaklanıyorum.",
    service3dTitle: "3B ve Parametrik Araçlar",
    threeDDescription:
      "Tarayıcı tabanlı 3B yapılandırıcılar ve baskıya hazır model üreticileri — gridSmith ve stlSmith'in arkasındaki yaklaşımın aynısı. Gerçek zamanlı geometri, canlı önizleme ve STL, 3MF veya STEP çıktısı; müşterilerinizin hiçbir program kurmasına gerek kalmadan.",
    serviceAppTitle: "Uygulama ve Masaüstü Geliştirme",
    mobileAppDescription:
      "Hem responsive mobil deneyimler hem de native masaüstü araçları. Progressive web uygulamalarından Swift ve C# ile yazılmış menü çubuğu araçlarına kadar, çalıştığı her cihazda kendini evinde hisseden yazılımlar geliştiriyorum.",

    contactTitle: "Bir sohbet başlatalım",
    contactLede:
      "Aklınızda bir proje mi var, yoksa sadece merhaba mı demek istiyorsunuz? Mesaj bırakın, en kısa sürede dönüş yapayım.",
    formName: "Adınız",
    formEmail: "E-posta adresiniz",
    formSubject: "Konu",
    formMessage: "Mesajınız",
    formSend: "Mesajı gönder",
    errName: "Lütfen adınızı girin.",
    errEmail: "Lütfen geçerli bir e-posta adresi girin.",
    errMessage: "Lütfen bir mesaj yazın.",
    formSending: "Gönderiliyor…",
    formSuccess: "Teşekkürler! Mesajınız yola çıktı — en kısa sürede döneceğim.",
    formError: "Bir şeyler ters gitti. Lütfen doğrudan e-posta gönderin.",
    formNotConfigured:
      "Form henüz bağlanmadı. Şimdilik dev.ardacanbakis@gmail.com adresine yazabilirsiniz.",

    directTitle: "Ya da doğrudan ulaşın",
    whatsappRow: "WhatsApp'tan yazın",
    allLinks: "Tüm bağlantılarım",
    whatsappTooltip: "WhatsApp'tan yazın",

    createdWith: "Sevgiyle",
    by: "hazırlayan:",
  },

  es: {
    skipLink: "Ir al contenido",
    navHome: "Inicio",
    navCraft: "Enfoque",
    navProjects: "Proyectos",
    navAbout: "Sobre mí",
    navServices: "Servicios",
    navContact: "Contacto",

    greeting: "¡Hola!",
    heroName: "Arda Canbakış",
    heroFrontend: "Frontend",
    heroBackend: "Backend",
    heroSub:
      "Un desarrollador full-stack que construye ambas mitades — la superficie que la gente toca y el sistema que hay debajo.",
    ctaWork: "Ver el trabajo",
    ctaTalk: "Iniciar una conversación",
    scrollHint: "Desplázate — la luz te sigue",

    dualityTitle: "Dos mitades de una misma cosa",
    dualityLede:
      "Las interfaces son solo la mitad del trabajo. Lo que las hace funcionar es todo lo que hay detrás — y yo construyo ambas partes.",
    yinTag: "Yin — la superficie",
    yinTitle: "Frontend y Diseño",
    yinBody:
      "La parte que la gente realmente toca. Interfaces que responden, se animan y siguen siendo legibles en cualquier pantalla, hechas para sentirse sencillas aunque lo de abajo no lo sea.",
    yangTag: "Yang — la estructura",
    yangTitle: "Backend y Sistemas",
    yangBody:
      "La parte que nadie ve y de la que todos dependen. Modelos de datos que se mantienen correctos, APIs que aguantan, y código nativo cuando el navegador no llega lo bastante lejos.",

    projectsTitle: "Trabajos seleccionados",
    projectsLede:
      "Nueve proyectos — 3D en el navegador, procesamiento de audio, modelado financiero, herramientas nativas de escritorio y sitios para clientes.",
    liveDemo: "Ver demo",
    sourceCode: "Código",
    codeMacos: "Código macOS",
    codeWindows: "Código Windows",
    viewStory: "Nuestra historia",
    moreOnGithub: "Ver todos los repositorios en GitHub",

    projGridsmith:
      "Un estudio paramétrico de Gridfinity que funciona enteramente en el navegador. Diseña cajas, placas base y organizadores de brocas y tornillos con vista previa 3D en vivo mediante Manifold CSG, y exporta a STL, 3MF o STEP.",
    projMusicviz:
      "Un visualizador ambiental que reacciona al audio del micrófono en vivo. Una cadena DSP propia — bandas logarítmicas, detección de ataques por flujo espectral y estimación de tempo — alimenta modos de shader WebGL, con extracción opcional de paletas desde las portadas de Spotify.",
    projBudgetsim:
      "Una aplicación de presupuesto multidivisa que reúne TRY, USD, EUR, BTC y oro en gramos en un solo libro contable, con tipos de cambio en vivo, seguimiento de pagos planificados y completados, simulación de préstamos y una proyección de flujo de caja a 24 meses. Los saldos siempre se calculan en el servidor, así que todos los dispositivos coinciden.",
    projStlsmith:
      "Nueve generadores que convierten texto, enlaces y fotos en archivos STL listos para imprimir sin instalar nada: placas QR, placas de nombre, códigos de Spotify, tarjetas WiFi, códigos de barras, litofanías y siluetas — todo procesado y exportado en el navegador.",
    projDigitalmuseum:
      "Un museo de arte virtual en 3D por el que se puede caminar, construido con React Three Fiber y poblado con obras extraídas en vivo de Wikipedia y Wikimedia Commons.",
    projHushbar:
      "Un silenciador de micrófono en la barra de menú que activa la bandera de silencio del propio hardware, de modo que todas las aplicaciones lo ven a la vez. Formas de insignia personalizables, doce preajustes y un atajo global. Desarrollado de forma nativa dos veces — Swift y CoreAudio en macOS, C# en Windows.",
    projWedding:
      "Una plataforma de boda bilingüe: enlaces de invitación únicos e impredecibles por invitado con RSVP, un panel de administración protegido con plantillas de WhatsApp y control de asistentes, y un sitio animado de historia y línea de tiempo. Exportación estática, con seguridad a nivel de fila en Postgres aplicando las reglas.",
    projVetapp:
      "Una aplicación web integral con un frontend en React y un backend en Spring Boot, que proporciona una solución completa de gestión para cualquier clínica veterinaria.",
    projGym:
      "Un sitio web de gimnasio responsivo con características como un calculador de IMC, horarios de clases dinámicos y funcionalidad de comercio electrónico.",

    aboutTitle: "Sobre mí",
    aboutBody1:
      "Soy un desarrollador versátil, con experiencia en tecnologías tanto de front-end como de back-end. Mi pasión por la programación solo es igualada por mi deseo de aprender y adaptarme a nuevos desafíos. Me desenvuelvo bien en entornos dinámicos y siempre estoy listo para abordar problemas complejos con soluciones innovadoras.",
    aboutBody2:
      "Lejos del teclado estoy aprendiendo idiomas, practicando deportes extremos, construyendo cosas a mano y pasando todo el tiempo que puedo al aire libre. El mismo equilibrio que recorre esta página recorre el resto.",
    downloadCv: "Descargar mi CV",

    servicesTitle: "Lo que puedo construir para ti",
    servicesLede:
      "Cuatro formas de trabajar contigo — desde el primer boceto hasta algo funcionando en producción.",
    serviceWebTitle: "Desarrollo Web",
    webDevelopmentDescription:
      "Desde el concepto hasta el despliegue, ofrezco servicios integrales de desarrollo web para dar vida a tu visión. Ya sea que necesites un sitio web simple o una aplicación web compleja, tengo las habilidades y la experiencia para ofrecer soluciones de alta calidad.",
    serviceUiTitle: "Diseño UI/UX",
    uiUxDesignDescription:
      "Crear interfaces fáciles de usar y estéticamente atractivas es mi especialidad. Me enfoco en diseñar experiencias de usuario fluidas, asegurando que tus usuarios puedan navegar por tu sitio con facilidad y disfruten del proceso.",
    service3dTitle: "Herramientas 3D y Paramétricas",
    threeDDescription:
      "Configuradores 3D en el navegador y generadores de modelos listos para imprimir — lo mismo que hay detrás de gridSmith y stlSmith. Geometría en tiempo real, vista previa en vivo y exportación a STL, 3MF o STEP, sin que tus clientes instalen nada.",
    serviceAppTitle: "Desarrollo de Apps y Escritorio",
    mobileAppDescription:
      "Tanto experiencias móviles responsivas como utilidades nativas de escritorio. Desde aplicaciones web progresivas hasta herramientas de barra de menú escritas en Swift y C#, construyo software que se siente natural en cualquier dispositivo.",

    contactTitle: "Iniciemos una conversación",
    contactLede:
      "¿Tienes un proyecto en mente o simplemente quieres saludar? Envíame un mensaje y te responderé pronto.",
    formName: "Tu nombre",
    formEmail: "Correo electrónico",
    formSubject: "Asunto",
    formMessage: "Mensaje",
    formSend: "Enviar mensaje",
    errName: "Por favor, introduce tu nombre.",
    errEmail: "Por favor, introduce un correo electrónico válido.",
    errMessage: "Por favor, escribe un mensaje.",
    formSending: "Enviando…",
    formSuccess: "¡Gracias! Tu mensaje va en camino — responderé pronto.",
    formError: "Algo salió mal. Por favor, escríbeme directamente por correo.",
    formNotConfigured:
      "El formulario aún no está conectado. Por ahora escribe a dev.ardacanbakis@gmail.com.",

    directTitle: "O contáctame directamente",
    whatsappRow: "Chatear por WhatsApp",
    allLinks: "Todos mis enlaces",
    whatsappTooltip: "Chatear por WhatsApp",

    createdWith: "Creado con",
    by: "por",
  },
};

/* --------------------------------------------------------------------------
   3. BOOT
   -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  let currentLang = "en";

  /* ── The inversion ──────────────────────────────────────────────────────
     The sections carry their own palettes (see styles.css), so the page
     inverts on its own as you scroll past the seam. What still needs
     tracking is the fixed furniture — the top bar, the side rail and the
     mobile menu float over both halves, so they have to be told which tone
     is currently underneath them. */

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const toned = [...document.querySelectorAll("section.yin, section.yang")];

  const applyTone = () => {
    // Sample just below the top bar: that is what the fixed chrome overlaps.
    const probe = 96;
    let tone = "yin";

    for (const section of toned) {
      const { top, bottom } = section.getBoundingClientRect();
      if (top <= probe && bottom > probe) {
        tone = section.classList.contains("yang") ? "yang" : "yin";
        break;
      }
      // Past the last section (the footer) the page has fully turned over.
      if (top > probe) break;
      tone = section.classList.contains("yang") ? "yang" : "yin";
    }

    if (root.dataset.tone !== tone) {
      root.dataset.tone = tone;
      themeMeta?.setAttribute("content", TONE_THEME_COLOR[tone]);
    }
  };

  /* ── Nav state, top bar, rail ───────────────────────────────────────── */

  const topbar = document.querySelector(".topbar");
  const railLinks = [...document.querySelectorAll(".rail a")];
  const sections = railLinks
    .map((link) => document.getElementById(link.dataset.rail))
    .filter(Boolean);

  const updateNav = () => {
    topbar.classList.toggle("scrolled", window.scrollY > 20);

    let activeIndex = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) {
        activeIndex = index;
      }
    });

    railLinks.forEach((link, index) => {
      link.classList.toggle("active", index === activeIndex);
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      applyTone();
      updateNav();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  applyTone();
  updateNav();

  /* ── Mobile overlay menu ────────────────────────────────────────────── */

  const menuToggle = document.getElementById("menu-toggle");
  const overlay = document.getElementById("overlay-menu");

  const setMenu = (open) => {
    overlay.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };

  menuToggle.addEventListener("click", () => setMenu(overlay.hidden));
  overlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) setMenu(false);
  });

  /* ── WhatsApp links ─────────────────────────────────────────────────── */

  const whatsappHref = (lang) => {
    const base = `https://wa.me/${WHATSAPP_NUMBER}`;
    if (WHATSAPP_STYLE === "blank") return base;

    const set = WHATSAPP_MESSAGES[WHATSAPP_STYLE];
    const text = set && (set[lang] || set.en);
    return text ? `${base}?text=${encodeURIComponent(text)}` : base;
  };

  /* ── Language ───────────────────────────────────────────────────────── */

  const languageSwitcher = document.getElementById("language-switcher");

  const applyLanguage = (lang) => {
    const dict = translations[lang] || translations.en;
    currentLang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = dict[el.dataset.i18n];
      if (typeof value === "string") el.textContent = value;
    });

    document.documentElement.lang = lang;

    const href = whatsappHref(lang);
    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
      el.setAttribute("href", href);
    });

    try {
      localStorage.setItem("lang", lang);
    } catch {
      /* private browsing — the switcher still works for this visit */
    }
  };

  let savedLang = null;
  try {
    savedLang = localStorage.getItem("lang");
  } catch {
    /* ignore */
  }

  const browserLang = navigator.language?.slice(0, 2);
  const initialLang = savedLang && translations[savedLang]
    ? savedLang
    : translations[browserLang]
      ? browserLang
      : "en";

  languageSwitcher.value = initialLang;
  applyLanguage(initialLang);

  languageSwitcher.addEventListener("change", () => {
    applyLanguage(languageSwitcher.value);
  });

  /* ── Contact form ───────────────────────────────────────────────────── */

  const form = document.getElementById("contact-form");
  const status = form.querySelector(".form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  const t = (key) => (translations[currentLang] || translations.en)[key];

  const markField = (input, valid) => {
    input.closest(".field")?.classList.toggle("invalid", !valid);
    return valid;
  };

  const validate = () => {
    const { name, email, message } = form.elements;
    const nameOk = markField(name, name.value.trim().length > 0);
    const emailOk = markField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
    const messageOk = markField(message, message.value.trim().length > 0);
    return nameOk && emailOk && messageOk;
  };

  ["name", "email", "message"].forEach((fieldName) => {
    form.elements[fieldName].addEventListener("input", (event) => {
      event.target.closest(".field")?.classList.remove("invalid");
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    if (!validate()) return;

    const accessKey = form.elements.access_key.value;
    if (!accessKey || accessKey.startsWith("YOUR-")) {
      // No key configured yet — say so plainly rather than failing silently.
      status.classList.add("error");
      status.textContent = t("formNotConfigured");
      return;
    }

    submitBtn.disabled = true;
    status.textContent = t("formSending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        status.classList.add("success");
        status.textContent = t("formSuccess");
        form.reset();
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch {
      status.classList.add("error");
      status.textContent = t("formError");
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ── Scroll reveal ──────────────────────────────────────────────────── */

  document
    .querySelectorAll(".half, .card, .service, .about-media, .about-text, .contact-grid")
    .forEach((el) => el.classList.add("reveal"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ── Footer year ────────────────────────────────────────────────────── */

  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});
