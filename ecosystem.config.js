module.exports = {
  apps: [
    {
      name: 'strapi-connect-api',
      script: 'node_modules/@strapi/strapi/bin/strapi.js',
      args: 'start',
      instances: '2',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};


// สาเหตุที่ต้องเปลี่ยนจาก npm run start มาชี้ไฟล์โดยตรง (
// node_modules/@strapi/strapi/bin/strapi.js
// ) เป็นเพราะกลไกการทำงานของ PM2 Cluster Mode ครับ:

// ปัญหาของการใช้ npm run start ในโหมด Cluster:
// เมื่อ PM2 สั่งรัน npm run start ตัว PM2 จะเกาะอยู่ที่ Process ของ npm ไม่ใช่ตัว Strapi โดยตรง
// npm จะไปเรียก Strapi ขึ้นมาเป็น "ลูก" (Child Process) อีกที
// พอเรารันหลาย Instance (เช่น 4 ตัว) เราจะได้ npm 4 ตัว ซึ่งไปปลุก Strapi มา 4 ตัว
// ผลลัพธ์: Strapi ทั้ง 4 ตัวนี้ทำงานแยกกันอิสระ และพยายามจะ แย่งกันจอง Port 1337 พร้อมกัน ทำให้เกิด Error EADDRINUSE (Port ชนกัน) ครับ
// การใช้ strapi.js โดยตรง (วิธีที่แก้):
// เราบอกให้ PM2 ไปคุมไฟล์ strapi.js ตรงๆ
// PM2 จะรู้ทันทีว่านี่คือ Process ที่ต้องทำงานร่วมกันในโหมด Cluster
// PM2 จะทำหน้าที่เป็นตัวกลาง เปิด Port 1337 ไว้แค่ที่เดียว แล้วกระจายงาน (Load Balance) ส่งต่อให้ Strapi แต่ละตัวที่รันอยู่
// ผลลัพธ์: รันได้หลายตัวพร้อมกันโดย Port ไม่ชนกัน และใช้ CPU ได้เต็มประสิทธิภาพครับ
// สรุปคือต้อง "ข้าม" npm ไป เพื่อให้ PM2 จัดการเรื่องแชร์ Port ให้ Strapi ได้ถูกต้องครับ