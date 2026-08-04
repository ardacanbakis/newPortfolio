/* ==========================================================================
   Arda Canbakış — portfolio (v1)
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CONFIGURATION — the two things you are most likely to want to change
   -------------------------------------------------------------------------- */

/** WhatsApp number in international format, digits only (no +, no spaces). */
const WHATSAPP_NUMBER = "905469660256";

/**
 * Which prefilled opening message the WhatsApp button uses.
 *
 * Change WHATSAPP_STYLE to any key below. Set it to "blank" to open an empty
 * chat instead. Each style has a translation per site language, so the message
 * follows whatever language the visitor is browsing in.
 */
const WHATSAPP_STYLE = "quote";

const WHATSAPP_MESSAGES = {
  // Option 1 — warm and direct, clear business intent.
  project: {
    en: "Hi Arda! I saw your portfolio and I'd like to talk about a project.",
    tr: "Merhaba Arda! Portfolyonu gördüm ve bir proje hakkında konuşmak istiyorum.",
    es: "¡Hola Arda! Vi tu portafolio y me gustaría hablar sobre un proyecto.",
  },
  // Option 2 — pushes straight to a paid enquiry. Best for lead generation.
  quote: {
    en: "Hi Arda! I'd like to get a quote for a website / web app.",
    tr: "Merhaba Arda! Bir web sitesi / web uygulaması için teklif almak istiyorum.",
    es: "¡Hola Arda! Me gustaría solicitar un presupuesto para un sitio o aplicación web.",
  },
  // Option 3 — casual and low-pressure, and tells you the traffic source.
  casual: {
    en: "Hello Arda 👋 Coming from ardacanbakis.com — I have a question.",
    tr: "Merhaba Arda 👋 ardacanbakis.com üzerinden yazıyorum — bir sorum var.",
    es: "¡Hola Arda! 👋 Vengo de ardacanbakis.com — tengo una pregunta.",
  },
  // Option 4 — hiring / recruitment focused.
  hiring: {
    en: "Hi Arda! I'd like to talk to you about a role / collaboration.",
    tr: "Merhaba Arda! Bir pozisyon / iş birliği hakkında konuşmak istiyorum.",
    es: "¡Hola Arda! Me gustaría hablar contigo sobre un puesto o colaboración.",
  },
};

/* --------------------------------------------------------------------------
   2. TRANSLATIONS
   -------------------------------------------------------------------------- */

const translations = {
  en: {
    skipLink: "Skip to content",
    navProjects: "Projects",
    navAbout: "About",
    navServices: "Services",
    navContact: "Contact",

    greeting: "Hello!",
    name: "My name is Arda Canbakış",
    iAmA: "I am a",
    roleSuffix: "Web Developer",
    description:
      "with a passion for learning new languages, extreme sports, DIY projects, and the great outdoors.",

    projectsTitle1: "My",
    projectsTitle2: "Projects",
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

    aboutTitle1: "About",
    aboutTitle2: "Me",
    aboutRole: "Full-Stack Web Developer",
    aboutDescription:
      "I am a versatile developer proficient in both front-end and back-end technologies. My passion for coding is matched only by my desire to learn and adapt to new challenges. I thrive in dynamic environments and am always ready to tackle complex problems with innovative solutions.",
    myCv: "My CV",
    clickMe: "Click me!",

    servicesTitle1: "My",
    servicesTitle2: "Services",
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

    contactTitle1: "Contact",
    contactTitle2: "Me",
    contactIntro:
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
    navProjects: "Projeler",
    navAbout: "Hakkımda",
    navServices: "Hizmetler",
    navContact: "İletişim",

    greeting: "Merhaba!",
    name: "Benim adım Arda Canbakış",
    iAmA: "Ben bir",
    roleSuffix: "Web Geliştirici",
    description:
      "yeni diller öğrenmeye, ekstrem sporlara, DIY projelerine ve doğada vakit geçirmeye tutkuluyum.",

    projectsTitle1: "",
    projectsTitle2: "Projelerim",
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

    aboutTitle1: "",
    aboutTitle2: "Hakkımda",
    aboutRole: "Full-Stack Web Geliştirici",
    aboutDescription:
      "Hem front-end hem de back-end teknolojilerinde yetkin, çok yönlü bir yazılımcıyım. Kodlama tutkum, yeni zorluklara öğrenme ve uyum sağlama arzumla yarışır. Karmaşık sorunlara yenilikçi çözümlerle yaklaşmaya hazırım.",
    myCv: "Özgeçmişim",
    clickMe: "Tıkla!",

    servicesTitle1: "",
    servicesTitle2: "Hizmetlerim",
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

    contactTitle1: "",
    contactTitle2: "İletişim",
    contactIntro:
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
    navProjects: "Proyectos",
    navAbout: "Sobre mí",
    navServices: "Servicios",
    navContact: "Contacto",

    greeting: "¡Hola!",
    name: "Mi nombre es Arda Canbakış",
    iAmA: "Soy un",
    roleSuffix: "Desarrollador Web",
    description:
      "con una pasión por aprender nuevos idiomas, deportes extremos, proyectos de bricolaje y la naturaleza.",

    projectsTitle1: "Mis",
    projectsTitle2: "Proyectos",
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

    aboutTitle1: "Sobre",
    aboutTitle2: "Mí",
    aboutRole: "Desarrollador Web Full-Stack",
    aboutDescription:
      "Soy un desarrollador versátil, con experiencia en tecnologías tanto de front-end como de back-end. Mi pasión por la programación solo es igualada por mi deseo de aprender y adaptarme a nuevos desafíos. Me desenvuelvo bien en entornos dinámicos y siempre estoy listo para abordar problemas complejos con soluciones innovadoras.",
    myCv: "Mi CV",
    clickMe: "¡Haz clic!",

    servicesTitle1: "Mis",
    servicesTitle2: "Servicios",
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

    contactTitle1: "",
    contactTitle2: "Contáctame",
    contactIntro:
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
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");
  const languageSwitcher = document.getElementById("language-switcher");

  let currentLang = "en";

  /* ── Theme ──────────────────────────────────────────────────────────────
     The previous version toggled two different class names ("dark" and
     "dark-theme") from two separate listeners, but only "dark-theme" had any
     styles attached. One class, one listener, and the choice is remembered. */

  const setTheme = (isDark) => {
    body.classList.toggle("dark-theme", isDark);

    // The button holds both a sun and a moon as inline SVG; CSS shows one.
    themeToggle.classList.toggle("is-dark", isDark);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? "#1f242d" : "#ffffff");

    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      /* private browsing — the toggle still works for this visit */
    }
  };

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("theme");
  } catch {
    /* ignore */
  }

  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  setTheme(savedTheme ? savedTheme === "dark" : prefersDark);

  themeToggle.addEventListener("click", () => {
    setTheme(!body.classList.contains("dark-theme"));
  });

  /* ── WhatsApp links ─────────────────────────────────────────────────── */

  const whatsappHref = (lang) => {
    const base = `https://wa.me/${WHATSAPP_NUMBER}`;
    if (WHATSAPP_STYLE === "blank") return base;

    const set = WHATSAPP_MESSAGES[WHATSAPP_STYLE];
    const text = set && (set[lang] || set.en);
    return text ? `${base}?text=${encodeURIComponent(text)}` : base;
  };

  const refreshWhatsappLinks = (lang) => {
    const href = whatsappHref(lang);
    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
      el.setAttribute("href", href);
    });
  };

  /* ── Language ───────────────────────────────────────────────────────── */

  const applyLanguage = (lang) => {
    const dict = translations[lang] || translations.en;
    currentLang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = dict[el.dataset.i18n];
      if (typeof value === "string") el.textContent = value;
    });

    document.documentElement.lang = lang;
    refreshWhatsappLinks(lang);

    try {
      localStorage.setItem("lang", lang);
    } catch {
      /* ignore */
    }
  };

  let savedLang = null;
  try {
    savedLang = localStorage.getItem("lang");
  } catch {
    /* ignore */
  }

  const initialLang =
    savedLang && translations[savedLang]
      ? savedLang
      : translations[navigator.language?.slice(0, 2)]
        ? navigator.language.slice(0, 2)
        : "en";

  languageSwitcher.value = initialLang;
  applyLanguage(initialLang);

  languageSwitcher.addEventListener("change", () => {
    applyLanguage(languageSwitcher.value);
  });

  /* ── Mobile menu ────────────────────────────────────────────────────── */

  const menuBtn = document.getElementById("menu-btn");

  document.querySelectorAll(".navbar a").forEach((link) => {
    link.addEventListener("click", () => {
      menuBtn.checked = false;
    });
  });

  /* ── Contact form ───────────────────────────────────────────────────── */

  const form = document.getElementById("contact-form");
  const status = form.querySelector(".form-status");
  const submitBtn = form.querySelector(".submit-btn");

  const t = (key) => (translations[currentLang] || translations.en)[key];

  const markField = (input, valid) => {
    input.closest(".field")?.classList.toggle("invalid", !valid);
    return valid;
  };

  const validate = () => {
    const name = form.elements.name;
    const email = form.elements.email;
    const message = form.elements.message;

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
      // No key configured yet — say so plainly rather than silently failing.
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

  /* ── Scroll behaviour: reveal, header shadow, active nav, back to top ── */

  document
    .querySelectorAll(".projects-box, .service-box, .contact-wrapper, .about-content")
    .forEach((el) => el.classList.add("reveal"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  const header = document.querySelector(".header");
  const backToTop = document.getElementById("back-to-top");
  const navLinks = [...document.querySelectorAll(".navbar a")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    const y = window.scrollY;

    header.classList.toggle("scrolled", y > 20);
    backToTop.classList.toggle("visible", y > 600);

    let activeIndex = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= 140) activeIndex = index;
    });

    navLinks.forEach((link, index) => {
      link.classList.toggle("active", index === activeIndex);
    });
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true },
  );

  onScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ── Footer year ────────────────────────────────────────────────────── */

  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});
