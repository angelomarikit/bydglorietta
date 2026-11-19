# Implementation plan

Phase 1 is the asset library, the November 2026 catalog, and this plan. The React application is not started. The master brief was cut off while it was still asking for model names and vehicle data, so the data model below covers what that brief had already specified: one site, fifteen agent landing pages, one admin, shared vehicles.

The Cursor project root `D:\BYD` is the site root. A nested `BYD-GLORIETTA` folder was not added, so `public/`, `src/`, and `supabase/` can deploy as one Vercel project later.

## Product

One website. Not fifteen sites.

Each sales agent gets a route such as `/a/:slug` that reuses the same page components and reads that agent’s profile. Vehicle images, specifications, and the price catalog are shared. What changes per agent is the URL, name, portrait, phone, Messenger or WhatsApp link, the inquiry form’s owner, the test-drive form’s owner, and a QR code that points at that URL.

An administrator manages agents, inquiries, and test-drive bookings from `/admin`. Agents can later be limited to their own leads. Nothing in the public UI is copied per person.

## Stack

- Vite, React, TypeScript, React Router
- Tailwind CSS
- Motion for React
- Lucide React
- Supabase Postgres, Auth, and Storage, with row-level security
- GitHub and Vercel

Vehicle content starts from `docs/vehicle-catalog.json` so the public pages do not depend on a CMS row being typed in before the first deploy. Prices move into Postgres once the admin needs to edit them without a code change.

## Suggested data

`agents`: slug, name, photo path, phone, email, messenger URL, whatsapp URL, active flag.

`inquiries`: agent id, customer name, contact, model of interest, message, status.

`test_drives`: agent id, customer name, contact, model, preferred schedule, status.

`vehicles` and `variants`: the fields already shaped in `docs/vehicle-catalog.json`, when prices need to be edited in the admin.

Storage buckets: `agent-photos` (public read), `lead-attachments` if needed later. Vehicle photography stays in `public/assets` until a model actually needs CMS replacement. That avoids putting the same Sealion 6 set in the database fifteen times.

Row-level security, in outline:

- Anonymous users can read active agents and the published catalog.
- Anonymous users can insert an inquiry or a test drive only when the agent id is an active agent.
- An authenticated agent can read and update leads where `agent_id` is their own.
- An admin role can read and write agents, leads, and catalog rows.

QR codes are generated from the absolute landing URL and stored or rendered in the admin. They are not a separate website.

## Build order

1. Vite app, Tailwind, router, and a layout that loads the BYD mark, the Glorietta wordmark-as-type, and the catalog JSON.
2. Shared vehicle sections. Sealion 6 renders the hero, exterior, spin, and interior. Every other model renders price, variant, range, battery, charging, and colors, with an empty image state.
3. Agent route with profile, inquiry form, and test-drive form. Until Supabase exists, a single sample agent can prove the layout.
4. Supabase project, migrations in `supabase/migrations`, auth, and the policies above.
5. Admin: sign-in, agent editor, lead inbox filtered by agent, QR download.
6. Seed the fifteen agents when their names, photos, and contact links are provided. The library does not contain agent portraits or a roster.
7. Vercel, with the Supabase URL and anon key in environment variables. No service-role key in the frontend.

## Do not build yet

- A different theme per agent.
- Per-agent copies of vehicle components.
- Public use of the broken Glorietta lockup, the Greenhills logos, the previous-generation Sealion 6 refresh art, or the 748 MB print TIFF.
- Publishing eMAX 9’s 95 km and 170 km NEDC figures as total range, or merging the two Seal 5 rows. Both are called out in `docs/price-verification.md`.

## Asset map

Originals remain in `C:\Users\Toptier\Downloads\BYD`. Nothing there was renamed or deleted.

| Location | What it holds |
| --- | --- |
| `reference-materials/01-branding` | BYD, ACMobility, the incomplete Glorietta lockup, Greenhills |
| `reference-materials/02-fonts` | FZ LanTing Hei and Source Han Sans SC |
| `reference-materials/03-vehicle-source-images` | Original Sealion 6 frames. `unclassified/` is empty |
| `reference-materials/04-promotional-materials` | Current key visual and pull-up; previous-generation KV; pointer to the TIFF that was not copied |
| `reference-materials/05-price-lists` | November 2026 PDF and page JPGs |
| `reference-materials/06-specification-sheets` | Current one-pager and the previous refresh sheet |
| `reference-materials/07-original-design-files` | AI and INDD sources |
| `reference-materials/08-framer-reference` | Frame index for design |
| `public/assets` | Logos and compressed website images |
| `docs/asset-manifest.csv` | Original filename, new path, and why a file was skipped |

Skipped on purpose: the macOS `DS_Store`, an Illustrator `.tmp`, a duplicate ACMobility PNG, three compressed copies of the price-list pages, and the 6600×15600 refresh pull-up TIFF (747.6 MB), which is still at its original path.
