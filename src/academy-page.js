import { createStudentInquiry, fetchStudents } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Set minimum date on enrollment form
    const dateInput = document.getElementById("enrollDate");
    if (dateInput) {
        dateInput.min = new Date().toISOString().split("T")[0];
    }

    // 2. Handle course selection from query param
    parseQueryParams();

    // 3. Handle Enroll triggers from course cards
    document.querySelectorAll(".btn-enroll-trigger").forEach(btn => {
        btn.addEventListener("click", () => {
            const courseName = btn.getAttribute("data-course");
            scrollToFormWithCourse(courseName);
        });
    });

    // 4. Handle enrollment form submission
    const form = document.getElementById("enrollmentForm");
    if (form) {
        form.addEventListener("submit", handleEnrollmentSubmit);
    }
});

function parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const courseParam = params.get("course");
    if (courseParam) {
        const courseInput = document.getElementById("enrollCourse");
        if (courseInput) courseInput.value = courseParam;
    }
}

function scrollToFormWithCourse(courseName) {
    const courseInput = document.getElementById("enrollCourse");
    if (courseInput) courseInput.value = courseName;

    const section = document.getElementById("enrollmentSection");
    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

async function handleEnrollmentSubmit(event) {
    event.preventDefault();

    const courseName = document.getElementById("enrollCourse").value;
    const name = document.getElementById("enrollName").value.trim();
    const phone = document.getElementById("enrollPhone").value.trim();
    const email = document.getElementById("enrollEmail").value.trim();
    const date = document.getElementById("enrollDate").value;
    const note = document.getElementById("enrollNote").value.trim();
    const studentId = document.getElementById("enrollStudentId").value.trim().toLowerCase();
    const password = document.getElementById("enrollPassword").value;

    if (!name || !phone || !email || !date || !studentId || !password) return;

    // Validate studentId format - only alphanumeric
    if (!/^[a-z0-9]+$/.test(studentId)) {
        triggerToast("Invalid Username", "Student ID can only contain letters and numbers (no spaces).", "error");
        return;
    }

    // Password minimum length check
    if (password.length < 6) {
        triggerToast("Weak Password", "Password must be at least 6 characters long.", "error");
        return;
    }

    // Disable button to prevent double submission
    const submitBtn = document.getElementById("btnSubmitEnrollment");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
    }

    // Calculate next working day for physical verification
    const visitDate = getNextWorkingDay(new Date());
    const friendlyVisitDate = formatWorkingDayFriendly(visitDate);

    const newStudent = {
        student_id: studentId,
        name,
        phone,
        email,
        course_name: courseName,
        start_date: date,
        note: note || "",
        status: "Pre-Booked",
        visit_date: visitDate
    };

    try {
        await createStudentInquiry(newStudent, password);

        // Reset form
        document.getElementById("enrollmentForm").reset();
        document.getElementById("enrollDate").min = new Date().toISOString().split("T")[0];

        // Show success toast
        triggerToast(
            "Seat Pre-Booked! 🎉",
            `${name}, your inquiry is submitted! Please visit the studio on ${friendlyVisitDate} between 10:00 AM and 3:00 PM for verification.`,
            "success"
        );

        // Show prominent confirmation message
        showEnrollmentSuccess(name, studentId, friendlyVisitDate);

    } catch (err) {
        console.error("Enrollment error:", err);

        let errMsg = "Registration failed. Please try again.";
        if (err.message && err.message.includes("duplicate") || (err.code && err.code === "23505")) {
            errMsg = "This Student ID or email is already registered. Please use a different one.";
        }

        triggerToast("Enrollment Error", errMsg, "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Academy Inquiry";
        }
    }
}

function showEnrollmentSuccess(name, studentId, visitDate) {
    const enrollmentSection = document.getElementById("enrollmentSection");
    if (!enrollmentSection) return;

    enrollmentSection.innerHTML = `
        <div class="success-alert text-center" style="padding: 40px 20px;">
            <div class="success-icon-badge" style="margin: 0 auto 20px auto;">✓</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: var(--color-text-dark); margin-bottom: 15px;">Enrollment Inquiry Received!</h3>
            <p style="margin-bottom: 20px;">Thank you, <strong>${escapeHtml(name)}</strong>! Your academy seat request has been successfully registered.</p>

            <div class="success-ticket card-glow" style="text-align: left; padding: 20px; border-radius: 8px; margin: 20px 0; max-width: 400px; margin-left: auto; margin-right: auto;">
                <div style="font-weight: 700; color: var(--color-accent-gold); margin-bottom: 12px; border-bottom: 1px dashed var(--color-border); padding-bottom: 10px;">Enrollment Reference</div>
                <p style="margin: 6px 0;"><strong>Student ID:</strong> <code style="background: rgba(232,167,161,0.15); padding: 2px 6px; border-radius: 4px;">${escapeHtml(studentId)}</code></p>
                <p style="margin: 6px 0;"><strong>Status:</strong> <span style="color: #8A6D1C; font-weight: 600; background: #FFF9E6; padding: 2px 8px; border-radius: 4px;">Pre-Booked</span></p>
            </div>

            <div style="background: #FFF9E6; border: 1px solid #FFEAA8; border-radius: 10px; padding: 20px; text-align: left; margin-bottom: 25px; max-width: 450px; margin-left: auto; margin-right: auto;">
                <p style="font-weight: 700; color: #8A6D1C; margin-bottom: 8px;">📢 IMPORTANT – Physical Verification Visit</p>
                <p style="color: #6E5616; font-size: 0.9rem; line-height: 1.5;">
                    Please visit the <strong>Trendy Touch Studio</strong> on <strong>${escapeHtml(visitDate)}</strong> between <strong>10:00 AM – 3:00 PM</strong>.
                    Bring a valid ID. Your student portal login will be activated after this visit.
                </p>
            </div>

            <a href="/" class="btn btn-primary" style="margin-right: 10px;">Back to Home</a>
            <a href="student.html" class="btn btn-outline">Try Student Portal Login</a>
        </div>
    `;
}

// Calculate next working weekday (Sunday to Friday working, Saturday off)
function getNextWorkingDay(date) {
    const d = new Date(date);
    let offset = 1;
    const day = d.getDay(); // 0=Sun, 6=Sat
    if (day === 5) offset = 2; // Friday -> skip Saturday -> Sunday
    const nextDate = new Date(d.getTime() + offset * 24 * 60 * 60 * 1000);
    return nextDate.toISOString().split('T')[0];
}

function formatWorkingDayFriendly(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
    }, 7000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
