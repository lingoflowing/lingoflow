# LingoFlow Project State
Last Updated: 2026-05-23

## Current Production
URL:
https://lingoflowing.com/

Analytics Viewer:
https://lingoflowing.com/analytics_viewer.html

Current appVersion:
2026-05-23-word-card-v13-filtered-meta-selects-toggle-groups

---

# Core Philosophy

- Taiwanese Mandarin focused
- Traditional Chinese only
- iPhone-first
- iPhone SE 320px no horizontal scroll
- No surprise autoplay
- Clean/simple UI
- Low cognitive load
- Audio safety is highest priority

---

# Critical Safety Rules

NEVER break:

- start overlay
- audio permission flow
- sleep resume safety
- tab return safety
- no surprise audio
- embeddedData 300 sentences
- audio_error = 0
- ja_audio_error = 0
- no horizontal scroll

Always:
- modify latest stable version only
- output complete index.html
- increase appVersion
- verify on 320px width

---

# Current Top Menu

Top:
- 再生
- 問題
- 一覧

Bottom Toggle:
- content toggle
- playback toggle
- direction toggle

Meta Select:
- レベル
- ジャンル

---

# Current Word Card Features

Implemented:
- word mode
- 30 beginner words
- emoji illustration
- Taiwanese Mandarin audio
- manual tap playback
- illustration mode
- sentence/word toggle
- playback toggle
- continuous/random toggle

Not included:
- Japanese audio
- autoplay
- favorites
- learned button
- spaced repetition
- external images

---

# Current Audio Rules

Sentence playback:
- Chinese → Japanese → next sentence

Word mode:
- Chinese audio only
- manual playback only

No autoplay after:
- tab return
- sleep return

---

# Analytics KPI

Target:
- audio_error = 0
- ja_audio_error = 0
- audio_complete_rate >= 85%
- no abnormal audio_interrupted spikes

Latest confirmed:
- audio_complete_rate ≈ 89.6%
- audio_error = 0

---

# Current UI Direction

Prefer:
- grouped toggles
- minimal layers
- low visual noise
- black text default
- blue only for active/highlight
- typography hierarchy

Avoid:
- large icons
- oversized illustrations
- glossy clutter
- duplicated menus
- too many stacked rows

---

# Known Important Decisions

- "台湾語" wording avoided
- Use:
  - 台湾華語
  - 繁體字
  - ピンイン
  - 日本語

- "聞き流し" renamed to:
  - 再生

- "単語" removed from top menu
- Top menu order:
  - 再生 > 問題 > 一覧

---

# Important Workflow

Before changing anything:

1. verify latest appVersion
2. verify GitHub main updated
3. verify Cloudflare deployment
4. verify production URL
5. verify 320px width
6. verify Analytics Viewer

---

# GitHub

Repository:
https://github.com/lingoflowing/lingoflow

Important:
Sometimes GitHub main remained old version.
Always search appVersion inside GitHub main/index.html after upload.

---

# Current Next Tasks

Potential next improvements:
- cleaner grouped toggle UI
- simpler playback controls
- refine typography hierarchy
- improve word question UX
- optimize analytics structure
- stabilize playback controls further

DO NOT:
- large redesigns
- add heavy features suddenly
- break stable audio logic