// ==========================================================================
// MOCK DATABASE & SEED DATA (LOCALSTORAGE)
// ==========================================================================
const DEFAULT_BOOKINGS = [
    {
        id: "TT-59281",
        name: "Sushma Adhikari",
        phone: "9851029381",
        email: "sushma.ad@gmail.com",
        serviceType: "Studio",
        category: "Bridal",
        package: "Royal Bridal HD Makeup",
        addons: ["Nail Art"],
        dateTime: "2026-06-12T10:00",
        address: "",
        basePrice: 25000,
        travelFee: 0,
        totalPrice: 27000,
        status: "Confirmed",
        createdDate: "2026-05-20"
    },
    {
        id: "TT-12493",
        name: "Pooja Shrestha",
        phone: "9803328192",
        email: "pooja.sh@gmail.com",
        serviceType: "Home",
        category: "Bridal",
        package: "Premium Bridal Airbrush",
        addons: ["Nail Art", "Hydra Glow"],
        dateTime: "2026-06-18T08:00",
        address: "Hotel Yak & Yeti, Darbar Marg, Kathmandu",
        basePrice: 35000,
        travelFee: 2000,
        totalPrice: 38500,
        status: "Pending",
        createdDate: "2026-05-22"
    },
    {
        id: "TT-83921",
        name: "Monika Thapa",
        phone: "9841882736",
        email: "monika.thapa@outlook.com",
        serviceType: "Studio",
        category: "Party",
        package: "Glamorous Party Makeup",
        addons: [],
        dateTime: "2026-05-28T14:00",
        address: "",
        basePrice: 8000,
        travelFee: 0,
        totalPrice: 8000,
        status: "Rescheduled",
        createdDate: "2026-05-21"
    }
];

const DEFAULT_STUDENTS = [
    {
        name: "Barsha Raut",
        phone: "9812903827",
        email: "barsha.makeup@gmail.com",
        courseName: "Professional Bridal Makeup Course",
        startDate: "2026-06-01",
        note: "Interested in bridal draping styling especially.",
        createdDate: "2026-05-18",
        studentId: "barsha123",
        password: "pass123",
        status: "Confirmed"
    },
    {
        name: "Sneha Pandey",
        phone: "9808772836",
        email: "sneha.pandey@gmail.com",
        courseName: "Self-Makeup Mastery Course",
        startDate: "2026-05-26",
        note: "Wants to learn everyday work looks.",
        createdDate: "2026-05-19",
        studentId: "sneha123",
        password: "pass123",
        status: "Confirmed"
    }
];

const DEFAULT_FEEDBACKS = [
    {
        name: "Nisha Gurung",
        service: "Premium Bridal Airbrush",
        rating: 5,
        comment: "Babita is an absolute genius! My wedding makeup was flawless, sweatproof, and lasted until late night reception. Worth every single Rupee!",
        createdDate: "2026-05-15"
    },
    {
        name: "Anjali Karki",
        service: "Professional Bridal Makeup Course",
        rating: 5,
        comment: "Completing the 40 days professional course changed my career. The lessons are thorough and Babita shares all her real-world studio secrets. Highly recommended!",
        createdDate: "2026-05-10"
    },
    {
        name: "Roshani Devkota",
        service: "Glamorous Party Makeup",
        rating: 4,
        comment: "Loved the soft eyes and base makeup done for my brother's reception party. Got many compliments. The studio has very pleasant aesthetics too.",
        createdDate: "2026-05-20"
    }
];

const PACKAGES_DATABASE = {
    Bridal: [
        { name: "Royal Bridal HD Makeup", price: 25000 },
        { name: "Premium Bridal Airbrush", price: 35000 }
    ],
    Party: [
        { name: "Glamorous Party Makeup", price: 8000 },
        { name: "Engagement / Reception", price: 15000 }
    ],
    Casual: [
        { name: "Casual Glow Makeup", price: 5000 },
        { name: "Editorial / Photoshoot", price: 12000 }
    ]
};

// Helper: Generate gradient SVG placeholder image as base64 data URL
function makePlaceholderSvg(color1, color2, label) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color1}"/><stop offset="100%" stop-color="${color2}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><rect x="20" y="415" width="360" height="58" fill="rgba(0,0,0,0.28)" rx="10"/><text x="200" y="447" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="18" font-family="Georgia,serif" font-style="italic">${label}</text></svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

// Database Initialization
function initializeMockDatabase() {
    if (!localStorage.getItem("tt_bookings")) {
        localStorage.setItem("tt_bookings", JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem("tt_students")) {
        localStorage.setItem("tt_students", JSON.stringify(DEFAULT_STUDENTS));
    } else {
        try {
            let existing = JSON.parse(localStorage.getItem("tt_students"));
            let modified = false;
            existing = existing.map(st => {
                if (!st.hasOwnProperty("studentId")) {
                    modified = true;
                    const cleanName = st.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
                    st.studentId = cleanName + "123";
                    st.password = "pass123";
                    st.status = "Confirmed";
                }
                return st;
            });
            if (modified) {
                localStorage.setItem("tt_students", JSON.stringify(existing));
            }
        } catch (e) {
            console.error("Migration error", e);
        }
    }
    if (!localStorage.getItem("tt_feedbacks")) {
        localStorage.setItem("tt_feedbacks", JSON.stringify(DEFAULT_FEEDBACKS));
    }
    if (!localStorage.getItem("tt_gallery")) {
        const seeded = [
            { id: "GLP-001", postedBy: "Babita Poudel", tag: "Bridal Glam", caption: "Stunning airbrush bridal look for our precious bride Sushma! Loved every detail of this transformation.", type: "photo", mediaDataUrl: makePlaceholderSvg("#E8A7A1", "#D4AF37", "Bridal Glam"), createdDate: "2026-05-20", createdTime: "14:30" },
            { id: "GLP-002", postedBy: "Babita Poudel", tag: "Party Look", caption: "Bold smokey glam for Anjali's birthday night! That eye work was pure fire. So much fun creating this look.", type: "photo", mediaDataUrl: makePlaceholderSvg("#3E2A2E", "#D48C85", "Party Look"), createdDate: "2026-05-18", createdTime: "17:00" },
            { id: "GLP-003", postedBy: "Babita Poudel", tag: "Academy Transformation", caption: "So proud of our Batch 8 students! Incredible editorial shoot results from our class today.", type: "photo", mediaDataUrl: makePlaceholderSvg("#D4AF37", "#E8A7A1", "Academy Batch 8"), createdDate: "2026-05-15", createdTime: "11:00" },
            { id: "GLP-004", postedBy: "Babita Poudel", tag: "Before & After", caption: "The power of professional makeup — an absolute transformation. She was glowing all evening!", type: "photo", mediaDataUrl: makePlaceholderSvg("#FFF0F2", "#D4AF37", "Before & After"), createdDate: "2026-05-12", createdTime: "09:00" }
        ];
        localStorage.setItem("tt_gallery", JSON.stringify(seeded));
    }
}

// Global Storage Reference Helpers
function getBookings() { return JSON.parse(localStorage.getItem("tt_bookings")); }
function saveBookings(data) { localStorage.setItem("tt_bookings", JSON.stringify(data)); }
function getStudents() { return JSON.parse(localStorage.getItem("tt_students")); }
function saveStudents(data) { localStorage.setItem("tt_students", JSON.stringify(data)); }
function getFeedbacks() { return JSON.parse(localStorage.getItem("tt_feedbacks")); }
function saveFeedbacks(data) { localStorage.setItem("tt_feedbacks", JSON.stringify(data)); }
function getGallery() { return JSON.parse(localStorage.getItem("tt_gallery")) || []; }
function saveGallery(data) { localStorage.setItem("tt_gallery", JSON.stringify(data)); }

// ==========================================================================
// ROLE MANAGEMENT
// ==========================================================================
let currentUserRole = 'staff'; // 'staff' | 'student'
let loggedInStudentId = null;  // tracks the unique studentId if logged in as a student

// ==========================================================================
// APP STATE & BOOTSTRAP
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initializeMockDatabase();
    
    // Header scroll background modification
    window.addEventListener("scroll", () => {
        const header = document.querySelector(".header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        highlightActiveSection();
    });

    // Mobile Hamburger Menu Setup
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");
    const mobileNavClose = document.getElementById("mobileNavClose");

    if (menuToggle && mobileNav && mobileNavClose) {
        menuToggle.addEventListener("click", () => mobileNav.classList.add("open"));
        mobileNavClose.addEventListener("click", () => mobileNav.classList.remove("open"));
    }

    // Set minimum date picker in wizard to current date
    const dateInput = document.getElementById("wizDate");
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.min = today;
    }

    // Interactive Star Rating for feedback form
    setupStarRating();

    // Render Testimonials Carousel
    renderTestimonialsSlider();

    // Render Client Gallery Feed on landing page
    renderGalleryFeed('all');

    // Close Modals on overlay click + always restore body scroll
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("open");
                document.body.style.overflow = ""; // restore background page scroll
            }
        });
    });

    // Initialize drag-and-drop for the media gallery
    setupDragAndDrop();
});

// Navigation Active Scroll Highlight
function highlightActiveSection() {
    const sections = document.querySelectorAll("section, footer");
    const navLinks = document.querySelectorAll(".nav-link");
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
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

function toggleMobileMenu() {
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) {
        mobileNav.classList.toggle("open");
    }
}

// ==========================================================================
// TESTIMONIALS SLIDER
// ==========================================================================
let currentSlideIndex = 0;

function renderTestimonialsSlider() {
    const feedbacks = getFeedbacks();
    const slider = document.getElementById("testimonialsSlider");
    if (!slider) return;

    slider.innerHTML = "";
    feedbacks.forEach(fb => {
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= fb.rating ? "&#9733;" : "&#9734;";
        }

        const slide = document.createElement("div");
        slide.className = "testimonial-slide";
        slide.innerHTML = `
            <div class="stars">${starsHtml}</div>
            <p class="testimonial-comment">"${fb.comment}"</p>
            <div class="testimonial-author">
                <h4>${escapeHtml(fb.name)}</h4>
                <p>${fb.service}</p>
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
    const feedbacks = getFeedbacks();
    currentSlideIndex = (currentSlideIndex + 1) % feedbacks.length;
    updateSliderPosition();
}

function prevSlide() {
    const feedbacks = getFeedbacks();
    currentSlideIndex = (currentSlideIndex - 1 + feedbacks.length) % feedbacks.length;
    updateSliderPosition();
}

// Auto-advance testimonials every 8 seconds
setInterval(nextSlide, 8000);

// Setup feedback star selection
function setupStarRating() {
    const stars = document.querySelectorAll(".star-input");
    const ratingInput = document.getElementById("fbRating");
    if (!stars.length) return;

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const val = parseInt(star.getAttribute("data-value"));
            ratingInput.value = val;
            
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

// Feedback Form Submit Handler
function submitFeedback(event) {
    event.preventDefault();
    const name = document.getElementById("fbName").value.trim();
    const service = document.getElementById("fbService").value;
    const rating = parseInt(document.getElementById("fbRating").value);
    const comment = document.getElementById("fbComment").value.trim();

    if (!name || !service || !comment) return;

    const newFeedback = {
        name,
        service,
        rating,
        comment,
        createdDate: new Date().toISOString().split("T")[0]
    };

    const list = getFeedbacks();
    list.unshift(newFeedback);
    saveFeedbacks(list);

    // Refresh reviews UI
    renderTestimonialsSlider();
    
    // In-app Alert
    triggerNotification("Feedback Received", `Thank you, ${name}! Your rating has been shared.`, "success");
    
    // Reset Form
    document.getElementById("feedbackForm").reset();
    document.querySelectorAll(".star-input").forEach(s => s.classList.add("active")); // reset to 5 stars visually
    document.getElementById("fbRating").value = 5;

    // Trigger Admin updates if active
    if (document.getElementById("dashboardPortal").classList.contains("open")) {
        loadDashboardData();
    }
}

// ==========================================================================
// PRE-BOOKING SYSTEM WIZARD (STATE CONTROLLER)
// ==========================================================================
let wizCurrentStep = 1;
const totalWizSteps = 5;
let wizSelectedPackage = { category: "Bridal", name: "", price: 0 };
let wizVenueSelection = "Studio";

function openBookingWizard(defaultVenue = "studio") {
    wizCurrentStep = 1;
    wizVenueSelection = defaultVenue.toLowerCase() === "home" ? "Home" : "Studio";
    
    // Select the radio option in step 1 UI
    const venueRadios = document.getElementsByName("bookingVenue");
    venueRadios.forEach(radio => {
        if (radio.value === wizVenueSelection) {
            radio.checked = true;
        }
    });
    handleVenueChange({ value: wizVenueSelection });

    // Show initial package list in Step 2
    loadCategoryPackages(document.getElementById("wizCategory").value);
    
    // Reset inputs
    document.getElementById("wizName").value = "";
    document.getElementById("wizPhone").value = "";
    document.getElementById("wizEmail").value = "";
    document.getElementById("wizAddress").value = "";
    document.querySelectorAll("input[name='wizAddons']").forEach(ch => ch.checked = false);

    // Toggle Modal Overlay
    document.getElementById("bookingModal").classList.add("open");
    document.body.style.overflow = "hidden"; // lock background scroll while modal is open
    updateWizardUI();
    document.getElementById("wizardSuccessPanel").style.display = "none";
    document.querySelector(".wizard-body").style.display = "block";
    document.querySelector(".wizard-header").style.display = "block";
}

function closeBookingWizard() {
    document.getElementById("bookingModal").classList.remove("open");
    document.body.style.overflow = ""; // restore background scroll
}

function handleVenueChange(element) {
    wizVenueSelection = element.value;
    const addressContainer = document.getElementById("wizAddressContainer");
    if (wizVenueSelection === "Home") {
        addressContainer.style.display = "block";
        document.getElementById("wizAddress").setAttribute("required", "required");
    } else {
        addressContainer.style.display = "none";
        document.getElementById("wizAddress").removeAttribute("required");
    }
    updateSummaryPrice();
}

function loadCategoryPackages(category) {
    const listContainer = document.getElementById("wizPackagesList");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    const packages = PACKAGES_DATABASE[category] || [];
    packages.forEach((pkg, index) => {
        const checked = index === 0 ? "checked" : "";
        if (index === 0) {
            wizSelectedPackage = { category, name: pkg.name, price: pkg.price };
        }

        const label = document.createElement("label");
        label.className = "package-option-label";
        label.innerHTML = `
            <input type="radio" name="wizPackageRadio" value="${pkg.name}" data-price="${pkg.price}" ${checked} onchange="selectWizPackage('${category}', '${pkg.name}', ${pkg.price})">
            <div class="package-option-inner">
                <div>
                    <strong>${pkg.name}</strong>
                </div>
                <div class="price-badge" style="color: var(--color-accent-rose-dark); font-weight: 700;">
                    Rs. ${pkg.price.toLocaleString()}
                </div>
            </div>
        `;
        listContainer.appendChild(label);
    });
    updateSummaryPrice();
}

function selectWizPackage(category, name, price) {
    wizSelectedPackage = { category, name, price };
    updateSummaryPrice();
}

// Select package directly from main page cards
function selectPackageFromList(category, name, price) {
    openBookingWizard();
    document.getElementById("wizCategory").value = category;
    loadCategoryPackages(category);
    
    // Choose specific radio item
    setTimeout(() => {
        const radios = document.getElementsByName("wizPackageRadio");
        radios.forEach(radio => {
            if (radio.value === name) {
                radio.checked = true;
                selectWizPackage(category, name, price);
            }
        });
    }, 50);

    // Jump immediately to step 2
    wizCurrentStep = 2;
    updateWizardUI();
}

function updateSummaryPrice() {
    let base = wizSelectedPackage.price;
    let travel = wizVenueSelection === "Home" ? 2000 : 0;
    
    let addonsTotal = 0;
    const addons = document.querySelectorAll("input[name='wizAddons']:checked");
    addons.forEach(ch => {
        addonsTotal += parseInt(ch.getAttribute("data-price"));
    });

    const grandTotal = base + travel + addonsTotal;

    // Write to final summary steps
    const sumBase = document.getElementById("sumBasePrice");
    const sumTravel = document.getElementById("sumTravelFee");
    const sumTotal = document.getElementById("sumTotalPrice");
    
    if (sumBase) sumBase.textContent = `Rs. ${base.toLocaleString()}`;
    if (sumTravel) sumTravel.textContent = `Rs. ${travel.toLocaleString()}`;
    if (sumTotal) sumTotal.textContent = `Rs. ${grandTotal.toLocaleString()}`;
}

function updateWizardUI() {
    // Show active panel
    document.querySelectorAll(".wizard-step-panel").forEach(panel => {
        panel.classList.remove("active");
    });
    
    const activePanel = document.querySelector(`.wizard-step-panel[data-step="${wizCurrentStep}"]`);
    if (activePanel) activePanel.classList.add("active");

    // Fill Progress Bar
    const fillPercent = ((wizCurrentStep - 1) / (totalWizSteps - 1)) * 100;
    const fillBar = document.getElementById("progressFill");
    if (fillBar) fillBar.style.width = fillPercent + "%";

    // Set dots colors
    document.querySelectorAll(".step-dot").forEach(dot => {
        const dStep = parseInt(dot.getAttribute("data-step"));
        dot.className = "step-dot";
        if (dStep < wizCurrentStep) {
            dot.classList.add("completed");
        } else if (dStep === wizCurrentStep) {
            dot.classList.add("active");
        }
    });

    // Load Summary step data if entering Step 5
    if (wizCurrentStep === 5) {
        populateSummaryDetails();
    }
}

function nextWizardStep() {
    // Basic Input Validations before advancing steps
    if (wizCurrentStep === 3) {
        const dateVal = document.getElementById("wizDate").value;
        if (!dateVal) {
            triggerNotification("Details Required", "Please select a preferred date for your service.", "warning");
            return;
        }
    }

    if (wizCurrentStep === 4) {
        const nameVal = document.getElementById("wizName").value.trim();
        const phoneVal = document.getElementById("wizPhone").value.trim();
        const emailVal = document.getElementById("wizEmail").value.trim();
        const addressVal = document.getElementById("wizAddress").value.trim();

        if (!nameVal || !phoneVal || !emailVal) {
            triggerNotification("Details Required", "Name, Phone and Email are mandatory fields.", "warning");
            return;
        }
        if (wizVenueSelection === "Home" && !addressVal) {
            triggerNotification("Details Required", "Venue address is required for Home Service requests.", "warning");
            return;
        }
    }

    if (wizCurrentStep < totalWizSteps) {
        wizCurrentStep++;
        updateWizardUI();
    }
}

function prevWizardStep() {
    if (wizCurrentStep > 1) {
        wizCurrentStep--;
        updateWizardUI();
    }
}

function populateSummaryDetails() {
    const name = document.getElementById("wizName").value;
    const phone = document.getElementById("wizPhone").value;
    const date = document.getElementById("wizDate").value;
    const time = document.getElementById("wizTime").value;
    
    // Addons names list
    let selectedAddonsList = [];
    document.querySelectorAll("input[name='wizAddons']:checked").forEach(ch => {
        selectedAddonsList.push(ch.value);
    });

    document.getElementById("sumVenue").textContent = wizVenueSelection === "Home" ? "Luxury Home Service" : "Studio Session";
    document.getElementById("sumPackage").textContent = `${wizSelectedPackage.name} (${wizSelectedPackage.category})`;
    document.getElementById("sumAddons").textContent = selectedAddonsList.length > 0 ? selectedAddonsList.join(", ") : "None";
    document.getElementById("sumDateTime").textContent = `${date} at ${time}`;
    document.getElementById("sumClient").textContent = `${name} (${phone})`;

    const sumAddressLine = document.getElementById("sumAddressLine");
    if (wizVenueSelection === "Home") {
        sumAddressLine.style.display = "flex";
        document.getElementById("sumAddress").textContent = document.getElementById("wizAddress").value;
        document.getElementById("sumTravelFeeLine").style.display = "flex";
    } else {
        sumAddressLine.style.display = "none";
        document.getElementById("sumTravelFeeLine").style.display = "none";
    }

    updateSummaryPrice();
}

function confirmPreBooking() {
    const name = document.getElementById("wizName").value.trim();
    const phone = document.getElementById("wizPhone").value.trim();
    const email = document.getElementById("wizEmail").value.trim();
    const date = document.getElementById("wizDate").value;
    const time = document.getElementById("wizTime").value;
    const address = document.getElementById("wizAddress").value.trim();

    // Calculate Prices
    let base = wizSelectedPackage.price;
    let travel = wizVenueSelection === "Home" ? 2000 : 0;
    let addonsList = [];
    let addonsTotal = 0;
    
    document.querySelectorAll("input[name='wizAddons']:checked").forEach(ch => {
        addonsList.push(ch.value);
        addonsTotal += parseInt(ch.getAttribute("data-price"));
    });

    const total = base + travel + addonsTotal;
    const refCode = "TT-" + Math.floor(10000 + Math.random() * 90000);

    const newBooking = {
        id: refCode,
        name,
        phone,
        email,
        serviceType: wizVenueSelection,
        category: wizSelectedPackage.category,
        package: wizSelectedPackage.name,
        addons: addonsList,
        dateTime: `${date}T${time.split(" ")[0]}`, // simple combine
        address: wizVenueSelection === "Home" ? address : "",
        basePrice: base,
        travelFee: travel,
        totalPrice: total,
        status: "Pending",
        createdDate: new Date().toISOString().split("T")[0]
    };

    // Save to Database
    const list = getBookings();
    list.unshift(newBooking);
    saveBookings(list);

    // Show Success Panel
    document.querySelector(".wizard-body").style.display = "none";
    document.querySelector(".wizard-header").style.display = "none";
    
    const successPanel = document.getElementById("wizardSuccessPanel");
    successPanel.style.display = "block";

    // Write Receipt Ticket Info
    document.getElementById("ticketRef").textContent = refCode;
    document.getElementById("ticketName").textContent = name;
    document.getElementById("ticketPackage").textContent = `${newBooking.package} (${newBooking.category})`;
    document.getElementById("ticketVenue").textContent = wizVenueSelection === "Home" ? `Home - ${address}` : "New Baneshwor Studio";
    document.getElementById("ticketDateTime").textContent = `${date} @ ${time}`;
    document.getElementById("ticketTotal").textContent = `Rs. ${total.toLocaleString()}`;

    // Sound alert & Native Browser alerts triggers
    triggerNotification("New Pre-booking Saved!", `${name} pre-booked ${newBooking.package} for Rs. ${total.toLocaleString()}`, "success");
    pushSystemDesktopNotification("New Pre-Booking Received", `${name} requested a slot on ${date} at ${time}`);

    // If dashboard open, refresh it
    if (document.getElementById("dashboardPortal").classList.contains("open")) {
        loadDashboardData();
    }
}

// Print/Save Ticket action
function printReceipt() {
    window.print();
}

// Open Academy Enrollment Modal
function openAcademyEnrollment(courseName) {
    document.getElementById("enrollCourse").value = courseName;
    document.getElementById("enrollName").value = "";
    document.getElementById("enrollPhone").value = "";
    document.getElementById("enrollEmail").value = "";
    document.getElementById("enrollDate").value = "";
    document.getElementById("enrollNote").value = "";

    const dateInput = document.getElementById("enrollDate");
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;

    document.getElementById("enrollmentModal").classList.add("open");
    document.body.style.overflow = "hidden"; // lock background scroll while modal is open
}

function closeAcademyEnrollment() {
    document.getElementById("enrollmentModal").classList.remove("open");
    document.body.style.overflow = ""; // restore background scroll
}

// Calculate next working weekday (Sunday to Friday are working, Saturday is holiday)
function getNextWorkingDay(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
    let offset = 1;
    if (day === 5) { // Friday -> skip Saturday, go to Sunday
        offset = 2;
    } else if (day === 6) { // Saturday -> skip Saturday, go to Sunday
        offset = 1;
    }
    const nextDate = new Date(d.getTime() + offset * 24 * 60 * 60 * 1000);
    return nextDate.toISOString().split('T')[0];
}

// Format date to friendly string
function formatWorkingDayFriendly(dateStr) {
    const d = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
}

function submitEnrollment(event) {
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

    // Validate ID is unique and not 'staff'
    if (studentId === "staff") {
        triggerNotification("Invalid Student ID", "ID 'staff' is reserved. Please choose another ID.", "error");
        return;
    }

    const students = getStudents();
    const idExists = students.some(st => st.studentId === studentId);
    if (idExists) {
        triggerNotification("ID Already Taken", "This Student ID is already registered. Please choose a different ID.", "error");
        return;
    }

    // Calculate physical visit date (next weekday after booking)
    const visitDate = getNextWorkingDay(new Date());
    const friendlyVisitDate = formatWorkingDayFriendly(visitDate);

    const newStudent = {
        name,
        phone,
        email,
        courseName,
        startDate: date,
        note,
        studentId,
        password,
        status: "Pre-Booked",
        visitDate,
        createdDate: new Date().toISOString().split("T")[0]
    };

    students.unshift(newStudent);
    saveStudents(students);

    closeAcademyEnrollment();

    // Show persistent instruction details to the user
    alert(`🎉 Seat Pre-Booked Successfully!\n\nYour Student ID: ${studentId}\nYour Status: Pre-Booked\n\n📢 IMPORTANT VERIFICATION VISIT:\nPlease visit the Trendy Touch Makeup Studio on ${friendlyVisitDate} between 10:00 AM and 3:00 PM for physical verification and activation of your student portal.`);

    // Trigger Success alerts
    triggerNotification("Seat Pre-Booked", `Admission initialized. Visit us on ${friendlyVisitDate} for verification.`, "success");
    pushSystemDesktopNotification("New Student Pre-Booking", `${name} pre-booked for ${courseName}.`);

    // If dashboard open, refresh it
    if (document.getElementById("dashboardPortal").classList.contains("open")) {
        loadDashboardData();
    }
}

// ==========================================================================
// REAL-TIME NOTIFICATIONS (TOASTS SYSTEM)
// ==========================================================================
function triggerNotification(title, message, type = "success") {
    // Sound FX Play
    const audio = document.getElementById("notificationSound");
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio play blocked by browser policies until direct user interactions."));
    }

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

    // Auto delete toast after 6 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 400);
    }, 6000);
}

// Native Desktop Notifications Setup
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications.");
        return;
    }

    Notification.requestPermission().then(permission => {
        const btn = document.getElementById("btnRequestNotification");
        if (permission === "granted") {
            triggerNotification("Notifications Enabled", "You will now receive desktop alerts for new bookings.", "success");
            if (btn) btn.textContent = "🔔 Desktop Alerts Enabled";
        } else {
            alert("Desktop notification permission denied.");
            if (btn) btn.textContent = "🔔 Alerts Blocked";
        }
    });
}

function pushSystemDesktopNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // default cosmetic avatar
        });
    }
}

// ==========================================================================
// ADMIN DASHBOARD PORTAL & ACCESS CONTROLLERS
// ==========================================================================
function setLoginRole(role) {
    document.getElementById("loginRole").value = role;
    const staffBtn = document.getElementById("loginTabStaffBtn");
    const studentBtn = document.getElementById("loginTabStudentBtn");
    const staffGroup = document.getElementById("loginGroupStaff");
    const studentGroup = document.getElementById("loginGroupStudent");
    const error = document.getElementById("loginError");

    error.style.display = "none";

    if (role === 'staff') {
        staffBtn.className = "btn btn-sm btn-primary";
        studentBtn.className = "btn btn-sm btn-outline";
        staffGroup.style.display = "block";
        studentGroup.style.display = "none";
    } else {
        staffBtn.className = "btn btn-sm btn-outline";
        studentBtn.className = "btn btn-sm btn-primary";
        staffGroup.style.display = "none";
        studentGroup.style.display = "block";
    }
}

function openAdminLogin() {
    document.getElementById("loginError").style.display = "none";
    document.getElementById("adminPass").value = "";
    document.getElementById("studentLoginId").value = "";
    document.getElementById("studentLoginPass").value = "";
    setLoginRole('staff');
    document.getElementById("adminLoginModal").classList.add("open");
    document.body.style.overflow = "hidden"; // lock background scroll while modal is open
}

function closeAdminLogin() {
    document.getElementById("adminLoginModal").classList.remove("open");
    document.body.style.overflow = ""; // restore background scroll
}

function validateAdminPassword(event) {
    event.preventDefault();
    const role = document.getElementById("loginRole").value;
    const error = document.getElementById("loginError");
    error.style.display = "none";

    if (role === 'staff') {
        const pass = document.getElementById("adminPass").value;
        if (pass === "staff123") {
            closeAdminLogin();
            openDashboard('staff');
        } else {
            error.textContent = "Incorrect master staff password.";
            error.style.display = "block";
            error.classList.add("shake-animation");
            setTimeout(() => error.classList.remove("shake-animation"), 500);
        }
    } else {
        const studentId = document.getElementById("studentLoginId").value.trim().toLowerCase();
        const pass = document.getElementById("studentLoginPass").value;

        if (!studentId || !pass) {
            error.textContent = "Please enter both Student ID and Password.";
            error.style.display = "block";
            return;
        }

        const students = getStudents();
        const activeStudent = students.find(st => st.studentId === studentId && st.password === pass);

        if (!activeStudent) {
            error.textContent = "Invalid Student ID or Password.";
            error.style.display = "block";
            error.classList.add("shake-animation");
            setTimeout(() => error.classList.remove("shake-animation"), 500);
        } else if (activeStudent.status === "Pre-Booked") {
            const friendlyDate = formatWorkingDayFriendly(activeStudent.visitDate);
            error.innerHTML = `⚠️ <strong>Portal Access Denied (Pre-Booked)</strong><br>
                               Please visit the studio on <strong>${friendlyDate}</strong> between 10am-3pm to physically verify enrollment and enable your login.`;
            error.style.display = "block";
        } else if (activeStudent.status === "Confirmed") {
            closeAdminLogin();
            loggedInStudentId = activeStudent.studentId;
            openDashboard('student');
        }
    }
}

function openDashboard(role = 'staff') {
    currentUserRole = role;

    const portal = document.getElementById("dashboardPortal");
    portal.classList.add("open");
    document.body.style.overflow = "hidden"; // lock page scrolling under dashboard
    
    // Check permission state for notification toggle
    const btn = document.getElementById("btnRequestNotification");
    if (btn && "Notification" in window) {
        if (Notification.permission === "granted") {
            btn.textContent = "🔔 Desktop Alerts Enabled";
        } else if (Notification.permission === "denied") {
            btn.textContent = "🔔 Alerts Blocked";
        }
    }

    // Apply role-specific UI restrictions before loading data
    applyRoleBasedDashboard(role);
    loadDashboardData();
}

function applyRoleBasedDashboard(role) {
    const isStaff = role === 'staff';

    // Update portal role badge text and colour
    const badge = document.getElementById("portalRoleBadge");
    if (badge) {
        badge.textContent = isStaff ? "Staff Portal" : "Student Portal";
        badge.className = isStaff
            ? "badge badge-accent ml-2"
            : "badge badge-accent ml-2 student-role-badge";
    }

    // Show / hide restricted tab buttons
    const tabBookings  = document.getElementById("tabBtnBookings");
    const tabFeedbacks = document.getElementById("tabBtnFeedbacks");
    const tabGallery   = document.getElementById("tabBtnGallery");
    if (tabBookings)  tabBookings.style.display  = isStaff ? "" : "none";
    if (tabFeedbacks) tabFeedbacks.style.display = isStaff ? "" : "none";
    if (tabGallery)   tabGallery.style.display   = isStaff ? "" : "none";

    // Show / hide booking and rating metric cards
    const metricBookings  = document.getElementById("metricCardBookings");
    const metricFeedbacks = document.getElementById("metricCardFeedbacks");
    if (metricBookings)  metricBookings.style.display  = isStaff ? "" : "none";
    if (metricFeedbacks) metricFeedbacks.style.display = isStaff ? "" : "none";

    // Show Academy Learning Center only for students
    const academyCenter = document.getElementById("studentAcademyCenter");
    if (academyCenter) academyCenter.style.display = isStaff ? "none" : "block";

    // Force correct default tab
    switchDashboardTab(isStaff ? 'bookings' : 'students');
}

function closeDashboard() {
    document.getElementById("dashboardPortal").classList.remove("open");
    document.body.style.overflow = ""; // unlock page scrolling
}

// Load metrics data and populate tables
function loadDashboardData() {
    const bookings = getBookings();
    const students = getStudents();
    const feedbacks = getFeedbacks();

    // 1. Calculate Scorecards
    const totalB = bookings.length;
    const totalS = students.length;
    
    let avgF = 5.0;
    if (feedbacks.length > 0) {
        const sum = feedbacks.reduce((acc, fb) => acc + fb.rating, 0);
        avgF = (sum / feedbacks.length).toFixed(1);
    }

    document.getElementById("metricTotalBookings").textContent = totalB;
    document.getElementById("metricActiveStudents").textContent = totalS;
    document.getElementById("metricAverageRating").textContent = `${avgF} / 5★`;

    // 2. Render tables
    renderBookingsTable(bookings);
    renderStudentsTable(students);
    renderStudentAcademyCenter(students);
    renderFeedbacksTable(feedbacks);
    renderAdminGallery();
}

function renderBookingsTable(list) {
    const tbody = document.getElementById("bookingsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No bookings found matching filter.</td></tr>`;
        return;
    }

    list.forEach(bk => {
        const statusClass = `status-${bk.status.toLowerCase()}`;
        const formatPrice = `Rs. ${bk.totalPrice.toLocaleString()}`;
        const formatDateTime = bk.dateTime.replace("T", " @ ");
        const locationText = bk.serviceType === "Home" ? `Home Service<br><small style="color:var(--color-text-muted);">${bk.address}</small>` : "Studio Session";

        // Generate action controls based on status
        let actionsHtml = "";
        if (bk.status !== "Cancelled") {
            if (bk.status === "Pending") {
                actionsHtml += `<button class="table-btn btn-confirm" onclick="updateBookingStatus('${bk.id}', 'Confirmed')">Confirm</button>`;
            }
            actionsHtml += `<button class="table-btn btn-resched" onclick="triggerBookingReschedule('${bk.id}')">Reschedule</button>`;
            actionsHtml += `<button class="table-btn btn-cancel" onclick="updateBookingStatus('${bk.id}', 'Cancelled')">Cancel</button>`;
        } else {
            actionsHtml = `<span class="text-muted">-</span>`;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${bk.id}</strong></td>
            <td>${escapeHtml(bk.name)}<br><small>${bk.phone}</small></td>
            <td>${locationText}</td>
            <td>${bk.package}<br><small class="text-muted">${bk.addons.join(", ") || 'No addons'}</small></td>
            <td>${formatDateTime}</td>
            <td><strong>${formatPrice}</strong></td>
            <td><span class="status-badge ${statusClass}">${bk.status}</span></td>
            <td><div class="d-flex">${actionsHtml}</div></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderStudentsTable(list) {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No student enrollments found.</td></tr>`;
        return;
    }

    list.forEach((st) => {
        // Students can see their own row, but other students' private data is masked
        const isSelf = currentUserRole === 'student' && st.studentId === loggedInStudentId;
        const maskPrivate = currentUserRole === 'student' && !isSelf;
        
        const displayPhone = maskPrivate ? "●●●●●●●●●●" : st.phone;
        const displayEmail = maskPrivate ? "Protected" : st.email;
        const displayNote  = maskPrivate ? "—" : (escapeHtml(st.note) || "—");
        const displayId    = maskPrivate ? "Protected" : st.studentId;

        let statusHtml = "";
        if (st.status === "Confirmed") {
            statusHtml = `<span class="badge" style="background-color: #E8F8F5; color: #117864; font-weight: 600; font-size: 0.75rem;">Confirmed</span>`;
        } else {
            statusHtml = `<span class="badge" style="background-color: #FFF9E6; color: #8A6D1C; font-weight: 600; font-size: 0.75rem;">Pre-Booked</span>`;
        }

        let actionHtml = "—";
        if (currentUserRole === 'staff') {
            if (st.status === "Pre-Booked") {
                actionHtml = `<button class="table-btn btn-confirm" onclick="verifyStudentPortal('${st.studentId}')" style="padding: 4px 8px; font-size: 0.75rem;">✓ Verify & Approve</button>`;
            } else {
                actionHtml = `<span class="text-success" style="font-weight: 600; font-size: 0.8rem;">✓ Verified Access</span>`;
            }
        }

        const tr = document.createElement("tr");
        if (maskPrivate) tr.style.opacity = "0.7";
        tr.innerHTML = `
            <td><strong>${escapeHtml(st.name)}</strong>${maskPrivate ? ' <small style="color:var(--color-text-muted);">(private)</small>' : ''}</td>
            <td>${displayPhone}<br><small>${displayEmail}</small></td>
            <td><span class="badge badge-accent">${st.courseName}</span></td>
            <td>${st.startDate}</td>
            <td><small>${displayNote}</small></td>
            <td>${st.createdDate}</td>
            <td><code>${displayId}</code></td>
            <td>${statusHtml}</td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function verifyStudentPortal(studentId) {
    if (!confirm("Are you sure you want to verify this student's physical visit and grant them Portal access?")) return;
    let students = getStudents();
    const st = students.find(s => s.studentId === studentId);
    if (st) {
        st.status = "Confirmed";
        saveStudents(students);
        loadDashboardData();
        triggerNotification("Student Verified", `${st.name}'s portal access has been activated!`, "success");
        pushSystemDesktopNotification("Student Account Activated", `${st.name} can now log in to the student portal.`);
    }
}

function renderStudentAcademyCenter(studentsList) {
    const academyCenter = document.getElementById("studentAcademyCenter");
    if (!academyCenter) return;
    
    // Check if the role is student
    if (currentUserRole !== 'student') {
        academyCenter.style.display = "none";
        return;
    }
    
    academyCenter.style.display = "block";
    
    // Get the active student (matching logged-in student ID)
    const activeStudent = (studentsList && studentsList.length > 0)
        ? (studentsList.find(st => st.studentId === loggedInStudentId) || studentsList[0])
        : {
            name: "Valued Student",
            courseName: "Professional Bridal Makeup Course",
            startDate: new Date().toISOString().split('T')[0]
        };
    
    const courseName = activeStudent.courseName || "Professional Bridal Makeup Course";
    
    // Define course details database
    const courseDetails = {
        "Professional Bridal Makeup Course": {
            duration: "30 - 40 Days (3 Hours/Day)",
            fee: "Rs. 45,000",
            timings: [
                { batch: "Morning Batch", hours: "10:00 AM - 1:00 PM" },
                { batch: "Afternoon Batch", hours: "2:00 PM - 5:00 PM" }
            ],
            schedule: "Sunday to Friday (Saturday Off)",
            syllabus: [
                { title: "Week 1: Foundations & Fundamentals", desc: "Skin Anatomy, Advanced Sanitization, Color Wheel & Skin Undertone Theory" },
                { title: "Week 2: Sculpting & Eyes", desc: "Contouring, Highlighting, Baking & Face Shape Corrections" },
                { title: "Week 3: Advanced Eye Artistry", desc: "Cut-crease, Halo, Glitters, Liner Styles & Lash Artistry" },
                { title: "Week 4: Traditional Bridal Styles", desc: "Traditional Nepali, Indian, Reception, & Mehendi Looks" },
                { title: "Week 5: Airbrush & Draping", desc: "Airbrush Makeup Mechanics, Saree & Dupatta Draping Styles" },
                { title: "Week 6: Business & Hair Styling", desc: "Hair styling foundations, business setup & social media branding" }
            ],
            materials: [
                { name: "Professional Bridal Course Syllabus (PDF)", size: "1.4 MB", icon: "📄" },
                { name: "Required Cosmetics & Tools List (PDF)", size: "850 KB", icon: "🛠️" },
                { name: "Bridal Draping Guide Sheet (PDF)", size: "2.1 MB", icon: "👗" }
            ],
            notices: [
                "Class cancellation on June 15 due to studio outdoor shoot. Backup class will be held on Saturday.",
                "Please bring your own model for Week 3 eye artistry practice.",
                "Portfolio photo session is scheduled for the last week of the course. Prepare your bridal model accordingly."
            ]
        },
        "Self-Makeup Mastery Course": {
            duration: "7 Days (2 Hours/Day)",
            fee: "Rs. 10,000",
            timings: [
                { batch: "Evening Batch", hours: "4:00 PM - 6:00 PM" }
            ],
            schedule: "7 Consecutive Days",
            syllabus: [
                { title: "Day 1: Skin Prep & Bases", desc: "Understanding skin type, daily skincare prep, and choosing correct primer" },
                { title: "Day 2: Foundation & Concealer", desc: "Finding your perfect foundation match, concealer placement, and color correction" },
                { title: "Day 3: Eye Makeup Basics", desc: "Quick 10-minute office/casual makeup look and classic winged liner" },
                { title: "Day 4: Day to Night Glam", desc: "Transitioning casual makeup to a dramatic night-out transformation" },
                { title: "Day 5: Eyes & Lips Focus", desc: "Classic soft smoky eyes, lash placement, and defining bold lips" },
                { title: "Day 6: Kit Audit & Selection", desc: "Personal cosmetic kit audit - separating essentials from expired/unnecessary items" },
                { title: "Day 7: Final Hands-On & Graduation", desc: "Creating a complete look independently and photo shoot certification" }
            ],
            materials: [
                { name: "Self-Makeup Course Manual (PDF)", size: "2.8 MB", icon: "📘" },
                { name: "Daily Skincare Routine Checklist (PDF)", size: "420 KB", icon: "✨" },
                { name: "Personal Kit Audit Guide (PDF)", size: "1.1 MB", icon: "🎒" }
            ],
            notices: [
                "Bring your personal cosmetics bag on Day 6 for the Kit Audit.",
                "Certificates will be distributed at the end of the Day 7 session.",
                "Enjoy 10% student discount on all retail purchases at the Trendy Touch studio during your course."
            ]
        }
    };
    
    // Get info for current course, fallback if not found
    const details = courseDetails[courseName] || courseDetails["Professional Bridal Makeup Course"];
    
    // Construct HTML content
    let html = `
        <div class="student-academy-header" style="margin-bottom: 24px;">
            <h2 style="font-family: var(--font-heading); color: var(--color-text-dark); border-bottom: 2px solid var(--color-border); padding-bottom: 12px; font-size: 1.6rem;">
                🎓 Academy Student Portal
            </h2>
            <p style="color: var(--color-text-muted); font-size: 0.95rem; margin-top: 8px;">
                Welcome back, <strong>${escapeHtml(activeStudent.name)}</strong>. Review your enrolled course information, schedules, syllabus, and study materials below.
            </p>
        </div>
        
        <!-- Quick Stats / Enrolled Course Card -->
        <div class="active-course-status-card" style="background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(255,255,255,1) 100%); border: 1px solid var(--color-border); padding: 24px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(232, 167, 161, 0.15);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
                <div>
                    <span class="badge" style="background-color: var(--color-accent-gold); color: white; font-size: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; font-weight: 600;">Active Enrollment</span>
                    <h3 style="font-size: 1.5rem; color: var(--color-text-dark); margin: 8px 0;">${escapeHtml(courseName)}</h3>
                    <p style="font-size: 0.9rem; color: var(--color-text-muted);">
                        📅 <strong>Commences:</strong> ${activeStudent.startDate} &nbsp;|&nbsp; ⌛ <strong>Duration:</strong> ${details.duration}
                    </p>
                </div>
                <div style="text-align: right; min-width: 150px;">
                    <div style="font-size: 0.8rem; color: var(--color-text-muted);">Total Course Fee</div>
                    <div style="font-size: 1.6rem; font-weight: bold; color: var(--color-text-dark); margin-top: 2px;">${details.fee}</div>
                    <div class="badge" style="background-color: #E8F8F5; color: #117864; font-size: 0.75rem; font-weight: 600; display: inline-block; padding: 4px 8px; border-radius: 4px; margin-top: 6px;">✓ Admission Confirmed</div>
                </div>
            </div>
        </div>
        
        <div class="academy-resources-grid">
            <!-- Section 1: Time Schedule & Batches -->
            <div class="resource-card">
                <div class="resource-icon">⏰</div>
                <h4>Timing & Class Schedule</h4>
                <p>Please review your daily class timings. If you need to request a batch transfer, contact Babita Poudel at the desk.</p>
                <div style="background-color: var(--color-white); border: 1px dashed var(--color-border); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 6px; color: var(--color-text-dark);">Weekly Classes:</div>
                    <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 10px;">${details.schedule}</div>
                    
                    <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 6px; color: var(--color-text-dark);">Available Shifts:</div>
                    <ul style="list-style: none; padding-left: 0;">
                        ${details.timings.map(t => `
                            <li style="font-size: 0.8rem; color: var(--color-text-dark); margin-bottom: 6px; padding-left: 0; display: flex; align-items: center; gap: 6px;">
                                <span style="color: #2ECC71;">●</span> <strong>${t.batch}:</strong> ${t.hours}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <small style="color: var(--color-text-muted); font-style: italic;">* Please arrive 10 minutes prior to your batch time.</small>
            </div>
            
            <!-- Section 2: Syllabus Breakdown -->
            <div class="resource-card">
                <div class="resource-icon">📖</div>
                <h4>Syllabus Roadmap</h4>
                <p>Curriculum roadmap for your training modules:</p>
                <ul style="max-height: 200px; overflow-y: auto; padding-right: 6px; list-style: none;">
                    ${details.syllabus.map((s, idx) => `
                        <li style="margin-bottom: 12px; font-size: 0.8rem; border-left: 2px solid var(--color-accent-rose); padding-left: 8px;">
                            <strong>${escapeHtml(s.title)}</strong><br>
                            <span style="color: var(--color-text-muted); font-size: 0.75rem;">${escapeHtml(s.desc)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <!-- Section 3: Learning Materials & Downloads -->
            <div class="resource-card">
                <div class="resource-icon">📥</div>
                <h4>Course Resources</h4>
                <p>Download study manuals, kit lists, and guidelines prepared by Babita Poudel.</p>
                <ul style="margin-bottom: 16px; list-style: none;">
                    ${details.materials.map(m => `
                        <li style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(232, 167, 161, 0.15); padding-bottom: 6px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span>${m.icon}</span>
                                <span style="font-weight: 500; font-size: 0.8rem; color: var(--color-text-dark);">${escapeHtml(m.name)}</span>
                            </div>
                            <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">(${m.size})</span>
                        </li>
                    `).join('')}
                </ul>
                <button class="btn btn-sm btn-outline w-100" onclick="triggerNotification('Download Started', 'The resources pack is downloading to your device.', 'success')" style="margin-top: auto;">
                    📥 Download Resource Bundle
                </button>
            </div>
        </div>
        
        <!-- Notices and Instructor Info Row -->
        <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            <!-- Notices -->
            <div style="background-color: #FFF9E6; border: 1px solid #FFEAA8; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                <h4 style="font-family: var(--font-heading); color: #8A6D1C; font-size: 1.1rem; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    📢 Important Notices
                </h4>
                <ul style="padding-left: 16px; margin: 0; color: #6E5616;">
                    ${details.notices.map(n => `
                        <li style="font-size: 0.85rem; margin-bottom: 8px; line-height: 1.4;">
                            ${escapeHtml(n)}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <!-- Instructor Info -->
            <div style="background-color: var(--color-white); border: 1px solid var(--color-border); padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                <div class="instructor-avatar" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--color-accent-gold) 0%, var(--color-accent-rose) 100%); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: white; font-weight: bold; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
                    BP
                </div>
                <div>
                    <h4 style="font-size: 1rem; color: var(--color-text-dark); margin-bottom: 2px;">Your Instructor</h4>
                    <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-accent-gold); margin-bottom: 4px;">Babita Poudel</p>
                    <p style="font-size: 0.75rem; color: var(--color-text-muted); line-height: 1.3;">
                        Lead Makeup Artist & Academy Director<br>
                        💬 Contact Support: <strong>9851000000</strong> (Academy Office)
                    </p>
                </div>
            </div>
        </div>
    `;
    
    academyCenter.innerHTML = html;
}

function renderFeedbacksTable(list) {
    const tbody = document.getElementById("feedbacksTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No reviews recorded.</td></tr>`;
        return;
    }

    list.forEach(fb => {
        let stars = "";
        for (let i = 0; i < fb.rating; i++) stars += "★";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${escapeHtml(fb.name)}</strong></td>
            <td>${fb.service}</td>
            <td style="color:#F1C40F;">${stars}</td>
            <td>"${escapeHtml(fb.comment)}"</td>
            <td>
                <button class="table-btn btn-cancel" onclick="deleteFeedback('${fb.name}', '${fb.createdDate}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Search and status filter mechanism
function filterBookingsTable() {
    const search = document.getElementById("bookingSearch").value.toLowerCase();
    const status = document.getElementById("bookingFilterStatus").value;
    const bookings = getBookings();

    const filtered = bookings.filter(bk => {
        const matchesSearch = bk.name.toLowerCase().includes(search) || 
                              bk.phone.includes(search) || 
                              bk.package.toLowerCase().includes(search) || 
                              bk.id.toLowerCase().includes(search);
        
        const matchesStatus = status === "All" || bk.status === status;
        
        return matchesSearch && matchesStatus;
    });

    renderBookingsTable(filtered);
}

// Action controllers
function updateBookingStatus(id, newStatus) {
    const bookings = getBookings();
    const index = bookings.findIndex(bk => bk.id === id);
    if (index === -1) return;

    bookings[index].status = newStatus;
    saveBookings(bookings);
    loadDashboardData();

    triggerNotification("Booking Updated", `Booking ${id} is now ${newStatus}.`, "success");
}

function triggerBookingReschedule(id) {
    const newDate = prompt("Enter new Date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]);
    if (!newDate) return;
    const newTime = prompt("Enter preferred Time Slot (e.g. 10:00 AM, 02:00 PM):", "10:00 AM");
    if (!newTime) return;

    const bookings = getBookings();
    const index = bookings.findIndex(bk => bk.id === id);
    if (index === -1) return;

    bookings[index].dateTime = `${newDate}T${newTime}`;
    bookings[index].status = "Rescheduled";
    saveBookings(bookings);
    loadDashboardData();

    triggerNotification("Rescheduled Successfully", `Booking ${id} set to ${newDate} at ${newTime}`, "success");
}

function deleteFeedback(name, date) {
    if (!confirm("Are you sure you want to delete this feedback review?")) return;
    let feedbacks = getFeedbacks();
    feedbacks = feedbacks.filter(fb => !(fb.name === name && fb.createdDate === date));
    saveFeedbacks(feedbacks);

    loadDashboardData();
    renderTestimonialsSlider();
    triggerNotification("Review Deleted", "Feedback deleted from database records.", "warning");
}

// Switch dashboard tabs
function switchDashboardTab(tabName) {
    document.querySelectorAll(".dash-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".dashboard-tab-panel").forEach(panel => panel.classList.remove("active"));

    // Find trigger button and activate panel
    const btn = document.querySelector(`.dash-tab-btn[onclick*="${tabName}"]`);
    if (btn) btn.classList.add("active");

    const panel = document.getElementById(`dash-${tabName}`);
    if (panel) panel.classList.add("active");
}

// Switch landing page Packages tabs
function switchPackageTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".package-tab-content").forEach(c => c.classList.remove("active"));

    const btn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (btn) btn.classList.add("active");

    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) tab.classList.add("active");
}

// ==========================================================================
// INTERACTIVE UTILITIES & PLUGINS
// ==========================================================================

// Accordion Collapsible Logic
function toggleAccordion(element) {
    const parent = element.parentElement;
    const items = parent.querySelectorAll(".accordion-item");
    const isActive = element.classList.contains("active");

    items.forEach(item => {
        item.classList.remove("active");
        item.querySelector(".accordion-icon").textContent = "+";
    });

    if (!isActive) {
        element.classList.add("active");
        element.querySelector(".accordion-icon").textContent = "-";
    }
}

// Clipboard Copy logic with dynamic tooltip visual
function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = "Copied!";
        buttonElement.style.backgroundColor = "var(--color-accent-gold)";
        buttonElement.style.borderColor = "var(--color-accent-gold)";
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.backgroundColor = "";
            buttonElement.style.borderColor = "";
        }, 2000);
    }).catch(err => {
        console.error("Could not copy text: ", err);
    });
}

// Floating Widget menu trigger toggle
function toggleWidgetOptions() {
    const options = document.getElementById("widgetOptions");
    if (options) {
        options.classList.toggle("open");
    }
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

// ==========================================================================
// CLIENT GALLERY FEED
// ==========================================================================
let currentGalleryFilter = 'all';

function renderGalleryFeed(filter) {
    currentGalleryFilter = filter || currentGalleryFilter;
    const grid = document.getElementById("galleryFeedGrid");
    const emptyState = document.getElementById("galleryEmptyState");
    if (!grid) return;

    // Update filter button active states
    document.querySelectorAll(".gallery-filter-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.gallery-filter-btn[onclick*="'${currentGalleryFilter}'"]`);
    if (activeBtn) activeBtn.classList.add("active");

    let posts = getGallery();
    if (currentGalleryFilter !== 'all') {
        posts = posts.filter(p => p.type === currentGalleryFilter);
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
                  <video src="${post.mediaDataUrl}" preload="metadata" loop muted playsinline
                         onmouseenter="this.play()" onmouseleave="this.pause()"></video>
                  <div class="video-play-overlay"><span>&#9654;</span></div>
               </div>`
            : `<div class="gallery-post-media">
                  <img src="${post.mediaDataUrl}" alt="${escapeHtml(post.caption)}" loading="lazy">
               </div>`;

        card.innerHTML = `
            ${mediaHtml}
            <div class="gallery-post-info">
                <div class="gallery-tag-badge">${escapeHtml(post.tag)}</div>
                <p class="gallery-post-caption">${escapeHtml(post.caption)}</p>
                <div class="gallery-post-meta">
                    <span class="gallery-artist">&#128247; ${escapeHtml(post.postedBy)}</span>
                    <span class="gallery-date">${post.createdDate}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterGallery(type) {
    renderGalleryFeed(type);
}

// ==========================================================================
// ADMIN GALLERY MANAGEMENT
// ==========================================================================

function renderAdminGallery() {
    const listContainer = document.getElementById("galleryAdminList");
    if (!listContainer) return;

    const posts = getGallery();
    if (posts.length === 0) {
        listContainer.innerHTML = `<p class="text-center text-muted mt-4" style="padding:40px 0;">No posts yet. Use the form above to publish your first client transformation!</p>`;
        return;
    }

    listContainer.innerHTML = "";
    posts.forEach(post => {
        const item = document.createElement("div");
        item.className = "gallery-admin-item";

        const thumbHtml = post.type === "video"
            ? `<video class="gallery-admin-thumb" src="${post.mediaDataUrl}" muted preload="metadata"></video>`
            : `<img class="gallery-admin-thumb" src="${post.mediaDataUrl}" alt="thumbnail">`;

        item.innerHTML = `
            ${thumbHtml}
            <div class="gallery-admin-info">
                <span class="gallery-tag-badge badge-sm">${escapeHtml(post.tag)}</span>
                <p class="gallery-admin-caption">${escapeHtml(post.caption)}</p>
                <span class="gallery-admin-meta">by ${escapeHtml(post.postedBy)} &mdash; ${post.createdDate} at ${post.createdTime}</span>
            </div>
            <div class="gallery-admin-actions">
                <button class="table-btn btn-cancel" onclick="deleteGalleryPost('${post.id}')">&#128465; Delete</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

function deleteGalleryPost(id) {
    if (!confirm("Delete this post from the client gallery feed?")) return;
    let gallery = getGallery();
    gallery = gallery.filter(p => p.id !== id);
    saveGallery(gallery);
    renderAdminGallery();
    renderGalleryFeed(currentGalleryFilter);
    triggerNotification("Post Deleted", "The gallery post has been removed from the client feed.", "warning");
}

function previewGalleryFile(input) {
    const file = input.files[0];
    if (!file) return;

    const previewContainer = document.getElementById("galleryFilePreview");
    const dropInner = document.getElementById("fileDropInner");
    const dropZone = document.getElementById("galleryFileDrop");

    if (file.size > 52428800) { // 50MB limit
        triggerNotification("File Too Large", "Please select a file smaller than 50MB.", "warning");
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
                ? `<video src="${dataUrl}" controls class="gallery-preview-media"></video>
                   <p class="file-preview-name">&#127916; ${escapeHtml(file.name)} (${(file.size / 1024 / 1024).toFixed(2)} MB)</p>`
                : `<img src="${dataUrl}" class="gallery-preview-media" alt="preview">
                   <p class="file-preview-name">&#128247; ${escapeHtml(file.name)} (${(file.size / 1024 / 1024).toFixed(2)} MB)</p>`;
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

function submitGalleryPost(event) {
    event.preventDefault();
    const fileInput = document.getElementById("galleryFile");
    const file = fileInput.files[0];
    if (!file) {
        triggerNotification("No File Selected", "Please select a photo or video to post.", "warning");
        return;
    }

    const postedBy = document.getElementById("galleryPostedBy").value.trim();
    const tag = document.getElementById("galleryTag").value;
    const caption = document.getElementById("galleryCaption").value.trim();

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        const isVideo = file.type.startsWith("video/");
        const now = new Date();

        const newPost = {
            id: "GLP-" + Date.now(),
            postedBy,
            tag,
            caption,
            type: isVideo ? "video" : "photo",
            mediaDataUrl: dataUrl,
            createdDate: now.toISOString().split("T")[0],
            createdTime: now.toTimeString().slice(0, 5)
        };

        const gallery = getGallery();
        gallery.unshift(newPost);
        saveGallery(gallery);

        renderAdminGallery();
        renderGalleryFeed(currentGalleryFilter);
        clearGalleryForm();
        triggerNotification("Post Published!", `"${caption.substring(0, 45)}..." is now live in the client feed.`, "success");
    };
    reader.readAsDataURL(file);
}

// Setup real drag & drop functionality for the gallery admin panel
function setupDragAndDrop() {
    const dropZone = document.getElementById("galleryFileDrop");
    const fileInput = document.getElementById("galleryFile");
    
    if (!dropZone || !fileInput) return;

    // Prevent default behaviors for drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when item is dragged over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-active');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-active');
        }, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            fileInput.files = files;
            previewGalleryFile(fileInput);
        }
    }, false);
}

