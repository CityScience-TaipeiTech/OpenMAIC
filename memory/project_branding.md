---
name: Project branding & theme
description: CSL customization of OpenMAIC — logo, locale, color theme decisions
type: project
---

Branding decisions applied to this fork of OpenMAIC:

- Logo: light mode uses `logo-csl-black.png`, dark mode uses `logo-csl-white.png` (both in `public/assets/`). Switched via `dark:hidden` / `hidden dark:block` in `app/page.tsx` and `components/stage/scene-sidebar.tsx`. Favicon (`app/layout.tsx`) uses black logo.
- Theme: ivory white (`oklch(0.985 0.008 80)`) + orange (`oklch(0.65 0.18 43)`) minimalist palette. Dark mode: cool gray (`oklch(0.15 0.003 250)`) + orange — neutral/cool grays, no warm browns. All purple/violet/indigo/blue Tailwind classes and hex values replaced with orange equivalents.
- Interface locale: zh-TW default; zh-CN removed; ru-RU removed. Supported: zh-TW, en-US, ja-JP.
- Generation language: zh-TW (was zh-CN). Type is `'zh-TW' | 'en-US'` throughout.

**Why:** User (CSL organization) wants branded fork distinct from upstream OpenMAIC.
**How to apply:** When adding new UI components, use orange-* Tailwind classes (not purple/violet). Default locale is zh-TW.
