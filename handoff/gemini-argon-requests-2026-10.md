# Gemini Argon Mode: image requests for protectedlegacyfl.com (Oct 2026)

How this works: run each request below in Gemini (Argon Mode), save the result with the exact file name, and put the files in `Downloads\pp-gemini\`. Claude then converts them to fast web formats (WebP/AVIF, several sizes), places them on the pages, and checks the phone speed scores stay at 99 before deploying.

Brand rules for every request:
- Colors: Dark Emerald #07221A, Brushed Gold #C5A059, Warm White #FAF8F5.
- No text, no logos, no watermarks, no people (except the headshot).
- Never the words "2-20 General Agent" anywhere.
- Photorealistic, natural South Florida light. No obvious AI look (no warped railings, melted windows, extra palm trunks).

---

## 1. Advisor headshot, background cleanup only (highest value)

Used in: the new sidebar advisor card on all 28 guides, and "Sobre mí / About" on the home pages.

Source: `img/christian-retrato.jpg` in the repo (upload it to Gemini).

```
GEMINI ARGON MODE ASSET REQUEST
File: christian-headshot-clean.png
Input: the attached portrait photo.
Task: Replace only the background with a smooth, softly lit Dark Emerald (#07221A) studio backdrop with a very subtle vignette. Balance the studio lighting on the jacket and shoulders.
Hard rule: ZERO changes to the face. Do not smooth skin, reshape features, change eyes, teeth, hair line or expression. Keep 100% natural facial detail and the original skin texture.
Framing: head and shoulders, centered, square 1:1, at least 1200 x 1200 px.
Output: PNG, no text, no logo.
```

## 2. Guide header photos for the 3 pages that get the ad traffic

Used in: the dark green header of each guide, shown on laptops only (right side), so phone speed is not affected.

```
GEMINI ARGON MODE ASSET REQUEST
File: guide-umbrella.png
Scene: A modern waterfront family home in Coral Gables or Miami Beach at golden hour, seen from the lawn: covered terrace, pool edge in the foreground, a private dock with a center-console boat in the background.
Mood: calm, private, high value; warm sunset light with deep green shadows that blend toward #07221A.
Rules: photorealistic, 4:3 landscape, at least 2000 x 1500 px, zero people, zero text, zero logos, no visible house numbers or license plates.
```

```
GEMINI ARGON MODE ASSET REQUEST
File: guide-flood.png
Scene: A Miami-area canal-front home seen from across the water at blue hour: seawall, dock, mangroves, calm water reflecting the house lights; slightly overcast sky after rain.
Mood: serene but aware of water; colors leaning toward deep emerald and warm gold window light.
Rules: photorealistic, 4:3 landscape, at least 2000 x 1500 px, no flooding or damage shown, zero people, zero text, zero logos.
```

```
GEMINI ARGON MODE ASSET REQUEST
File: guide-hurricanes.png
Scene: A Mediterranean-style South Florida home with hurricane impact windows and a tile roof, royal palms bending gently in a stiff breeze under a dramatic but clearing sky.
Mood: resilient, prepared; late-afternoon light, deep green landscaping.
Rules: photorealistic, 4:3 landscape, at least 2000 x 1500 px, no damage or debris, zero people, zero text, zero logos.
```

## 3. Share preview background (WhatsApp, iMessage, LinkedIn)

Used in: the preview card when someone shares a guide. Claude adds the title and crest in code, so the photo itself has no text.

```
GEMINI ARGON MODE ASSET REQUEST
File: share-background.png
Scene: Biscayne Bay at dusk seen from a high-rise terrace: calm water, distant Miami skyline softly out of focus on the right third, open dark sky on the left two thirds (room for a title).
Mood: quiet luxury; deep emerald and navy tones with gold city lights.
Rules: photorealistic, exactly 1200 x 630 px (or 2400 x 1260), zero people, zero text, zero logos.
```

---

## What Claude does when the files arrive
1. Converts each image to AVIF and WebP in 2 or 3 sizes and adds width/height so nothing jumps while loading.
2. Headshot: replaces the current photo in the sidebar card and the home "About" section.
3. Guide photos: adds them to the umbrella, flood and hurricane guide headers on laptops only.
4. Share card: builds per-guide preview images (photo + crest + guide title) for ES and EN.
5. Re-runs the tests and the phone speed check, then deploys after your yes.
