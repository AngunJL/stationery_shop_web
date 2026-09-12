const express = require('express');
const path = require('path');
const app = express();

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

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Admin.html'));
});

// 3. กำหนด Port และสั่งให้เซิร์ฟเวอร์เริ่มทำงาน
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์ทำงานแล้วที่ http://localhost:${PORT}`);
});