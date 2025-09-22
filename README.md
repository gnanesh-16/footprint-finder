# footprint-finder
Usually we park our bikes in parking lot when we go for the malls so we did not remember so this is the app where u dont need to remember.

---

# Footprints Finder — Web (HTML/CSS/JS + Node)

A mobile-friendly PWA to record a precise walking path and retrace it to your parked vehicle. Privacy-first: all data stays on-device with optional export.

## Quick start
1. Install Node 18+.
2. Install deps:
   - `npm install`
3. Run dev server:
   - `npm run dev` → http://localhost:5173
4. Build and serve:
   - `npm run build`
   - `npm run serve` → http://localhost:5174

## Notes
- Geolocation requires HTTPS in production; localhost works for dev.
- On iOS, run in the foreground; background recording is not supported in MVP.
- Map tiles are fetched from OpenStreetMap; use responsibly.

## Structure
- `src/` — app code (map, recording, UI, styles)
- `public/manifest.webmanifest` — PWA manifest
- `sw.js` — basic service worker
- `server/index.js` — static server with security headers

## Roadmap
- IndexedDB persistence for trips/history
- JSON export, snapshot image capture
- Accuracy tuning and smoothing
