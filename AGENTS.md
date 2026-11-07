# AGENTS.md — Customer Storefront (frontend)

หน้าร้านให้ลูกค้าดูสินค้า สั่งซื้อ ชำระเงินด้วย cryptocurrency และติดตาม order
repo นี้เป็น **frontend อย่างเดียว** ต่อกับ backend API ที่แยกอยู่อีก repo

## Tech stack

ดูจาก `package.json` และ `nuxt.config.ts`

- Nuxt 4.6 (โครงสร้าง `app/` ของ Nuxt 4) + Vue 3.5 + vue-router 5
- TypeScript ใช้ `tsconfig.json` ที่อ้างอิงไป `.nuxt/tsconfig.*.json`
- Tailwind CSS v4 ผ่าน `@tailwindcss/vite` (**ไม่มี** `tailwind.config.js` token อยู่ใน `app/assets/css/main.css`)
- `@nuxt/image` และ `@nuxt/eslint` (config ถูกสร้างไว้ใน `.nuxt/eslint.config.mjs`)
- Prettier 3 + `prettier-plugin-tailwindcss`
- Package manager คือ **npm** (มี `package-lock.json`)
- ยังไม่มี UI component library, state library, test framework หรือ API client

## Project structure

```
app/
  app.vue                  # root ตอนนี้ยังเป็นหน้าทดสอบธีม ยังไม่มี <NuxtPage />
  assets/css/main.css      # Tailwind entry + design token (light/dark)
  components/app/          # component ระดับ app (ThemeToggle.vue)
  composables/useTheme.ts  # จัดการธีม light/dark/system
  pages/ layouts/ middleware/ plugins/ utils/   # ยังว่าง
shared/types/              # ยังว่าง ใช้เก็บ type ที่ใช้ร่วมกัน
server/api, server/utils   # ว่าง ห้ามใช้ (ดู Boundaries)
public/                    # favicon.ico, robots.txt, images/ (ว่าง)
.claude/skills/            # skill ของ AI agent ไม่ใช่โค้ดของแอป
.data/                     # ข้อมูล dev ที่ Nuxt สร้าง (อยู่ใน .gitignore)
```

## Commands

| งาน             | คำสั่ง                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| ติดตั้ง         | `npm install` (รัน `nuxt prepare` ให้อัตโนมัติผ่าน postinstall)           |
| Dev server      | `npm run dev` → http://localhost:3000                                     |
| Build           | `npm run build`                                                           |
| Preview build   | `npm run preview`                                                         |
| Static generate | `npm run generate`                                                        |
| Format          | `npm run format`                                                          |
| เช็ก format     | `npm run format:check`                                                    |
| Lint            | `npx eslint app nuxt.config.ts` (อย่าใช้ `npx eslint .` ดู Known gotchas) |
| Typecheck       | [TODO: ถาม] ยังไม่ได้ติดตั้ง `vue-tsc` เลยรัน `npx nuxi typecheck` ไม่ได้ |
| Test            | ยังไม่มี [TODO: ถาม] จะใช้ framework อะไร                                 |

## Scope

ทำเฉพาะ 5 ฟีเจอร์นี้

1. **ดูและค้นหาสินค้า** ได้แก่ รายการสินค้า, หน้ารายละเอียด, ค้นหา, กรองตามหมวดหมู่
2. **ตะกร้าสินค้า** ได้แก่ เพิ่ม, ลบ, แก้จำนวน
3. **สมัครและเข้าสู่ระบบ** ได้แก่ สมัคร, login, แก้ข้อมูลส่วนตัว, จัดการที่อยู่จัดส่ง
4. **สั่งซื้อและชำระเงิน** ได้แก่ ยืนยัน order, ชำระด้วย cryptocurrency
5. **ติดตาม order** ได้แก่ ประวัติการสั่งซื้อ, สถานะการจัดส่ง, เลขพัสดุ

สถานะ order ที่ต้องรองรับครบ (ใช้ string ตามนี้ทุกตัว):
`pending_payment` → `paid` → `processing` → `shipped` → `delivered` → `completed` และ `cancelled`, `refunded`

**นอกขอบเขต** (ห้ามทำ ถ้าจำเป็นต้องถามก่อน): รีวิวสินค้า, wishlist, คูปอง/โปรโมชัน, แชท,
หลายภาษา/หลายสกุลเงิน, ช่องทางชำระอื่นนอกจาก crypto (บัตร, โอนธนาคาร, COD),
ลูกค้ายกเลิก order หรือขอคืนเงินเอง, social login, แจ้งเตือน SMS/Push, mobile app

ยังต้องยืนยัน: เหรียญ crypto และ network ที่รับ [TODO: ถาม], payment provider [TODO: ถาม]

## Boundaries

### Always

- เรียก API ผ่าน client layer กลางที่เดียวเท่านั้น (ยังไม่ได้สร้าง ตำแหน่งที่เสนอคือ `app/services/` [TODO: ถาม])
  ห้ามมี `$fetch`/`useFetch` ที่ยิงไป backend ตรงๆ ในไฟล์ `.vue`
- ทุกหน้าใน `app/pages/` ต้องมี 3 สถานะแยกกันให้เห็น: loading, error (มีข้อความและปุ่ม retry) และ empty state
- แสดงยอดเงิน ราคา ค่าส่ง และสถานะชำระเงินตามค่าที่ API ส่งมาเท่านั้น
- ใช้ semantic color utility จาก `main.css` (`bg-background`, `text-foreground`, `bg-primary`,
  `text-muted-foreground`, `bg-success`, `bg-destructive` ฯลฯ) แทนสี palette ตรงๆ อย่าง `bg-blue-500`
- เขียนข้อความบน UI เป็น **ภาษาอังกฤษ** ภาษาเดียว
- ทำงานบน feature branch แล้วเปิด PR เข้า `main`
- รัน `npm run format:check` และ `npx eslint app nuxt.config.ts` ให้ผ่านก่อน commit
- เปลี่ยน logic ธีมเมื่อไร ต้องแก้ทั้ง `useTheme.ts` และ `themeInitScript` ใน `nuxt.config.ts` ให้ตรงกัน

### Ask first

- ก่อนเขียนโค้ดที่เรียก endpoint ใดๆ (ยังไม่มีเอกสาร API [TODO: ถาม] base URL, รูปแบบ auth, env var)
- ก่อนเพิ่ม dependency ใน `package.json` (รวม test framework, `vue-tsc`, UI library, state library)
- ก่อนแก้ `nuxt.config.ts` (modules, `ssr`, `routeRules`, runtimeConfig)
- ก่อนเปลี่ยนค่า design token ใน `app/assets/css/main.css`
- ก่อนทำฟีเจอร์ใดก็ตามที่ไม่อยู่ใน 5 ข้อของ Scope
- ก่อนเลือกเหรียญ/network crypto หรือ payment provider
- ก่อนแก้หรือลบไฟล์ใน `.claude/`

### Never

- ห้ามสร้างไฟล์ใน `server/` (API route, middleware, plugin ของ Nitro) — repo นี้เป็น frontend ส่วน backend อยู่อีกที่
- ห้ามต่อ database หรือเขียน business logic ฝั่ง server — ขอบเขตงานกำหนดไว้แบบนั้น
- ห้ามเดา endpoint, query param หรือรูปร่าง response — ถ้าเดาผิดจะได้โค้ดที่ต้องรื้อทิ้งทีหลัง
- ห้ามคำนวณยอดรวม ส่วนลด ค่าส่ง หรือตัดสินสถานะชำระเงินเองที่ frontend — API คือแหล่งข้อมูลจริงเพียงที่เดียว
- ห้ามเก็บ auth token ใน `localStorage`/`sessionStorage` ถ้า API รองรับ httpOnly cookie — JS อ่านได้ ถ้าโดน XSS ก็โดนขโมยได้
- ห้ามใส่ secret, private key หรือ API key ใน `app/`, `nuxt.config.ts` หรือ `runtimeConfig.public` — ทุกอย่างในนี้ถูกส่งไปที่ browser
- ห้ามแสดงยอดขาย จำนวนคนซื้อ หรือรีวิวปลอม และห้ามให้ build production ใช้ mock data — หลอกลูกค้า
- ห้ามเพิ่มปุ่มให้ลูกค้ายกเลิก order หรือขอคืนเงิน — อยู่นอกขอบเขต
- ห้าม commit ตรงเข้า `main` — ต้องผ่าน PR
- ห้าม commit `.env*` (ยกเว้น `.env.example`), `.nuxt/`, `.output/`, `.data/` — มีอยู่ใน `.gitignore` และอาจมีความลับ

## Workflow

1. ตรวจว่างานอยู่ใน Scope ถ้าต้องใช้ API ให้เช็กว่ามีเอกสาร endpoint นั้นแล้ว ถ้ายังไม่มีให้หยุดแล้วถาม
2. แตก branch จาก `main` [TODO: ถาม] รูปแบบชื่อ branch
3. เขียนโค้ด ถ้าต้องใช้ mock ให้ใช้เฉพาะตอน dev และปิดได้ด้วย flag เดียว [TODO: ถาม] ชื่อ flag
4. รัน `npm run dev` แล้วเปิดดูหน้านั้นจริงให้ครบทั้ง light, dark, loading, error และ empty
5. รัน `npm run format` → `npx eslint app nuxt.config.ts` → `npm run build` ทุกตัวต้องผ่าน
6. Commit แล้วเปิด PR เข้า `main` ใน PR ต้องระบุว่าได้เทสอะไรไปบ้าง

## Conventions

ดูจากโค้ดที่มีอยู่ตอนนี้

- **Format** (`.prettierrc`): ไม่ใส่ semicolon, single quote, trailing comma ทุกที่, printWidth 100
  และ Prettier เรียงลำดับ Tailwind class ให้อัตโนมัติ ห้ามเรียงเองด้วยมือ
- **SFC**: ใช้ `<script setup lang="ts">` ไว้บนสุด ตามด้วย `<template>` (ดู `ThemeToggle.vue`)
- **Auto-import**: ไม่ต้อง import `ref`, `useState`, `onMounted`, `readonly` หรือ composable ใน `app/composables/` เอง
- **Composable**: ไฟล์ละตัว ชื่อไฟล์คือ `useXxx.ts` export เป็น `export function useXxx()`
  ส่วน state ที่ใช้ร่วมกันข้าม component ให้ใช้ `useState('key', ...)` (ดู `useTheme.ts`)
- **โค้ดที่ใช้ browser API**: ต้องครอบด้วย `if (import.meta.server) return` หรือเขียนใน `onMounted`
  และถ้าแตะ `localStorage` ต้องครอบ `try/catch` (ดู `useTheme.ts`)
- **Component name**: Nuxt ใส่ชื่อโฟลเดอร์เป็น prefix ให้ เช่น `components/app/ThemeToggle.vue` → `<AppThemeToggle />`
- **Dark mode**: ใช้ class `.dark` บน `<html>` ร่วมกับ variant `dark:` ไม่ได้ใช้ media query
- **Accessibility**: ปุ่มที่มีแต่ไอคอนต้องมี `aria-label` และ emoji/ไอคอนตกแต่งต้องใส่ `aria-hidden="true"`
- **Type**: type ที่ใช้ร่วมกันใส่ไว้ใน `shared/types/` ส่วน type ของ composable ให้ export จากไฟล์นั้นเลย
- **Commit message**: ภาษาอังกฤษ ขึ้นต้นด้วยคำกริยา เช่น "Implement …", "Add …" (ดูจาก `git log`)

## Known gotchas

- **`<ThemeToggle />` ใน `app/app.vue` resolve ไม่ได้** เพราะชื่อที่ auto-import จริงคือ `AppThemeToggle`
  (ดู `.nuxt/components.d.ts`) ต้องเปลี่ยนเป็น `<AppThemeToggle />`
- **`npx eslint .` แสดง error 59 ตัว** ทั้งหมดมาจาก `.claude/skills/` ไม่ใช่โค้ดของแอป
  ให้ lint เฉพาะ `app nuxt.config.ts` [TODO: ถาม] จะเพิ่ม `.claude` ใน ignore ของ `eslint.config.mjs` หรือไม่
- **`eslint.config.mjs` import `./.nuxt/eslint.config.mjs`** ถ้ายังไม่มี `.nuxt/` ให้รัน `npx nuxi prepare` ก่อน
- **`eslint` อยู่ใน `dependencies`** แทนที่จะเป็น `devDependencies` ถ้าจะย้ายต้องถามก่อน
- **ยังไม่มี `<NuxtPage />`** ตอนสร้างไฟล์แรกใน `app/pages/` ต้องแก้ `app.vue` ไม่อย่างนั้น route จะไม่แสดง
- **ธีมอ่านค่าจาก 2 ที่**: script ใน `<head>` (`nuxt.config.ts`) กับ `useTheme.ts`
  ใช้ key `localStorage` ชื่อ `theme` เหมือนกัน ถ้าแก้ที่เดียวหน้าจอจะกระพริบหรือธีมไม่ตรงกัน
- **ไม่มี `.env.example`** และยังไม่ได้ตั้ง `runtimeConfig` [TODO: ถาม] ชื่อ env var ของ API base URL
- **README.md เป็น template ของ Nuxt** ข้อความเรื่อง pnpm/yarn/bun ใช้ไม่ได้กับ repo นี้ ให้ใช้ npm
