const fs = require('fs');

// 1. โหลดข้อมูลจากไฟล์ JSON ทั้ง 3 ไฟล์
// ตรวจสอบ path ไฟล์ให้ถูกต้อง
const provinces = require('./provinces.json');     // source [2]
const districts = require('./districts.json');     // source [1]
const subdistricts = require('./subdistricts.json'); // source [3]

console.log(`Loaded ${provinces.length} provinces, ${districts.length} districts, ${subdistricts.length} subdistricts.`);

// 2. สร้าง Lookup Map สำหรับจังหวัดและอำเภอ เพื่อความเร็วในการค้นหา
// ใช้ provinceCode เป็น key เพื่อดึง provinceNameTh และ provinceNameEn [2]
const provinceMap = {};
provinces.forEach(p => {
    provinceMap[p.provinceCode] = {
        th: p.provinceNameTh,
        en: p.provinceNameEn
    };
});

// ใช้ districtCode เป็น key เพื่อดึง districtNameTh และ districtNameEn [1]
const districtMap = {};
districts.forEach(d => {
    districtMap[d.districtCode] = {
        th: d.districtNameTh,
        en: d.districtNameEn
    };
});

// 3. วนลูป subdistricts เพื่อรวมข้อมูล (Merge)
const mergedData = subdistricts.map(item => {
    // ดึงข้อมูลจังหวัดและอำเภอจาก Map ที่เตรียมไว้
    const prov = provinceMap[item.provinceCode];
    const dist = districtMap[item.districtCode];

    // ป้องกันกรณีข้อมูลไม่ครบ
    if (!prov || !dist) return null;

    return {
        // --- ข้อมูลจังหวัด (จาก provinces.json) [2] ---
        provinceCode: item.provinceCode,
        provinceNameTh: prov.th,
        provinceNameEn: prov.en,

        // --- ข้อมูลอำเภอ (จาก districts.json) [1] ---
        districtCode: item.districtCode,
        districtNameTh: dist.th,
        districtNameEn: dist.en,

        // --- ข้อมูลตำบล (จาก subdistricts.json) [3] ---
        subdistrictCode: item.subdistrictCode,
        subdistrictNameTh: item.subdistrictNameTh,
        subdistrictNameEn: item.subdistrictNameEn,

        // --- รหัสไปรษณีย์ [3] ---
        postalCode: String(item.postalCode) // แปลงเป็น String เผื่อการแสดงผล
    };
}).filter(item => item !== null); // กรองข้อมูลที่ผิดพลาดออก (ถ้ามี)

// 4. บันทึกไฟล์ผลลัพธ์
fs.writeFileSync('thai_address_full.json', JSON.stringify(mergedData, null, 2));

console.log(`เสร็จเรียบร้อย! รวมข้อมูลได้ทั้งหมด ${mergedData.length} รายการ`);
console.log('บันทึกไฟล์ที่: thai_address_full.json');