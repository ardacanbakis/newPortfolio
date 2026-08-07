/* ==========================================================================
   Shared site behaviour — used by v3 onwards.

   v1 and v2 predate this and keep their own copies, so each of those folders
   can be uploaded on its own. From v3 there are too many versions for that to
   be honest: eight copies of the translation table would drift apart within a
   week. Versions from v3 need this folder uploaded alongside them.

   Everything is hung off `window.Portfolio`. Nothing here touches layout — a
   version's own script decides what to render and when.
   ========================================================================== */

(function (global) {
  "use strict";

  /* ── Configuration ────────────────────────────────────────────────────── */

  /** WhatsApp number in international format, digits only (no +, no spaces). */
  const WHATSAPP_NUMBER = "905469660256";

  /**
   * Which prefilled opening message the WhatsApp button uses. Set to "blank"
   * for an empty chat. Each style is translated, so the message follows the
   * language the visitor is browsing in.
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

  /** The six projects, in display order. */
  const PROJECTS = [
    {
      id: "gridsmith",
      name: "gridSmith",
      thumb: "gridsmith.svg",
      tags: ["React", "TypeScript", "Three.js", "WebAssembly"],
      links: [
        { key: "liveDemo", href: "https://ardacanbakis.github.io/gridSmith/" },
        { key: "sourceCode", href: "https://github.com/ardacanbakis/gridSmith" },
      ],
    },
    {
      id: "musicvisualizer",
      name: "musicVisualizer",
      thumb: "musicvisualizer.svg",
      tags: ["WebGL", "Web Audio", "GLSL", "Spotify API"],
      links: [
        { key: "liveDemo", href: "https://ardacanbakis.github.io/musicVisualizer/" },
        { key: "sourceCode", href: "https://github.com/ardacanbakis/musicVisualizer" },
      ],
    },
    {
      id: "hushbar",
      name: "hushBar",
      thumb: "hushbar.svg",
      tags: ["Swift", "AppKit", "CoreAudio", "C#"],
      links: [
        { key: "liveDemo", href: "https://ardacanbakis.github.io/hushBar/" },
        { key: "codeMacos", href: "https://github.com/ardacanbakis/hushBar" },
        { key: "codeWindows", href: "https://github.com/ardacanbakis/hushBar-windows" },
      ],
    },
    {
      id: "wedding",
      name: "Tansu & Arda — Wedding",
      thumb: "wedding.svg",
      tags: ["Next.js", "Supabase", "PostgreSQL RLS", "i18n"],
      links: [
        { key: "viewStory", href: "https://wedding.ardacanbakis.com/story/" },
        { key: "sourceCode", href: "https://github.com/ardacanbakis/t-t-wedding" },
      ],
    },
    {
      id: "vetapp",
      name: "VetApp",
      thumb: "projectVetApp.png",
      tags: ["React", "Spring Boot", "Java", "PostgreSQL"],
      links: [
        { key: "liveDemo", href: "https://vetapp-ardacanbakis.vercel.app/" },
        { key: "sourceCode", href: "https://github.com/ardacanbakis/vetApp" },
      ],
    },
    {
      id: "gym",
      name: "Theo's Gym",
      thumb: "projectGYM.png",
      tags: ["JavaScript", "CSS", "Bootstrap"],
      links: [{ key: "liveDemo", href: "https://www.ardacanbakis.com/gym/gym.html" }],
    },
  ];

  const SOCIALS = [
    { key: "website", label: "Website", href: "https://ardacanbakis.com" },
    { key: "github", label: "GitHub", href: "https://github.com/ardacanbakis" },
    { key: "instagram", label: "Instagram", href: "https://www.instagram.com/arda.canbakiss/" },
    { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@arda.canbakis" },
    { key: "spotify", label: "Spotify", href: "https://open.spotify.com/user/11146430303" },
    { key: "linkedin", label: "LinkedIn", href: "https://linkedin.com/in/ardacanbakis" },
    { key: "medium", label: "Medium", href: "https://medium.com/@dev.ardacanbakis" },
    { key: "linktree", label: "Linktree", href: "https://linktr.ee/arda.canbakis" },
    { key: "whatsapp", label: "WhatsApp", href: "#", whatsapp: true },
  ];

  const EMAIL = "dev.ardacanbakis@gmail.com";

  /* ── Translations ─────────────────────────────────────────────────────── */

  const translations = {
    en: {
      navHome: "Home",
      navProjects: "Projects",
      navAbout: "About",
      navServices: "Services",
      navContact: "Contact",

      role: "Full-Stack Web Developer",
      tagline:
        "A full-stack developer who builds both halves — the surface people touch and the system underneath it.",

      projectsTitle: "Selected work",
      liveDemo: "Live demo",
      sourceCode: "Code",
      codeMacos: "macOS code",
      codeWindows: "Windows code",
      viewStory: "Our story",
      moreOnGithub: "See all repositories on GitHub",

      projGridsmith:
        "A parametric Gridfinity studio that runs entirely in the browser. Design bins, baseplates, drill-bit and screw organizers with a live 3D preview powered by Manifold CSG, then export STL, 3MF or STEP.",
      projMusicvisualizer:
        "An ambient audio-reactive visualiser driven by live microphone input. A custom DSP pipeline — log-spaced bands, spectral-flux onset detection and tempo estimation — feeds WebGL shader modes, with optional Spotify album-art palette extraction.",
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
        "Away from the keyboard I am learning new languages, chasing extreme sports, building things by hand and spending as much time outdoors as I can.",
      downloadCv: "Download my CV",

      servicesTitle: "What I can build for you",
      serviceWebTitle: "Web Development",
      serviceWebBody:
        "From concept to deployment, I offer comprehensive web development services to bring your vision to life. Whether you need a simple website or a complex web application, I have the skills and experience to deliver high-quality solutions.",
      serviceUiTitle: "UI/UX Design",
      serviceUiBody:
        "Creating user-friendly and aesthetically pleasing interfaces is my specialty. I focus on crafting designs that provide a seamless user experience, ensuring that your users can navigate your site with ease and enjoy the process.",
      service3dTitle: "3D & Parametric Tools",
      service3dBody:
        "Browser-based 3D configurators and print-ready model generators — the kind of thing behind gridSmith and stlSmith. Real-time geometry, live preview and STL, 3MF or STEP export, with no software for your customers to install.",
      serviceAppTitle: "App & Desktop Development",
      serviceAppBody:
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
      createdWith: "Created with",
      by: "by",
      skipLink: "Skip to content",
    },

    tr: {
      navHome: "Ana Sayfa",
      navProjects: "Projeler",
      navAbout: "Hakkımda",
      navServices: "Hizmetler",
      navContact: "İletişim",

      role: "Full-Stack Web Geliştirici",
      tagline:
        "Her iki yarıyı da inşa eden bir full-stack geliştirici — insanların dokunduğu yüzeyi ve onun altındaki sistemi.",

      projectsTitle: "Seçilmiş çalışmalar",
      liveDemo: "Canlı demo",
      sourceCode: "Kod",
      codeMacos: "macOS kodu",
      codeWindows: "Windows kodu",
      viewStory: "Hikâyemiz",
      moreOnGithub: "Tüm repoları GitHub'da gör",

      projGridsmith:
        "Tamamen tarayıcıda çalışan parametrik bir Gridfinity stüdyosu. Kutular, taban plakaları, matkap ucu ve vida düzenleyicileri tasarlayın; Manifold CSG ile canlı 3B önizleme alın ve STL, 3MF veya STEP olarak dışa aktarın.",
      projMusicvisualizer:
        "Canlı mikrofon girişiyle çalışan, ortam odaklı ses tepkili bir görselleştirici. Özel bir DSP hattı — logaritmik bantlar, spektral akış tabanlı vuruş algılama ve tempo tahmini — WebGL shader modlarını besliyor; isteğe bağlı olarak Spotify albüm kapağından renk paleti çıkarıyor.",
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
        "Klavyeden uzaktayken yeni diller öğreniyor, ekstrem sporların peşinden gidiyor, elimle bir şeyler yapıyor ve mümkün olduğunca çok vakti dışarıda geçiriyorum.",
      downloadCv: "Özgeçmişimi indir",

      servicesTitle: "Sizin için neler yapabilirim",
      serviceWebTitle: "Web Geliştirme",
      serviceWebBody:
        "Fikirden dağıtıma kadar, vizyonunuzu hayata geçirmek için kapsamlı web geliştirme hizmetleri sunuyorum. İster basit bir web sitesi ister karmaşık bir web uygulaması olsun, yüksek kaliteli çözümler sunmak için gerekli beceri ve deneyime sahibim.",
      serviceUiTitle: "UI/UX Tasarım",
      serviceUiBody:
        "Kullanıcı dostu ve estetik açıdan hoş arayüzler oluşturmak benim uzmanlık alanım. Kullanıcılarınızın sitenizde kolayca gezinebilmesini ve süreçten keyif almasını sağlayan tasarımlar yaratmaya odaklanıyorum.",
      service3dTitle: "3B ve Parametrik Araçlar",
      service3dBody:
        "Tarayıcı tabanlı 3B yapılandırıcılar ve baskıya hazır model üreticileri — gridSmith ve stlSmith'in arkasındaki yaklaşımın aynısı. Gerçek zamanlı geometri, canlı önizleme ve STL, 3MF veya STEP çıktısı; müşterilerinizin hiçbir program kurmasına gerek kalmadan.",
      serviceAppTitle: "Uygulama ve Masaüstü Geliştirme",
      serviceAppBody:
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
      createdWith: "Sevgiyle",
      by: "hazırlayan:",
      skipLink: "İçeriğe geç",
    },

    es: {
      navHome: "Inicio",
      navProjects: "Proyectos",
      navAbout: "Sobre mí",
      navServices: "Servicios",
      navContact: "Contacto",

      role: "Desarrollador Web Full-Stack",
      tagline:
        "Un desarrollador full-stack que construye ambas mitades — la superficie que la gente toca y el sistema que hay debajo.",

      projectsTitle: "Trabajos seleccionados",
      liveDemo: "Ver demo",
      sourceCode: "Código",
      codeMacos: "Código macOS",
      codeWindows: "Código Windows",
      viewStory: "Nuestra historia",
      moreOnGithub: "Ver todos los repositorios en GitHub",

      projGridsmith:
        "Un estudio paramétrico de Gridfinity que funciona enteramente en el navegador. Diseña cajas, placas base y organizadores de brocas y tornillos con vista previa 3D en vivo mediante Manifold CSG, y exporta a STL, 3MF o STEP.",
      projMusicvisualizer:
        "Un visualizador ambiental que reacciona al audio del micrófono en vivo. Una cadena DSP propia — bandas logarítmicas, detección de ataques por flujo espectral y estimación de tempo — alimenta modos de shader WebGL, con extracción opcional de paletas desde las portadas de Spotify.",
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
        "Lejos del teclado estoy aprendiendo idiomas, practicando deportes extremos, construyendo cosas a mano y pasando todo el tiempo que puedo al aire libre.",
      downloadCv: "Descargar mi CV",

      servicesTitle: "Lo que puedo construir para ti",
      serviceWebTitle: "Desarrollo Web",
      serviceWebBody:
        "Desde el concepto hasta el despliegue, ofrezco servicios integrales de desarrollo web para dar vida a tu visión. Ya sea que necesites un sitio web simple o una aplicación web compleja, tengo las habilidades y la experiencia para ofrecer soluciones de alta calidad.",
      serviceUiTitle: "Diseño UI/UX",
      serviceUiBody:
        "Crear interfaces fáciles de usar y estéticamente atractivas es mi especialidad. Me enfoco en diseñar experiencias de usuario fluidas, asegurando que tus usuarios puedan navegar por tu sitio con facilidad y disfruten del proceso.",
      service3dTitle: "Herramientas 3D y Paramétricas",
      service3dBody:
        "Configuradores 3D en el navegador y generadores de modelos listos para imprimir — lo mismo que hay detrás de gridSmith y stlSmith. Geometría en tiempo real, vista previa en vivo y exportación a STL, 3MF o STEP, sin que tus clientes instalen nada.",
      serviceAppTitle: "Desarrollo de Apps y Escritorio",
      serviceAppBody:
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
      createdWith: "Creado con",
      by: "por",
      skipLink: "Ir al contenido",
    },
  };

  /* ── Language ─────────────────────────────────────────────────────────── */

  let currentLang = "en";

  const dict = () => translations[currentLang] || translations.en;
  const t = (key) => dict()[key] ?? key;

  const whatsappHref = (lang) => {
    const base = "https://wa.me/" + WHATSAPP_NUMBER;
    if (WHATSAPP_STYLE === "blank") return base;
    const set = WHATSAPP_MESSAGES[WHATSAPP_STYLE];
    const text = set && (set[lang || currentLang] || set.en);
    return text ? base + "?text=" + encodeURIComponent(text) : base;
  };

  const listeners = [];

  /** Swap every [data-i18n] element and refresh the WhatsApp links. */
  const applyLanguage = (lang) => {
    currentLang = translations[lang] ? lang : "en";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = dict()[el.dataset.i18n];
      if (typeof value === "string") el.textContent = value;
    });

    document.documentElement.lang = currentLang;

    const href = whatsappHref(currentLang);
    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
      el.setAttribute("href", href);
    });

    try {
      localStorage.setItem("lang", currentLang);
    } catch {
      /* private browsing — the switcher still works for this visit */
    }

    listeners.forEach((fn) => fn(currentLang));
  };

  /** The language to start in: last choice, else browser, else English. */
  const initialLanguage = () => {
    let saved = null;
    try {
      saved = localStorage.getItem("lang");
    } catch {
      /* ignore */
    }
    if (saved && translations[saved]) return saved;

    const browser = (navigator.language || "en").slice(0, 2);
    return translations[browser] ? browser : "en";
  };

  /* ── Contact form ─────────────────────────────────────────────────────── */

  /**
   * Wire a contact form to Web3Forms. Expects a hidden `access_key` input and
   * a `.form-status` element; fields named name, email and message.
   */
  const wireContactForm = (form) => {
    if (!form) return;

    const status = form.querySelector(".form-status");
    const submitBtn = form.querySelector('button[type="submit"], .submit-btn');

    const mark = (input, valid) => {
      input.closest(".field")?.classList.toggle("invalid", !valid);
      return valid;
    };

    const validate = () => {
      const { name, email, message } = form.elements;
      const okName = mark(name, name.value.trim().length > 0);
      const okMail = mark(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
      const okBody = mark(message, message.value.trim().length > 0);
      return okName && okMail && okBody;
    };

    ["name", "email", "message"].forEach((field) => {
      form.elements[field]?.addEventListener("input", (event) => {
        event.target.closest(".field")?.classList.remove("invalid");
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (status) {
        status.className = "form-status";
        status.textContent = "";
      }

      if (!validate()) return;

      const key = form.elements.access_key?.value;
      if (!key || key.startsWith("YOUR-")) {
        // No key configured yet — say so rather than failing silently.
        if (status) {
          status.classList.add("error");
          status.textContent = t("formNotConfigured");
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (status) status.textContent = t("formSending");

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const result = await response.json();

        if (response.ok && result.success) {
          if (status) {
            status.classList.add("success");
            status.textContent = t("formSuccess");
          }
          form.reset();
        } else {
          throw new Error(result.message || "Submission failed");
        }
      } catch {
        if (status) {
          status.classList.add("error");
          status.textContent = t("formError");
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  };

  /* ── WhatsApp reveal ──────────────────────────────────────────────────── */

  /**
   * Hold the floating WhatsApp button back until the visitor has scrolled past
   * the projects, then keep it for the rest of the page. Anchored to the
   * element rather than a pixel offset, so it still lands correctly if the
   * project list or type scale changes.
   */
  const gateWhatsappAfter = (target, button) => {
    if (!target || !button) return () => {};

    const update = () => {
      const passed = target.getBoundingClientRect().bottom < window.innerHeight * 0.6;
      button.classList.toggle("revealed", passed);
    };

    update();
    return update;
  };

  /** rAF-throttled scroll listener; returns the handler so it can be reused. */
  const onScroll = (fn) => {
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        fn();
        ticking = false;
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler, { passive: true });
    fn();
    return handler;
  };

  /** Reveal elements as they scroll into view. */
  const revealOnScroll = (selector, options) => {
    const els = [...document.querySelectorAll(selector)];
    if (!els.length) return;

    els.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, ...options },
    );

    els.forEach((el) => observer.observe(el));
  };

  /* ── Standard page wiring ─────────────────────────────────────────────
     Language switcher, contact form, mobile menu, header state, active nav
     link, WhatsApp gate and the footer year — identical in every version
     that uses the generated markup, so it lives here rather than being
     copied into each app.js. */
  const wireStandardPage = () => {
    const switcher = document.getElementById("language-switcher");
    if (switcher) {
      switcher.value = initialLanguage();
      applyLanguage(switcher.value);
      switcher.addEventListener("change", () => applyLanguage(switcher.value));
    }

    wireContactForm(document.getElementById("contact-form"));

    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("nav");

    if (toggle && nav) {
      const setMenu = (open) => {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      };
      toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
      nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMenu(false);
      });
    }

    const header = document.querySelector(".site-header");
    const links = nav ? [...nav.querySelectorAll("a")] : [];
    const sections = links.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
    const gate = gateWhatsappAfter(
      document.getElementById("projects"),
      document.querySelector(".whatsapp-float"),
    );

    onScroll(() => {
      header?.classList.toggle("scrolled", window.scrollY > 20);

      let active = 0;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) active = i;
      });
      links.forEach((a, i) => a.classList.toggle("active", i === active));

      gate();
    });

    const year = document.getElementById("footer-year");
    if (year) year.textContent = String(new Date().getFullYear());
  };

  global.Portfolio = {
    WHATSAPP_NUMBER,
    WHATSAPP_STYLE,
    WHATSAPP_MESSAGES,
    PROJECTS,
    SOCIALS,
    EMAIL,
    translations,
    get lang() {
      return currentLang;
    },
    t,
    whatsappHref,
    applyLanguage,
    initialLanguage,
    onLanguageChange: (fn) => listeners.push(fn),
    wireContactForm,
    wireStandardPage,
    gateWhatsappAfter,
    onScroll,
    revealOnScroll,
  };
})(window);
