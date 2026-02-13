# Flow: เพิ่ม Entry ใน select_default_multi_lang (Multi-Language)

## Overview Flow

```mermaid
flowchart TD
    A["User สร้าง Entry ใหม่<br/>(English locale)"] --> B["กรอก name"]
    B --> C["เลือก multi_langs relation<br/>(เช่น 'english')"]
    C --> D["กด Save"]
    D --> E{"ต้องการสร้าง<br/>locale อื่นไหม?"}
    E -- ไม่ --> END["จบ"]
    E -- ใช่ --> F["คลิก Locale Dropdown"]
    F --> G["เลือก '+ Create Thai (th-TH) locale'"]
    G --> H["Strapi สร้าง Thai locale form"]
    H --> I{"beforeCreate Lifecycle<br/>ตรวจจับ locale ใหม่"}
    I --> J["ค้นหา source entry (EN)<br/>ดึง multi_langs relations"]
    J --> K["Map relation ไปยัง Thai locale<br/>'english' → 'ไทยแลนด์'"]
    K --> L["Set multi_langs = ไทยแลนด์<br/>ก่อนสร้าง entry"]
    L --> M["Entry ถูกสร้างพร้อม relation"]
    M --> N["UI แสดง 'ไทยแลนด์'<br/>ใน multi_langs field"]

    style A fill:#4a90d9,color:#fff
    style D fill:#27ae60,color:#fff
    style G fill:#e67e22,color:#fff
    style K fill:#8e44ad,color:#fff
    style N fill:#27ae60,color:#fff
```

## Detailed: Frontend AutoFill Flow (via Form API)

```mermaid
flowchart TD
    A1["AutoFillMultiLangs Component<br/>(inject ใน editView)"] --> A2["Monitor URL changes<br/>ทุก 2 วินาที"]
    A2 --> A3{"อยู่ในหน้า<br/>select-default-multi-lang?"}
    A3 -- ไม่ --> A2
    A3 -- ใช่ --> A4{"Locale เป็น<br/>ภาษาอื่น (ไม่ใช่ EN)?"}
    A4 -- ไม่ --> A2
    A4 -- ใช่ --> A5{"formValues.multi_langs.connect<br/>มีข้อมูลแล้ว?"}
    A5 -- มี --> A2
    A5 -- ว่าง --> A6["เรียก API:<br/>GET /localized-relations<br/>?documentId=xxx&targetLocale=th-TH"]
    A6 --> A7{"ได้ relations<br/>กลับมา?"}
    A7 -- ไม่ --> A2
    A7 -- ได้ --> A8["สร้าง connect items array<br/>(id, apiData, __temp_key__, label)"]
    A8 --> A9["formOnChange:<br/>multi_langs.connect = items"]
    A9 --> A10["multi_langs แสดงค่า<br/>'ไทยแลนด์' สำเร็จ ✅"]

    style A1 fill:#4a90d9,color:#fff
    style A6 fill:#e67e22,color:#fff
    style A9 fill:#8e44ad,color:#fff
    style A10 fill:#27ae60,color:#fff
```

> **หมายเหตุ:** ใช้ Strapi's internal `useForm` hook + `formOnChange()` เพื่อ set ค่า relation โดยตรง
> ไม่มีการ manipulate DOM หรือจำลอง user interaction

## Detailed: Backend API Flow

```mermaid
flowchart TD
    B1["GET /api/select-default-multi-langs/<br/>localized-relations"] --> B2["รับ documentId + targetLocale"]
    B2 --> B3["ค้นหา source entries<br/>ทุก locale ของ document นี้"]
    B3 --> B4["หา entry ที่มี multi_langs<br/>(locale ≠ targetLocale)"]
    B4 --> B5{"พบ source entry?"}
    B5 -- ไม่ --> B6["Return: empty array"]
    B5 -- พบ --> B7["Loop: แต่ละ relation<br/>ใน source.multi_langs"]
    B7 --> B8["ค้นหา multi-lang entry<br/>ใน targetLocale"]
    B8 --> B9{"พบ localized<br/>version?"}
    B9 -- ไม่ --> B7
    B9 -- พบ --> B10["เพิ่มเข้า result array<br/>{documentId, id, data, locale}"]
    B10 --> B7
    B7 --> B11["Return: localized relations"]

    style B1 fill:#4a90d9,color:#fff
    style B8 fill:#8e44ad,color:#fff
    style B11 fill:#27ae60,color:#fff
```

## Files ที่เกี่ยวข้อง

| File | บทบาท |
|------|--------|
| [lifecycles.ts](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/api/select-default-multi-lang/content-types/select-default-multi-lang/lifecycles.ts) | `beforeCreate` — auto-fill multi_langs ก่อนสร้าง entry |
| [service](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/api/select-default-multi-lang/services/select-default-multi-lang.ts) | `getLocalizedRelations()` — map relations ข้าม locale |
| [controller](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/api/select-default-multi-lang/controllers/select-default-multi-lang.ts) | API handler สำหรับ custom endpoint |
| [route](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/api/select-default-multi-lang/routes/get-localized-relations.ts) | Custom route: GET /localized-relations |
| [AutoFillMultiLangs](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/admin/components/AutoFillMultiLangs/index.tsx) | Admin component — monitor locale + auto-fill via Form API (useForm) |
| [app.tsx](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/admin/app.tsx) | Register component ใน bootstrap() |
