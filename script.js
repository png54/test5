// تأكد من وضع رابطك هنا، ولكن حتى لو لم تضعه، الأزرار ستعمل الآن
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0dsPjCLrDGzfi5Vl1vSN9mYIRko-ORddU5FzD3mWSM-8AEjUL0Wzz879z_ow6sW57Ig/exec";

// 1. البيانات التجريبية لضمان عمل الموقع فوراً
const dummyProducts = [
    { 
        ProductID: '1', 
        Name: 'قميص كلاسيك فاخر', 
        NewPrice: '4500', 
        OldPrice: '6000',
        MainImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c717658?q=80&w=1000', 
        Sizes: 'M, L, XL', 
        Colors: 'أسود, أبيض', 
        Visible: "true" 
    },
    { 
        ProductID: '2', 
        Name: 'حذاء جلدي عصري', 
        NewPrice: '8500', 
        OldPrice: '12000',
        MainImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000', 
        Sizes: '40, 41, 42, 43', 
        Colors: 'بني, أسود', 
        Visible: "true" 
    }
];

// 2. نظام الترجمة
const i18n = {
    ar: { home: "الرئيسية", clothes: "ملابس", shoes: "أحذية", heroTitle: "مجموعة جديدة", heroSub: "أناقة بلا حدود", shopNow: "تسوق الآن", newArrivals: "وصلنا حديثاً", confirmOrder: "تأكيد الطلب", buyNow: "تأكيد الشراء", name: "الاسم الكامل", address: "العنوان" },
    fr: { home: "Accueil", clothes: "Vêtements", shoes: "Chaussures", heroTitle: "NOUVELLE COLLECTION", heroSub: "Élégance sans limites", shopNow: "Acheter", newArrivals: "Nouveautés", confirmOrder: "Confirmer", buyNow: "Acheter maintenant", name: "Nom Complet", address: "Adresse" }
};

let currentLang = 'ar';

// 3. تشغيل الموقع
window.onload = () => {
    console.log("DZYN Store Loaded"); // للتأكد من أن الملف اشتغل
    initApp();
};

function initApp() {
    setupLanguage();
    setupModals();
    fetchData();
    loadWilayas();
}

// إعداد تبديل اللغة
function setupLanguage() {
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.onclick = (e) => {
            e.preventDefault();
            currentLang = currentLang === 'ar' ? 'fr' : 'ar';
            langBtn.innerText = currentLang === 'ar' ? 'FR' : 'AR';
            document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = currentLang;
            updateUI();
        };
    }
}

// تحديث النصوص في الموقع
function updateUI() {
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (i18n[currentLang][key]) el.innerText = i18n[currentLang][key];
    });
}

// إعداد النوافذ المنبثقة (Modal)
function setupModals() {
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.onclick = () => {
            document.getElementById('orderModal').style.display = 'none';
        };
    }

    // إغلاق المودال عند الضغط خارجه
    window.onclick = (event) => {
        const modal = document.getElementById('orderModal');
        if (event.target == modal) modal.style.display = 'none';
    };
}

// جلب البيانات من Google Sheets
async function fetchData() {
    const grid = document.getElementById('productsGrid');
    try {
        const res = await fetch(`${SCRIPT_URL}?action=getProducts`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderProducts(data.length > 0 ? data : dummyProducts);
    } catch (e) {
        console.warn("فشل الاتصال بـ Google Sheets، تم عرض البيانات التجريبية.");
        renderProducts(dummyProducts);
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = ""; // مسح المحتوى الحالي
    
    products.forEach(p => {
        if (p.Visible === "true" || p.Visible === true) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${p.MainImage}" alt="${p.Name}">
                <div class="product-info">
                    <h4>${p.Name}</h4>
                    <p class="price">${p.NewPrice} د.ج</p>
                    <button class="btn-buy-now">اطلب الآن</button>
                </div>
            `;
            card.onclick = () => openOrderModal(p);
            grid.appendChild(card);
        }
    });
}

function openOrderModal(product) {
    const modal = document.getElementById('orderModal');
    document.getElementById('selectedProdName').innerText = product.Name;
    
    // تعبئة المقاسات والألوان
    fillOptions('size', product.Sizes);
    fillOptions('color', product.Colors);
    
    modal.style.display = 'block';
    window.currentProduct = product;
}

function fillOptions(id, str) {
    const el = document.getElementById(id);
    el.innerHTML = '<option value="">--</option>';
    if (str) {
        str.split(',').forEach(v => {
            let opt = document.createElement('option');
            opt.value = v.trim();
            opt.innerText = v.trim();
            el.appendChild(opt);
        });
    }
}

// دالة الولايات
function loadWilayas() {
    const select = document.getElementById('wilaya');
    const wilayas = ["01-Adrar", "02-Chlef", "06-Bejaia", "16-Alger", "19-Setif", "31-Oran"]; // أمثلة
    wilayas.forEach(w => {
        let opt = document.createElement('option');
        opt.value = w; opt.innerText = w;
        select.appendChild(opt);
    });
}

// إرسال الطلب
document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerText = "...";

    const data = {
        action: 'addOrder',
        payload: {
            ProductName: window.currentProduct.Name,
            FullName: document.getElementById('fullName').value,
            Phone: "+213" + document.getElementById('phone').value,
            Wilaya: document.getElementById('wilaya').value,
            Size: document.getElementById('size').value,
            Color: document.getElementById('color').value
        }
    };

    try {
        await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) });
        alert("تم إرسال طلبك بنجاح!");
        document.getElementById('orderModal').style.display = 'none';
    } catch (err) {
        alert("فشل الإرسال، تحقق من إعدادات السكريبت.");
    } finally {
        btn.disabled = false;
        btn.innerText = i18n[currentLang].buyNow;
    }
};
