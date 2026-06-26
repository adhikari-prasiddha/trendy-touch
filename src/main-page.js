import { fetchFeedbacks, fetchStudents } from './api.js';
import { supabase } from './supabase.js';

// Global variables
let currentSlideIndex = 0;
let feedbacksCache = [];
let homeGalleryIndex = 0;
let homeGalleryAutoTimer = null;

const homeGalleryItems = [
    {
        type: "photo",
        media_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop",
        caption: "Stunning Royal Bridal HD transformation by Babita Poudel.",
        tag: "Bridal Signature"
    },
    {
        type: "video",
        media_url: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-applying-makeup-in-front-of-mirror-40292-large.mp4",
        caption: "BTS video: traditional saree draping and gold jewelry setting.",
        tag: "Studio BTS"
    },
    {
        type: "photo",
        media_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&auto=format&fit=crop",
        caption: "Engagement glam featuring dewy highlights and soft curls.",
        tag: "Engagement Glow"
    },
    {
        type: "video",
        media_url: "https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-creative-project-at-home-40192-large.mp4",
        caption: "Founder Babita Poudel demonstrating professional blending techniques.",
        tag: "Masterclass Clip"
    },
    {
        type: "photo",
        media_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&auto=format&fit=crop",
        caption: "Glamorous night-out look with deep kohl eyes and bold lips.",
        tag: "Evening Glam"
    }
];

const COURSE_LIMITS = {
    "Self-Makeup Mastery Course": 15,
    "Professional Bridal Makeup Course": 10
};

// =============================================
// PAGE INITIALIZATION
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Header scroll effect
    window.addEventListener("scroll", handleScrollEffects, { passive: true });
    handleScrollEffects(); // Trigger immediately to evaluate admin visibility on load

    // 2. Navigation highlight
    highlightPageNavigation();

    // 3. Mobile hamburger menu
    initMobileNav();

    // 4. Owner biography modal
    initOwnerModal();

    // 5. Home gallery carousel
    initHomeGallerySlides();

    // 6. Clipboard copy buttons
    setupClipboardCopy();

    // 7. Course seat availability (only relevant on home page)
    updateSeatsCount();
    subscribeToSeatsRealtime();

    // 8. Testimonials slider
    loadTestimonials();
});

// =============================================
// SCROLL EFFECTS
// =============================================
function handleScrollEffects() {
    // Header background on scroll
    const header = document.querySelector(".header");
    if (header) {
        header.classList.toggle("scrolled", window.scrollY > 50);
    }

    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = document.body.offsetHeight;

    // Floating map button — appears near footer
    const mapBtn = document.getElementById("mapLocationBtn");
    if (mapBtn) {
        mapBtn.classList.toggle("show", scrollBottom >= docHeight - 800);
    }

    // Floating Admin button — appears near footer if user is authorized staff/admin
    const adminBtn = document.getElementById("adminPortalBtn");
    if (adminBtn) {
        const urlParams = new URLSearchParams(window.location.search);
        const hasStaffParam = urlParams.has("role") && urlParams.get("role") === "staff";
        const hasStaffStorage = localStorage.getItem("trendyTouchRole") === "staff";

        if (hasStaffParam || hasStaffStorage) {
            // Save state so parameter isn't needed on next reload
            if (hasStaffParam) localStorage.setItem("trendyTouchRole", "staff");

            adminBtn.style.display = "flex";
            // Check scroll bottom condition just like mapBtn
            const isNearBottom = scrollBottom >= docHeight - 800;
            if (isNearBottom) {
                adminBtn.style.opacity = "1";
                adminBtn.style.pointerEvents = "auto";
                adminBtn.style.transform = "scale(1) translateY(0)";
            } else {
                adminBtn.style.opacity = "0";
                adminBtn.style.pointerEvents = "none";
                adminBtn.style.transform = "scale(0.8) translateY(20px)";
            }
        } else {
            adminBtn.style.display = "none";
        }
    }
}

// =============================================
// NAVIGATION
// =============================================
function highlightPageNavigation() {
    const path = window.location.pathname;
    let page = path.split("/").pop();
    if (page && page.endsWith(".html")) {
        page = page.substring(0, page.length - 5);
    }
    if (!page || page === "index") {
        page = "";
    }
    document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(link => {
        let href = link.getAttribute("href");
        if (href) {
            // Strip leading slash if present, and remove .html or query parameters
            let urlPart = href.split("?")[0].split("#")[0];
            if (urlPart.endsWith(".html")) {
                urlPart = urlPart.substring(0, urlPart.length - 5);
            }
            if (urlPart === "/" || urlPart === "./" || urlPart === "index") {
                urlPart = "";
            }
            const isActive = urlPart === page;
            link.classList.toggle("active", isActive);
        }
    });
}

function initMobileNav() {
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");
    const mobileNavClose = document.getElementById("mobileNavClose");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            mobileNav.classList.add("open");
        });
    }
    if (mobileNavClose && mobileNav) {
        mobileNavClose.addEventListener("click", () => {
            mobileNav.classList.remove("open");
        });
    }

    // Close when clicking outside nav
    document.addEventListener("click", (e) => {
        if (mobileNav && mobileNav.classList.contains("open")) {
            if (!mobileNav.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
                mobileNav.classList.remove("open");
            }
        }
    });

    // Close nav links on click (navigates to new page)
    document.querySelectorAll(".mobile-nav-link").forEach(link => {
        link.addEventListener("click", () => {
            if (mobileNav) mobileNav.classList.remove("open");
        });
    });
}

// Global toggle for inline onclick (used in some pages)
window.toggleMobileMenu = function () {
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) mobileNav.classList.toggle("open");
};

// =============================================
// OWNER BIOGRAPHY MODAL
// =============================================
function initOwnerModal() {
    const ownerTrigger = document.getElementById("ownerPhotoTrigger");
    const ownerModal = document.getElementById("ownerModal");
    const ownerClose = document.getElementById("ownerModalClose");

    if (ownerTrigger && ownerModal) {
        ownerTrigger.addEventListener("click", () => {
            ownerModal.classList.add("open");
            document.body.style.overflow = "hidden";
        });
    }

    if (ownerModal) {
        if (ownerClose) {
            ownerClose.addEventListener("click", closeOwnerModal);
        }
        ownerModal.addEventListener("click", (e) => {
            if (e.target === ownerModal) closeOwnerModal();
        });
    }
}

function closeOwnerModal() {
    const ownerModal = document.getElementById("ownerModal");
    if (ownerModal) ownerModal.classList.remove("open");
    document.body.style.overflow = "";
}

// =============================================
// HOME GALLERY SLIDESHOW
// =============================================
function initHomeGallerySlides() {
    const slidesContainer = document.getElementById("homeGallerySlides");
    if (!slidesContainer) return;

    slidesContainer.innerHTML = "";

    homeGalleryItems.forEach((item, i) => {
        const slide = document.createElement("div");
        slide.className = "home-gallery-slide" + (i === 0 ? " active" : "");

        const mediaHtml = item.type === "video"
            ? `<video src="${item.media_url}" autoplay muted loop playsinline></video>`
            : `<img src="${item.media_url}" alt="${escapeHtml(item.caption)}" loading="${i === 0 ? 'eager' : 'lazy'}">`;

        slide.innerHTML = `
            ${mediaHtml}
            <div class="home-gallery-slide-overlay">
                <span class="gallery-slide-tag">${escapeHtml(item.tag)}</span>
                <p class="home-gallery-caption">${escapeHtml(item.caption)}</p>
            </div>
        `;
        slidesContainer.appendChild(slide);
    });

    // Arrow buttons
    const prevBtn = document.getElementById("btnPrevHomeGallery");
    const nextBtn = document.getElementById("btnNextHomeGallery");
    if (prevBtn) prevBtn.addEventListener("click", () => changeHomeGallerySlide(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => changeHomeGallerySlide(1));

    // Auto advance every 5 seconds
    homeGalleryAutoTimer = setInterval(() => changeHomeGallerySlide(1), 5000);

    // Build dot indicators
    buildGalleryDots();
}

function buildGalleryDots() {
    const carousel = document.querySelector(".home-gallery-carousel");
    if (!carousel) return;

    let dotsContainer = carousel.querySelector(".gallery-dots");
    if (!dotsContainer) {
        dotsContainer = document.createElement("div");
        dotsContainer.className = "gallery-dots";
        carousel.appendChild(dotsContainer);
    }

    homeGalleryItems.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "gallery-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", `Slide ${i + 1}`);
        dot.addEventListener("click", () => goToHomeGallerySlide(i));
        dotsContainer.appendChild(dot);
    });
}

function changeHomeGallerySlide(direction) {
    const slides = document.querySelectorAll(".home-gallery-slide");
    if (!slides.length) return;
    const newIndex = (homeGalleryIndex + direction + slides.length) % slides.length;
    goToHomeGallerySlide(newIndex);
}

function goToHomeGallerySlide(newIndex) {
    const slides = document.querySelectorAll(".home-gallery-slide");
    const dots = document.querySelectorAll(".gallery-dot");

    if (slides[homeGalleryIndex]) slides[homeGalleryIndex].classList.remove("active");
    if (dots[homeGalleryIndex]) dots[homeGalleryIndex].classList.remove("active");

    homeGalleryIndex = newIndex;

    if (slides[homeGalleryIndex]) slides[homeGalleryIndex].classList.add("active");
    if (dots[homeGalleryIndex]) dots[homeGalleryIndex].classList.add("active");
}

// =============================================
// COURSE SEAT AVAILABILITY (Home Page)
// =============================================
async function updateSeatsCount() {
    // Only run if seat counter elements exist
    const selfMakeupEl = document.getElementById("seats-self-makeup");
    const bridalMakeupEl = document.getElementById("seats-bridal-makeup");
    if (!selfMakeupEl && !bridalMakeupEl) return;

    try {
        const students = await fetchStudents();
        const counts = {
            "Self-Makeup Mastery Course": 0,
            "Professional Bridal Makeup Course": 0
        };

        students.forEach(student => {
            if (student.status !== "Dropped" && counts[student.course_name] !== undefined) {
                counts[student.course_name]++;
            }
        });

        if (selfMakeupEl) {
            const total = COURSE_LIMITS["Self-Makeup Mastery Course"];
            const left = total - (counts["Self-Makeup Mastery Course"] || 0);
            selfMakeupEl.innerHTML = left <= 0
                ? `<span class="text-danger" style="font-weight:700;">❌ Course Full (0 / ${total} seats left)</span>`
                : `🔥 Only <strong>${left}</strong> of ${total} seats remaining!`;
        }

        if (bridalMakeupEl) {
            const total = COURSE_LIMITS["Professional Bridal Makeup Course"];
            const left = total - (counts["Professional Bridal Makeup Course"] || 0);
            bridalMakeupEl.innerHTML = left <= 0
                ? `<span style="color:#ff8a80;font-weight:bold;">❌ Course Full (0 / ${total} seats left)</span>`
                : `✨ Only <strong>${left}</strong> of ${total} seats remaining!`;
        }
    } catch (e) {
        console.warn("Seats update skipped:", e.message);
        if (selfMakeupEl) selfMakeupEl.innerHTML = "Inquire for availability";
        if (bridalMakeupEl) bridalMakeupEl.innerHTML = "Inquire for availability";
    }
}

function subscribeToSeatsRealtime() {
    if (!supabase) return;
    try {
        supabase
            .channel('home-students-watch')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
                updateSeatsCount();
            })
            .subscribe();
    } catch (e) {
        console.warn("Realtime seat watch not available:", e.message);
    }
}

// =============================================
// CLIPBOARD COPY
// =============================================
function setupClipboardCopy() {
    const actions = [
        { btn: 'btnCopyPhone', text: '+9779801234567' },
        { btn: 'btnCopyEmail', text: 'info@trendytouchmakeup.com' },
        { btn: 'btnCopyAddress', text: 'Siddhartha chowk, Soondar Marga, Pokhara, Nepal' }
    ];

    actions.forEach(act => {
        const button = document.getElementById(act.btn);
        if (!button) return;
        button.addEventListener("click", () => {
            navigator.clipboard.writeText(act.text).then(() => {
                const orig = button.textContent;
                button.textContent = "Copied!";
                button.style.backgroundColor = "var(--color-accent-gold)";
                button.style.color = "#000";
                setTimeout(() => {
                    button.textContent = orig;
                    button.style.backgroundColor = "";
                    button.style.color = "";
                }, 2000);
            }).catch(err => console.error("Clipboard copy failed:", err));
        });
    });
}

// =============================================
// ACCORDION (used on services/packages pages)
// =============================================
window.toggleAccordion = function (element) {
    const parent = element.parentElement;
    const items = parent.querySelectorAll(".accordion-item");
    const isActive = element.classList.contains("active");

    items.forEach(item => {
        item.classList.remove("active");
        const icon = item.querySelector(".accordion-icon");
        if (icon) icon.textContent = "+";
    });

    if (!isActive) {
        element.classList.add("active");
        const icon = element.querySelector(".accordion-icon");
        if (icon) icon.textContent = "-";
    }
};

// =============================================
// TESTIMONIALS SLIDER
// =============================================
async function loadTestimonials() {
    const slider = document.getElementById("testimonialsSlider");
    if (!slider) return;

    try {
        feedbacksCache = await fetchFeedbacks();

        if (feedbacksCache.length === 0) {
            feedbacksCache = [
                { name: "Nisha Gurung", service: "Premium Bridal Airbrush", rating: 5, comment: "Babita is an absolute genius! My wedding makeup was flawless, sweatproof, and lasted until late night reception. Worth every single Rupee!" },
                { name: "Anjali Karki", service: "Professional Bridal Makeup Course", rating: 5, comment: "Completing the 40 days professional course changed my career. The lessons are thorough and Babita shares all her real-world studio secrets. Highly recommended!" },
                { name: "Roshani Devkota", service: "Glamorous Party Makeup", rating: 4, comment: "Loved the soft eyes and base makeup done for my brother's reception party. Got many compliments. The studio has very pleasant aesthetics too." }
            ];
        }

        renderTestimonials();
        setInterval(nextTestimonialSlide, 8000);

        const prevBtn = document.getElementById("btnPrevTestimonial");
        const nextBtn = document.getElementById("btnNextTestimonial");
        if (prevBtn) prevBtn.addEventListener("click", prevTestimonialSlide);
        if (nextBtn) nextBtn.addEventListener("click", nextTestimonialSlide);

    } catch (e) {
        console.error("Testimonials loading failed:", e);
    }
}

function renderTestimonials() {
    const slider = document.getElementById("testimonialsSlider");
    if (!slider) return;
    slider.innerHTML = "";

    feedbacksCache.forEach(fb => {
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= fb.rating ? "&#9733;" : "&#9734;";
        }
        const slide = document.createElement("div");
        slide.className = "testimonial-slide";
        slide.innerHTML = `
            <div class="stars">${starsHtml}</div>
            <p class="testimonial-comment">"${escapeHtml(fb.comment)}"</p>
            <div class="testimonial-author">
                <h4>${escapeHtml(fb.name)}</h4>
                <p>${escapeHtml(fb.service)}</p>
            </div>
        `;
        slider.appendChild(slide);
    });

    updateTestimonialPosition();
}

function updateTestimonialPosition() {
    const slider = document.getElementById("testimonialsSlider");
    if (slider) slider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
}

function nextTestimonialSlide() {
    if (!feedbacksCache.length) return;
    currentSlideIndex = (currentSlideIndex + 1) % feedbacksCache.length;
    updateTestimonialPosition();
}

function prevTestimonialSlide() {
    if (!feedbacksCache.length) return;
    currentSlideIndex = (currentSlideIndex - 1 + feedbacksCache.length) % feedbacksCache.length;
    updateTestimonialPosition();
}

// =============================================
// UTILITY: HTML ESCAPER
// =============================================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// In-app toast notification
function triggerToast(title, message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${escapeHtml(title)}</div>
            <div class="toast-msg">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 400);
    }, 6000);
}
