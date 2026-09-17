const mysql = require('mysql2');

// สร้างการเชื่อมต่อไปยัง MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'db_admin',       // ชื่อ User ที่เราเพิ่งสร้างใน Ubuntu
    password: '123456',     // รหัสผ่านที่เราเพิ่งตั้ง
    database: 'stationery_shop' // ชื่อ Database ที่เราสร้างไว้
});

// ตรวจสอบสถานะการเชื่อมต่อ
connection.connect((err) => {
    if (err) {
        console.error(' เกิดข้อผิดพลาดในการเชื่อมต่อ Database:', err.message);
        return;
    }
    console.log('เชื่อมต่อฐานข้อมูล MySQL (stationery_shop) สำเร็จแล้ว!');
});

// ส่งออก connection ไปให้ server.js ใช้งาน
module.exports = connection;