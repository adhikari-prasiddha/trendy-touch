import { fetchFeedbacks, submitFeedback } from './api.js';

let currentSlideIndex = 0;
let feedbacksCache = [];

document.addEventListener("DOMContentLoaded", () => {
    // Header scroll effect
    window.addEventListener("scroll", () => {
        const header = document.querySelector(".header");
        if (header) header.classList.toggle("scrolled", window.scrollY > 50);
    }, { passive: true });

    // Mobile nav toggle
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
        mobileNavClose.addEventListener("click", () => mobileNav.classList.remove("open"));
    }
    document.addEventListener("click", (e) => {
        if (mobileNav && mobileNav.classList.contains("open")) {
            if (!mobileNav.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
                mobileNav.classList.remove("open");
            }
        }
    });

    // Feedback Rating Selection
    setupStarRating();

    // Feedback Submission handler
    const feedbackForm = document.getElementById("feedbackForm");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", handleFeedbackSubmit);
    }

    // Load data from Supabase
    loadTestimonials();
});

// Interactive Star Rating Setup
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
