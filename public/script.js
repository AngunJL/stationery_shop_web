const loginBtn = document.getElementById('loginBtn');
const authModal = document.getElementById('authModal');
const closeModal = document.getElementById('closeModal');
const loginFormWrapper = document.getElementById('loginFormWrapper');
const registerFormWrapper = document.getElementById('registerFormWrapper');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');

loginBtn.addEventListener('click', () => {
    authModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    authModal.style.display = 'none';
    resetForms();
});

window.addEventListener('click', (event) => {
    if (event.target === authModal) {
        authModal.style.display = 'none';
        resetForms();
    }
});

showRegister.addEventListener('click', () => {
    loginFormWrapper.style.display = 'none';
    registerFormWrapper.style.display = 'block';
});

showLogin.addEventListener('click', () => {
    registerFormWrapper.style.display = 'none';
    loginFormWrapper.style.display = 'block';
});

function resetForms() {
    loginFormWrapper.style.display = 'block';
    registerFormWrapper.style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

/*
fetch('/api/products') // ไปเรียกข้อมูลจากหลังบ้าน
    .then(response => response.json())
    .then(products => {
        const productGrid = document.getElementById('productGrid');
        // เอาข้อมูลที่ได้จาก Database มาวนลูปสร้างลงหน้าเว็บ
        products.forEach(product => {
            productGrid.innerHTML += `
                <div class="product-card">
                    <img src="${product.Image}" class="product-image">
                    <h3 class="product-name">${product.ProductName}</h3>
                    <p class="product-price">${product.Price} บาท</p>
                    <button class="btn-add-cart">เพิ่มลงตะกร้า</button>
                </div>
            `;
        });
    });*/