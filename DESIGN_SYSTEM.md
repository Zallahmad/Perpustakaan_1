# Design System

Design system untuk aplikasi Perpustakaan Sekolah. Dokumentasi ini mencakup warna, spacing, typography, dan komponen UI yang digunakan.

## Table of Contents
- [Colors](#colors)
- [Spacing](#spacing)
- [Typography](#typography)
- [Border Radius](#border-radius)
- [Shadows](#shadows)
- [Transitions](#transitions)
- [Z-Index](#z-index)

---

## Colors

### Primary (Blue)
Warna utama untuk brand dan elemen interaktif.

| Class | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#eff6ff` | Background hover yang sangat ringan |
| `primary-100` | `#dbeafe` | Background hover ringan |
| `primary-200` | `#bfdbfe` | Background hover |
| `primary-300` | `#93c5fd` | Background aktif ringan |
| `primary-400` | `#60a5fa` | Background aktif |
| `primary-500` | `#3b82f6` | Primary color (default) |
| `primary-600` | `#2563eb` | Primary hover |
| `primary-700` | `#1d4ed8` | Primary active |
| `primary-800` | `#1e40af` | Text primary |
| `primary-900` | `#1e3a8a` | Text primary gelap |
| `primary-950` | `#172554` | Background sangat gelap |

### Secondary (Gray)
Warna netral untuk teks, border, dan background.

| Class | Hex | Usage |
|-------|-----|-------|
| `secondary-50` | `#f8fafc` | Background page |
| `secondary-100` | `#f1f5f9` | Background card |
| `secondary-200` | `#e2e8f0` | Border ringan |
| `secondary-300` | `#cbd5e1` | Border |
| `secondary-400` | `#94a3b8` | Text disabled |
| `secondary-500` | `#64748b` | Text secondary |
| `secondary-600` | `#475569` | Text body |
| `secondary-700` | `#334155` | Text heading |
| `secondary-800` | `#1e293b` | Text heading gelap |
| `secondary-900` | `#0f172a` | Text sangat gelap |
| `secondary-950` | `#020617` | Background sangat gelap |

### Success (Green)
Warna untuk status sukses.

| Class | Hex | Usage |
|-------|-----|-------|
| `success-50` | `#f0fdf4` | Background success ringan |
| `success-100` | `#dcfce7` | Background success |
| `success-500` | `#22c55e` | Success color |
| `success-600` | `#16a34a` | Success hover |
| `success-700` | `#15803d` | Success active |

### Warning (Amber)
Warna untuk peringatan.

| Class | Hex | Usage |
|-------|-----|-------|
| `warning-50` | `#fffbeb` | Background warning ringan |
| `warning-100` | `#fef3c7` | Background warning |
| `warning-500` | `#f59e0b` | Warning color |
| `warning-600` | `#d97706` | Warning hover |
| `warning-700` | `#b45309` | Warning active |

### Danger (Red)
Warna untuk error dan destructive actions.

| Class | Hex | Usage |
|-------|-----|-------|
| `danger-50` | `#fef2f2` | Background danger ringan |
| `danger-100` | `#fee2e2` | Background danger |
| `danger-500` | `#ef4444` | Danger color |
| `danger-600` | `#dc2626` | Danger hover |
| `danger-700` | `#b91c1c` | Danger active |

### Info (Sky)
Warna untuk informasi.

| Class | Hex | Usage |
|-------|-----|-------|
| `info-50` | `#f0f9ff` | Background info ringan |
| `info-100` | `#e0f2fe` | Background info |
| `info-500` | `#0ea5e9` | Info color |
| `info-600` | `#0284c7` | Info hover |
| `info-700` | `#0369a1` | Info active |

### Accent (Purple)
Warna aksen untuk elemen highlight.

| Class | Hex | Usage |
|-------|-----|-------|
| `accent-50` | `#faf5ff` | Background accent ringan |
| `accent-100` | `#f3e8ff` | Background accent |
| `accent-500` | `#a855f7` | Accent color |
| `accent-600` | `#9333ea` | Accent hover |
| `accent-700` | `#7e22ce` | Accent active |

---

## Spacing

Scale spacing yang digunakan di seluruh aplikasi.

| Class | Value | Usage |
|-------|-------|-------|
| `p-0` | `0` | No padding |
| `p-px` | `1px` | 1 pixel |
| `p-0.5` | `0.125rem` (2px) | Extra small |
| `p-1` | `0.25rem` (4px) | Small |
| `p-1.5` | `0.375rem` (6px) | Small-medium |
| `p-2` | `0.5rem` (8px) | Medium |
| `p-2.5` | `0.625rem` (10px) | Medium-large |
| `p-3` | `0.75rem` (12px) | Large |
| `p-3.5` | `0.875rem` (14px) | Large-extra |
| `p-4` | `1rem` (16px) | Extra large |
| `p-5` | `1.25rem` (20px) | 2X large |
| `p-6` | `1.5rem` (24px) | 3X large |
| `p-8` | `2rem` (32px) | 4X large |
| `p-10` | `2.5rem` (40px) | 5X large |
| `p-12` | `3rem` (48px) | 6X large |
| `p-16` | `4rem` (64px) | 8X large |

---

## Typography

### Font Family
- **Sans**: Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
- **Mono**: JetBrains Mono, Fira Code, Consolas, Monaco, monospace

### Font Size

| Class | Size | Line Height | Letter Spacing | Usage |
|-------|------|-------------|----------------|-------|
| `text-xs` | `0.75rem` (12px) | `1rem` (16px) | `0.025em` | Caption, label kecil |
| `text-sm` | `0.875rem` (14px) | `1.25rem` (20px) | `0.025em` | Body text kecil |
| `text-base` | `1rem` (16px) | `1.5rem` (24px) | `0` | Body text default |
| `text-lg` | `1.125rem` (18px) | `1.75rem` (28px) | `-0.01em` | Body text besar |
| `text-xl` | `1.25rem` (20px) | `1.75rem` (28px) | `-0.01em` | Subheading |
| `text-2xl` | `1.5rem` (24px) | `2rem` (32px) | `-0.02em` | Heading kecil |
| `text-3xl` | `1.875rem` (30px) | `2.25rem` (36px) | `-0.02em` | Heading medium |
| `text-4xl` | `2.25rem` (36px) | `2.5rem` (40px) | `-0.02em` | Heading besar |
| `text-5xl` | `3rem` (48px) | `1` (48px) | `-0.03em` | Display kecil |
| `text-6xl` | `3.75rem` (60px) | `1` (60px) | `-0.03em` | Display medium |
| `text-7xl` | `4.5rem` (72px) | `1` (72px) | `-0.04em` | Display besar |
| `text-8xl` | `6rem` (96px) | `1` (96px) | `-0.04em` | Display extra besar |
| `text-9xl` | `8rem` (128px) | `1` (128px) | `-0.05em` | Display hero |

### Font Weight

| Class | Value | Usage |
|-------|-------|-------|
| `font-thin` | `100` | Very light text |
| `font-extralight` | `200` | Extra light text |
| `font-light` | `300` | Light text |
| `font-normal` | `400` | Normal text (default) |
| `font-medium` | `500` | Medium text |
| `font-semibold` | `600` | Semibold text |
| `font-bold` | `700` | Bold text |
| `font-extrabold` | `800` | Extra bold text |
| `font-black` | `900` | Black text |

---

## Border Radius

| Class | Value | Usage |
|-------|-------|-------|
| `rounded-none` | `0` | No border radius |
| `rounded-sm` | `0.125rem` (2px) | Very small radius |
| `rounded` | `0.25rem` (4px) | Small radius (default) |
| `rounded-md` | `0.375rem` (6px) | Medium radius |
| `rounded-lg` | `0.5rem` (8px) | Large radius |
| `rounded-xl` | `0.75rem` (12px) | Extra large radius |
| `rounded-2xl` | `1rem` (16px) | 2X large radius |
| `rounded-3xl` | `1.5rem` (24px) | 3X large radius |
| `rounded-full` | `9999px` | Full circle/pill |

---

## Shadows

| Class | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Very small shadow |
| `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | Default shadow |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Medium shadow |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Large shadow |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Extra large shadow |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | 2X large shadow |
| `shadow-inner` | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` | Inner shadow |
| `shadow-none` | `0 0 #0000` | No shadow |

---

## Transitions

### Duration

| Class | Value | Usage |
|-------|-------|-------|
| `duration-75` | `75ms` | Very fast |
| `duration-100` | `100ms` | Fast |
| `duration-150` | `150ms` | Fast-medium |
| `duration-200` | `200ms` | Medium |
| `duration-300` | `300ms` | Medium-slow (default) |
| `duration-500` | `500ms` | Slow |
| `duration-700` | `700ms` | Slower |
| `duration-1000` | `1000ms` | Very slow |

### Timing Function

| Class | Value | Usage |
|-------|-------|-------|
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Starts slow, ends fast |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Starts fast, ends slow |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Starts and ends slow (default) |

---

## Z-Index

| Class | Value | Usage |
|-------|-------|-------|
| `z-dropdown` | `1000` | Dropdown menus |
| `z-sticky` | `1020` | Sticky elements |
| `z-fixed` | `1030` | Fixed elements |
| `z-modal-backdrop` | `1040` | Modal backdrop |
| `z-modal` | `1050` | Modal content |
| `z-popover` | `1060` | Popover content |
| `z-tooltip` | `1070` | Tooltip content |

---

## Usage Examples

### Button Primary
```tsx
<button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md">
  Button
</button>
```

### Card
```tsx
<div className="bg-white rounded-2xl border border-secondary-200 shadow-lg p-6">
  <h3 className="text-lg font-semibold text-secondary-900 mb-2">Title</h3>
  <p className="text-sm text-secondary-600">Description</p>
</div>
```

### Input
```tsx
<input 
  className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
  placeholder="Enter text"
/>
```

### Badge Success
```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700">
  Success
</span>
```

### Alert Warning
```tsx
<div className="p-4 rounded-xl bg-warning-50 border border-warning-200">
  <p className="text-sm font-medium text-warning-800">Warning message</p>
</div>
```
