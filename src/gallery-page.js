import { fetchGallery } from './api.js';

let galleryCache = [];
let currentGalleryFilter = 'all';

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

    // Filters
    setupGalleryFilters();

    // Load data from Supabase
    loadGalleryFeed();
});

async function loadGalleryFeed() {
    try {
        galleryCache = await fetchGallery();

        // Seed default items if empty
        if (galleryCache.length === 0) {
            galleryCache = [
                {
                    type: "photo",
                    media_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop",
                    caption: "Stunning Royal Bridal HD transformation by Babita Poudel.",
                    tag: "Bridal",
                    posted_by: "Babita Poudel",
                    created_at: new Date().toISOString()
                },
                {
                    type: "photo",
                    media_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop",
                    caption: "Engagement glam featuring dewy highlights and soft curls.",
                    tag: "Engagement",
                    posted_by: "Staff Artist",
                    created_at: new Date().toISOString()
                },
                {
                    type: "video",
                    media_url: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-applying-makeup-in-front-of-mirror-40292-large.mp4",
                    caption: "BTS video showing traditional saree draping and gold jewelry setting.",
                    tag: "Syllabus BTS",
                    posted_by: "Babita Poudel",
                    created_at: new Date().toISOString()
                }
            ];
        }

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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
