# Shipping Keel

## 1. Web (the Windows desktop version)

```powershell
npx expo export --platform web    # static site in dist/
npx serve dist                    # open http://localhost:3000 in any Windows browser
```

The web build is fully responsive (centered max-width column on wide screens, mobile layout at phone widths), keyboard-navigable, and supports light/dark mode. To publish a live demo link, drop `dist/` on any static host (Vercel/Netlify): `npx vercel dist` or drag-and-drop into Netlify.

## 2. iOS `.ipa` for SideStore (no Mac required)

iOS binaries are compiled by **EAS Build in the cloud** on Apple hardware. The `eas.json` in this repo already contains the `sideload` profile (`internal` distribution, real device).

> **TODO(human):** the steps below need an interactive Expo-account login, so they must be run by you once:

```powershell
npm i -g eas-cli
eas login                          # your (free) Expo account
eas build:configure                # links the project (accept defaults)
eas build -p ios --profile sideload
```

- When EAS asks about iOS credentials, let it **manage them automatically** (internal distribution). A paid Apple Developer account is **not** required — SideStore re-signs on-device with a free Apple ID.
- The build finishes in the cloud (~10–20 min) and prints a **download URL for the `.ipa`**. Paste that URL below for the record:

  **`.ipa` download URL:** _TODO(human): paste after first successful build_

## 3. Installing with SideStore on the iPhone

1. One-time setup: install [SideStore](https://sidestore.io) on the iPhone (follow their pairing guide — requires SideServer on your PC the first time and a free Apple ID).
2. Download the `.ipa` from the EAS URL (on the phone, or transfer it).
3. Open SideStore → **+** → pick the Keel `.ipa`. SideStore re-signs it with your Apple ID and installs it.
4. Free-Apple-ID caveat: apps expire after **7 days**; open SideStore to refresh before expiry.
5. First launch: allow notifications so care reminders can fire.

## 4. Connecting the real backend

The app currently runs in **demo mode** (on-device fake data) until Supabase keys exist:

1. Create a project at supabase.com → run `supabase/migrations/*.sql` in the SQL editor (in order), then `supabase/seed.sql`.
2. In Authentication → Providers, keep Email enabled (magic links optional).
3. Copy the project URL + anon key into `.env` (see `.env.example`).
4. Rebuild/restart — the same UI now talks to Supabase with RLS enforcing the privacy model.
