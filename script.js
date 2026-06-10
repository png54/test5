const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0dsPjCLrDGzfi5Vl1vSN9mYIRko-ORddU5FzD3mWSM-8AEjUL0Wzz879z_ow6sW57Ig/exec";

// 1. نظام الترجمة
const i18n = {
    ar: {
        home: "الرئيسية", clothes: "ملابس", shoes: "أحذية",
        heroTitle: "مجموعة جديدة", heroSub: "اكتشف الفخامة في كل خطوة",
        shopNow: "تسوق الآن", newArrivals: "وصلنا حديثاً",
        confirmOrder: "تأكيد الطلب", buyNow: "تأكيد الشراء",
        namePlaceholder: "الاسم الكامل", addressPlaceholder: "العنوان بالتفصيل"
    },
    fr: {
        home: "Accueil", clothes: "Vêtements", shoes: "Chaussures",
        heroTitle: "NOUVELLE COLLECTION", heroSub: "Découvrez le luxe à chaque pas",
        shopNow: "Acheter", newArrivals: "Nouveautés",
        confirmOrder: "Confirmer la commande", buyNow: "Acheter maintenant",
        namePlaceholder: "Nom Complet", addressPlaceholder: "Adresse Détillée"
    }
};

let currentLang = 'ar';

// 2. بيانات تجريبية (تظهر إذا كان الـ Sheet فارغاً)
const dummyProducts = [
    { ProductID: '1', Name: 'المنتج التجريبي 1', NewPrice: '4500', MainImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', Sizes: '40,41,42', Colors: 'أسود,أبيض', Visible: true },
    { ProductID: '2', Name: 'المنتج التجريبي 2', NewPrice: '3800', MainImage: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', Sizes: 'M,L,XL', Colors: 'أزرق,رمادي', Visible: true }
];

// 3. الولايات الجزائرية
const wilayas = ["01-Adrar", "02-Chlef", "03-Laghouat", "04-Oum El Bouaghi", "05-Batna", "06-Bejaia", "07-Biskra", "08-Bechar", "09-Blida", "10-Bouira", "16-Alger", "19-Setif", "31-Oran"]; // اختصار للتبسيط

window.onload = () => {
    initApp();
    setupEventListeners();
};

async function initApp() {
    loadWilayas();
    updateUI();
    fetchData();
}

function setupEventListeners() {
    // تبديل اللغة
    document.getElementById('langBtn').onclick = function() {
        currentLang = currentLang === 'ar' ? 'fr' : 'ar';
        this.innerText = currentLang === 'ar' ? 'FR' : 'AR';
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        updateUI();
    };

    // إغلاق المودال
    document.querySelector('.close-modal').onclick = () => {
        document.getElementById('orderModal').style.display = 'none';
    };

    // إرسال النموذج
    document.getElementById('orderForm').onsubmit = handleOrder;
}

function updateUI() {
    document.querySelectorAll('[data-key]').forEach(el => {
        el.innerText = i18n[currentLang][el.getAttribute('data-key')];
    });
    document.querySelectorAll('[data-placeholder]').forEach(el => {
        el.placeholder = i18n[currentLang][el.getAttribute('data-placeholder')];
    });
}

function loadWilayas() {
    const select = document.getElementById('wilaya');
    wilayas.forEach(w => {
        let opt = document.createElement('option');
        opt.value = w; opt.innerText = w;
        select.appendChild(opt);
    });
}

async function fetchData() {
    try {
        const res = await fetch(`${SCRIPT_URL}?action=getProducts`);
        const data = await res.json();
        renderProducts(data.length > 0 ? data : dummyProducts);
    } catch (e) {
        console.log("Using dummy data...");
        renderProducts(dummyProducts);
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openOrderModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">
            <img src="${p.MainImage}" alt="${p.Name}">
            <div class="product-info">
                <h4>${p.Name}</h4>
                <p class="price">${p.NewPrice} DZD</p>
            </div>
        </div>
    `).join('');
}

function openOrderModal(product) {
    document.getElementById('selectedProdName').innerText = product.Name;
    fillOptions('size', product.Sizes);
    fillOptions('color', product.Colors);
    document.getElementById('orderModal').style.display = 'block';
    window.currentProduct = product;
}

function fillOptions(id, str) {
    const el = document.getElementById(id);
    el.innerHTML = '<option value="">Select</option>';
    if(!str) return;
    str.split(',').forEach(v => {
        let opt = document.createElement('option');
        opt.value = v.trim(); opt.innerText = v.trim();
        el.appendChild(opt);
    });
}

async function handleOrder(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; btn.innerText = "...";

    const payload = {
        action: 'addOrder',
        payload: {
            ProductID: window.currentProduct.ProductID,
            ProductName: window.currentProduct.Name,
            FullName: document.getElementById('fullName').value,
            Phone: "+213" + document.getElementById('phone').value,
            Wilaya: document.getElementById('wilaya').value,
            Size: document.getElementById('size').value,
            Color: document.getElementById('color').value,
            Price: window.currentProduct.NewPrice
        }
    };

    try {
        await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
        alert("Success! / تم الطلب بنجاح");
        document.getElementById('orderModal').style.display = 'none';
    } catch (err) {
        alert("Error connecting to server");
    } finally {
        btn.disabled = false; btn.innerText = i18n[currentLang].buyNow;
    }
}
