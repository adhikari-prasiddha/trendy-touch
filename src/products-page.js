// Products page logic
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

    // Products data
    const products = [
        {
            name: "Professional 24-Piece Brush Set",
            category: "practice",
            badge: "Used for Practice",
            desc: "Ultra-soft synthetic hair brushes designed for students to master blending, contouring, and eyeshadow precision.",
            price: "Rs. 4,500",
            img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop"
        },
        {
            name: "HD Liquid Foundation Pro",
            category: "studio",
            badge: "Used in Studio",
            desc: "Used in our bridal sessions. 4K camera-ready, high-coverage matte formula infused with hyaluronic acid.",
            price: "Rs. 6,800",
            img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop"
        },
        {
            name: "Velvet Matte Liquid Lipstick",
            category: "sale",
            badge: "For Sale",
            desc: "Long-lasting, smudge-proof velvet lipstick in signature shades. Highly moisturizing and lightweight.",
            price: "Rs. 1,800",
            img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop"
        },
        {
            name: "Pro Eyeshadow Artistry Palette",
            category: "practice",
            badge: "Used for Practice",
            desc: "35 highly pigmented shimmers and mattes. Perfect for learning bridal cut-crease and editorial eye glams.",
            price: "Rs. 3,200",
            img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop"
        },
        {
            name: "Ultra Lock Setting Spray",
            category: "studio",
            badge: "Used in Studio",
            desc: "18-hour sweatproof locking spray. Kept in our pro setup to guarantee perfect longevity for humid weather.",
            price: "Rs. 2,900",
            img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop"
        },
        {
            name: "Hydra-Glow Face Primer",
            category: "sale",
            badge: "For Sale",
            desc: "Infused with vitamin E and rose extracts. Smooths pores and adds an instant natural lit-from-within glow.",
            price: "Rs. 2,400",
            img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop"
        }
    ];

    const grid = document.getElementById("productsGrid");

    function renderProducts(filterCategory) {
        if (!grid) return;
        grid.innerHTML = "";

        const filtered = filterCategory === "all" 
            ? products 
            : products.filter(p => p.category === filterCategory);

        filtered.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <div class="product-img-box">
                    <img src="${p.img}" alt="${p.name}" loading="lazy">
                    <span class="product-badge ${p.category}">${p.badge}</span>
                </div>
                <div class="product-details">
                    <h3>${p.name}</h3>
                    <p class="product-desc">${p.desc}</p>
                    <div class="product-footer">
                        <span class="product-price">${p.price}</span>
                        <a href="contact.html?inquiry=${encodeURIComponent(p.name)}" class="btn btn-sm btn-primary">Inquire</a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Setup filter buttons
    const filters = [
        { id: "prodFilterAll", cat: "all" },
        { id: "prodFilterStudio", cat: "studio" },
        { id: "prodFilterPractice", cat: "practice" },
        { id: "prodFilterSale", cat: "sale" }
    ];

    filters.forEach(f => {
        const btn = document.getElementById(f.id);
        if (btn) {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderProducts(f.cat);
            });
        }
    });

    // Initial render
    renderProducts("all");
});
