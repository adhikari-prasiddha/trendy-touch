import { fetchFeedbacks, submitFeedback, fetchGallery } from './api.js';

// Global reference variables
let currentSlideIndex = 0;
let feedbacksCache = [];
let galleryCache = [];
let currentGalleryFilter = 'all';

// Initialize Landing Page
document.addEventListener("DOMContentLoaded", () => {
    // Scroll background changes for Header
    window.addEventListener("scroll", () => {
        const header = document.querySelector(".header");
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
        highlightActiveSection();
    });

    // Mobile Hamburger Toggle
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");
    const mobileNavClose = document.getElementById("mobileNavClose");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", () => mobileNav.classList.add("open"));
    }
    if (mobileNavClose && mobileNav) {
        mobileNavClose.addEventListener("click", () => mobileNav.classList.remove("open"));
    }

    // Interactive Star Rating Setup
    setupStarRating();

    // Clipboard copy buttons
    setupClipboardCopy();

    // Floating Widget Options
    const widgetToggle = document.getElementById("widgetToggle");
    const widgetOptions = document.getElementById("widgetOptions");
    if (widgetToggle && widgetOptions) {
        widgetToggle.addEventListener("click", () => {
            widgetOptions.classList.toggle("open");
        });
    }

    // Feedback Submission handler
    const feedbackForm = document.getElementById("feedbackForm");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", handleFeedbackSubmit);
    }

    // Gallery Filter Tabs handlers
    setupGalleryFilters();

    // Load data from Supabase
    loadTestimonials();
    loadGalleryFeed();
});

// Auto highlighting navbar based on section scroll
function highlightActiveSection() {
    const sections = document.querySelectorAll("section, footer");
    const navLinks = document.querySelectorAll(".nav-link");
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 120)) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
}

// Mobile nav close wrapper helper
window.toggleMobileMenu = function() {
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) {
        mobileNav.classList.toggle("open");
    }
};

// Clipboard copy controls helper
function setupClipboardCopy() {
    const actions = [
        { btn: 'btnCopyPhone', text: '+9779801234567' },
        { btn: 'btnCopyEmail', text: 'info@trendytouchmakeup.com' },
        { btn: 'btnCopyAddress', text: 'Siddhartha chowk, Soondar Marga, Pokhara, Nepal' }
    ];

    actions.forEach(act => {
        const button = document.getElementById(act.btn);
        if (button) {
            button.addEventListener("click", () => {
                navigator.clipboard.writeText(act.text).then(() => {
                    const originalText = button.textContent;
                    button.textContent = "Copied!";
                    button.style.backgroundColor = "var(--color-accent-gold)";
                    button.style.borderColor = "var(--color-accent-gold)";
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.backgroundColor = "";
                        button.style.borderColor = "";
                    }, 2000);
                }).catch(err => console.error("Clipboard copy failed:", err));
            });
        }
    });
}

// Collapsible accordion details
window.toggleAccordion = function(element) {
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

// Load reviews from Supabase and render
async function loadTestimonials() {
    const slider = document.getElementById("testimonialsSlider");
    if (!slider) return;

    try {
        feedbacksCache = await fetchFeedbacks();
        
        // Seed default feedbacks if database is empty
        if (feedbacksCache.length === 0) {
            feedbacksCache = [
                { name: "Nisha Gurung", service: "Premium Bridal Airbrush", rating: 5, comment: "Babita is an absolute genius! My wedding makeup was flawless, sweatproof, and lasted until late night reception. Worth every single Rupee!" },
                { name: "Anjali Karki", service: "Professional Bridal Makeup Course", rating: 5, comment: "Completing the 40 days professional course changed my career. The lessons are thorough and Babita shares all her real-world studio secrets. Highly recommended!" },
                { name: "Roshani Devkota", service: "Glamorous Party Makeup", rating: 4, comment: "Loved the soft eyes and base makeup done for my brother's reception party. Got many compliments. The studio has very pleasant aesthetics too." }
            ];
        }

        renderTestimonials();
        
        // Auto advance every 8 seconds
        setInterval(nextSlide, 8000);

        // Bind control buttons
        const prevBtn = document.getElementById("btnPrevTestimonial");
        const nextBtn = document.getElementById("btnNextTestimonial");
        if (prevBtn) prevBtn.addEventListener("click", prevSlide);
        if (nextBtn) nextBtn.addEventListener("click", nextSlide);

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

    updateSliderPosition();
}

function updateSliderPosition() {
    const slider = document.getElementById("testimonialsSlider");
    if (slider) {
        slider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }
}

function nextSlide() {
    if (feedbacksCache.length === 0) return;
    currentSlideIndex = (currentSlideIndex + 1) % feedbacksCache.length;
    updateSliderPosition();
}

function prevSlide() {
    if (feedbacksCache.length === 0) return;
    currentSlideIndex = (currentSlideIndex - 1 + feedbacksCache.length) % feedbacksCache.length;
    updateSliderPosition();
}

// Feedback Rating Selection
function setupStarRating() {
    const stars = document.querySelectorAll(".star-input");
    const ratingInput = document.getElementById("fbRating");
    if (!stars.length) return;

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const val = parseInt(star.getAttribute("data-value"));
            if (ratingInput) ratingInput.value = val;
            
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute("data-value"));
                if (sVal <= val) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            });
        });
    });
}

// Submit review to Supabase
async function handleFeedbackSubmit(event) {
    event.preventDefault();
    const name = document.getElementById("fbName").value.trim();
    const service = document.getElementById("fbService").value;
    const rating = parseInt(document.getElementById("fbRating").value || 5);
    const comment = document.getElementById("fbComment").value.trim();

    if (!name || !service || !comment) return;

    const newFeedback = {
        name,
        service,
        rating,
        comment
    };

    try {
        const result = await submitFeedback(newFeedback);
        feedbacksCache.unshift(result);
        renderTestimonials();
        
        triggerToast("Review Submitted", `Thank you, ${name}! Your rating has been successfully saved.`, "success");
        
        // Reset Form
        document.getElementById("feedbackForm").reset();
        document.querySelectorAll(".star-input").forEach(s => s.classList.add("active"));
        document.getElementById("fbRating").value = 5;
    } catch (e) {
        triggerToast("Submission Error", "Failed to submit review. Please check connection.", "error");
    }
}

// Load public gallery from Supabase and render
async function loadGalleryFeed() {
    try {
        galleryCache = await fetchGallery();
        renderGallery(currentGalleryFilter);
    } catch (e) {
        console.error("Failed to load gallery:", e);
    }
}

function setupGalleryFilters() {
    const allBtn = document.getElementById("galleryFilterAll");
    const photoBtn = document.getElementById("galleryFilterPhoto");
    const videoBtn = document.getElementById("galleryFilterVideo");

    if (allBtn) {
        allBtn.addEventListener("click", () => {
            setActiveFilterBtn(allBtn);
            renderGallery('all');
        });
    }
    if (photoBtn) {
        photoBtn.addEventListener("click", () => {
            setActiveFilterBtn(photoBtn);
            renderGallery('photo');
        });
    }
    if (videoBtn) {
        videoBtn.addEventListener("click", () => {
            setActiveFilterBtn(videoBtn);
            renderGallery('video');
        });
    }
}

function setActiveFilterBtn(activeBtn) {
    document.querySelectorAll(".gallery-filter-btn").forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
}

function renderGallery(filter) {
    currentGalleryFilter = filter;
    const grid = document.getElementById("galleryFeedGrid");
    const emptyState = document.getElementById("galleryEmptyState");
    if (!grid) return;

    let posts = galleryCache;
    if (currentGalleryFilter !== 'all') {
        posts = galleryCache.filter(p => p.type === currentGalleryFilter);
    }

    grid.innerHTML = "";
    if (posts.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }
    if (emptyState) emptyState.style.display = "none";

    posts.forEach(post => {
        const card = document.createElement("div");
        card.className = "gallery-post-card";
        card.setAttribute("data-type", post.type);

        const mediaHtml = post.type === "video"
            ? `<div class="gallery-post-media">
                  <video src="${post.media_url}" preload="metadata" loop muted playsinline
                         onmouseenter="this.play()" onmouseleave="this.pause()"></video>
                  <div class="video-play-overlay"><span>&#9654;</span></div>
               </div>`
            : `<div class="gallery-post-media">
                  <img src="${post.media_url}" alt="${escapeHtml(post.caption)}" loading="lazy">
               </div>`;

        const friendlyDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        card.innerHTML = `
            ${mediaHtml}
            <div class="gallery-post-info">
                <div class="gallery-tag-badge">${escapeHtml(post.tag)}</div>
                <p class="gallery-post-caption">${escapeHtml(post.caption)}</p>
                <div class="gallery-post-meta">
                    <span class="gallery-artist">&#128247; ${escapeHtml(post.posted_by)}</span>
                    <span class="gallery-date">${friendlyDate}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// In-app Toast Messages UI
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

// HTML Escaper for Security
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
