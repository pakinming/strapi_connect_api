# Flow: เพิ่ม Entry ใน select_tag (Multi-Language Auto-Fill)

## Overview Flow

```mermaid
flowchart TD
    A["User สร้าง Entry ใหม่<br/>(English locale)"] --> B["เลือก Tags<br/>(เช่น 'Food', 'Travel')"]
    B --> C["กด Save"]
    C --> D{"ต้องการสร้าง<br/>locale อื่นไหม?"}
    D -- ไม่ --> END["จบ"]
    D -- ใช่ --> E["คลิก Locale Dropdown"]
    E --> F["เลือก '+ Create Thai (th-TH) locale'"]
    F --> G["Strapi สร้าง Thai locale form"]
    G --> H["beforeCreate Lifecycle<br/>ตรวจจับ locale ใหม่"]
    H --> I["ค้นหา source entry (EN)<br/>ดึง tags relations"]
    I --> J["Map relation ไปยัง Thai locale<br/>'Food' → 'อาหาร', 'Travel' → 'ท่องเที่ยว'"]
    J --> K["Set tags = [อาหาร, ท่องเที่ยว]<br/>ก่อนสร้าง entry"]
    K --> L["Entry ถูกสร้างพร้อม relation"]
    L --> M["UI แสดง 'อาหาร', 'ท่องเที่ยว'<br/>ใน tags field"]

    style A fill:#4a90d9,color:#fff
    style C fill:#27ae60,color:#fff
    style F fill:#e67e22,color:#fff
    style J fill:#8e44ad,color:#fff
    style M fill:#27ae60,color:#fff
```

## Detailed: Frontend AutoFill Flow (via Form API)

```mermaid
flowchart TD
    A1["AutoFillMultiLangs Component<br/>(inject ใน editView)"] --> A2["Monitor URL changes<br/>ทุก 2 วินาที"]
    A2 --> A3{"อยู่ในหน้า<br/>api::select-tag.select-tag?"}
    A3 -- ไม่ --> A2
    A3 -- ใช่ --> A4{"Locale เป็น<br/>ภาษาอื่น (ไม่ใช่ EN)?"}
    A4 -- ไม่ --> A2
    A4 -- ใช่ --> A5{"formValues.tags.connect<br/>มีข้อมูลแล้ว?"}
    A5 -- มี --> A2
    A5 -- ว่าง --> A6["เรียก API:<br/>GET /select-tags/localized-relations<br/>?documentId=xxx&targetLocale=th-TH"]
    A6 --> A7{"ได้ relations<br/>กลับมา?"}
    A7 -- ไม่ --> A2
    A7 -- ได้ --> A8["สร้าง connect items array<br/>(id, apiData, __temp_key__, label)<br/>ทุก tag ในครั้งเดียว"]
    A8 --> A9["formOnChange:<br/>tags.connect = items"]
    A9 --> A10["tags แสดงค่า<br/>ครบทุก items ✅"]

    style A1 fill:#4a90d9,color:#fff
    style A6 fill:#e67e22,color:#fff
    style A9 fill:#8e44ad,color:#fff
    style A10 fill:#27ae60,color:#fff
```

> **หมายเหตุ:** ใช้ Strapi's internal `useForm` hook + `formOnChange()` เพื่อ set ค่า relation โดยตรง
> ไม่มี DOM manipulation, ไม่มี setTimeout loop — set ทุก tag ในครั้งเดียว

## Detailed: Backend API Flow

```mermaid
flowchart TD
    B1["GET /api/select-tags/localized-relations"] --> B2["รับ documentId + targetLocale"]
    B2 --> B3["ค้นหา source entries<br/>ทุก locale ของ document นี้"]
    B3 --> B4["หา entry ที่มี tags populated<br/>(locale ≠ targetLocale)"]
    B4 --> B5{"พบ source entry?"}
    B5 -- ไม่ --> B6["Return: empty array"]
    B5 -- พบ --> B7["Loop: แต่ละ tag<br/>ใน source.tags"]
    B7 --> B8["ค้นหา tag entry<br/>ใน targetLocale"]
    B8 --> B9{"พบ localized<br/>version?"}
    B9 -- ไม่ --> B7
    B9 -- พบ --> B10["เพิ่มเข้า result array<br/>{documentId, id, tag_name, locale}"]
    B10 --> B7
    B7 --> B11["Return: localized relations"]
```

## Files ที่เกี่ยวข้อง

| File | บทบาท |
|------|--------|
| [lifecycles.ts](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/api/select-tag/content-types/select-tag/lifecycles.ts) | `beforeCreate` — auto-fill tags ก่อนสร้าง entry (backend logic) |
| [service](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/api/select-tag/services/select-tag.ts) | `getLocalizedRelations()` — map relations ข้าม locale |
| [controller](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/api/select-tag/controllers/select-tag.ts) | API handler สำหรับ custom endpoint |
| [route](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/api/select-tag/routes/get-localized-relations.ts) | Custom route: GET /select-tags/localized-relations |
| [AutoFillMultiLangs](file:///Users/pkdev/mfec_dev/mfec-x-tsb/strapi_connect_api/src/admin/components/AutoFillMultiLangs/index.tsx) | Admin component — monitor locale + auto-fill via Form API (useForm, generic support) |
