# Design reference

This is the visual brief for the BYD Glorietta site, taken from the files that were actually supplied. The site itself is a React application. This note is the design handoff, including the board in `reference-materials/08-framer-reference/`.

## Brand marks

Use these on the site:

- `public/assets/logos/byd-logo-white.png` on dark or photographic backgrounds.
- `public/assets/logos/byd-logo-grey.png` on white. Sampled ink from that raster is about `#687070`. The vector PDF next to it in `reference-materials/01-branding/byd/` is the print master.
- `public/assets/logos/acmobility-logo-full-color.png` and `acmobility-logo-white.png`. Both have transparent backgrounds. Sampled full-color inks are an olive near `#405018` and a cyan near `#00D0E8`. ACMobility is the distributor mark, secondary to the BYD wordmark.

Do not use:

- `reference-materials/01-branding/byd-glorietta/byd-glorietta-lockup.png`. The BYD mark is missing and has been replaced by a flat grey bar. Only the word “Glorietta” is real artwork. Set the dealer name in type until a complete lockup is exported.
- Anything in `reference-materials/01-branding/other-branches/`. Those are BYD Greenhills logos.

The price list and the approved key visual both set the BYD wordmark at the top left, small, in white or grey, with the model name in wide capital letters. Follow that hierarchy: BYD mark, then “Glorietta” as a dealer line, then the vehicle name.

## Type

The supplied families are FZ LanTing Hei (three TTFs) and Source Han Sans SC (five OTFs), in `reference-materials/02-fonts/`. They are Chinese brand fonts. FZ LanTing should stay off the public site until a web license is confirmed. Source Han Sans is typically released under the SIL Open Font License, but the files here are full Simplified Chinese OTFs of 14–17 MB each and are the wrong tool for an English page.

The key visual is set in a wide geometric sans, nearly all capitals, with a light subhead over a heavy model name. Match that proportion with a geometric grotesque for the UI. Do not load the CJK files as webfonts.

## Photography

Only Sealion 6 DM-i has real photography.

The product hero is the clean studio frame, not the poster:

`public/assets/vehicles/sealion-6-dm-i/hero/sealion-6-dm-i-delan-black-exterior-01.jpg`

It is a front three-quarter of the Delan Black car on a pale seamless background, full vehicle in frame, landscape. It is only 1080 pixels wide. That is the highest-resolution clean photograph in the library. Do not upscale it, and do not crop the wheels or the roof rail.

Delan Black is a paint name on the November 2026 price list (Sealion 6 and Seagull), and it is the name of the folder these frames came from. The exterior and six-frame spin are that black car. The interior frames are not labeled with a paint color. They show a black leather cabin with blue contrast stitching. Use them as the Sealion 6 interior, and do not caption them as a specific exterior color.

The approved key visual is a campaign banner, 1920×1080, two cars on a coastal road: black Premium on the left, white Dynamic on the right, blue sky, the model name centered. Use it as a banner (`public/assets/banners/sealion-6-dm-i-main-kv.jpg`). It already contains a price and legal line (ASC Ref No. M0176N111126B), so it should not sit under a second headline that repeats the same claims.

The 2024–2025 refresh key visual is a grey car in motion and belongs to the previous model. It is not in `public/`.

## Pages

One design, fifteen agent URLs. Shared blocks:

- BYD mark and Glorietta dealer line
- Agent name, portrait, phone, and Messenger or WhatsApp when that agent has one
- Model lineup from `docs/vehicle-catalog.json`, in price-list order
- Sealion 6 gallery: hero, exterior, 360 frames, interior
- For every other model, a specification and price row with an explicit empty image state. Do not substitute the Sealion 6 photograph, and do not lift the tiny car renderings out of the price-list pages.
- Inquiry form and test-drive form bound to that agent
- QR in the admin, not drawn into the public hero

The price-list pages themselves stay in `reference-materials/05-price-lists/`. They include blank consultant boxes and are the dealer’s print sheet, not a web layout.

## Motion

The supplied art is still photography and print. Motion should be short and quiet: a fade between gallery frames, and the 360 sequence stepped in the order `360-01` through `360-06`. No parallax that crops the car.

## Gaps a layout must not invent

- No Glorietta lockup with a real BYD mark.
- No exterior photography except Sealion 6 in Delan Black. There is no white or grey Sealion 6 photo to match the key visual’s Dynamic car, apart from the key visual itself.
- Premium interior frames are numbered 02–05. Frame 01 was not in the folder.
- No brochure photography for Seagull, Seal, Atto, Dolphin, Shark, Tang, Sealion 5, Sealion 7, or eMAX.
