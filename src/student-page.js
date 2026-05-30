import { loginStudent, logoutUser, getCurrentUser } from './auth.js';
import { fetchStudentByStudentId, fetchGallery, submitFeedback } from './api.js';

let currentStudent = null;

document.addEventListener("DOMContentLoaded", () => {
    // Login form
    const loginForm = document.getElementById("studentLoginForm");
    if (loginForm) loginForm.addEventListener("submit", handleStudentLogin);

    // Logout
    const logoutBtn = document.getElementById("btnStudentLogout");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

    // Feedback form
    const feedbackForm = document.getElementById("studentFeedbackForm");
    if (feedbackForm) feedbackForm.addEventListener("submit", handleFeedbackSubmit);

    // Star rating setup
    setupStarRating();

    // Tab switching
    document.getElementById("tabBtnMyCourse")?.addEventListener("click", () => switchPortalTab("myCourse"));
    document.getElementById("tabBtnGalleryFeed")?.addEventListener("click", () => switchPortalTab("galleryFeed"));
    document.getElementById("tabBtnFeedback")?.addEventListener("click", () => switchPortalTab("feedback"));
});

// ========== AUTHENTICATION ==========

async function handleStudentLogin(event) {
    event.preventDefault();
    const studentIdInput = document.getElementById("studentId").value.trim().toLowerCase();
    const password = document.getElementById("studentPassword").value;
    const errorEl = document.getElementById("studentLoginError");
    const submitBtn = document.getElementById("btnStudentLogin");

    errorEl.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
        // Build fake email from student_id pattern used during enrollment
        const fakeEmail = `${studentIdInput}@trendytouch.academy`;
        await loginStudent(fakeEmail, password);

        // Fetch student record from DB
        const student = await fetchStudentByStudentId(studentIdInput);

        if (!student) {
            throw new Error("Student record not found. Please contact the studio.");
        }

        if (student.status !== "Confirmed") {
            await logoutUser();
            throw new Error(`Your enrollment is still "${student.status}". Please visit the studio for physical verification first.`);
        }

        currentStudent = student;
        showStudentPortal(student);
    } catch (err) {
        console.error("Student login error:", err);
        errorEl.textContent = err.message || "Invalid Student ID or password. Please try again.";
        errorEl.style.display = "block";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Access My Portal";
    }
}

async function handleLogout() {
    await logoutUser();
    currentStudent = null;
    document.getElementById("studentPortalView").style.display = "none";
    document.getElementById("studentLoginView").style.display = "flex";
    document.getElementById("studentId").value = "";
    document.getElementById("studentPassword").value = "";
    document.getElementById("studentLoginError").style.display = "none";
}

// ========== STUDENT PORTAL ==========

function showStudentPortal(student) {
    document.getElementById("studentLoginView").style.display = "none";
    document.getElementById("studentPortalView").style.display = "block";

    // Populate header greeting
    document.getElementById("portalStudentName").textContent = student.name;
    document.getElementById("portalCourseName").textContent = student.course_name;
    document.getElementById("portalStudentId").textContent = student.student_id;
    document.getElementById("portalStartDate").textContent = student.start_date
        ? new Date(student.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : "To be confirmed";

    renderCourseContent(student.course_name);
    loadPublicGallery();
    prefillFeedbackForm(student);
    switchPortalTab("myCourse");
}

// ========== COURSE CONTENT ==========

function renderCourseContent(courseName) {
    const container = document.getElementById("myCourseContent");
    if (!container) return;

    const curriculumMap = {
        "Full Bridal Makeup": {
            icon: "💄",
            duration: "3 Months",
            description: "Master the complete art of bridal makeup from skin prep to final look.",
            modules: [
                { title: "Skin Analysis & Preparation", topics: ["Understanding skin types", "Cleansing & moisturising", "Primer application techniques", "Coverage vs natural looks"] },
                { title: "Foundation & Contouring", topics: ["Shade matching", "Blending techniques", "HD & airbrush foundation", "Contouring for different face shapes"] },
                { title: "Eye Makeup Mastery", topics: ["Eye shapes & corrections", "Eyeshadow blending", "Eyeliner techniques (pencil, gel, liquid)", "Classic & smoky eye looks"] },
                { title: "Bridal Specific Looks", topics: ["Terai & Hill bridal styles", "Traditional & modern bridal looks", "Long-lasting setting techniques", "Touch-up kit preparation"] },
                { title: "Final Assessment", topics: ["Live model bridal look", "Portfolio shoot", "Certificate presentation"] }
            ]
        },
        "Hair Styling": {
            icon: "✂️",
            duration: "2 Months",
            description: "Comprehensive hair styling covering cuts, colour, and advanced styling techniques.",
            modules: [
                { title: "Hair Science & Tools", topics: ["Hair types & textures", "Professional tool usage", "Sectioning techniques", "Client consultation"] },
                { title: "Basic Cuts & Styling", topics: ["Blunt cuts", "Layered cuts", "Bob styles", "Blow-dry & setting"] },
                { title: "Advanced Techniques", topics: ["Keratin & smoothening", "Perming & relaxing", "Hair extensions", "Updos & braids"] },
                { title: "Colour & Highlights", topics: ["Colour theory basics", "Balayage & ombre", "Highlights & lowlights", "Toning & glossing"] },
                { title: "Professional Assessment", topics: ["Client model styling", "Portfolio creation", "Certificate presentation"] }
            ]
        },
        "Mehndi Art": {
            icon: "🌿",
            duration: "6 Weeks",
            description: "Learn traditional and modern mehndi designs from beginner to advanced.",
            modules: [
                { title: "Foundations", topics: ["Mehndi paste preparation", "Cone making", "Pressure & flow control", "Basic patterns"] },
                { title: "Traditional Designs", topics: ["Nepali & Terai patterns", "Rajasthani style", "Peacock motifs", "Floral patterns"] },
                { title: "Modern Designs", topics: ["Arabic & Indo-Arabic", "Geometric patterns", "Minimalist designs", "Glitter & coloured mehndi"] },
                { title: "Bridal Mehndi", topics: ["Full hand bridal designs", "Feet mehndi", "Hidden groom name art", "Multi-session planning"] }
            ]
        },
        "Saree Draping": {
            icon: "🥻",
            duration: "4 Weeks",
            description: "Master the art of draping sarees in multiple regional and contemporary styles.",
            modules: [
                { title: "Basics & Fabrics", topics: ["Saree types & fabrics", "Petticoat & blouse fitting", "Basic Nivi drape", "Pin placement"] },
                { title: "Regional Styles", topics: ["Nepali traditional drape", "Bengali style", "Gujarati style", "Maharashtrian style"] },
                { title: "Contemporary & Bridal", topics: ["Modern pre-stitched styles", "Lehenga-style drape", "Bridal saree draping", "Quick draping for events"] }
            ]
        }
    };

    const course = Object.keys(curriculumMap).find(k => courseName?.includes(k)) || null;
    const data = curriculumMap[course] || {
        icon: "📚",
        duration: "Ongoing",
        description: `Your ${courseName} course. Contact the studio for your detailed curriculum.`,
        modules: []
    };

    const modulesHtml = data.modules.length > 0 ? data.modules.map((mod, i) => `
        <div class="course-module-card">
            <div class="module-header" onclick="this.parentElement.classList.toggle('open')">
                <span class="module-num">Module ${i + 1}</span>
                <span class="module-title">${mod.title}</span>
                <span class="module-chevron">▼</span>
            </div>
            <div class="module-body">
                <ul class="topic-list">
                    ${mod.topics.map(t => `<li>✓ ${t}</li>`).join("")}
                </ul>
            </div>
        </div>
    `).join("") : `<p class="text-muted">Course curriculum will be available after your first class. Please check back after visiting the studio.</p>`;

    container.innerHTML = `
        <div class="course-overview-card">
            <div class="course-overview-icon">${data.icon}</div>
            <div class="course-overview-info">
                <h3>${courseName}</h3>
                <p>${data.description}</p>
                <div class="course-meta-chips">
                    <span class="meta-chip">⏱ Duration: ${data.duration}</span>
                    <span class="meta-chip">📍 Trendy Touch Studio, Siddhartha Chowk, Pokhara</span>
                    <span class="meta-chip">🗓 Classes as per schedule</span>
                </div>
            </div>
        </div>

        <h4 style="margin: 24px 0 12px; font-family: var(--font-heading); color: var(--color-text-dark);">Course Curriculum</h4>
        <div class="module-accordion">
            ${modulesHtml}
        </div>

        <div class="studio-info-box">
            <h5>📌 Studio Contact</h5>
            <p>If you have any questions about your course, please contact our team:</p>
            <div class="contact-items">
                <a href="tel:+977-9813261928">📞 +977-9813261928</a>
                <a href="https://www.facebook.com/trendytouchwithRajukumari" target="_blank">💬 Message on Facebook</a>
                <a href="https://maps.google.com" target="_blank">📍 View Location on Maps</a>
            </div>
        </div>
    `;
}

// ========== GALLERY FEED ==========

async function loadPublicGallery() {
    const container = document.getElementById("galleryFeedContainer");
    if (!container) return;

    container.innerHTML = `<div class="gallery-loading"><div class="spinner"></div><p>Loading gallery…</p></div>`;

    try {
        const posts = await fetchGallery();

        if (!posts || posts.length === 0) {
            container.innerHTML = `<p class="text-center text-muted" style="padding: 40px 0;">No gallery posts yet. Check back soon!</p>`;
            return;
        }

        container.innerHTML = "";

        posts.forEach(post => {
            const card = document.createElement("div");
            card.className = "gallery-feed-card";

            const isVideo = post.type === "video";
            const mediaHtml = isVideo
                ? `<video class="gallery-feed-media" src="${post.media_url}" controls preload="metadata"></video>`
                : `<img class="gallery-feed-media" src="${post.media_url}" alt="${escapeHtml(post.caption)}" loading="lazy">`;

            const friendlyDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            card.innerHTML = `
                <div class="gallery-feed-media-wrapper">
                    ${mediaHtml}
                    <span class="gallery-feed-tag-badge">${escapeHtml(post.tag)}</span>
                </div>
                <div class="gallery-feed-caption">
                    <p>${escapeHtml(post.caption)}</p>
                    <small>by <strong>${escapeHtml(post.posted_by)}</strong> · ${friendlyDate}</small>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        container.innerHTML = `<p class="text-center text-muted">Could not load gallery. Please try again.</p>`;
    }
}

// ========== FEEDBACK ==========

function prefillFeedbackForm(student) {
    const nameInput = document.getElementById("feedbackName");
    const serviceInput = document.getElementById("feedbackService");
    if (nameInput) nameInput.value = student.name;
    if (serviceInput) serviceInput.value = student.course_name;
}

function setupStarRating() {
    const stars = document.querySelectorAll(".star-btn");
    let selected = 5;

    stars.forEach(star => {
        star.addEventListener("mouseenter", () => {
            const val = parseInt(star.getAttribute("data-value"));
            highlightStars(stars, val);
        });
        star.addEventListener("mouseleave", () => {
            highlightStars(stars, selected);
        });
        star.addEventListener("click", () => {
            selected = parseInt(star.getAttribute("data-value"));
            highlightStars(stars, selected);
            document.getElementById("selectedRating").value = selected;
        });
    });

    highlightStars(stars, selected);
}

function highlightStars(stars, value) {
    stars.forEach(s => {
        const v = parseInt(s.getAttribute("data-value"));
        s.classList.toggle("active", v <= value);
    });
}

async function handleFeedbackSubmit(event) {
    event.preventDefault();
    const name = document.getElementById("feedbackName").value.trim();
    const service = document.getElementById("feedbackService").value.trim();
    const rating = parseInt(document.getElementById("selectedRating").value);
    const comment = document.getElementById("feedbackComment").value.trim();
    const submitBtn = document.getElementById("btnFeedbackSubmit");

    if (!comment || !rating) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        await submitFeedback({ name, service, rating, comment });

        document.getElementById("feedbackComment").value = "";
        triggerToast("Thank You! 🌟", "Your feedback has been submitted and helps us grow!", "success");

        const btnEl = document.getElementById("btnFeedbackSubmit");
        if (btnEl) {
            btnEl.textContent = "✓ Feedback Submitted";
            btnEl.style.background = "#27AE60";
            setTimeout(() => {
                btnEl.textContent = "Submit Feedback";
                btnEl.style.background = "";
                btnEl.disabled = false;
            }, 4000);
        }
    } catch (err) {
        triggerToast("Submission Error", err.message || "Failed to submit feedback. Please try again.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Feedback";
    }
}

// ========== TABS ==========

function switchPortalTab(tabName) {
    document.querySelectorAll(".portal-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".portal-tab-panel").forEach(panel => panel.classList.remove("active"));

    document.getElementById(`portal-${tabName}`)?.classList.add("active");
    const tabMap = { myCourse: "tabBtnMyCourse", galleryFeed: "tabBtnGalleryFeed", feedback: "tabBtnFeedback" };
    document.getElementById(tabMap[tabName])?.classList.add("active");
}

// ========== UTILS ==========

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
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
