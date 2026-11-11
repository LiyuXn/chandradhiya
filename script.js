
import { firebaseConfig, ADMIN_UID } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, deleteDoc, updateDoc, doc, getDocs,
  startAfter, limit, where
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

/* ------------------------------ INTRO ------------------------------ */

const intro = $("#intro");
const header = $("#siteHeader");
let introClosed = false;
let typingStarted = false;
const roleText = $("#roleText");
const rolePhrase = roleText?.textContent ?? "creative thinker.";

function startRoleTyping() {
  if (typingStarted || !roleText) return;
  typingStarted = true;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    roleText.textContent = rolePhrase;
    return;
  }

  roleText.textContent = "";
  let index = 0;

  const typeNext = () => {
    roleText.textContent = rolePhrase.slice(0, index + 1);
    index += 1;

    if (index < rolePhrase.length) {
      window.setTimeout(typeNext, 58);
    }
  };

  window.setTimeout(typeNext, 360);
}

function closeIntro() {
  if (introClosed || !intro || !header) return;

  introClosed = true;
  intro.classList.add("is-hidden");
  document.body.classList.remove("intro-active");
  header.classList.add("is-visible");

  window.setTimeout(startRoleTyping, 420);
  window.setTimeout(() => intro.remove(), 1100);
}

document.body.classList.add("intro-active");

document.fonts.ready.then(() => {
  document.body.classList.add("fonts-loaded");
});

window.setTimeout(closeIntro, 3400);

/* ---------------------------- STARFIELD ---------------------------- */

const canvas = $("#starfield");
const ctx = canvas?.getContext("2d", { alpha: true });

let width = 0;
let height = 0;
let dpr = 1;
let stars = [];
let comets = [];
let lastFrame = 0;
let lastComet = 0;
let starFrameId = 0;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const STAR_FRAME_INTERVAL = 1000 / 30;

function resizeCanvas() {
  if (!canvas || !ctx) return;

  dpr = Math.min(window.devicePixelRatio || 1, 1.35);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.max(
    45,
    Math.min(130, Math.floor(width * height / 13000))
  );

  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.15 + .25,
    alpha: Math.random() * .62 + .2,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * .8 + .2,
    drift: (Math.random() - .5) * .07
  }));
}

function addComet() {
  const fromLeft = Math.random() > .35;

  const startX = fromLeft
    ? Math.random() * width * .8
    : width * (.65 + Math.random() * .35);

  const startY = Math.random() * height * .38;

  comets.push({
    x: startX,
    y: startY,
    vx: fromLeft ? 4.2 + Math.random() * 2 : -4 - Math.random() * 2,
    vy: 2.1 + Math.random() * 2,
    life: 0,
    maxLife: 65 + Math.random() * 35,
    length: 65 + Math.random() * 70,
    width: .7 + Math.random() * .8
  });
}

function drawStars(time, delta) {
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.phase += delta * .001 * star.speed;
    star.x += star.drift * delta;

    if (star.x < -2) star.x = width + 2;
    if (star.x > width + 2) star.x = -2;

    const twinkle = .58 + Math.sin(
      star.phase + time * .0003
    ) * .28;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(205, 225, 255, ${star.alpha * twinkle})`;
    ctx.fill();
  }

  if (
    !reducedMotion &&
    time - lastComet > 14500 + Math.random() * 9500
  ) {
    addComet();
    lastComet = time;
  }

  comets = comets.filter(
    (comet) => comet.life < comet.maxLife
  );

  for (const comet of comets) {
    comet.life += delta / 16.67;
    comet.x += comet.vx * delta * .06;
    comet.y += comet.vy * delta * .06;

    const progress = comet.life / comet.maxLife;
    const fade = Math.sin(progress * Math.PI);

    const tailX = comet.x - comet.vx * comet.length * .11;
    const tailY = comet.y - comet.vy * comet.length * .11;

    const gradient = ctx.createLinearGradient(
      comet.x,
      comet.y,
      tailX,
      tailY
    );

    gradient.addColorStop(
      0,
      `rgba(225, 241, 255, ${fade * .95})`
    );

    gradient.addColorStop(
      .25,
      `rgba(111, 177, 255, ${fade * .56})`
    );

    gradient.addColorStop(1, "rgba(85, 145, 255, 0)");

    ctx.beginPath();
    ctx.moveTo(comet.x, comet.y);
    ctx.lineTo(tailX, tailY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = comet.width;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

function animateStars(time) {
  if (document.hidden) {
    starFrameId = 0;
    return;
  }

  starFrameId = requestAnimationFrame(animateStars);

  if (time - lastFrame < STAR_FRAME_INTERVAL) return;

  const delta = Math.min(
    time - (lastFrame || time),
    50
  );

  lastFrame = time;
  drawStars(time, delta);
}

function startStarfield() {
  if (
    reducedMotion ||
    document.hidden ||
    starFrameId ||
    !canvas ||
    !ctx
  ) return;

  lastFrame = 0;
  starFrameId = requestAnimationFrame(animateStars);
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas, {
  passive: true
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (starFrameId) {
      cancelAnimationFrame(starFrameId);
    }

    starFrameId = 0;
  } else {
    startStarfield();
  }
});

if (reducedMotion) {
  drawStars(0, 0);
} else {
  startStarfield();
}

/* ------------------------- SCROLL INTERACTIONS ---------------------- */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: .1,
  rootMargin: "0px 0px -25px 0px"
});

$$(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const navLinks = $$(".nav-link");
const navIndicator = $(".nav-indicator");
const glassNav = $(".glass-nav");

const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let navFrame = 0;
let indicatorFrame = 0;

let activeNavLink =
  navLinks.find((link) => link.classList.contains("active")) ||
  navLinks[0];

let indicatorX = 0;
let indicatorWidth = 0;
let indicatorReady = false;
let navigationTargetLink = null;
let navScrollSettleTimer = 0;

function paintNavIndicator(x, width) {
  if (!navIndicator) return;

  indicatorX = x;
  indicatorWidth = width;

  navIndicator.style.width = `${width.toFixed(2)}px`;
  navIndicator.style.transform =
    `translate3d(${x.toFixed(2)}px, 0, 0)`;
}

function moveNavIndicator(link, immediate = false) {
  if (
    !link ||
    !navIndicator ||
    !glassNav ||
    window.innerWidth <= 760
  ) return;

  const navRect = glassNav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  const targetX = linkRect.left - navRect.left - 4;
  const targetWidth = linkRect.width;

  if (indicatorFrame) {
    cancelAnimationFrame(indicatorFrame);
    indicatorFrame = 0;
  }

  if (
    immediate ||
    !indicatorReady ||
    prefersReducedMotion
  ) {
    paintNavIndicator(targetX, targetWidth);
    navIndicator.classList.add("is-ready");
    indicatorReady = true;
    return;
  }

  const startX = indicatorX;
  const startWidth = indicatorWidth;

  const deltaX = targetX - startX;
  const deltaWidth = targetWidth - startWidth;

  const duration = 460;
  let startTime = 0;

  const animate = (time) => {
    if (!startTime) startTime = time;

    const progress = Math.min(
      (time - startTime) / duration,
      1
    );

    const eased = 1 - Math.pow(1 - progress, 4);

    paintNavIndicator(
      startX + deltaX * eased,
      startWidth + deltaWidth * eased
    );

    if (progress < 1) {
      indicatorFrame = requestAnimationFrame(animate);
    } else {
      paintNavIndicator(targetX, targetWidth);
      indicatorFrame = 0;
    }
  };

  indicatorFrame = requestAnimationFrame(animate);
}

function setActiveNav(link) {
  if (!link || link === activeNavLink) return;

  activeNavLink = link;

  navLinks.forEach((item) => {
    item.classList.toggle("active", item === link);
  });

  moveNavIndicator(link);
}

function updateActiveNavFromScroll() {
  navFrame = 0;

  if (navigationTargetLink) return;

  const marker = Math.min(
    window.innerHeight * .42,
    360
  );

  let currentSection = navSections[0];

  for (const section of navSections) {
    if (section.getBoundingClientRect().top <= marker) {
      currentSection = section;
    } else {
      break;
    }
  }

  if (currentSection) {
    const activeLink = navLinks.find(
      (link) => link.hash === `#${currentSection.id}`
    );

    if (activeLink) {
      setActiveNav(activeLink);
    }
  }
}

function requestNavUpdate() {
  if (navFrame) return;

  navFrame = requestAnimationFrame(
    updateActiveNavFromScroll
  );
}

function finishNavScroll() {
  if (!navigationTargetLink) return;

  navigationTargetLink = null;

  if (navScrollSettleTimer) {
    window.clearTimeout(navScrollSettleTimer);
    navScrollSettleTimer = 0;
  }

  updateActiveNavFromScroll();
}

function handleNavScroll() {
  requestNavUpdate();

  if (!navigationTargetLink) return;

  if (navScrollSettleTimer) {
    window.clearTimeout(navScrollSettleTimer);
  }

  navScrollSettleTimer = window.setTimeout(
    finishNavScroll,
    180
  );
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!document.querySelector(link.getAttribute("href"))) {
      return;
    }

    navigationTargetLink = link;
    setActiveNav(link);

    if (navScrollSettleTimer) {
      window.clearTimeout(navScrollSettleTimer);
    }

    navScrollSettleTimer = window.setTimeout(
      finishNavScroll,
      1600
    );
  });
});

window.addEventListener("scroll", handleNavScroll, {
  passive: true
});

window.addEventListener("scrollend", finishNavScroll, {
  passive: true
});

window.addEventListener("resize", () => {
  moveNavIndicator(activeNavLink, true);
  requestNavUpdate();
}, {
  passive: true
});

window.addEventListener("load", () => {
  moveNavIndicator(activeNavLink, true);
  requestNavUpdate();
});

if (document.fonts?.ready) {
  document.fonts.ready.then(() => {
    moveNavIndicator(activeNavLink, true);
  });
}

moveNavIndicator(activeNavLink, true);
requestNavUpdate();

/* -------------------- BACKGROUND POINTER AMBIENT ------------------- */

(() => {
  const glow = document.querySelector("#pointerAmbient");

  if (!glow) return;

  const hasFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!hasFinePointer || prefersReducedMotion) return;

  let x = -700;
  let y = -700;
  let targetX = -700;
  let targetY = -700;
  let frame = 0;
  let hasMoved = false;

  const animateGlow = () => {
    x += (targetX - x) * .14;
    y += (targetY - y) * .14;

    glow.style.transform =
      `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

    if (
      Math.abs(targetX - x) +
      Math.abs(targetY - y) > .45
    ) {
      frame = requestAnimationFrame(animateGlow);
    } else {
      frame = 0;
    }
  };

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;

    targetX = event.clientX;
    targetY = event.clientY;

    if (!hasMoved) {
      x = targetX;
      y = targetY;
      hasMoved = true;
    }

    glow.classList.add("is-visible");

    if (!frame) {
      frame = requestAnimationFrame(animateGlow);
    }
  }, {
    passive: true
  });

  document.documentElement.addEventListener(
    "mouseleave",
    () => {
      glow.classList.remove("is-visible");
    }
  );

  document.documentElement.addEventListener(
    "mouseenter",
    () => {
      if (hasMoved) {
        glow.classList.add("is-visible");
      }
    }
  );
})();

/* ---------------------------- SMALL UI ----------------------------- */

const currentYear = $("#currentYear");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const messageTextInput = $("#messageText");

messageTextInput?.addEventListener("input", () => {
  const charCount = $("#charCount");

  if (charCount) {
    charCount.textContent = messageTextInput.value.length;
  }
});

/* ------------------------------ FIREBASE ---------------------------- */

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith("ISI_") &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.startsWith("ISI_")
);

/* ---------------------------- STATE ---------------------------- */

let db = null;
let auth = null;

let messageCursor = null;
let canLoadMore = true;
let loadingMore = false;

let currentAdmin = false;
let unsubscribeAdminMessages = null;

const messageMap = new Map();
const adminMessageMap = new Map();

/* ---------------------------- ELEMENTS ---------------------------- */

const messageList = $("#messageList");
const messageError = $("#messageError");
const loadMoreButton = $("#loadMoreMessages");
const formStatus = $("#formStatus");
const adminMessageList = $("#adminMessageList");

/* ---------------------------- HELPERS ---------------------------- */

function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getDateLabel(timestamp) {
  if (!timestamp?.toDate) return "Baru saja";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(timestamp.toDate());
}

function setAdminStatus(message) {
  const element = $("#adminStatus");

  if (element) {
    element.textContent = message;
  }
}

function isAdminModeActive() {
  const panel = $("#adminPanel");

  return Boolean(
    currentAdmin &&
    panel &&
    !panel.hidden
  );
}

function setButtonLoading(button, loading, label) {
  if (!button) return;

  button.disabled = loading;
  button.classList.toggle("is-loading", loading);

  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.textContent = label;
  } else if (button.dataset.originalText) {
    button.innerHTML = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

/* ------------------------ PUBLIC MESSAGES ------------------------ */

function renderMessages() {
  if (!messageList) return;

  const messages = [...messageMap.entries()].sort((a, b) => {
    const aTime = a[1].createdAt?.toMillis?.() ?? 0;
    const bTime = b[1].createdAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });

  const countElement = $("#messageCount");

  if (countElement) {
    countElement.textContent =
      messages.length.toLocaleString("id-ID");
  }

  if (!messages.length) {
    messageList.innerHTML = `
      <div class="empty-messages glass-card">
        <span class="empty-message-icon">✧</span>
        <p>Belum ada pesan yang disetujui.</p>
        <small>Jadilah orang pertama yang meninggalkan pesan.</small>
      </div>
    `;

    return;
  }

  const showDelete = isAdminModeActive();

  messageList.innerHTML = messages.map(([id, data]) => {
    const name = escapeText(data.name || "Anonymous");

    const initial = escapeText(
      (data.name || "?").trim().charAt(0).toUpperCase()
    );

    const message = escapeText(data.message || "")
      .replace(/\n/g, "<br>");

    return `
      <article
        class="guest-message glass-card"
        data-message-id="${escapeText(id)}">

        <div class="guest-message-top">
          <span class="guest-avatar">${initial}</span>

          <div class="guest-meta">
            <strong>${name}</strong>
            <time>${escapeText(getDateLabel(data.createdAt))}</time>
          </div>
        </div>

        <p class="guest-message-text">${message}</p>

        ${showDelete ? `
          <div class="admin-message-actions">
            <button
              type="button"
              class="admin-action-delete"
              data-admin-action="delete"
              data-message-id="${escapeText(id)}"
              aria-label="Hapus pesan dari ${name}">
              <span aria-hidden="true">×</span>
              Delete
            </button>
          </div>
        ` : ""}

      </article>
    `;
  }).join("");
}

/* ------------------------ ADMIN MODERATION ------------------------ */

function renderAdminMessages() {
  if (!adminMessageList) return;

  if (!isAdminModeActive()) {
    adminMessageList.innerHTML = "";
    return;
  }

  const messages = [...adminMessageMap.entries()].sort((a, b) => {
    const aTime = a[1].createdAt?.toMillis?.() ?? 0;
    const bTime = b[1].createdAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });

  if (!messages.length) {
    adminMessageList.innerHTML = `
      <div class="empty-messages">
        <span class="empty-message-icon">✧</span>
        <p>All caught up.</p>
        <small>Tidak ada pesan yang menunggu persetujuan.</small>
      </div>
    `;

    return;
  }

  adminMessageList.innerHTML = messages.map(([id, data]) => {
    const name = escapeText(data.name || "Anonymous");

    const initial = escapeText(
      (data.name || "?").trim().charAt(0).toUpperCase()
    );

    const message = escapeText(data.message || "")
      .replace(/\n/g, "<br>");

    return `
      <article
        class="guest-message glass-card admin-message-item"
        data-message-id="${escapeText(id)}">

        <div class="guest-message-top">
          <span class="guest-avatar">${initial}</span>

          <div class="guest-meta">
            <strong>${name}</strong>
            <time>${escapeText(getDateLabel(data.createdAt))}</time>
          </div>

          <span class="message-pending-label">
            <span></span>
            Pending
          </span>
        </div>

        <p class="guest-message-text">${message}</p>

        <div class="admin-message-actions">
          <button
            type="button"
            class="admin-action-approve"
            data-admin-action="approve"
            data-message-id="${escapeText(id)}">
            <span aria-hidden="true">✓</span>
            Approve
          </button>

          <button
            type="button"
            class="admin-action-delete"
            data-admin-action="delete"
            data-message-id="${escapeText(id)}">
            <span aria-hidden="true">×</span>
            Delete
          </button>
        </div>

      </article>
    `;
  }).join("");
}

/* -------------------------- FIREBASE INIT -------------------------- */

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);

    db = getFirestore(app);
    auth = getAuth(app);

    /* PUBLIC MESSAGES */

    const firstPage = query(
      collection(db, "messages"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    onSnapshot(
      firstPage,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "removed") {
            messageMap.delete(change.doc.id);
          } else {
            messageMap.set(
              change.doc.id,
              change.doc.data()
            );
          }
        });

        if (snapshot.docs.length) {
          messageCursor =
            snapshot.docs[snapshot.docs.length - 1];
        }

        canLoadMore = snapshot.docs.length === 20;

        if (loadMoreButton) {
          loadMoreButton.hidden = !canLoadMore;
        }

        renderMessages();

        if (messageError) {
          messageError.textContent = "";
        }
      },
      (error) => {
        console.error("Public message read error:", error);

        if (messageError) {
          messageError.textContent =
            "Pesan gagal dimuat. Periksa Firestore Rules dan indeks database.";
        }
      }
    );

    /* AUTHENTICATION */

    onAuthStateChanged(auth, (user) => {
      currentAdmin = Boolean(
        user &&
        ADMIN_UID &&
        !ADMIN_UID.startsWith("ISI_") &&
        user.uid === ADMIN_UID
      );

      const adminLoginForm = $("#adminLoginForm");
      const adminLoggedIn = $("#adminLoggedIn");

      if (adminLoginForm) {
        adminLoginForm.hidden = currentAdmin;
      }

      if (adminLoggedIn) {
        adminLoggedIn.hidden = !currentAdmin;
      }

      if (!user) {
        setAdminStatus("");
      } else if (!currentAdmin) {
        setAdminStatus(
          "Akun ini tidak memiliki izin admin."
        );
      } else {
        setAdminStatus(
          "Admin berhasil terautentikasi."
        );
      }

      if (unsubscribeAdminMessages) {
        unsubscribeAdminMessages();
        unsubscribeAdminMessages = null;
      }

      adminMessageMap.clear();

      renderMessages();
      renderAdminMessages();

      /* ADMIN PENDING QUEUE */

      if (currentAdmin) {
        const pendingQuery = query(
          collection(db, "messages"),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc")
        );

        unsubscribeAdminMessages = onSnapshot(
          pendingQuery,
          (snapshot) => {
            adminMessageMap.clear();

            snapshot.docs.forEach((messageDoc) => {
              adminMessageMap.set(
                messageDoc.id,
                messageDoc.data()
              );
            });

            renderAdminMessages();
          },
          (error) => {
            console.error(
              "Admin moderation error:",
              error
            );

            setAdminStatus(
              "Antrean gagal dimuat. Periksa Firestore Rules atau indeks."
            );
          }
        );
      }
    });

  } catch (error) {
    console.error(
      "Firebase initialization error:",
      error
    );

    if (messageError) {
      messageError.textContent =
        "Firebase gagal diinisialisasi. Periksa firebase-config.js.";
    }
  }

} else {
  if (messageList) {
    messageList.innerHTML = `
      <div class="empty-messages glass-card">
        <span class="empty-message-icon">✧</span>
        <p>Guestbook belum tersedia.</p>
        <small>Lengkapi konfigurasi Firebase terlebih dahulu.</small>
      </div>
    `;
  }

  if (messageError) {
    messageError.textContent =
      "Lengkapi firebase-config.js dan Firestore Rules sesuai README.md.";
  }

  const countElement = $("#messageCount");

  if (countElement) {
    countElement.textContent = "0";
  }
}

/* -------------------------- SEND MESSAGE -------------------------- */

const messageForm = $("#messageForm");

messageForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = $("#messageName")?.value.trim() ?? "";
  const message = messageTextInput?.value.trim() ?? "";
  const honeypot = $("#websiteField")?.value ?? "";

  if (honeypot) return;

  if (!name || !message) {
    if (formStatus) {
      formStatus.textContent =
        "Nama dan pesan tidak boleh kosong.";
    }

    return;
  }

  if (name.length > 40 || message.length > 600) {
    if (formStatus) {
      formStatus.textContent =
        "Nama atau pesan terlalu panjang.";
    }

    return;
  }

  if (!db) {
    if (formStatus) {
      formStatus.textContent =
        "Firebase belum dikonfigurasi.";
    }

    return;
  }

  const submitButton = $("#sendMessage");

  if (!submitButton) return;

  setButtonLoading(
    submitButton,
    true,
    "Sending..."
  );

  if (formStatus) {
    formStatus.textContent = "Mengirim pesan...";
  }

  try {
    await addDoc(collection(db, "messages"), {
      name,
      message,
      status: "pending",
      createdAt: serverTimestamp()
    });

    messageForm.reset();

    const charCount = $("#charCount");

    if (charCount) {
      charCount.textContent = "0";
    }

    if (formStatus) {
      formStatus.textContent =
        "Pesan berhasil dikirim! Tunggu persetujuan admin sebelum ditampilkan.";
    }

  } catch (error) {
    console.error("Message send error:", error);

    if (formStatus) {
      formStatus.textContent =
        error.code === "permission-denied"
          ? "Pesan ditolak oleh Firestore Rules."
          : "Pesan gagal dikirim. Coba lagi beberapa saat.";
    }

  } finally {
    setButtonLoading(submitButton, false);
  }
});

/* -------------------------- LOAD MORE -------------------------- */

loadMoreButton?.addEventListener("click", async () => {
  if (
    !db ||
    !messageCursor ||
    loadingMore ||
    !canLoadMore
  ) {
    return;
  }

  loadingMore = true;

  setButtonLoading(
    loadMoreButton,
    true,
    "Loading..."
  );

  try {
    const olderQuery = query(
      collection(db, "messages"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      startAfter(messageCursor),
      limit(20)
    );

    const snapshot = await getDocs(olderQuery);

    snapshot.docs.forEach((messageDoc) => {
      messageMap.set(
        messageDoc.id,
        messageDoc.data()
      );
    });

    if (snapshot.docs.length) {
      messageCursor =
        snapshot.docs[snapshot.docs.length - 1];
    }

    canLoadMore = snapshot.docs.length === 20;

    renderMessages();

    loadMoreButton.hidden = !canLoadMore;

  } catch (error) {
    console.error(
      "Load older messages error:",
      error
    );

    if (messageError) {
      messageError.textContent =
        "Pesan sebelumnya gagal dimuat.";
    }

  } finally {
    loadingMore = false;

    setButtonLoading(
      loadMoreButton,
      false
    );
  }
});

/* -------------------------- ADMIN PANEL -------------------------- */

$("#adminToggle")?.addEventListener("click", () => {
  const panel = $("#adminPanel");

  if (!panel) return;

  panel.hidden = !panel.hidden;

  renderMessages();
  renderAdminMessages();

  if (!panel.hidden) {
    panel.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
});

$("#closeAdmin")?.addEventListener("click", () => {
  const panel = $("#adminPanel");

  if (!panel) return;

  panel.hidden = true;

  renderMessages();
  renderAdminMessages();
});

/* -------------------------- ADMIN LOGIN -------------------------- */

$("#adminLoginForm")?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    if (!auth) {
      setAdminStatus(
        "Firebase belum dikonfigurasi."
      );
      return;
    }

    const email = $("#adminEmail")?.value.trim() ?? "";
    const password = $("#adminPassword")?.value ?? "";

    const loginButton = $(
      "#adminLoginForm button[type='submit']"
    );

    setButtonLoading(
      loginButton,
      true,
      "Signing in..."
    );

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setAdminStatus("Login berhasil.");

    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setAdminStatus(
        "Login gagal. Periksa email dan password admin."
      );

    } finally {
      setButtonLoading(
        loginButton,
        false
      );
    }
  }
);

/* -------------------------- ADMIN LOGOUT -------------------------- */

$("#adminLogout")?.addEventListener(
  "click",
  async () => {
    if (!auth) return;

    try {
      await signOut(auth);

      currentAdmin = false;
      adminMessageMap.clear();

      renderMessages();
      renderAdminMessages();

      setAdminStatus("Kamu sudah keluar.");

    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );

      setAdminStatus(
        "Gagal keluar. Coba lagi."
      );
    }
  }
);

/* ----------------------- MODERATION ACTIONS ----------------------- */

document.addEventListener("click", async (event) => {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const button = target.closest("[data-admin-action]");

  if (!button || !isAdminModeActive() || !db) {
    return;
  }

  const action = button.dataset.adminAction;
  const id = button.dataset.messageId;

  if (!id || !["approve", "delete"].includes(action)) {
    return;
  }

  const confirmation = action === "approve"
    ? "Setujui dan tampilkan pesan ini?"
    : "Hapus pesan ini secara permanen?";

  if (!window.confirm(confirmation)) {
    return;
  }

  const messagesRef = doc(db, "messages", id);

  button.disabled = true;

  try {
    if (action === "approve") {
      await updateDoc(messagesRef, {
        status: "approved"
      });

      setAdminStatus(
        "Pesan berhasil dipublikasikan."
      );
    }

    if (action === "delete") {
      await deleteDoc(messagesRef);

      messageMap.delete(id);
      adminMessageMap.delete(id);

      renderMessages();
      renderAdminMessages();

      setAdminStatus(
        "Pesan berhasil dihapus."
      );
    }

  } catch (error) {
    console.error(
      "Moderation action error:",
      error
    );

    setAdminStatus(
      error.code === "permission-denied"
        ? "Aksi ditolak oleh Firestore Rules."
        : "Aksi gagal. Periksa koneksi dan database."
    );

    button.disabled = false;
  }
});
