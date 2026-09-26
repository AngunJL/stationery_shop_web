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

        showCustomAlert('Please fill in all required fields.', false);
        return;
    }

    if (pass !== confirmPass) {
        showCustomAlert('Password and Confirm Password do not match.', false);
        return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(pass)) {
        showCustomAlert('Password must be at least 8 characters and contain both letters and numbers.', false);
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
            showCustomAlert(data.message, true);
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
            showCustomAlert('Error: ' + data.error, false);
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
// ฟังก์ชัน Checkout (ยืนยันการสั่งซื้อ)
// ==========================================
function checkout() {
    const userObj = JSON.parse(localStorage.getItem('user'));
    if (!userObj) {

        showCustomAlert('Please log in before checking out.', false);
        return;
    }

    // สมมติว่าตะกร้าเก็บอยู่ใน localStorage ชื่อ 'cart'
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartItems.length === 0) {
        showCustomAlert('Your cart is empty. Please add some items before checking out.', false);
        return;
    }

    const deliveryMethod = document.getElementById('deliveryMethod').value;
    const shippingAddress = document.getElementById('shippingAddress').value;

    // เช็คว่าถ้าให้จัดส่ง ต้องกรอกที่อยู่
    if (deliveryMethod === 'shipping' && !shippingAddress.trim()) {
        showCustomAlert('Please enter an address for shipping.', false);
        return;
    }

    // ดึงราคารวมสุทธิ (ที่อาจจะหักส่วนลดไปแล้ว)
    const finalTotalText = document.getElementById('cartTotal').innerText;
    const finalTotal = parseInt(finalTotalText.replace(/\D/g, '')); // ตัดเอาเฉพาะตัวเลข

    // รวบรวมข้อมูลทั้งหมด
    const orderData = {
        userId: userObj.userId,
        cartItems: cartItems,
        deliveryMethod: deliveryMethod,
        shippingAddress: deliveryMethod === 'pickup' ? 'มารับที่ร้าน' : shippingAddress,
        pointsUsed: appliedDiscount,
        totalAmount: finalTotal
    };

    // ส่งไปที่ API
    fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('cart'); // ล้างตะกร้าหลังสั่งซื้อสำเร็จ
            window.location.href = '/'; // เด้งกลับไปหน้าแรก (หรือเปลี่ยนเป็น '/profile' ได้)
        } else {
            showCustomAlert('Error: ' + data.error, false);
        }
    })
    .catch(err => console.error('Error:', err));
}

// ==========================================
// ระบบ Points ส่วนลด (หน้า Cart)
// ==========================================
let userMaxPoints = 0;
let appliedDiscount = 0;
let originalTotal = 0; // เก็บราคาสุทธิก่อนหักส่วนลด

// ดึงแต้มจาก Database มาโชว์
function fetchUserPointsForCart() {
    const userObj = JSON.parse(localStorage.getItem('user'));
    const pointsDisplay = document.getElementById('cartUserPoints');
    if (!userObj || !pointsDisplay) return; 

    const userId = userObj.userId || userObj.id || userObj.UserID;
    if (!userId) return;

    fetch(`/api/user/${userId}`)
        .then(res => res.json())
        .then(data => {
            // โชว์แต้ม
            userMaxPoints = data.Points || 0;
            pointsDisplay.innerText = userMaxPoints;
            
            // --- ดึงที่อยู่มาใส่อัตโนมัติ ---
            const addressInput = document.getElementById('shippingAddress');
            if (addressInput && data.Address) {
                addressInput.value = data.Address;
            }
        })
        .catch(error => console.error('Error fetching points:', error));
}

// ฟังก์ชันคำนวณแต้มอัตโนมัติเมื่อพิมพ์
function applyPointsDiscount() {
    const inputElement = document.getElementById('pointsToUse');
    let inputPoints = parseInt(inputElement.value) || 0;
    const resultText = document.getElementById('discountResult');
    
    // ดึงราคารวมมาเก็บไว้ใน originalTotal (ทำแค่ครั้งเดียว)
    const currentTotalText = document.getElementById('cartTotal').innerText;
    if (originalTotal === 0) originalTotal = parseInt(currentTotalText.replace(/\D/g, ''));

    // ป้องกันการพิมพ์ค่าติดลบ
    if (inputPoints < 0) inputPoints = 0;
    
    // ถ้าพิมพ์เกินแต้มที่มี ให้ปรับลงมาเท่ากับแต้มสูงสุด
    if (inputPoints > userMaxPoints) {
        inputPoints = userMaxPoints;
    }
    
    // ถ้าพิมพ์แต้มเกินราคาสินค้ารวม ให้ปรับลงมาเท่ากับราคาสินค้า
    if (inputPoints > originalTotal) {
        inputPoints = originalTotal;
    }

    // อัปเดตค่ากลับไปที่ช่อง input เผื่อกรณีที่ระบบปรับตัวเลขให้
    if (inputElement.value !== "" && parseInt(inputElement.value) !== inputPoints) {
        inputElement.value = inputPoints;
    }

    appliedDiscount = inputPoints;
    const newTotal = originalTotal - appliedDiscount;
    
    // อัปเดตราคาบนหน้าจอ
    document.getElementById('cartTotal').innerText = `${newTotal} THB`;
    
    // แสดงข้อความส่วนลดถ้ามีการใช้แต้ม
    if (appliedDiscount > 0) {
        resultText.style.display = 'block';
        resultText.innerText = `Discount: ${appliedDiscount} THB (Remaining ${userMaxPoints - appliedDiscount} Points)`;
    } else {
        resultText.style.display = 'none';
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
                showCustomAlert('Welcome back ' + data.username, true);                closeAuthModal();     // 1. สั่งปิดป๊อปอัปทันที
                checkLoginStatus();   // 2. เรียกคำสั่งซ่อนปุ่ม Login
            }
        } else {
            showCustomAlert(data.message || data.error, false);
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
            logoutBtn.innerText = 'Logout (' + userObj.username + ')';
            logoutBtn.style = 'background:#ff6b6b; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;';
            logoutBtn.onclick = function() {
                localStorage.removeItem('user'); 
                localStorage.removeItem('cart'); // เพิ่มบรรทัดนี้
                window.location.href = '/';      // เปลี่ยนจาก reload เป็นกลับไปหน้าแรก
            };
            
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
    localStorage.removeItem('user'); // ลบข้อมูลผู้ใช้
    localStorage.removeItem('cart'); // ล้างตะกร้าสินค้า
    window.location.href = '/';      // กลับหน้าแรก
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
            showCustomAlert('Product added successfully!', true);
            closeAddProductModal(); // ปิดหน้าต่าง
            document.getElementById('addProductForm').reset(); // ล้างฟอร์มให้ว่าง
            loadAdminProducts(); // รีเฟรชตารางให้สินค้าใหม่โผล่ขึ้นมาทันที!
        } else {
            showCustomAlert('Error: ' + data.error, false);
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
                showCustomAlert('Deleted product successfully!', true);
                loadAdminProducts(); // รีเฟรชตารางใหม่เพื่อให้สินค้าที่โดนลบหายไป
            } else {
                showCustomAlert('Error: ' + data.error, false);
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
    const sectionUsers = document.getElementById('sectionUsers'); // เพิ่มดึงข้อมูลแท็บสมาชิก
    const btnProducts = document.getElementById('btnMenuProducts');
    const btnOrders = document.getElementById('btnMenuOrders');
    const btnUsers = document.getElementById('btnMenuUsers'); // เพิ่มดึงข้อมูลปุ่มสมาชิก

    // ถ้ากดปุ่ม สินค้า
    if (menuName === 'products') {
        sectionProducts.style.display = 'block'; // โชว์ตารางสินค้า
        sectionOrders.style.display = 'none';    // ซ่อนตารางคำสั่งซื้อ
        sectionUsers.style.display = 'none';     // ซ่อนตารางสมาชิก
        
        // เปลี่ยนสีปุ่ม
        btnProducts.style.background = '#247041';
        btnProducts.style.color = 'white';
        btnOrders.style.background = '#f0f0f0';
        btnOrders.style.color = '#333';
        btnUsers.style.background = '#f0f0f0';
        btnUsers.style.color = '#333';
    } 
    // ถ้ากดปุ่ม คำสั่งซื้อ
    else if (menuName === 'orders') {
        sectionProducts.style.display = 'none';  // ซ่อนตารางสินค้า
        sectionOrders.style.display = 'block';   // โชว์ตารางคำสั่งซื้อ
        sectionUsers.style.display = 'none';     // ซ่อนตารางสมาชิก
        
        // เปลี่ยนสีปุ่ม
        btnOrders.style.background = '#247041';
        btnOrders.style.color = 'white';
        btnProducts.style.background = '#f0f0f0';
        btnProducts.style.color = '#333';
        btnUsers.style.background = '#f0f0f0';
        btnUsers.style.color = '#333';
    }
    // ถ้ากดปุ่ม จัดการสมาชิก
    else if (menuName === 'users') {
        sectionProducts.style.display = 'none';  // ซ่อนตารางสินค้า
        sectionOrders.style.display = 'none';    // ซ่อนตารางคำสั่งซื้อ
        sectionUsers.style.display = 'block';    // โชว์ตารางสมาชิก
        
        // เปลี่ยนสีปุ่ม
        btnUsers.style.background = '#247041';
        btnUsers.style.color = 'white';
        btnProducts.style.background = '#f0f0f0';
        btnProducts.style.color = '#333';
        btnOrders.style.background = '#f0f0f0';
        btnOrders.style.color = '#333';

        loadAdminUsers(); // โหลดข้อมูลสมาชิกเมื่อกดแท็บนี้
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

// ==========================================
// ระบบดึงข้อมูลสมาชิก (Admin)
// ==========================================
function loadAdminUsers() {
    const userTable = document.getElementById('adminUserTable');
    if (!userTable) return; 

    // เปลี่ยนข้อความตารางเป็น กำลังโหลด ระหว่างรอข้อมูล (ปรับเป็น colspan 7)
    userTable.innerHTML = '<tr><td colspan="7" style="padding:15px; text-align:center;">กำลังโหลดข้อมูล...</td></tr>';

    fetch('/api/admin/users')
        .then(res => res.json())
        .then(users => {
            userTable.innerHTML = ''; // ล้างตาราง
            if (users.length === 0) {
                userTable.innerHTML = '<tr><td colspan="7" style="padding:15px; text-align:center;">ยังไม่มีข้อมูลสมาชิกในระบบ</td></tr>';
                return;
            }

            users.forEach(u => {
                const fullName = (u.FirstName || u.LastName) ? `${u.FirstName || ''} ${u.LastName || ''}` : '<span style="color:#999;">-</span>';
                const contact = (u.Email || u.Phone) ? `${u.Email || '-'}<br>${u.Phone || '-'}` : '<span style="color:#999;">-</span>';
                
                const roleBadge = u.Role === 'Admin' 
                    ? `<span style="padding: 3px 8px; border-radius: 12px; background: #f8d7da; color: #721c24; font-size: 13px;">${u.Role}</span>`
                    : `<span style="padding: 3px 8px; border-radius: 12px; background: #e3f2fd; color: #0d47a1; font-size: 13px;">${u.Role}</span>`;

                // สร้างตัวแปรเก็บสไตล์ปุ่ม ให้มีความกว้างเท่ากัน (width: 60px)
                const btnStyle = "width: 60px; padding: 5px 0; border: none; border-radius: 3px; cursor: pointer; color: white; margin-right: 3px; margin-bottom: 3px; text-align: center; display: inline-block; font-size: 13px;";

                userTable.innerHTML += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding:12px;">#${u.UserID}</td>
                        <td style="padding:12px;"><strong>${u.Username}</strong></td>
                        <td style="padding:12px;">${fullName}</td>
                        <td style="padding:12px;">${contact}</td>
                        <td style="padding:12px; color:#28a745; font-weight:bold;">${u.Points}</td>
                        <td style="padding:12px;">${roleBadge}</td>
                        <td style="padding:12px; text-align:center;">
                            <!-- นำ btnStyle มาใช้กับทั้ง 3 ปุ่ม -->
                            <button onclick="openEditUserModal(${u.UserID}, '${u.FirstName || ''}', '${u.LastName || ''}', '${u.Email || ''}', '${u.Phone || ''}', ${u.Points}, '${u.Role}')" style="${btnStyle} background:#ffc107; color:#000;">แก้ไข</button>
                            <button onclick="viewUserHistory(${u.UserID}, '${u.Username}')" style="${btnStyle} background:#17a2b8;">ประวัติ</button>
                            <button onclick="deleteUser(${u.UserID})" style="${btnStyle} background:#dc3545;">ลบ</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            userTable.innerHTML = '<tr><td colspan="7" style="padding:15px; text-align:center; color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
        });
}

// ==========================================
// ฟังก์ชันจัดการ User (แก้ไข / ลบ / ประวัติ)
// ==========================================

function openEditUserModal(id, fname, lname, email, phone, points, role) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUserFName').value = fname !== 'null' ? fname : '';
    document.getElementById('editUserLName').value = lname !== 'null' ? lname : '';
    document.getElementById('editUserEmail').value = email !== 'null' ? email : '';
    document.getElementById('editUserPhone').value = phone !== 'null' ? phone : '';
    document.getElementById('editUserPoints').value = points;
    document.getElementById('editUserRole').value = role;
    document.getElementById('editUserModal').style.display = 'flex'; // เปิดป๊อปอัป
}

function submitEditUser(event) {
    event.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช
    const id = document.getElementById('editUserId').value;
    const data = {
        firstName: document.getElementById('editUserFName').value,
        lastName: document.getElementById('editUserLName').value,
        email: document.getElementById('editUserEmail').value,
        phone: document.getElementById('editUserPhone').value,
        points: document.getElementById('editUserPoints').value,
        role: document.getElementById('editUserRole').value
    };

    fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('editUserModal').style.display = 'none'; // ปิดป๊อปอัป
            loadAdminUsers(); // รีเฟรชตารางสมาชิกใหม่
        } else {
            showCustomAlert('Error: ' + data.error, false);
        }
    })
    .catch(err => console.error('Error:', err));
}

function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user? (This action cannot be undone)')) return;

    fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadAdminUsers(); // รีเฟรชตารางสมาชิกใหม่
        } else {
            showCustomAlert('Error: ' + data.error, false);
        }
    })
    .catch(err => console.error('Error:', err));
}

function viewUserHistory(id, username) {
    document.getElementById('historyUsername').innerText = username;
    const historyTable = document.getElementById('userHistoryTable');
    historyTable.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';
    document.getElementById('userHistoryModal').style.display = 'flex'; // เปิดป๊อปอัป

    fetch(`/api/admin/users/${id}/orders`)
        .then(res => res.json())
        .then(orders => {
            historyTable.innerHTML = '';
            if (orders.length === 0) {
                historyTable.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px;">No order history found.</td></tr>';
                return;
            }
            orders.forEach(o => {
                const orderDate = new Date(o.OrderDate).toLocaleString('th-TH');
                historyTable.innerHTML += `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #eee;">#${o.OrderID}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${orderDate}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee; font-weight:bold;">${o.TotalAmount} ฿</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">
                            <span style="background:#e3f2fd; color:#0d47a1; padding:3px 8px; border-radius:10px; font-size:13px;">${o.Status}</span>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            console.error('Error:', err);
            historyTable.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Error loading data.</td></tr>';
        });
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
            showCustomAlert('Update status successful!', true);
            closeUpdateStatusModal(); // ปิดป๊อปอัป
            loadAdminOrders();        // รีเฟรชตารางคำสั่งซื้อใหม่
        } else {
            showCustomAlert('Error: ' + data.error, false);
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
        showCustomAlert('Please log in first', false);
        window.location.href = '/';
        return;
    }
    const userId = userObj.userId || userObj.id || userObj.UserID;
    // ดึงข้อมูลผู้ใช้จาก API
    fetch(`/api/user/${userId}`)
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
        loadCustomerOrders(userId); // โหลดประวัติการสั่งซื้อของผู้ใช้
}
// ==========================================
// ฟังก์ชันโหลดประวัติการสั่งซื้อ (หน้า Profile)
// ==========================================
function loadCustomerOrders(userId) {
    const orderTable = document.getElementById('customerOrderTable');
    if (!orderTable) return;

    fetch(`/api/user/${userId}/orders`)
        .then(res => res.json())
        .then(orders => {
            orderTable.innerHTML = '';
            if (orders.length === 0) {
                showCustomAlert('You have no order history.', false);
                return;
            }

            orders.forEach(o => {
                const orderDate = new Date(o.OrderDate).toLocaleString('th-TH');
                
                // กำหนดสีป้ายสถานะให้สวยงาม
                let badgeStyle = "padding:5px 10px; border-radius:12px; font-size:13px; font-weight:bold;";
                if (o.Status === 'Completed') badgeStyle += "background:#d4edda; color:#155724;";
                else if (o.Status === 'Cancelled') badgeStyle += "background:#f8d7da; color:#721c24;";
                else if (o.Status === 'Pending') badgeStyle += "background:#e2e3e5; color:#383d41;";
                else badgeStyle += "background:#fff3cd; color:#856404;"; // Processing, Shipped


                orderTable.innerHTML += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding:15px; color:#007bff; font-weight:bold;">#${o.OrderID}</td>
                        <td style="padding:15px;">${orderDate}</td>
                        <td style="padding:15px; font-weight:bold;">${o.TotalAmount} ฿</td>
                        <td style="padding:15px;">
                            <span style="${badgeStyle}">${o.Status}</span>
                        </td>
                        <td style="padding:15px; text-align:center;">
                            <button onclick="viewOrderDetails(${o.OrderID})" style="background:#007bff; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">รายละเอียด</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error('Error fetching orders:', err));
}
function viewOrderDetails(orderId) {
    document.getElementById('detailOrderIdText').innerText = orderId;
    const tbody = document.getElementById('orderDetailTable');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">กำลังโหลด...</td></tr>';
    document.getElementById('orderDetailModal').style.display = 'flex';

    fetch(`/api/orders/${orderId}/details`)
        .then(res => res.json())
        .then(items => {
            tbody.innerHTML = '';
            items.forEach(item => {
                const total = item.Quantity * item.UnitPrice;
                tbody.innerHTML += `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${item.ProductName}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${item.UnitPrice} ฿</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${item.Quantity}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee; font-weight:bold;">${total} ฿</td>
                    </tr>
                `;
            });
        });
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
            showCustomAlert('Profile updated successfully!', true);
        } else {
            showCustomAlert('Error: ' + data.error, false);
        }
    })
    .catch(error => console.error('Error updating profile:', error));
}

// ==========================================
// ระบบ ป๊อปอัปแจ้งเตือน (Custom Alert)
// ==========================================
function showCustomAlert(message, isSuccess = true, callback = null) {
    // แอบใส่ CSS Animation เล็กๆ ให้กล่องเด้งเนียนๆ
    if (!document.getElementById('customAlertStyle')) {
        const style = document.createElement('style');
        style.id = 'customAlertStyle';
        style.innerHTML = '@keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }';
        document.head.appendChild(style);
    }

    // สร้างพื้นหลังสีดำโปร่งแสง
    const overlay = document.createElement('div');
    overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; justify-content:center; align-items:center;';
    
    // สร้างกล่องข้อความ
    const box = document.createElement('div');
    box.style = 'background:white; padding:30px; border-radius:10px; text-align:center; min-width:300px; box-shadow:0 4px 15px rgba(0,0,0,0.2); animation: popIn 0.2s ease-out;';
    
    // ไอคอน (ติ๊กถูก / กากบาท)
    const icon = document.createElement('div');
    icon.innerHTML = isSuccess ? 'Success' : 'Error';
    icon.style = 'font-size:20px; margin-bottom:15px;';
    
    // ข้อความแจ้งเตือน
    const text = document.createElement('h3');
    text.innerText = message;
    text.style = 'margin:0 0 20px 0; color:#333; font-weight:normal;';
    
    // ปุ่มตกลง
    const btn = document.createElement('button');
    btn.innerText = 'OK';
    btn.style = `padding:10px 25px; border:none; border-radius:5px; color:white; cursor:pointer; font-size:16px; background:${isSuccess ? '#28a745' : '#dc3545'};`;
    
    // เมื่อกดปุ่ม ให้ลบกล่องออก และทำคำสั่งต่อไป (ถ้ามี)
    btn.onclick = () => {
        document.body.removeChild(overlay);
        if (callback) callback();
    };

    box.appendChild(icon);
    box.appendChild(text);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}


// สั่งให้ทำงานเมื่อโหลดหน้าเว็บเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();  // โหลดหมวดหมู่ (สำหรับหน้าแรก)
    loadProducts();    // โหลดสินค้า (สำหรับหน้าแรก)
    updateCartCount(); // อัปเดตเลขตะกร้า (ทุกหน้า)
    loadCartItems();   // โหลดรายการสินค้าในตะกร้า (สำหรับหน้า Cart)
    loadAdminProducts(); // โหลดรายการสินค้า (สำหรับหน้า Admin)
    loadAdminOrders();   // โหลดรายการคำสั่งซื้อ (สำหรับหน้า Admin)
    loadAdminUsers();    // โหลดรายการสมาชิก (สำหรับหน้า Admin)

// 1. จัดการปุ่ม Login/Logout (ทำงานทุกหน้า)
    if (typeof checkLoginStatus === 'function') {
        checkLoginStatus();
    }

    // 2. ดึงแต้มมาโชว์ในหน้า Cart (เช็คก่อนว่าอยู่หน้า Cart ไหม)
    if (document.getElementById('cartUserPoints')) {
        fetchUserPointsForCart();
    }

    // 3. โหลดหน้า Profile (เช็คก่อนว่าอยู่หน้า Profile ไหม)
    if (document.getElementById('displayPoints')) {
        loadProfile();
    }
});