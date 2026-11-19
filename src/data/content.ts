export const photos = {
  hero: "/assets/vehicles/sealion-6-dm-i/hero/sealion-6-dm-i-delan-black-exterior-01.jpg",
  exterior: [
    "/assets/vehicles/sealion-6-dm-i/exterior/sealion-6-dm-i-delan-black-exterior-01.jpg",
    "/assets/vehicles/sealion-6-dm-i/exterior/sealion-6-dm-i-delan-black-exterior-02.jpg",
    "/assets/vehicles/sealion-6-dm-i/exterior/sealion-6-dm-i-delan-black-exterior-03.jpg",
    "/assets/vehicles/sealion-6-dm-i/exterior/sealion-6-dm-i-delan-black-exterior-04.jpg",
    "/assets/vehicles/sealion-6-dm-i/exterior/sealion-6-dm-i-delan-black-exterior-05.jpg",
  ],
  interior: [
    "/assets/vehicles/sealion-6-dm-i/interior/sealion-6-dm-i-interior-01.jpg",
    "/assets/vehicles/sealion-6-dm-i/interior/sealion-6-dm-i-interior-02.jpg",
    "/assets/vehicles/sealion-6-dm-i/interior/sealion-6-dm-i-interior-03.jpg",
    "/assets/vehicles/sealion-6-dm-i/interior/sealion-6-dm-i-interior-04.jpg",
    "/assets/vehicles/sealion-6-dm-i/interior/sealion-6-dm-i-interior-05.jpg",
  ],
  interiorPremium: [
    "/assets/vehicles/sealion-6-dm-i/interior/sealion-6-dm-i-interior-premium-02.jpg",
    "/assets/vehicles/sealion-6-dm-i/interior/sealion-6-dm-i-interior-premium-03.jpg",
    "/assets/vehicles/sealion-6-dm-i/interior/sealion-6-dm-i-interior-premium-04.jpg",
    "/assets/vehicles/sealion-6-dm-i/interior/sealion-6-dm-i-interior-premium-05.jpg",
  ],
  spin: [
    "/assets/vehicles/sealion-6-dm-i/gallery/sealion-6-dm-i-delan-black-360-01.jpg",
    "/assets/vehicles/sealion-6-dm-i/gallery/sealion-6-dm-i-delan-black-360-02.jpg",
    "/assets/vehicles/sealion-6-dm-i/gallery/sealion-6-dm-i-delan-black-360-03.jpg",
    "/assets/vehicles/sealion-6-dm-i/gallery/sealion-6-dm-i-delan-black-360-04.jpg",
    "/assets/vehicles/sealion-6-dm-i/gallery/sealion-6-dm-i-delan-black-360-05.jpg",
    "/assets/vehicles/sealion-6-dm-i/gallery/sealion-6-dm-i-delan-black-360-06.jpg",
  ],
  kv: "/assets/banners/sealion-6-dm-i-main-kv.jpg",
  sheet: "/assets/promotions/sealion-6-dm-i-spec-sheet.jpg",
  logoGrey: "/assets/logos/byd-logo-grey.png",
  logoWhite: "/assets/logos/byd-logo-white.png",
  acmobility: "/assets/logos/acmobility-logo-full-color.png",
  acmobilityWhite: "/assets/logos/acmobility-logo-white.png",
} as const;

export const cabinFrames = [
  { src: photos.interiorPremium[0], alt: "Door speaker with an Infinity badge" },
  { src: photos.interiorPremium[2], alt: "Panoramic glass roof above the rear seats" },
  { src: photos.interiorPremium[3], alt: "Sealion 6 dashboard and centre screen" },
  { src: photos.interiorPremium[1], alt: "Front seats with pale green stitching" },
  { src: photos.exterior[1], alt: "Sealion 6 DM-i in Delan Black, front three-quarter" },
  { src: photos.exterior[2], alt: "Sealion 6 DM-i in Delan Black, side profile" },
  { src: photos.exterior[0], alt: "Sealion 6 DM-i in Delan Black, front three-quarter from above" },
  { src: photos.exterior[3], alt: "Sealion 6 DM-i in Delan Black, rear three-quarter" },
  { src: photos.exterior[4], alt: "Sealion 6 DM-i in Delan Black, front view" },
] as const;

export const sealion360 = [
  {
    src: photos.spin[5],
    alt: "Sealion 6 DM-i in Delan Black, front three-quarter",
    label: "Front",
  },
  {
    src: photos.spin[2],
    alt: "Sealion 6 DM-i in Delan Black, side profile",
    label: "Side",
  },
  {
    src: photos.spin[3],
    alt: "Sealion 6 DM-i in Delan Black, rear three-quarter",
    label: "Rear",
  },
] as const;

export const ratios = {
  gallery: "1080 / 553",
  premium: "1440 / 737",
  kv: "16 / 9",
  sheet: "736 / 953",
  byd: "1200 / 324",
  acmobility: "2756 / 781",
} as const;

export const posts = [
  {
    slug: "sealion-6-dm-i-at-glorietta",
    title: "Sealion 6 DM-i at Glorietta",
    category: "Sealion 6",
    date: "12 November 2026",
    excerpt:
      "The only model with showroom photography. Dynamic from ₱1,548,000. Premium ₱1,798,000. Combined range 1,200 km.",
    image: photos.hero,
    ratio: ratios.gallery,
    body: [
      "The Sealion 6 DM-i is the compact SUV photographed for BYD Glorietta. Dynamic starts at ₱1,548,000. Premium is ₱1,798,000, and the price list adds DC charging for Premium.",
      "Combined range is 1,200 km. The Blade Battery is 18.3 kWh. Colours on the sheet are Arctic White, Harbour Grey, and Delan Black. Every exterior frame in this site is the Delan Black car.",
      "The approved key visual also prints 217 Ps, 300 Nm, a 100 km full-EV range, vehicle-to-load, and DiPilot ADAS on Premium. Those lines are campaign claims, not a separate row on the price list.",
    ],
  },
  {
    slug: "prices-12-november-2026",
    title: "Prices as of 12 November 2026",
    category: "Pricing",
    date: "12 November 2026",
    excerpt:
      "Suggested retail prices from the November 2026 BYD price list. They can change, and they can vary by dealer.",
    image: photos.kv,
    ratio: ratios.kv,
    body: [
      "The price list is dated 12 November 2026. Sealion 6 DM-i Dynamic is ₱1,548,000 and Premium is ₱1,798,000.",
      "The same sheet lists the rest of the Philippine lineup, from Seagull at ₱968,000 to Tang at ₱3,421,000. Provincial prices may be higher. This site does not invent a Glorietta discount.",
    ],
  },
  {
    slug: "delan-black",
    title: "Delan Black, the photographed colour",
    category: "Colour",
    date: "12 November 2026",
    excerpt:
      "Every exterior and spin frame in the library is the Delan Black Sealion 6. Interior frames are not labeled with a paint colour.",
    image: photos.exterior[1],
    ratio: ratios.gallery,
    body: [
      "Delan Black is a listed Sealion 6 colour, with Arctic White and Harbour Grey. The exterior photographs and the six-frame spin are that black car.",
      "The interior photographs show a black leather cabin with blue contrast stitching. The files do not name a paint colour, so they are not captioned as a specific exterior.",
    ],
  },
  {
    slug: "what-the-price-list-prints",
    title: "What the price list actually prints",
    category: "Specification",
    date: "12 November 2026",
    excerpt: "Range, battery, and charging for the Sealion 6 DM-i, taken from the November 2026 sheet.",
    image: photos.interior[0],
    ratio: ratios.gallery,
    body: [
      "Both variants list a 1,200 km combined range and an 18.3 kWh Blade Battery. Dynamic lists AC charging in 2.8 hours from 15% to 100%.",
      "Premium adds DC charging in 0.5 hours from 30% to 80%. The older 2024–2025 refresh sheet, which says about 1,000 km, is the previous model and is not used here.",
    ],
  },
] as const;

export type Post = (typeof posts)[number];
