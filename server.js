const express = require('express');
const path = require('path');
const app = express();
app.use(express.json()); // สำหรับรับข้อมูล JSON จาก client
// เรียกใช้งานไฟล์เชื่อมต่อฐานข้อมูล
const db = require('./config/db.js');

// 1. ตั้งค่าให้ Node.js อนุญาตการเข้าถึงโฟลเดอร์ public (สำหรับไฟล์ CSS, JS, รูปภาพ)
app.use(express.static(path.join(__dirname, 'public')));

// 2. สร้างเส้นทาง (Routes) สำหรับดึงไฟล์ HTML จากโฟลเดอร์ views มาแสดง
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});


// 3. กำหนด Port และสั่งให้เซิร์ฟเวอร์เริ่มทำงาน
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์ทำงานแล้วที่ http://localhost:${PORT}`);
});

// API สำหรับดึงรายชื่อหมวดหมู่ทั้งหมด
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM Category', (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch categories' });
        res.json(results);
    });
});

// API สำหรับดึงสินค้า (รองรับการกรองหมวดหมู่)
app.get('/api/products', (req, res) => {
    const categoryId = req.query.category; // รับค่าหมวดหมู่ที่ส่งมา
    
    let sql = 'SELECT * FROM Product';
    let params = [];

    // ถ้ามีการคลิกเลือกหมวดหมู่ ให้กรองข้อมูล
    if (categoryId) {
        sql += ' WHERE CategoryID = ?';
        params.push(categoryId);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch products' });
        res.json(results);
    });
});

// API สำหรับเข้าสู่ระบบ (Login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // ค้นหาผู้ใช้ในฐานข้อมูล
    const sql = 'SELECT * FROM `User` WHERE Username = ? AND Password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error occurred while fetching user data' });
        
        if (results.length > 0) {
            const user = results[0];
            // ส่งข้อมูลกลับไปให้หน้าเว็บ (ส่ง Role ไปด้วยเพื่อเช็คว่าเป็น Admin หรือ Customer)
            res.json({ success: true, role: user.Role, username: user.Username, userId: user.UserID });
        } else {
            res.json({ success: false, message: 'Username or Password is incorrect' });
        }
    });
});

// API สำหรับสมัครสมาชิก (Register)
app.post('/api/register', (req, res) => {
    // รับค่าที่ส่งมาเพิ่ม
    const { firstName, lastName, email, phone, username, password } = req.body;
    
    // 1. เช็คก่อนว่ามี Username นี้ในระบบหรือยัง
    db.query('SELECT * FROM `User` WHERE Username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length > 0) return res.status(400).json({ error: 'Username already exists' });
        
        // 2. บันทึกข้อมูลส่วนตัว (ใส่ '' จองที่ว่างสำหรับ Address ไว้ก่อน)
        const sql = "INSERT INTO `User` (Role, Username, Password, Points, FirstName, LastName, Email, Phone, Address) VALUES (?, ?, ?, 0, ?, ?, ?, ?, '')";
        
        db.query(sql, ['Customer', username, password, firstName, lastName, email, phone], (err, result) => {
            if (err) {
                console.error("❌ Database Insert Error:", err);
                return res.status(500).json({ error: 'Failed to register user' });
            }
            res.json({ success: true, message: 'Registered successfully' });
        });
    });
});

app.get('/Admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/Admin.html'));
});

// API สำหรับเพิ่มสินค้าใหม่ (Admin)
app.post('/api/products', (req, res) => {
    // รับค่าที่ส่งมาจากฟอร์มหน้าเว็บ
    const { categoryId, name, description, price, stock, image } = req.body;
    
    // คำสั่ง SQL เพิ่มข้อมูลลงตาราง Product
    const sql = 'INSERT INTO Product (CategoryID, ProductName, Description, Price, StockQuantity, Image) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [categoryId, name, description, price, stock, image], (err, result) => {
        if (err) {
            console.error('Failed to add product:', err);
            return res.status(500).json({ success: false, error: 'Error adding product' });
        }
        res.json({ success: true, message: 'Added product successfully' });
    });
});

// API สำหรับลบสินค้า (Admin)
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id; // รับค่า ID ที่ส่งมากับ URL
    
    // คำสั่ง SQL ลบข้อมูล
    const sql = 'DELETE FROM Product WHERE ProductID = ?';
    
    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Failed to delete product:', err);
            return res.status(500).json({ success: false, error: 'Error deleting product' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    });
});

// API สำหรับดึงข้อมูลคำสั่งซื้อทั้งหมด (Admin)
app.get('/api/admin/orders', (req, res) => {
    // ใช้ JOIN เพื่อดึงชื่อผู้ใช้ (Username) จากตาราง User มาแสดงด้วย
    const sql = `
        SELECT o.OrderID, u.Username, o.OrderDate, o.TotalAmount, o.DeliveryMethod, o.Status 
        FROM \`Order\` o
        JOIN \`User\` u ON o.UserID = u.UserID
        ORDER BY o.OrderDate DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Failed to fetch orders:', err);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
        res.json(results);
    });
});

// API สำหรับอัปเดตสถานะคำสั่งซื้อ (Admin)
app.put('/api/admin/orders/:id/status', (req, res) => {
    const orderId = req.params.id; // รับ OrderID จาก URL
    const { status } = req.body;   // รับค่าสถานะใหม่จากข้อมูลที่ส่งมา
    
    // คำสั่ง SQL อัปเดตสถานะ
    const sql = 'UPDATE `Order` SET Status = ? WHERE OrderID = ?';
    
    db.query(sql, [status, orderId], (err, result) => {
        if (err) {
            console.error('Failed to update data:', err);
            return res.status(500).json({ success: false, error: 'Failed to update data' });
        }
        res.json({ success: true, message: 'Update status successfully' });
    });
});

// API สำหรับดึงรายละเอียดสินค้าในบิล (Admin)
app.get('/api/admin/orders/:id/details', (req, res) => {
    const orderId = req.params.id; // รับ OrderID จาก URL
    
    // JOIN ตาราง OrderDetail กับ Product เพื่อดึงรูปและชื่อสินค้ามาแสดง
    const sql = `
        SELECT od.Quantity, od.UnitPrice, p.ProductName, p.Image 
        FROM OrderDetail od 
        JOIN Product p ON od.ProductID = p.ProductID 
        WHERE od.OrderID = ?
    `;
    
    db.query(sql, [orderId], (err, results) => {
        if (err) {
            console.error('Failed to fetch order details:', err);
            return res.status(500).json({ error: 'Failed to fetch order details' });
        }
        res.json(results);
    });
});

// เส้นทางสำหรับเปิดหน้า Profile
app.get('/profile', (req, res) => {
    res.sendFile(__dirname + '/views/profile.html');
});

// API สำหรับดึงข้อมูลผู้ใช้ (พร้อมแต้ม Points)
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT Username, Points, FirstName, LastName, Email, Phone, Address FROM `User` WHERE UserID = ?';
    
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
        res.json(results[0]);
    });
});

// API สำหรับอัปเดตข้อมูลส่วนตัว
app.put('/api/user/:id', (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, email, phone, address } = req.body;
    
    const sql = 'UPDATE `User` SET FirstName = ?, LastName = ?, Email = ?, Phone = ?, Address = ? WHERE UserID = ?';
    
    db.query(sql, [firstName, lastName, email, phone, address, userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: 'ไม่สามารถอัปเดตข้อมูลได้' });
        res.json({ success: true, message: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!' });
    });
});