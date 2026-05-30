import { createBooking } from './api.js';

// Packages local database definitions
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

// Wizard State Variables
let wizCurrentStep = 1;
const totalWizSteps = 5;
let wizSelectedPackage = { category: "Bridal", name: "Royal Bridal HD Makeup", price: 25000 };
let wizVenueSelection = "Studio";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize datepicker min date to today
    const dateInput = document.getElementById("wizDate");
    if (dateInput) {
        dateInput.min = new Date().toISOString().split("T")[0];
    }

    // 2. Load Category dropdown dynamic list
    const categorySelect = document.getElementById("wizCategory");
    if (categorySelect) {
        categorySelect.addEventListener("change", (e) => {
            loadCategoryPackages(e.target.value);
        });
    }

    // 3. Register venue selection radios change
    const venueRadios = document.getElementsByName("bookingVenue");
    venueRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            handleVenueChange(e.target.value);
        });
    });

    // 4. Parse Query Parameters for deep linking
    parseQueryParams();

    // 5. Connect Navigation Buttons
    setupStepButtons();

    // 6. Final Booking submission
    const btnConfirm = document.getElementById("btnConfirmBooking");
    if (btnConfirm) {
        btnConfirm.addEventListener("click", confirmPreBooking);
    }

    // 7. Print Receipt handler
    const btnPrint = document.getElementById("btnPrintReceipt");
    if (btnPrint) {
        btnPrint.addEventListener("click", () => window.print());
    }

    // Initialize UI
    updateWizardUI();
});

// Parse Query Parameters from URL (e.g. ?venue=home&category=Bridal&package=Premium%20Bridal%20Airbrush)
function parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const venueParam = params.get('venue');
    const categoryParam = params.get('category');
    const packageParam = params.get('package');

    // 1. Venue Select
    if (venueParam && venueParam.toLowerCase() === 'home') {
        wizVenueSelection = "Home";
        const homeRadio = document.getElementById("venueHome");
        if (homeRadio) homeRadio.checked = true;
        handleVenueChange("Home");
    }

    // 2. Category Select
    let defaultCat = "Bridal";
    if (categoryParam) {
        const catSelect = document.getElementById("wizCategory");
        if (catSelect && PACKAGES_DATABASE.hasOwnProperty(categoryParam)) {
            catSelect.value = categoryParam;
            defaultCat = categoryParam;
        }
    }

    // 3. Package Select
    loadCategoryPackages(defaultCat);
    if (packageParam) {
        setTimeout(() => {
            const radios = document.getElementsByName("wizPackageRadio");
            radios.forEach(radio => {
                if (radio.value === packageParam) {
                    radio.checked = true;
                    const price = parseInt(radio.getAttribute("data-price"));
                    selectWizPackage(defaultCat, packageParam, price);
                }
            });
        }, 100);
    }
}

function handleVenueChange(value) {
    wizVenueSelection = value;
    const addressContainer = document.getElementById("wizAddressContainer");
    const addressInput = document.getElementById("wizAddress");

    if (wizVenueSelection === "Home") {
        if (addressContainer) addressContainer.style.display = "block";
        if (addressInput) addressInput.setAttribute("required", "required");
    } else {
        if (addressContainer) addressContainer.style.display = "none";
        if (addressInput) addressInput.removeAttribute("required");
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
            <input type="radio" name="wizPackageRadio" value="${pkg.name}" data-price="${pkg.price}" ${checked}>
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
        
        // Listen to change
        label.querySelector('input').addEventListener('change', () => {
            selectWizPackage(category, pkg.name, pkg.price);
        });
    });
    updateSummaryPrice();
}

function selectWizPackage(category, name, price) {
    wizSelectedPackage = { category, name, price };
    updateSummaryPrice();
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

    const sumBase = document.getElementById("sumBasePrice");
    const sumTravel = document.getElementById("sumTravelFee");
    const sumTotal = document.getElementById("sumTotalPrice");
    
    if (sumBase) sumBase.textContent = `Rs. ${base.toLocaleString()}`;
    if (sumTravel) sumTravel.textContent = `Rs. ${travel.toLocaleString()}`;
    if (sumTotal) sumTotal.textContent = `Rs. ${grandTotal.toLocaleString()}`;
}

function setupStepButtons() {
    // Step 1
    const n1 = document.getElementById("btnStep1Next");
    if (n1) n1.addEventListener("click", () => navigateToStep(2));

    // Step 2
    const b2 = document.getElementById("btnStep2Back");
    const n2 = document.getElementById("btnStep2Next");
    if (b2) b2.addEventListener("click", () => navigateToStep(1));
    if (n2) n2.addEventListener("click", () => navigateToStep(3));

    // Step 3
    const b3 = document.getElementById("btnStep3Back");
    const n3 = document.getElementById("btnStep3Next");
    if (b3) b3.addEventListener("click", () => navigateToStep(2));
    if (n3) {
        n3.addEventListener("click", () => {
            const dateVal = document.getElementById("wizDate").value;
            if (!dateVal) {
                triggerToast("Date Required", "Please choose a date for your makeup service.", "warning");
                return;
            }
            navigateToStep(4);
        });
    }

    // Step 4
    const b4 = document.getElementById("btnStep4Back");
    const n4 = document.getElementById("btnStep4Next");
    if (b4) b4.addEventListener("click", () => navigateToStep(3));
    if (n4) {
        n4.addEventListener("click", () => {
            const name = document.getElementById("wizName").value.trim();
            const phone = document.getElementById("wizPhone").value.trim();
            const email = document.getElementById("wizEmail").value.trim();
            const address = document.getElementById("wizAddress").value.trim();

            if (!name || !phone || !email) {
                triggerToast("Details Required", "Name, Phone and Email are required.", "warning");
                return;
            }
            if (wizVenueSelection === "Home" && !address) {
                triggerToast("Address Required", "Please enter the home service location address.", "warning");
                return;
            }
            navigateToStep(5);
        });
    }

    // Step 5
    const b5 = document.getElementById("btnStep5Back");
    if (b5) b5.addEventListener("click", () => navigateToStep(4));
}

function navigateToStep(step) {
    wizCurrentStep = step;
    updateWizardUI();
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

    // Populate summary if entering step 5
    if (wizCurrentStep === 5) {
        populateSummaryDetails();
    }
}

function populateSummaryDetails() {
    const name = document.getElementById("wizName").value;
    const phone = document.getElementById("wizPhone").value;
    const date = document.getElementById("wizDate").value;
    const time = document.getElementById("wizTime").value;
    
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
        if (sumAddressLine) sumAddressLine.style.display = "flex";
        document.getElementById("sumAddress").textContent = document.getElementById("wizAddress").value;
        document.getElementById("sumTravelFeeLine").style.display = "flex";
    } else {
        if (sumAddressLine) sumAddressLine.style.display = "none";
        document.getElementById("sumTravelFeeLine").style.display = "none";
    }

    updateSummaryPrice();
}

async function confirmPreBooking() {
    const name = document.getElementById("wizName").value.trim();
    const phone = document.getElementById("wizPhone").value.trim();
    const email = document.getElementById("wizEmail").value.trim();
    const date = document.getElementById("wizDate").value;
    const time = document.getElementById("wizTime").value;
    const address = document.getElementById("wizAddress").value.trim();

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

    // SQL timestamp format: YYYY-MM-DD HH:MM:SS
    // Combine date and time
    // E.g., date = "2026-05-25", time = "10:00 AM" -> "2026-05-25 10:00:00"
    let formattedTime = "10:00:00";
    if (time.includes("AM")) {
        const hour = time.split(":")[0];
        formattedTime = `${hour.padStart(2, '0')}:00:00`;
    } else {
        const hour = parseInt(time.split(":")[0]);
        const calculatedHour = hour === 12 ? 12 : hour + 12;
        formattedTime = `${calculatedHour}:00:00`;
    }
    const dateTimeSqlString = `${date}T${formattedTime}`;

    const newBooking = {
        id: refCode,
        name,
        phone,
        email,
        service_type: wizVenueSelection,
        category: wizSelectedPackage.category,
        package: wizSelectedPackage.name,
        addons: addonsList,
        date_time: dateTimeSqlString,
        address: wizVenueSelection === "Home" ? address : "Studio Session",
        base_price: base,
        travel_fee: travel,
        total_price: total,
        status: "Pending"
    };

    try {
        // Save to Supabase
        await createBooking(newBooking);

        // Hide steps indicators and panels, reveal success view
        document.querySelector(".wizard-body").style.display = "none";
        document.querySelector(".wizard-header").style.display = "none";
        
        const successPanel = document.getElementById("wizardSuccessPanel");
        if (successPanel) successPanel.style.display = "block";

        // Fill receipt
        document.getElementById("ticketRef").textContent = refCode;
        document.getElementById("ticketName").textContent = name;
        document.getElementById("ticketPackage").textContent = `${newBooking.package} (${newBooking.category})`;
        document.getElementById("ticketVenue").textContent = wizVenueSelection === "Home" ? `Home - ${address}` : "Pokhara Studio";
        document.getElementById("ticketDateTime").textContent = `${date} @ ${time}`;
        document.getElementById("ticketTotal").textContent = `Rs. ${total.toLocaleString()}`;

        triggerToast("Booking Requested!", "Your session pre-booking request was sent.", "success");
    } catch (e) {
        triggerToast("Booking Failed", "Failed to register booking in database. Please try again.", "error");
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
