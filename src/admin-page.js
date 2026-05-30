import { loginStaff, logoutUser } from './auth.js';
import {
    fetchBookings, updateBookingStatus, rescheduleBooking,
    fetchStudents, verifyStudent,
    fetchFeedbacks, deleteFeedback,
    fetchGallery, uploadGalleryFile, createGalleryPost, deleteGalleryPost
} from './api.js';
import { subscribeToRealtimeAlerts } from './realtime.js';

// State
let bookingsCache = [];
let studentsCache = [];
let feedbacksCache = [];
let galleryCache = [];
let realtimeChannel = null;

document.addEventListener("DOMContentLoaded", () => {
    // Login Form
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) loginForm.addEventListener("submit", handleAdminLogin);

    // Logout
    const logoutBtn = document.getElementById("btnAdminLogout");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

    // Dashboard Tab Buttons
    document.getElementById("tabBtnBookings")?.addEventListener("click", () => switchTab("bookings"));
    document.getElementById("tabBtnStudents")?.addEventListener("click", () => switchTab("students"));
    document.getElementById("tabBtnFeedbacks")?.addEventListener("click", () => switchTab("feedbacks"));
    document.getElementById("tabBtnGallery")?.addEventListener("click", () => switchTab("gallery"));

    // Booking Search & Filter
    document.getElementById("bookingSearch")?.addEventListener("input", filterBookingsTable);
    document.getElementById("bookingFilterStatus")?.addEventListener("change", filterBookingsTable);

    // Gallery Upload Form
    const galleryForm = document.getElementById("galleryUploadForm");
    if (galleryForm) galleryForm.addEventListener("submit", handleGalleryUpload);

    const clearBtn = document.getElementById("btnGalleryClear");
    if (clearBtn) clearBtn.addEventListener("click", clearGalleryForm);

    // Setup Drag & Drop for gallery file
    setupDragAndDrop();

    // File input change
    const fileInput = document.getElementById("galleryFile");
    if (fileInput) fileInput.addEventListener("change", () => previewGalleryFile(fileInput));

    // Notification permission button
    const notifBtn = document.getElementById("btnRequestNotification");
    if (notifBtn) notifBtn.addEventListener("click", requestNotificationPermission);
});

// ========== AUTHENTICATION ==========

async function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;
    const errorEl = document.getElementById("loginError");
    const submitBtn = document.getElementById("btnLoginSubmit");

    errorEl.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying...";

    try {
        await loginStaff(email, password);
        showDashboard();
    } catch (err) {
        console.error("Login error:", err);
        errorEl.textContent = err.message || "Invalid email or password. Please try again.";
        errorEl.style.display = "block";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Access Dashboard";
    }
}

async function handleLogout() {
    // Unsubscribe from realtime before logging out
    if (realtimeChannel) {
        const { supabase } = await import('./supabase.js');
        if (supabase) await supabase.removeChannel(realtimeChannel);
    }
    await logoutUser();
    document.getElementById("adminDashboardView").style.display = "none";
    document.getElementById("adminLoginView").style.display = "flex";
    document.getElementById("adminEmail").value = "";
    document.getElementById("adminPassword").value = "";
}

function showDashboard() {
    document.getElementById("adminLoginView").style.display = "none";
    document.getElementById("adminDashboardView").style.display = "block";
    loadDashboardData();
    startRealtimeListeners();
}

// ========== REALTIME NOTIFICATIONS ==========

function startRealtimeListeners() {
    realtimeChannel = subscribeToRealtimeAlerts(
        // onNewBooking handler
        (newBooking) => {
            bookingsCache.unshift(newBooking);
            renderBookingsTable(bookingsCache);
            updateMetrics();
            playNotificationSound();
            triggerToast(
                "🆕 New Booking Received!",
                `${newBooking.name} booked ${newBooking.package} for Rs. ${Number(newBooking.total_price).toLocaleString()}`,
                "success"
            );
            pushDesktopNotification(
                "New Pre-Booking – Trendy Touch",
                `${newBooking.name} requested ${newBooking.package} on ${newBooking.date_time?.split('T')[0]}`
            );
        },
        // onNewStudent handler
        (newStudent) => {
            studentsCache.unshift(newStudent);
            renderStudentsTable(studentsCache);
            updateMetrics();
            playNotificationSound();
            triggerToast(
                "🆕 New Student Enrollment!",
                `${newStudent.name} registered for ${newStudent.course_name}`,
                "success"
            );
            pushDesktopNotification(
                "New Academy Enrollment – Trendy Touch",
                `${newStudent.name} applied for ${newStudent.course_name}`
            );
        }
    );
}

function playNotificationSound() {
    const audio = document.getElementById("notificationSound");
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

function requestNotificationPermission() {
    if (!("Notification" in window)) return alert("This browser does not support desktop notifications.");
    Notification.requestPermission().then(permission => {
        const btn = document.getElementById("btnRequestNotification");
        if (permission === "granted") {
            triggerToast("Notifications Enabled", "You will now receive desktop alerts for new bookings and enrollments.", "success");
            if (btn) btn.textContent = "🔔 Desktop Alerts Active";
        } else {
            if (btn) btn.textContent = "🔔 Alerts Blocked";
        }
    });
}

function pushDesktopNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
    }
}

// ========== DASHBOARD DATA ==========

async function loadDashboardData() {
    try {
        const [bookings, students, feedbacks, gallery] = await Promise.all([
            fetchBookings(),
            fetchStudents(),
            fetchFeedbacks(),
            fetchGallery()
        ]);

        bookingsCache = bookings;
        studentsCache = students;
        feedbacksCache = feedbacks;
        galleryCache = gallery;

        updateMetrics();
        renderBookingsTable(bookingsCache);
        renderStudentsTable(studentsCache);
        renderFeedbacksTable(feedbacksCache);
        renderAdminGallery();
    } catch (err) {
        console.error("Dashboard load error:", err);
        triggerToast("Load Error", "Could not load dashboard data. Check your Supabase connection.", "error");
    }
}

function updateMetrics() {
    const totalB = bookingsCache.length;
    const totalS = studentsCache.length;
    const avgF = feedbacksCache.length > 0
        ? (feedbacksCache.reduce((acc, fb) => acc + fb.rating, 0) / feedbacksCache.length).toFixed(1)
        : "5.0";

    const el_b = document.getElementById("metricTotalBookings");
    const el_s = document.getElementById("metricActiveStudents");
    const el_r = document.getElementById("metricAverageRating");
    if (el_b) el_b.textContent = totalB;
    if (el_s) el_s.textContent = totalS;
    if (el_r) el_r.textContent = `${avgF} / 5★`;
}

// ========== BOOKINGS TABLE ==========

function renderBookingsTable(list) {
    const tbody = document.getElementById("bookingsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No bookings found.</td></tr>`;
        return;
    }

    list.forEach(bk => {
        const statusClass = `status-${bk.status.toLowerCase()}`;
        const formatPrice = `Rs. ${Number(bk.total_price).toLocaleString()}`;
        const rawDateTime = bk.date_time || "";
        const formatDateTime = rawDateTime.replace("T", " @ ").slice(0, 19);
        const locationText = bk.service_type === "Home"
            ? `Home Service<br><small style="color:var(--color-text-muted);">${escapeHtml(bk.address)}</small>`
            : "Studio Session";

        const addons = Array.isArray(bk.addons) ? bk.addons.join(", ") : (bk.addons || "");

        let actionsHtml = "";
        if (bk.status !== "Cancelled") {
            if (bk.status === "Pending") {
                actionsHtml += `<button class="table-btn btn-confirm" data-id="${bk.id}" data-action="confirm">Confirm</button>`;
            }
            actionsHtml += `<button class="table-btn btn-resched" data-id="${bk.id}" data-action="reschedule">Reschedule</button>`;
            actionsHtml += `<button class="table-btn btn-cancel" data-id="${bk.id}" data-action="cancel">Cancel</button>`;
        } else {
            actionsHtml = `<span class="text-muted">—</span>`;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${escapeHtml(bk.id)}</strong></td>
            <td>${escapeHtml(bk.name)}<br><small>${escapeHtml(bk.phone)}</small></td>
            <td>${locationText}</td>
            <td>${escapeHtml(bk.package)}<br><small class="text-muted">${escapeHtml(addons) || 'No addons'}</small></td>
            <td>${formatDateTime}</td>
            <td><strong>${formatPrice}</strong></td>
            <td><span class="status-badge ${statusClass}">${bk.status}</span></td>
            <td><div class="d-flex" style="gap:6px;">${actionsHtml}</div></td>
        `;
        tbody.appendChild(tr);
    });

    // Attach event listeners for action buttons
    tbody.querySelectorAll(".table-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            const action = btn.getAttribute("data-action");
            if (action === "confirm") doUpdateBookingStatus(id, "Confirmed");
            if (action === "cancel") doUpdateBookingStatus(id, "Cancelled");
            if (action === "reschedule") doRescheduleBooking(id);
        });
    });
}

function filterBookingsTable() {
    const search = document.getElementById("bookingSearch").value.toLowerCase();
    const status = document.getElementById("bookingFilterStatus").value;

    const filtered = bookingsCache.filter(bk => {
        const matchSearch = bk.name.toLowerCase().includes(search) ||
                            bk.phone?.includes(search) ||
                            bk.package?.toLowerCase().includes(search) ||
                            bk.id?.toLowerCase().includes(search);
        const matchStatus = status === "All" || bk.status === status;
        return matchSearch && matchStatus;
    });

    renderBookingsTable(filtered);
}

async function doUpdateBookingStatus(id, newStatus) {
    if (!confirm(`Are you sure you want to mark this booking as "${newStatus}"?`)) return;
    try {
        await updateBookingStatus(id, newStatus);
        const idx = bookingsCache.findIndex(b => b.id === id);
        if (idx !== -1) bookingsCache[idx].status = newStatus;
        renderBookingsTable(bookingsCache);
        triggerToast("Booking Updated", `Booking ${id} is now ${newStatus}.`, "success");
    } catch (err) {
        triggerToast("Update Failed", err.message, "error");
    }
}

async function doRescheduleBooking(id) {
    const newDate = prompt("Enter new Date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]);
    if (!newDate) return;
    const newTime = prompt("Enter new Time Slot (e.g. 10:00 AM, 02:00 PM):", "10:00 AM");
    if (!newTime) return;

    let hours = "10";
    const timeParts = newTime.split(":");
    if (timeParts.length >= 1) {
        const hourNum = parseInt(timeParts[0]);
        const isPM = newTime.toUpperCase().includes("PM") && hourNum !== 12;
        hours = (isPM ? hourNum + 12 : hourNum).toString().padStart(2, "0");
    }
    const dateTimeIso = `${newDate}T${hours}:00:00`;

    try {
        await rescheduleBooking(id, dateTimeIso);
        const idx = bookingsCache.findIndex(b => b.id === id);
        if (idx !== -1) {
            bookingsCache[idx].date_time = dateTimeIso;
            bookingsCache[idx].status = "Rescheduled";
        }
        renderBookingsTable(bookingsCache);
        triggerToast("Rescheduled", `Booking ${id} rescheduled to ${newDate} at ${newTime}.`, "success");
    } catch (err) {
        triggerToast("Reschedule Failed", err.message, "error");
    }
}

// ========== STUDENTS TABLE ==========

function renderStudentsTable(list) {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No student enrollments found.</td></tr>`;
        return;
    }

    list.forEach(st => {
        const isConfirmed = st.status === "Confirmed";
        const statusHtml = isConfirmed
            ? `<span class="badge" style="background:#E8F8F5;color:#117864;font-weight:600;font-size:.75rem;padding:4px 8px;border-radius:4px;">Confirmed</span>`
            : `<span class="badge" style="background:#FFF9E6;color:#8A6D1C;font-weight:600;font-size:.75rem;padding:4px 8px;border-radius:4px;">Pre-Booked</span>`;

        const actionHtml = !isConfirmed
            ? `<button class="table-btn btn-confirm" data-sid="${escapeHtml(st.student_id)}" data-name="${escapeHtml(st.name)}">✓ Verify & Approve</button>`
            : `<span class="text-success" style="font-weight:600;font-size:.8rem;">✓ Verified Access</span>`;

        const friendlyDate = st.created_at ? new Date(st.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${escapeHtml(st.name)}</strong></td>
            <td>${escapeHtml(st.phone)}<br><small>${escapeHtml(st.email)}</small></td>
            <td><span class="badge badge-accent">${escapeHtml(st.course_name)}</span></td>
            <td>${st.start_date || "—"}</td>
            <td><small>${escapeHtml(st.note) || "—"}</small></td>
            <td>${friendlyDate}</td>
            <td><code>${escapeHtml(st.student_id)}</code></td>
            <td>${statusHtml}</td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-confirm[data-sid]").forEach(btn => {
        btn.addEventListener("click", () => {
            const sid = btn.getAttribute("data-sid");
            const sName = btn.getAttribute("data-name");
            doVerifyStudent(sid, sName);
        });
    });
}

async function doVerifyStudent(studentId, studentName) {
    if (!confirm(`Verify physical visit of "${studentName}" and activate their student portal access?`)) return;
    try {
        await verifyStudent(studentId);
        const idx = studentsCache.findIndex(s => s.student_id === studentId);
        if (idx !== -1) studentsCache[idx].status = "Confirmed";
        renderStudentsTable(studentsCache);
        triggerToast("Student Verified ✓", `${studentName}'s portal access has been activated!`, "success");
        pushDesktopNotification("Student Activated", `${studentName} can now log in to the student portal.`);
    } catch (err) {
        triggerToast("Verification Failed", err.message, "error");
    }
}

// ========== FEEDBACKS TABLE ==========

function renderFeedbacksTable(list) {
    const tbody = document.getElementById("feedbacksTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No reviews recorded.</td></tr>`;
        return;
    }

    list.forEach(fb => {
        const stars = "★".repeat(fb.rating) + "☆".repeat(5 - fb.rating);
        const friendlyDate = fb.created_at ? new Date(fb.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${escapeHtml(fb.name)}</strong><br><small class="text-muted">${friendlyDate}</small></td>
            <td>${escapeHtml(fb.service)}</td>
            <td style="color:#F1C40F;font-size:1.1rem;">${stars}</td>
            <td>"${escapeHtml(fb.comment)}"</td>
            <td>
                <button class="table-btn btn-cancel" data-fid="${fb.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-cancel[data-fid]").forEach(btn => {
        btn.addEventListener("click", () => {
            const fid = btn.getAttribute("data-fid");
            doDeleteFeedback(fid);
        });
    });
}

async function doDeleteFeedback(id) {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
        await deleteFeedback(id);
        feedbacksCache = feedbacksCache.filter(fb => fb.id !== id);
        renderFeedbacksTable(feedbacksCache);
        updateMetrics();
        triggerToast("Review Deleted", "The feedback has been permanently removed.", "warning");
    } catch (err) {
        triggerToast("Delete Failed", err.message, "error");
    }
}

// ========== GALLERY ADMIN ==========

function renderAdminGallery() {
    const listContainer = document.getElementById("galleryAdminList");
    if (!listContainer) return;

    if (galleryCache.length === 0) {
        listContainer.innerHTML = `<p class="text-center text-muted mt-4" style="padding:40px 0;">No posts yet. Use the form above to publish your first client transformation!</p>`;
        return;
    }

    listContainer.innerHTML = "";
    galleryCache.forEach(post => {
        const item = document.createElement("div");
        item.className = "gallery-admin-item";

        const friendlyDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const thumbHtml = post.type === "video"
            ? `<video class="gallery-admin-thumb" src="${post.media_url}" muted preload="metadata"></video>`
            : `<img class="gallery-admin-thumb" src="${post.media_url}" alt="thumbnail">`;

        item.innerHTML = `
            ${thumbHtml}
            <div class="gallery-admin-info">
                <span class="gallery-tag-badge badge-sm">${escapeHtml(post.tag)}</span>
                <p class="gallery-admin-caption">${escapeHtml(post.caption)}</p>
                <span class="gallery-admin-meta">by ${escapeHtml(post.posted_by)} &mdash; ${friendlyDate}</span>
            </div>
            <div class="gallery-admin-actions">
                <button class="table-btn btn-cancel" data-pid="${post.id}" data-url="${escapeHtml(post.media_url)}">&#128465; Delete</button>
            </div>
        `;
        listContainer.appendChild(item);
    });

    listContainer.querySelectorAll(".btn-cancel[data-pid]").forEach(btn => {
        btn.addEventListener("click", () => {
            const pid = btn.getAttribute("data-pid");
            const purl = btn.getAttribute("data-url");
            doDeleteGalleryPost(pid, purl);
        });
    });
}

async function handleGalleryUpload(event) {
    event.preventDefault();
    const fileInput = document.getElementById("galleryFile");
    const file = fileInput?.files[0];
    if (!file) {
        triggerToast("No File Selected", "Please select a photo or video to upload.", "warning");
        return;
    }

    const postedBy = document.getElementById("galleryPostedBy").value.trim();
    const tag = document.getElementById("galleryTag").value;
    const caption = document.getElementById("galleryCaption").value.trim();

    const publishBtn = document.getElementById("btnPublishPost");
    if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.textContent = "Uploading...";
    }

    try {
        // 1. Upload file to Supabase Storage
        const publicUrl = await uploadGalleryFile(file);

        // 2. Create DB record
        const isVideo = file.type.startsWith("video/");
        const newPost = await createGalleryPost({
            posted_by: postedBy,
            tag,
            caption,
            type: isVideo ? "video" : "photo",
            media_url: publicUrl
        });

        galleryCache.unshift(newPost);
        renderAdminGallery();
        clearGalleryForm();

        triggerToast("Post Published! 🎉", `"${caption.substring(0, 40)}..." is now live in the client gallery.`, "success");
    } catch (err) {
        console.error("Gallery upload error:", err);
        triggerToast("Upload Failed", err.message || "Failed to upload media. Check storage permissions.", "error");
    } finally {
        if (publishBtn) {
            publishBtn.disabled = false;
            publishBtn.textContent = "Publish to Client Feed";
        }
    }
}

async function doDeleteGalleryPost(id, mediaUrl) {
    if (!confirm("Delete this post from the public gallery feed?")) return;
    try {
        await deleteGalleryPost(id, mediaUrl);
        galleryCache = galleryCache.filter(p => p.id !== id);
        renderAdminGallery();
        triggerToast("Post Deleted", "Gallery post has been removed from the client feed.", "warning");
    } catch (err) {
        triggerToast("Delete Failed", err.message, "error");
    }
}

function previewGalleryFile(input) {
    const file = input.files[0];
    if (!file) return;

    const previewContainer = document.getElementById("galleryFilePreview");
    const dropInner = document.getElementById("fileDropInner");
    const dropZone = document.getElementById("galleryFileDrop");

    if (file.size > 52428800) {
        triggerToast("File Too Large", "Please select a file smaller than 50MB.", "warning");
        input.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        const isVideo = file.type.startsWith("video/");
        if (previewContainer) {
            previewContainer.style.display = "block";
            previewContainer.innerHTML = isVideo
                ? `<video src="${dataUrl}" controls class="gallery-preview-media"></video><p class="file-preview-name">&#127916; ${escapeHtml(file.name)} (${(file.size / 1024 / 1024).toFixed(2)} MB)</p>`
                : `<img src="${dataUrl}" class="gallery-preview-media" alt="preview"><p class="file-preview-name">&#128247; ${escapeHtml(file.name)} (${(file.size / 1024 / 1024).toFixed(2)} MB)</p>`;
        }
        if (dropInner) dropInner.style.opacity = "0.4";
        if (dropZone) dropZone.style.borderColor = "var(--color-accent-gold)";
    };
    reader.readAsDataURL(file);
}

function clearGalleryForm() {
    const form = document.getElementById("galleryUploadForm");
    if (form) form.reset();
    const previewContainer = document.getElementById("galleryFilePreview");
    if (previewContainer) { previewContainer.style.display = "none"; previewContainer.innerHTML = ""; }
    const dropInner = document.getElementById("fileDropInner");
    if (dropInner) dropInner.style.opacity = "1";
    const dropZone = document.getElementById("galleryFileDrop");
    if (dropZone) dropZone.style.borderColor = "";
}

function setupDragAndDrop() {
    const dropZone = document.getElementById("galleryFileDrop");
    const fileInput = document.getElementById("galleryFile");
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener("click", () => fileInput.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); });
    });
    ['dragenter', 'dragover'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.add('drag-active')));
    ['dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.remove('drag-active')));

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            fileInput.files = files;
            previewGalleryFile(fileInput);
        }
    });
}

// ========== TABS ==========

function switchTab(tabName) {
    document.querySelectorAll(".dash-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".dashboard-tab-panel").forEach(panel => panel.classList.remove("active"));

    const panelId = `dash-${tabName}`;
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add("active");

    const tabMap = { bookings: "tabBtnBookings", students: "tabBtnStudents", feedbacks: "tabBtnFeedbacks", gallery: "tabBtnGallery" };
    const btn = document.getElementById(tabMap[tabName]);
    if (btn) btn.classList.add("active");
}

// ========== SHARED UTILS ==========

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
