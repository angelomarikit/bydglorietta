export type LineupVariant = {
  name: string;
  body: string;
  price: string;
  range: string;
  battery: string;
  charging: string[];
  colours: string[];
};

export type LineupModel = {
  id: string;
  name: string;
  image: string;
  fromPrice: string;
  pricedFrom: boolean;
  variants: LineupVariant[];
  detailsHref?: string;
};

const blade = "BYD Blade Battery";

export const lineup: LineupModel[] = [
  {
    id: "seal-5-dm-i",
    name: "Seal 5 DM-i",
    image: "/assets/lineup/seal-5.png",
    fromPrice: "₱948,000",
    pricedFrom: true,
    variants: [
      {
        name: "Essential",
        body: "5-seater subcompact sedan, 5th Gen Super DM-i",
        price: "₱948,000",
        range: "1,600 km combined",
        battery: `7.42 kWh ${blade}`,
        charging: ["AC, 2.5 hours from 15% to 100%"],
        colours: ["Arctic White", "Cosmos Black", "Harbour Grey", "Deep Sea Blue"],
      },
      {
        name: "Dynamic",
        body: "5-seater subcompact sedan, 5th Gen Super DM-i",
        price: "₱1,048,000",
        range: "1,600 km combined",
        battery: `7.42 kWh ${blade}`,
        charging: ["AC, 2.5 hours from 15% to 100%"],
        colours: ["Arctic White", "Cosmos Black", "Harbour Grey", "Deep Sea Blue"],
      },
    ],
  },
  {
    id: "seagull",
    name: "Seagull",
    image: "/assets/lineup/seagull.png",
    fromPrice: "₱968,000",
    pricedFrom: false,
    variants: [
      {
        name: "Seagull",
        body: "5-seater mini hatchback, electric",
        price: "₱968,000",
        range: "300 km NEDC",
        battery: `30 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 5 hours from 0% to 100%"],
        colours: ["Sprout Green", "Delan Black", "Apricity White"],
      },
    ],
  },
  {
    id: "atto-2-dm-i",
    name: "Atto 2 DM-i",
    image: "/assets/lineup/atto-2-dmi.png",
    fromPrice: "₱1,048,000",
    pricedFrom: true,
    variants: [
      {
        name: "Dynamic",
        body: "5-seater subcompact SUV, Super DM-i",
        price: "₱1,048,000",
        range: "1,045 km combined",
        battery: `7.9 kWh ${blade}`,
        charging: ["AC, 2 hours from 15% to 100%"],
        colours: ["Cosmos Black", "Ski White", "Harbour Grey", "Midnight Blue"],
      },
      {
        name: "Premium",
        body: "5-seater subcompact SUV, Super DM-i",
        price: "₱1,258,000",
        range: "1,045 km combined",
        battery: `7.9 kWh ${blade}`,
        charging: ["AC, 2 hours from 15% to 100%"],
        colours: ["Cosmos Black", "Ski White", "Harbour Grey", "Midnight Blue"],
      },
    ],
  },
  {
    id: "atto-2-ev",
    name: "Atto 2 EV",
    image: "/assets/lineup/atto-2-ev.png",
    fromPrice: "₱1,338,000",
    pricedFrom: false,
    variants: [
      {
        name: "Premium",
        body: "5-seater subcompact SUV, electric",
        price: "₱1,338,000",
        range: "380 km NEDC",
        battery: `45.1 kWh ${blade}`,
        charging: ["AC, 7.4 hours from 0% to 100%", "DC, 0.4 hours from 10% to 80%"],
        colours: ["Ski White", "Harbour Grey", "Midnight Blue", "Breeze Green"],
      },
    ],
  },
  {
    id: "sealion-5-dm-i",
    name: "Sealion 5 DM-i",
    image: "/assets/lineup/sealion-5.png",
    fromPrice: "₱1,268,000",
    pricedFrom: false,
    variants: [
      {
        name: "Sealion 5 DM-i",
        body: "5-seater subcompact SUV, Super DM-i",
        price: "₱1,268,000",
        range: "1,001 km combined",
        battery: `12.96 kWh ${blade}`,
        charging: ["AC, 4.5 hours from 15% to 100%"],
        colours: ["Deep Sea Blue", "Cosmos Black", "Arctic White", "Harbour Grey"],
      },
    ],
  },
  {
    id: "emax-7",
    name: "eMAX 7",
    image: "/assets/lineup/emax-7.png",
    fromPrice: "₱1,548,000",
    pricedFrom: true,
    variants: [
      {
        name: "Standard",
        body: "7-seater subcompact MPV, electric",
        price: "₱1,548,000",
        range: "420 km NEDC",
        battery: `55.4 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 9 hours from 0% to 100%"],
        colours: ["Quartz Blue", "Cosmos Black"],
      },
      {
        name: "Superior Captain",
        body: "6-seater subcompact MPV, electric",
        price: "₱1,768,000",
        range: "530 km NEDC",
        battery: `71.8 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 13 hours from 0% to 100%"],
        colours: ["Crystal White", "Harbour Grey"],
      },
    ],
  },
  {
    id: "sealion-6-dm-i",
    name: "Sealion 6 DM-i",
    image: "/assets/vehicles/sealion-6-dm-i/exterior/sealion-6-dm-i-delan-black-exterior-02.jpg",
    fromPrice: "₱1,548,000",
    pricedFrom: true,
    detailsHref: "/car-details",
    variants: [
      {
        name: "Dynamic",
        body: "5-seater compact SUV, Super DM-i",
        price: "₱1,548,000",
        range: "1,200 km combined",
        battery: `18.3 kWh ${blade}`,
        charging: ["AC, 2.8 hours from 15% to 100%"],
        colours: ["Arctic White", "Harbour Grey", "Delan Black"],
      },
      {
        name: "Premium",
        body: "5-seater compact SUV, Super DM-i",
        price: "₱1,798,000",
        range: "1,200 km combined",
        battery: `18.3 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%"],
        colours: ["Arctic White", "Harbour Grey", "Delan Black"],
      },
    ],
  },
  {
    id: "atto-3",
    name: "Atto 3",
    image: "/assets/lineup/atto-3.png",
    fromPrice: "₱1,638,000",
    pricedFrom: true,
    variants: [
      {
        name: "Dynamic",
        body: "5-seater subcompact SUV, electric",
        price: "₱1,638,000",
        range: "410 km NEDC",
        battery: `49.9 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 7 to 7.5 hours from 0% to 100%"],
        colours: ["Ski White", "Boulder Grey"],
      },
      {
        name: "Premium",
        body: "5-seater subcompact SUV, electric",
        price: "₱1,848,000",
        range: "480 km NEDC",
        battery: `60.5 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 8 to 8.5 hours from 0% to 100%"],
        colours: ["Cosmos Black, Premium only"],
      },
    ],
  },
  {
    id: "shark-6-dmo",
    name: "Shark 6 DMO",
    image: "/assets/lineup/shark-6.png",
    fromPrice: "₱2,388,000",
    pricedFrom: true,
    variants: [
      {
        name: "Advanced",
        body: "5-seater pickup, Super DMO",
        price: "₱2,388,000",
        range: "800 km combined",
        battery: `29.6 kWh ${blade}`,
        charging: ["DC, 0.4 hours from 30% to 80%", "AC, 5.2 hours from 15% to 100%"],
        colours: ["Deep Sea Blue", "Cosmos Black", "Aurora White"],
      },
      {
        name: "Premium",
        body: "5-seater pickup, Super DMO",
        price: "₱2,618,000",
        range: "800 km combined",
        battery: `29.6 kWh ${blade}`,
        charging: ["DC, 0.4 hours from 30% to 80%", "AC, 5.2 hours from 15% to 100%"],
        colours: ["Deep Sea Blue", "Cosmos Black", "Aurora White"],
      },
    ],
  },
  {
    id: "tang-dm-i",
    name: "Tang DM-i",
    image: "/assets/lineup/tang-dmi.png",
    fromPrice: "₱2,148,000",
    pricedFrom: false,
    variants: [
      {
        name: "Tang DM-i",
        body: "7-seater mid-size SUV, Super DM-i",
        price: "₱2,148,000",
        range: "1,160 km combined",
        battery: `21.5 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 3 hours from 15% to 100%"],
        colours: ["Moon Stone Grey", "Pearl White", "Silver Sand Black"],
      },
    ],
  },
  {
    id: "sealion-7",
    name: "Sealion 7",
    image: "/assets/lineup/sealion-7.png",
    fromPrice: "₱2,588,000",
    pricedFrom: false,
    variants: [
      {
        name: "Sealion 7",
        body: "5-seater performance SUV, electric",
        price: "₱2,588,000",
        range: "542 km NEDC",
        battery: `82.6 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 16 hours from 15% to 100%"],
        colours: ["Shark Grey", "Deep Sea Blue", "Aurora White", "Cosmos Black"],
      },
    ],
  },
  {
    id: "emax-9-dm-i",
    name: "eMAX 9 DM-i",
    image: "/assets/lineup/emax-9.png",
    fromPrice: "₱2,778,000",
    pricedFrom: true,
    variants: [
      {
        name: "Advanced",
        body: "7-seater luxury MPV, Super DM-i",
        price: "₱2,778,000",
        range: "95 km NEDC",
        battery: `20.4 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 3 hours from 15% to 100%"],
        colours: ["Deep Sea Blue", "Cosmos Black"],
      },
      {
        name: "Premium",
        body: "7-seater luxury MPV, Super DM-i",
        price: "₱3,098,000",
        range: "170 km NEDC",
        battery: `36.6 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 5 hours from 15% to 100%"],
        colours: ["Aurora White"],
      },
    ],
  },
  {
    id: "tang",
    name: "Tang",
    image: "/assets/lineup/tang.png",
    fromPrice: "₱3,421,000",
    pricedFrom: false,
    variants: [
      {
        name: "Tang",
        body: "7-seater mid-size SUV, electric",
        price: "₱3,421,000",
        range: "530 km WLTP",
        battery: `108.8 kWh ${blade}`,
        charging: ["DC, 0.5 hours from 30% to 80%", "AC, 15 hours from 0% to 100%"],
        colours: ["Ridge Grey", "Snowy White", "Silver Sand Black"],
      },
    ],
  },
];

export function lineupPrice(model: LineupModel) {
  return model.pricedFrom ? `From ${model.fromPrice}` : model.fromPrice;
}
