const loginBtn = document.getElementById('loginBtn');
const authModal = document.getElementById('authModal');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const loginFormWrapper = document.getElementById('loginFormWrapper');
const registerFormWrapper = document.getElementById('registerFormWrapper');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');

if (loginBtn && authModal) {
    loginBtn.addEventListener('click', () => {
        authModal.style.display = 'flex';
        toggleAuthForm('login'); // เปิดมาหน้าแรกบังคับให้เป็น Login
    });
}

// ปิดป๊อปอัป
function closeAuthModal() {
    if (authModal) authModal.style.display = 'none';
}

// ฟังก์ชันสลับหน้า Login / Register
function toggleAuthForm(type) {
    if (type === 'register') {
        document.getElementById('loginFormSection').style.display = 'none';
        document.getElementById('registerFormSection').style.display = 'block';
    } else {
        document.getElementById('loginFormSection').style.display = 'block';
        document.getElementById('registerFormSection').style.display = 'none';
    }
}

// ฟังก์ชันสมัครสมาชิก
function submitRegister() {
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const user = document.getElementById('regUsername').value;
    const pass = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;

    // 1. เช็คว่ากรอกข้อมูลครบหรือไม่ (เว้น Address ไว้ไม่บังคับ)
    if (!firstName || !lastName || !email || !phone || !user || !pass || !confirmPass) {
        alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
    }

    if (pass !== confirmPass) {
        alert('รหัสผ่าน และ ยืนยันรหัสผ่าน ไม่ตรงกัน!');
        return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(pass)) {
        alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวอักษรและตัวเลข');
        return;
    }

    // รวมข้อมูลทั้งหมดเพื่อส่งไป API
    const newUserData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        username: user,
        password: pass
    };

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            toggleAuthForm('login'); 
            
            // เคลียร์ข้อมูลฟอร์ม
            document.getElementById('regFirstName').value = '';
            document.getElementById('regLastName').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPhone').value = '';
            document.getElementById('regUsername').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regConfirmPassword').value = '';
        } else {
            alert(data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

function resetForms() {
    loginFormWrapper.style.display = 'block';
    registerFormWrapper.style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}
// 1. โหลดหมวดหมู่และสร้างปุ่มให้กดได้
function loadCategories() {
    fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            const categoryList = document.getElementById('categoryList');
            if (!categoryList) return;
            
            // ปุ่ม "ทั้งหมด"
            categoryList.innerHTML = `<button onclick="loadProducts()" class="btn-category">All</button> `;
            
            // วนลูปสร้างปุ่มหมวดหมู่ที่ดึงมาจาก DB
            categories.forEach(cat => {
                categoryList.innerHTML += `<button onclick="loadProducts(${cat.CategoryID})" class="btn-category">${cat.CategoryName}</button> `;
            });
        })
        .catch(error => console.error('Error loading categories:', error));
}

// 2. โหลดสินค้า (ถ้ามีส่ง id หมวดหมู่มา จะแสดงเฉพาะหมวดหมู่นั้น)
function loadProducts(categoryId = null) {
    let url = '/api/products';
    if (categoryId) {
        url += `?category=${categoryId}`; // แนบเงื่อนไขไปที่ API
    }

    fetch(url)
        .then(response => response.json())
        .then(products => {
            const productGrid = document.getElementById('productGrid');
            if(!productGrid) return;
            productGrid.innerHTML = ''; 
            
            products.forEach(product => {
                // ปุ่ม Add to Cart จะเรียกฟังก์ชัน addToCart พร้อมส่งข้อมูลสินค้า
                const productCard = `
                    <div class="product-card">
                        <img src="${product.Image}" alt="${product.ProductName}" class="product-image" style="width:100%; height:200px; object-fit:cover;">
                        <h3 class="product-name">${product.ProductName}</h3>
                        <p class="product-price">${product.Price} THB</p>
                        <button class="btn-add-cart" onclick="addToCart(${product.ProductID}, '${product.ProductName}', ${product.Price})">Add to Cart</button>
                    </div>
                `;
                productGrid.innerHTML += productCard;
            });
        })
        .catch(error => console.error('Error loading products:', error));
}

// 3. ฟังก์ชันเพิ่มลงตะกร้า (เก็บลง LocalStorage เพื่อให้ข้ามหน้าเว็บได้)
function addToCart(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // เช็คว่ามีสินค้านี้ในตะกร้าหรือยัง
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    
    // เซฟลงเบราว์เซอร์
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // อัปเดตตัวเลข
    updateCartCount();
    alert(`เพิ่ม ${name} ลงตะกร้าแล้ว!`);
}

// 4. ฟังก์ชันอัปเดตตัวเลขตะกร้าด้านบน (Navbar)
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    // รวมจำนวนสินค้าทั้งหมดในตะกร้า
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = `(${totalItems})`;
    }
}


// ==========================================
// ส่วนสำหรับหน้า Cart (ตะกร้าสินค้า)
// ==========================================

function loadCartItems() {
    const container = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    
    // ถ้าไม่มี id นี้ในหน้าเว็บ แปลว่าไม่ได้อยู่หน้า cart ให้หยุดทำงาน
    if (!container) return; 

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="padding: 20px;">ตะกร้าสินค้าของคุณว่างเปล่า ไปเลือกซื้อสินค้ากันเถอะ!</p>';
        subtotalEl.innerText = '0 THB';
        totalEl.innerText = '0 THB';
        return;
    }

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        
        container.innerHTML += `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Price: ${item.price} THB</p>
                </div>
                <div class="cart-item-actions">
                    <input type="number" value="${item.quantity}" min="1" class="qty-input" style="width: 50px;" onchange="changeQuantity(${item.id}, this.value)">
                    <button class="btn-remove" onclick="removeFromCart(${item.id})" style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">Remove</button>
                </div>
            </div>
        `;
    });

    subtotalEl.innerText = `${subtotal} THB`;
    totalEl.innerText = `${subtotal} THB`; // Total ตอนนี้ยังเท่ากับ Subtotal ไปก่อน (ยังไม่รวมค่าส่ง/ส่วนลด)
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount(); // อัปเดตเลข Navbar
    loadCartItems();   // รีเฟรชหน้าตะกร้า
}

function changeQuantity(id, newQty) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = parseInt(newQty);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        loadCartItems();
    }
}
// ==========================================
// ระบบ Login
// ==========================================

// เปิดป๊อปอัป
if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
}

// ปิดป๊อปอัป
if (closeModal && loginModal) {
    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
}

// ฟังก์ชันเข้าสู่ระบบ (Login)
function submitLogin() {
    const user = document.getElementById('loginUsername').value;
    const pass = document.getElementById('loginPassword').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data)); // บันทึกข้อมูลลงเครื่อง

            if (data.role === 'Admin') {
                window.location.href = '/Admin.html';
            } else {
                alert('ยินดีต้อนรับ ' + data.username);
                closeAuthModal();     // 1. สั่งปิดป๊อปอัปทันที
                checkLoginStatus();   // 2. เรียกคำสั่งซ่อนปุ่ม Login
            }
        } else {
            alert(data.message || data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

// ==========================================
// ฟังก์ชันจัดการปุ่ม Login/Logout บน Navbar
// ==========================================
function checkLoginStatus() {
    const userObj = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('loginBtn');
    
    if (userObj && loginBtn) {
        // 1. ซ่อนปุ่ม Login
        loginBtn.style.display = 'none';

        // 2. ตรวจสอบว่ามีปุ่ม Logout หรือยัง ถ้ายังไม่มีให้สร้างขึ้นมาใหม่
        if (!document.getElementById('logoutBtn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.innerText = 'Logout';
            logoutBtn.style = 'background:#1f9c30; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;';
            logoutBtn.onclick = function() {
                localStorage.removeItem('user'); // ลบข้อมูลตอนกดออก
                window.location.reload();        // รีเฟรชหน้าเว็บใหม่
            };
            
            // นำปุ่ม Logout ไปวางแทนที่ข้างๆ ปุ่ม Login เดิม
            loginBtn.parentNode.insertBefore(logoutBtn, loginBtn.nextSibling);
        }
    }
}


// ==========================================
// ระบบหน้า Admin (ดึงข้อมูลสินค้ามาแสดงเป็นตาราง)
// ==========================================
function loadAdminProducts() {
    
    const adminTable = document.getElementById('adminProductTable');
    if (!adminTable) return; // ถ้าไม่ได้อยู่หน้า Admin ให้ข้ามไป

    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            adminTable.innerHTML = '';
            products.forEach(p => {
                adminTable.innerHTML += `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${p.ProductID}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;"><img src="${p.Image}" width="50" style="border-radius:5px;"></td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${p.ProductName}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${p.Price} ฿</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${p.StockQuantity}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">
                        <button onclick="deleteProduct(${p.ProductID})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">ลบ</button>                        </td>
                    </tr>
                `;
            });
        });
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/';
}

// ==========================================
// ระบบเพิ่มสินค้าใหม่ (เฉพาะหน้า Admin)
// ==========================================

// เปิด/ปิด ป๊อปอัป
function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
}

function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
}

// ฟังก์ชันเมื่อกดปุ่ม "บันทึกสินค้า"
function submitNewProduct(event) {
    event.preventDefault(); // ป้องกันไม่ให้หน้าเว็บรีเฟรชตัวเอง

    // ดึงค่าจากช่องกรอกข้อมูล
    const newProduct = {
        categoryId: document.getElementById('newProductCategory').value,
        name: document.getElementById('newProductName').value,
        description: document.getElementById('newProductDesc').value,
        price: document.getElementById('newProductPrice').value,
        stock: document.getElementById('newProductStock').value,
        image: document.getElementById('newProductImage').value
    };

    // ส่งข้อมูลไปให้ API
    fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Added new product successfully!');
            closeAddProductModal(); // ปิดหน้าต่าง
            document.getElementById('addProductForm').reset(); // ล้างฟอร์มให้ว่าง
            loadAdminProducts(); // รีเฟรชตารางให้สินค้าใหม่โผล่ขึ้นมาทันที!
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

// ฟังก์ชันลบสินค้า
function deleteProduct(id) {
    // เด้ง Popup ถามความแน่ใจก่อนลบ
    if (confirm('Are you sure you want to delete this product?')) {
        
        // ส่งคำสั่งลบไปที่ API พร้อมแนบ id ไปกับ URL
        fetch(`/api/products/${id}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Deleted product successfully!');
                loadAdminProducts(); // รีเฟรชตารางใหม่เพื่อให้สินค้าที่โดนลบหายไป
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    }
}
// ==========================================
// ระบบดึงข้อมูลคำสั่งซื้อ (เฉพาะหน้า Admin)
// ==========================================
function loadAdminOrders() {
    const adminOrderTable = document.getElementById('adminOrderTable');
    if (!adminOrderTable) return; // ถ้าไม่ได้อยู่หน้า Admin ให้ข้ามไป

    fetch('/api/admin/orders')
        .then(response => response.json())
        .then(orders => {
            adminOrderTable.innerHTML = '';
            orders.forEach(o => {
                // แปลงรูปแบบวันที่และเวลาให้อ่านง่ายขึ้น
                const orderDate = new Date(o.OrderDate).toLocaleString('th-TH');
                adminOrderTable.innerHTML += `
    <tr>
        <td style="padding:10px; border-bottom:1px solid #eee;">#${o.OrderID}</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">${o.Username}</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">${orderDate}</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">${o.TotalAmount} ฿</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">${o.DeliveryMethod}</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">
            <span style="padding: 3px 8px; border-radius: 12px; background: #e3f2fd; color: #0d47a1; font-size: 14px;">${o.Status}</span>
        </td>
        <td style="padding:10px; border-bottom:1px solid #eee;">
            <!-- เพิ่มปุ่ม รายละเอียด -->
            <button onclick="toggleOrderDetails(${o.OrderID})" style="width: 95px; text-align: center; background:#17a2b8; color:white; border:none; padding:6px 10px; border-radius:3px; cursor:pointer; margin-right:5px;">รายละเอียด</button>
<button onclick="openUpdateStatusModal(${o.OrderID}, '${o.Status}')" style="width: 95px; text-align: center; background:#007bff; color:white; border:none; padding:6px 10px; border-radius:3px; cursor:pointer;">อัปเดต</button>        </td>
    </tr>
    <!-- แถวสำหรับแสดง Dropdown (ซ่อนไว้ก่อนตั้งแต่แรก) -->
    <tr id="details-row-${o.OrderID}" style="display: none; background-color: #f8f9fa;">
        <td colspan="7" style="padding: 15px; border-bottom: 2px solid #ddd;">
            <div id="details-content-${o.OrderID}">กำลังโหลดข้อมูล...</div>
        </td>
    </tr>
`;
            });
        })
        .catch(error => console.error('Error loading orders:', error));
}
// ==========================================
// ฟังก์ชันกดเปิด/ปิดรายละเอียดคำสั่งซื้อ (Dropdown)
// ==========================================
function toggleOrderDetails(orderId) {
    const row = document.getElementById(`details-row-${orderId}`);
    const content = document.getElementById(`details-content-${orderId}`);
    
    // ถ้ากำลังซ่อนอยู่ ให้เปิดขึ้นมาและดึงข้อมูลจาก API
    if (row.style.display === 'none') {
        row.style.display = 'table-row';
        
        fetch(`/api/admin/orders/${orderId}/details`)
            .then(res => res.json())
            .then(details => {
                if (details.length === 0) {
                    content.innerHTML = '<p style="color:red;">ไม่พบข้อมูลสินค้าในบิลนี้</p>';
                    return;
                }
                
                // สร้างตารางเล็กๆ ซ้อนไว้ข้างใน
                let html = '<table style="width:95%; margin: 0 auto; background:white; border-collapse:collapse; box-shadow:0 0 5px rgba(0,0,0,0.1);">';
                html += '<tr style="background:#e9ecef;"> <th style="padding:8px; text-align:left;">รูป</th> <th style="padding:8px; text-align:left;">ชื่อสินค้า</th> <th style="padding:8px; text-align:center;">ราคา/ชิ้น</th> <th style="padding:8px; text-align:center;">จำนวน</th> <th style="padding:8px; text-align:center;">รวม</th> </tr>';
                
                details.forEach(item => {
                    const lineTotal = item.UnitPrice * item.Quantity;
                    html += `
                        <tr>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><img src="${item.Image}" width="40" style="border-radius:4px;"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;">${item.ProductName}</td>
                            <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.UnitPrice} ฿</td>
                            <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.Quantity}</td>
                            <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${lineTotal} ฿</td>
                        </tr>
                    `;
                });
                html += '</table>';
                content.innerHTML = html; // นำไปแสดงผล
            })
            .catch(error => {
                console.error(error);
                content.innerHTML = '<p style="color:red;">โหลดข้อมูลไม่สำเร็จ</p>';
            });
    } else {
        // ถ้าเปิดอยู่ แล้วกดซ้ำ ให้ปิด (ซ่อน)
        row.style.display = 'none';
    }
}
// ==========================================
// ฟังก์ชันสลับเมนูในหน้า Admin
// ==========================================
function switchAdminMenu(menuName) {
    const sectionProducts = document.getElementById('sectionProducts');
    const sectionOrders = document.getElementById('sectionOrders');
    const btnProducts = document.getElementById('btnMenuProducts');
    const btnOrders = document.getElementById('btnMenuOrders');

    // ถ้ากดปุ่ม สินค้า
    if (menuName === 'products') {
        sectionProducts.style.display = 'block'; // โชว์ตารางสินค้า
        sectionOrders.style.display = 'none';    // ซ่อนตารางคำสั่งซื้อ
        
        // เปลี่ยนสีปุ่มให้รู้ว่ากำลังเลือกหน้านี้อยู่
        btnProducts.style.background = '#247041';
        btnProducts.style.color = 'white';
        btnOrders.style.background = '#f0f0f0';
        btnOrders.style.color = '#333';
    } 
    // ถ้ากดปุ่ม คำสั่งซื้อ
    else if (menuName === 'orders') {
        sectionProducts.style.display = 'none';  // ซ่อนตารางสินค้า
        sectionOrders.style.display = 'block';   // โชว์ตารางคำสั่งซื้อ
        
        // เปลี่ยนสีปุ่ม
        btnOrders.style.background = '#247041';
        btnOrders.style.color = 'white';
        btnProducts.style.background = '#f0f0f0';
        btnProducts.style.color = '#333';
    }
}

// ==========================================
// ระบบอัปเดตสถานะคำสั่งซื้อ
// ==========================================
function openUpdateStatusModal(id, currentStatus) {
    document.getElementById('updateOrderId').value = id;
    
    // ตั้งค่า dropdown ให้ตรงกับสถานะปัจจุบัน
    const statusDropdown = document.getElementById('newOrderStatus');
    if (Array.from(statusDropdown.options).some(opt => opt.value === currentStatus)) {
        statusDropdown.value = currentStatus;
    } else {
        statusDropdown.value = 'Pending'; // ค่าเริ่มต้น
    }
    
    document.getElementById('updateStatusModal').style.display = 'flex';
}

function closeUpdateStatusModal() {
    document.getElementById('updateStatusModal').style.display = 'none';
}

function submitUpdateStatus() {
    const orderId = document.getElementById('updateOrderId').value;
    const newStatus = document.getElementById('newOrderStatus').value;

    fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('อัปเดตสถานะสำเร็จ!');
            closeUpdateStatusModal(); // ปิดป๊อปอัป
            loadAdminOrders();        // รีเฟรชตารางคำสั่งซื้อใหม่
        } else {
            alert('เกิดข้อผิดพลาด: ' + data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

// ==========================================
// ระบบ Profile (หน้า profile.html)
// ==========================================
function loadProfile() {
    const displayPoints = document.getElementById('displayPoints');
    if (!displayPoints) return; // ถ้าไม่ได้อยู่หน้า Profile ให้ข้ามไป

    const userObj = JSON.parse(localStorage.getItem('user'));
    if (!userObj) {
        alert('Please log in first');
        window.location.href = '/';
        return;
    }

    // ดึงข้อมูลผู้ใช้จาก API
    fetch(`/api/user/${userObj.userId}`)
        .then(res => res.json())
        .then(data => {
            // ใส่แต้มลงในหน้าจอ
            document.getElementById('displayPoints').innerText = data.Points || 0;
            
            // ใส่ข้อมูลลงในฟอร์ม
            document.getElementById('profFirstName').value = data.FirstName || '';
            document.getElementById('profLastName').value = data.LastName || '';
            document.getElementById('profEmail').value = data.Email || '';
            document.getElementById('profPhone').value = data.Phone || '';
            document.getElementById('profAddress').value = data.Address || '';
        })
        .catch(error => console.error('Error fetching profile:', error));
}

// ฟังก์ชันบันทึกข้อมูล Profile
function updateProfile(event) {
    event.preventDefault();
    const userObj = JSON.parse(localStorage.getItem('user'));
    
    const updatedData = {
        firstName: document.getElementById('profFirstName').value,
        lastName: document.getElementById('profLastName').value,
        email: document.getElementById('profEmail').value,
        phone: document.getElementById('profPhone').value,
        address: document.getElementById('profAddress').value
    };

    fetch(`/api/user/${userObj.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Complete: ' + data.message);
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => console.error('Error updating profile:', error));
}

// สั่งให้ทำงานเมื่อโหลดหน้าเว็บเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();  // โหลดหมวดหมู่ (สำหรับหน้าแรก)
    loadProducts();    // โหลดสินค้า (สำหรับหน้าแรก)
    updateCartCount(); // อัปเดตเลขตะกร้า (ทุกหน้า)
    loadCartItems();   // โหลดรายการสินค้าในตะกร้า (สำหรับหน้า Cart)
    loadAdminProducts(); // โหลดรายการสินค้า (สำหรับหน้า Admin)
    loadAdminOrders();   // โหลดรายการคำสั่งซื้อ (สำหรับหน้า Admin)
    loadProfile();     // โหลดข้อมูลโปรไฟล์ (สำหรับหน้า Profile)  
    checkLoginStatus(); // ตรวจสอบสถานะการเข้าสู่ระบบ
});