const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0dsPjCLrDGzfi5Vl1vSN9mYIRko-ORddU5FzD3mWSM-8AEjUL0Wzz879z_ow6sW57Ig/exec";

const wilayas = [
    "01-أدرار", "02-الشلف", "03-الأغواط", "04-أم البواقي", "05-باتنة", "06-بجاية", "07-بسكرة", "08-بشار", "09-البليدة", "10-البويرة",
    "11-تمنراست", "12-تبسة", "13-تلمسان", "14-تيارت", "15-تيزي وزو", "16-الجزائر", "17-الجلفة", "18-جيجل", "19-سطيف", "20-سعيدة",
    "21-سكيكدة", "22-سيدي بلعباس", "23-عنابة", "24-قالمة", "25-قسنطينة", "26-المدية", "27-مستغانم", "28-المسيلة", "29-معسكر", "30-ورقلة",
    "31-وهران", "32-البيض", "33-إليزي", "34-برج بوعريريج", "35-بومرداس", "36-الطارف", "37-تندوف", "38-تيسمسيلت", "39-الوادي", "40-خنشلة",
    "41-سوق أهراس", "42-تيبازة", "43-ميلة", "44-عين الدفلى", "45-النعامة", "46-عين تموشنت", "47-غرداية", "48-غليزان", "49-تيميمون", "50-برج باجي مختار",
    "51-أولاد جلال", "52-بني عباس", "53-عين صالح", "54-عين قزام", "55-تقرت", "56-جانت", "57-المغير", "58-المنيعة"
];

let allProducts = [];

// جلب البيانات عند البداية
window.addEventListener('DOMContentLoaded', () => {
    loadWilayas();
    fetchData();
});

function loadWilayas() {
    const select = document.getElementById('wilaya');
    wilayas.forEach(w => {
        let opt = document.createElement('option');
        opt.value = w;
        opt.textContent = w;
        select.appendChild(opt);
    });
}

async function fetchData() {
    try {
        const res = await fetch(`${SCRIPT_URL}?action=getProducts`);
        allProducts = await res.json();
        renderProducts(allProducts);
        document.getElementById('loader').style.display = 'none';
    } catch (err) {
        showToast("خطأ في الاتصال بالخادم");
    }
}

function renderProducts(items) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = items.map(p => `
        <div class="product-card" onclick="openOrderModal('${p.ProductID}')">
            <img src="${p.MainImage}" alt="${p.Name}">
            <div class="product-info">
                <h4>${p.Name}</h4>
                <p class="price">${p.NewPrice} د.ج</p>
            </div>
        </div>
    `).join('');
}

let selectedProduct = null;

function openOrderModal(id) {
    selectedProduct = allProducts.find(p => p.ProductID == id);
    document.getElementById('selectedProdName').innerText = selectedProduct.Name;
    
    // تعبئة المقاسات والألوان
    fillSelect('size', selectedProduct.Sizes);
    fillSelect('color', selectedProduct.Colors);
    
    document.getElementById('orderModal').style.display = 'block';
}

function fillSelect(id, data) {
    const el = document.getElementById(id);
    el.innerHTML = '<option value="">اختر</option>';
    data.split(',').forEach(item => {
        let opt = document.createElement('option');
        opt.value = item.trim();
        opt.textContent = item.trim();
        el.appendChild(opt);
    });
}

// إغلاق المودال
document.querySelector('.close-modal').onclick = () => {
    document.getElementById('orderModal').style.display = 'none';
};

// إرسال الطلب
document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "جاري الإرسال...";
    btn.disabled = true;

    const orderData = {
        action: 'addOrder',
        payload: {
            ProductID: selectedProduct.ProductID,
            ProductName: selectedProduct.Name,
            Price: selectedProduct.NewPrice,
            FullName: document.getElementById('fullName').value,
            Phone: "+213" + document.getElementById('phone').value,
            Wilaya: document.getElementById('wilaya').value,
            Address: document.getElementById('address').value,
            Size: document.getElementById('size').value,
            Color: document.getElementById('color').value,
            ShippingCompany: document.getElementById('shipping').value,
            Quantity: 1
        }
    };

    try {
        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        showToast("تم إرسال طلبك بنجاح!");
        document.getElementById('orderModal').style.display = 'none';
    } catch (err) {
        showToast("حدث خطأ، حاول ثانية");
    } finally {
        btn.innerText = "تأكيد الشراء";
        btn.disabled = false;
    }
};

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}