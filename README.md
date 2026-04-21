# Tonal — Film Light Meter

A film-aware Zone System light meter. Web prototype — runs in mobile Safari and installable to the iPhone home screen.

## Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173/` on desktop, or `http://<your-LAN-ip>:5173/` on an iPhone on the same network.

Note: camera access requires **HTTPS**. Safari refuses `getUserMedia` on plain `http://` except on `localhost`. To test camera on iPhone:
- Deploy to Vercel (HTTPS is automatic), or
- Tunnel the dev server with `ngrok http 5173` / `cloudflared tunnel --url http://localhost:5173` and open the HTTPS URL on the phone.

## Build & deploy

```bash
npm run build
```

Deploys to Vercel. `vercel.json` sets a `Permissions-Policy: camera=(self)` header. First push:

```bash
vercel
```

## Install to iPhone home screen

1. Open the deployed URL in Safari on the iPhone.
2. Tap Share → Add to Home Screen.
3. Launch from the icon — it runs standalone without the Safari chrome.

## Project layout

```
src/
  data/
    filmStocks.ts        # Kodak, Ilford, Fuji, cinema, digital
    formats.ts           # 35mm / 120 / LF / Instant with aspect ratios + focal lengths
    exposureScales.ts    # f-stop + shutter + 1/3 stop exp-comp scales
  hooks/
    useEVCalc.ts         # EV = log2(N²/t)
    useZoneEngine.ts     # Zone placement from film + exposure compensation
    useCamera.ts         # getUserMedia, iOS Safari quirks, Kelvin sampling
  store/
    useTonalStore.ts     # Zustand store
  components/
    PreviewArea.tsx      # Aspect-ratio frame holding the <video> + zone markers
    ZoneMarker.tsx       # Roman-numeral pill with clipping indicator
    TickSlider.tsx       # Touch/pointer tick-mark ruler slider
    ApertureSlider.tsx
    ShutterSlider.tsx
    ExpCompSlider.tsx
    EVDisplay.tsx
    WarningIcons.tsx
    FilmInfoBar.tsx
    FilmSelectionSheet.tsx
  App.tsx
  main.tsx
  index.css              # Tailwind v4 + design tokens
  types.ts
```

## What this prototype tests

- Camera-as-viewfinder with aspect-ratio crop and focal-length zoom simulation
- Zone-system overlay positioned on the live feed
- Film-specific latitude (clipping triangle on zones outside `minZone..maxZone`)
- Exposure compensation shifts zones on the fly
- Kelvin estimate from the frame's average R/B ratio

## Not yet built (future stages)

- Real luminance analysis for zone positioning (Stage 3) — positions are static demo coords
- Spot metering tap
- Onboarding carousel
- Dark mode
- Preset saving / multi-camera support
