# Product Context

## Why this exists
The samithi serves free meals to pilgrims at 3,583 m on the Kedarnath yatra. The
portal is their public face: explain the seva, list members, collect visitor
reviews, accept donations (QR), and share what happens at the camp.

## Users
- **Pilgrims / visitors / donors** — read everything; leave reviews; donate via QR.
- **Samithi members (admin)** — post updates from the camp; (new) manage Gallery
  and News.

## Experience goals
- Devotional, calm, "cold stone, warm hearth" design (see `theme/tokens.js`).
- WCAG AA contrast, keyboard-reachable controls, reduced-motion respected.
- Fast on slow mountain connections: light pages, lazy images, cached binaries.
- Telugu text renders correctly (Noto Sans Telugu in every font stack).

## Content ownership
- Home/About/Members/Donation: static, code-owned (members in `pages/data/`).
- Reviews: visitor-written via Firestore (`firestore.rules` protect them).
- Posts: admin-written via MongoDB (`/posts`).
- Gallery & News (2026): admin-written via MongoDB; public read-only.
