/* ============================================================
   AAYUSH RESORT — INTERACTIVE WEDDING MAP
   data.js — All location content lives here.
   Nothing else in the app needs to change when you edit this file.
   ============================================================

   HOW TO EDIT POLYGONS
   ---------------------
   Every location has a `polygon` array of [x, y] points in IMAGE
   PIXEL coordinates (origin top-left, same as the source PNG).
   These are placeholder squares — reasonable starting positions,
   not traced outlines. To get exact shapes:

     1. Open the map in the app.
     2. Click "Edit Mode" (top right).
     3. Pick a location from the dropdown.
     4. Click points on the map to trace its real outline.
     5. Click "Finish Shape", then "Copy JSON" and paste the
        result back into this file, replacing that location's
        `polygon` value.

   CATEGORIES (used by the filter bar)
   ------------------------------------
   "rooms"   -> 🏨   guest accommodation
   "events"  -> 🎉   wedding function venues
   "food"    -> 🍽   dining / carnival food areas
   "pools"   -> 🏊   water features
   "photo"   -> 📸   photo-op spots
   "parking" -> 🚗
   "temple"  -> 🛕
   "building"-> 🏛   general amenity buildings (no dedicated icon)

   A location can carry more than one via `tags` for search/filter
   purposes, but `category` drives its map color + primary icon.
============================================================ */

const MAP_IMAGE_BLANK = "assets/map-blank.png";
const MAP_IMAGE_LABELED = "assets/map-labeled.png";

// Natural pixel size of the source artwork. All polygon points
// are defined in this coordinate space.
const MAP_WIDTH = 1337;
const MAP_HEIGHT = 1177;

function box(cx, cy, w = 60, h = 60) {
  const hw = w / 2, hh = h / 2;
  return [
    [cx - hw, cy - hh],
    [cx + hw, cy - hh],
    [cx + hw, cy + hh],
    [cx - hw, cy + hh],
  ];
}

const LOCATIONS = [
  // ---------------- MARQUEE EVENT VENUES ----------------
  {
    id: "palace-de-shaan",
    days: [24],
    name: "Palace de Shaan",
    category: "events",
    tags: ["events", "landmark"],
    icon: "🎉",
    subtitle: "Wedding Ceremony",
    date: "24 Jan",
    time: "TBD",
    description:
      "The emotional climax of the journey — after three days travelling the world, everyone finally arrives in India. The Palace itself is the backdrop for the wedding ceremony.",
    capacity: "",
    dressCode: "",
    food: "",
    music: "",
    polygon: box(1080, 590, 220, 160),
  },
  {
    id: "manwar",
    days: [22, 23],
    name: "Manwar",
    category: "events",
    tags: ["events", "banquet-hall"],
    icon: "🎉",
    subtitle: "Garba Night (Morocco) · American Mameru",
    date: "22 Jan · 23 Jan",
    time: "8:00 PM (22nd) · 10:00 AM (23rd)",
    description:
      "Indoor banquet hall inside Manwar. Only the décor changes here — on the 22nd it transforms into a Moroccan palace with lanterns, carpets and arches for Garba; on the 23rd it becomes an American-inspired celebration for Mameru.",
    capacity: "",
    dressCode: "",
    food: "",
    music: "",
    polygon: box(890, 685, 140, 110),
  },
  {
    id: "dhaba",
    days: [23],
    name: "Dhaba",
    category: "events",
    tags: ["events", "food"],
    icon: "🎉",
    subtitle: "Brazilian Carnival",
    date: "23 Jan",
    time: "2:30 PM",
    description:
      "Outdoor event square that becomes a colourful carnival — samba, music, parades, dancers, food stalls and festival lighting.",
    capacity: "",
    dressCode: "",
    food: "Carnival food stalls",
    music: "Samba / live percussion",
    polygon: box(785, 440, 190, 160),
  },
  {
    id: "palace-lawns",
    days: [23],
    name: "Palace Lawns",
    category: "events",
    tags: ["events", "lawn"],
    icon: "🎉",
    subtitle: "European Sangeet (Venice)",
    date: "23 Jan",
    time: "8:00 PM",
    description:
      "Lawns outside Palace de Shaan, dressed as Venice for the evening — Venetian bridges, gondola photo areas, string lights, piazza cafés and masquerade masks, with the Palace as backdrop.",
    capacity: "",
    dressCode: "Masquerade-inspired formal",
    food: "",
    music: "",
    polygon: box(985, 700, 130, 90),
  },
  {
    id: "central-lawn",
    days: [22],
    name: "Central Lawn",
    category: "events",
    tags: ["events", "lawn"],
    icon: "🎉",
    subtitle: "Australian Wedding Olympics (tentative)",
    date: "22 Jan",
    time: "2:00 PM",
    description:
      "Large central lawn — candidate location for the Wedding Olympics outdoor games. Venue for this event still TBD between here and the pool area.",
    capacity: "",
    dressCode: "Sporty / casual",
    food: "",
    music: "",
    polygon: box(400, 480, 380, 260),
  },

  // ---------------- AMENITY BUILDINGS ----------------
  {
    id: "reception",
    name: "Reception",
    category: "building",
    tags: ["building", "arrival"],
    icon: "🏛",
    subtitle: "Airport Terminal Check-in",
    date: "",
    time: "",
    description:
      "Guest arrival point, styled as an international airport terminal rather than a wedding reception desk. Passports, boarding passes, luggage tags, itineraries and room assignments are issued here.",
    polygon: box(805, 855, 110, 90),
  },
  {
    id: "musical-lounge",
    name: "Dance Floor",
    category: "building",
    tags: ["building"],
    icon: "🏛",
    subtitle: "",
    date: "",
    time: "",
    description: "Indoor lounge space near Main House.",
    polygon: box(845, 600, 90, 70),
  },
  {
    id: "main-house",
    name: "Main House",
    category: "building",
    tags: ["building"],
    icon: "🏛",
    subtitle: "",
    date: "",
    time: "",
    description: "Main house building at the centre of the resort.",
    polygon: box(725, 605, 100, 80),
  },
  {
    id: "sb1",
    name: "SB1",
    category: "building",
    tags: ["building"],
    icon: "🏛",
    subtitle: "",
    date: "",
    time: "",
    description: "SB1 building, near the lower swimming pool.",
    polygon: box(620, 585, 60, 60),
  },
  {
    id: "new-building",
    name: "New Building",
    category: "rooms",
    tags: ["rooms"],
    icon: "🏨",
    subtitle: "Rooms N-101 to N-318",
    date: "",
    time: "",
    description:
      "Guest accommodation block, rooms N-101 through N-318. Guests will see destination-city names; N-numbers are kept for internal ops only.",
    roomRange: "N-101 – N-318",
    continent: "Europe",
    destinationCity: "",
    polygon: box(930, 870, 220, 110),
  },
  {
    id: "derasar",
    name: "Derasar",
    category: "temple",
    tags: ["temple"],
    icon: "🛕",
    subtitle: "Temple",
    date: "",
    time: "",
    description: "On-site Jain derasar (temple).",
    polygon: box(745, 940, 70, 70),
  },
  {
    id: "parking",
    name: "Parking Area",
    category: "parking",
    tags: ["parking"],
    icon: "🚗",
    subtitle: "",
    date: "",
    time: "",
    description: "Main guest and vendor parking area.",
    polygon: box(855, 950, 160, 70),
  },

  // ---------------- WATER FEATURES / PHOTO SPOTS ----------------
  {
    id: "pool-upper",
    name: "Swimming Pool (Upper)",
    category: "pools",
    tags: ["pools", "photo"],
    icon: "🏊",
    subtitle: "",
    date: "",
    time: "",
    description: "Cloverleaf-shaped pool near the C25–C34 cottage cluster.",
    polygon: box(720, 195, 190, 140),
  },
  {
    id: "pool-lower",
    name: "Swimming Pool (Lower)",
    category: "pools",
    tags: ["pools", "photo"],
    icon: "🏊",
    subtitle: "",
    date: "",
    time: "",
    description: "Smaller pool next to SB1, close to Dhaba.",
    polygon: box(665, 535, 90, 80),
  },
  {
    id: "boat-house",
    name: "Boat House",
    category: "pools",
    tags: ["pools", "photo"],
    icon: "🏊",
    subtitle: "",
    date: "",
    time: "",
    description: "Water feature near the E1–E8 cottage cluster.",
    polygon: box(1105, 275, 110, 100),
  },
  {
    id: "fountain-central",
    name: "Central Fountain",
    category: "photo",
    tags: ["photo"],
    icon: "📸",
    subtitle: "Photo Spot",
    date: "",
    time: "",
    description: "Circular fountain and roundabout near Main House / Manwar.",
    polygon: box(725, 730, 90, 90),
  },
  {
    id: "fountain-c15",
    name: "Garden Fountain",
    category: "photo",
    tags: ["photo"],
    icon: "📸",
    subtitle: "Photo Spot",
    date: "",
    time: "",
    description: "Small fountain in the C12–C18 cottage garden.",
    polygon: box(245, 505, 60, 60),
  },

  // ---------------- COTTAGE / ROOM CLUSTERS ----------------
  // continent here reflects the NEW area-based zone grouping (see ROOM_ZONES
  // below). This tag is independent of the zone's drawn area shape — it's
  // just which zone each cottage counts as for room-naming purposes.
  { id: "c1", name: "C1", cluster: "C1", roomCount: 1, cx: 565, cy: 665, continent: "Americas", destinationCity: "New York" },
  { id: "c2", name: "C2", cluster: "C2", roomCount: 1, cx: 520, cy: 665, continent: "Americas", destinationCity: "Toronto" },
  { id: "c3", name: "C3", cluster: "C3", roomCount: 1, cx: 475, cy: 665, continent: "Americas", destinationCity: "Havana" },
  { id: "c4", name: "C4", cluster: "C4", roomCount: 1, cx: 430, cy: 665, continent: "Americas", destinationCity: "Cancun" },
  { id: "c5-c6", name: "C5–C6", cluster: "C5-C6", roomCount: 2, cx: 375, cy: 665, continent: "Americas", destinationCity: "Buenos Aires" },
  { id: "c7-c8", name: "C7–C8", cluster: "C7-C8", roomCount: 2, cx: 310, cy: 655, continent: "Americas", destinationCity: "Rio de Janeiro" },
  { id: "c9", name: "C9", cluster: "C9", roomCount: 1, cx: 255, cy: 600, continent: "Americas", destinationCity: "Vancouver" },
  { id: "c10", name: "C10", cluster: "C10", roomCount: 1, cx: 195, cy: 600, continent: "Americas", destinationCity: "Aspen" },
  { id: "c11a-c11b", name: "C11A–C11B", cluster: "C11A-C11B", roomCount: 2, cx: 55, cy: 525, continent: "Africa", destinationCity: "Cairo" },
  { id: "c12", name: "C12", cluster: "C12", roomCount: 1, cx: 120, cy: 525, continent: "Africa", destinationCity: "Marrakech" },
  { id: "c14", name: "C14", cluster: "C14", roomCount: 1, cx: 175, cy: 525, continent: "Africa", destinationCity: "Casablanca" },
  { id: "c15-c16", name: "C15–C16", cluster: "C15-C16", roomCount: 2, cx: 150, cy: 470, continent: "Africa", destinationCity: "Cape Town" },
  { id: "c17", name: "C17", cluster: "C17", roomCount: 1, cx: 185, cy: 415, continent: "Africa", destinationCity: "Nairobi" },
  { id: "c18", name: "C18", cluster: "C18", roomCount: 1, cx: 240, cy: 415, continent: "Africa", destinationCity: "Zanzibar" },
  { id: "c19-c22", name: "C19–C22", cluster: "C19-C22", roomCount: 4, cx: 255, cy: 355, continent: "Africa", destinationCity: "Serengeti" },
  { id: "c25-c26", name: "C25–C26", cluster: "C25-C26", roomCount: 2, cx: 620, cy: 165, continent: "Asia", destinationCity: "Tokyo" },
  { id: "c27-c28", name: "C27–C28", cluster: "C27-C28", roomCount: 2, cx: 665, cy: 260, continent: "Asia", destinationCity: "Bangkok" },
  { id: "c29-c34", name: "C29–C34", cluster: "C29-C34", roomCount: 6, cx: 810, cy: 60, continent: "Asia", destinationCity: "Bali" },
  { id: "e1-e8", name: "E1–E8", cluster: "E1-E8", roomCount: 8, cx: 1180, cy: 410, continent: "Australia", destinationCity: "Sydney" },
  { id: "e9-e17", name: "E9–E17", cluster: "E9-E17", roomCount: 9, cx: 1225, cy: 480, continent: "Australia", destinationCity: "Auckland" },
  { id: "e17-e25", name: "E17–E25", cluster: "E17-E25", roomCount: 9, cx: 1290, cy: 575, continent: "Australia", destinationCity: "Fiji" },
  { id: "e26-e28", name: "E26–E28", cluster: "E26-E28", roomCount: 3, cx: 1290, cy: 700, continent: "Australia", destinationCity: "Bora Bora" },
  { id: "treetop", name: "Treetop Cottage T1–T6", cluster: "T1-T6", roomCount: 6, cx: 400, cy: 215, continent: "Asia", destinationCity: "Kyoto" },
].map((loc) => {
  // Rooms defined with cx/cy shorthand above get their box polygon
  // generated here, plus shared room metadata defaults.
  if (loc.cx !== undefined) {
    const size = 40 + Math.min(loc.roomCount, 6) * 6;
    return {
      ...loc,
      category: "rooms",
      tags: ["rooms"],
      icon: "🏨",
      subtitle: `${loc.roomCount} room${loc.roomCount > 1 ? "s" : ""}`,
      date: "",
      time: "",
      description: loc.destinationCity
        ? `Cottage cluster ${loc.cluster} — ${loc.continent} zone.`
        : `Cottage cluster ${loc.cluster} — ${loc.continent} zone. City name(s) to be assigned.`,
      guests: [],
      polygon: box(loc.cx, loc.cy, size, size),
    };
  }
  return loc;
});

/* ============================================================
   POLYGON OVERRIDES
   Hand-traced shapes from the polygon_tracker.xlsx handoff.
   Applied on top of the placeholder boxes above. To update a
   shape later, just replace its entry here (or re-run the
   tracker workflow) — no need to touch the LOCATIONS array.
============================================================ */
const POLYGON_OVERRIDES = {
  "palace-de-shaan": [[1201,762],[1265,652],[1269,611],[1245,566],[1101,494],[1045,639],[1060,676]],
  "manwar": [[913,857],[989,740],[991,701],[925,654],[889,717],[869,722],[828,772],[828,805],[833,820],[843,842],[855,849],[879,842],[913,856]],
  "dhaba": [[648,420],[763,604],[814,579],[869,556],[880,494],[870,464],[804,361],[649,416]],
  "palace-lawns": [[1058,660],[1201,756],[1128,906],[987,806]],
  "central-lawn": [[554,617],[598,447],[626,406],[626,378],[591,275],[582,259],[554,244],[525,250],[510,283],[483,317],[452,333],[363,338],[333,357],[317,420],[310,483],[321,563],[367,614],[468,631],[537,633],[552,622]],
  "reception": [[835,970],[858,921],[858,900],[839,889],[804,889],[782,893],[759,913],[751,951],[789,966],[821,975],[833,971]],
  "musical-lounge": [[819,599],[886,600],[877,683],[812,665]],
  "main-house": [[657,697],[699,650],[733,672],[747,662],[773,679],[797,661],[800,634],[700,568],[676,602],[675,617],[639,659],[638,680],[657,697]],
  "sb1": [[593,569],[639,568],[642,623],[596,622]],
  "new-building": [[864,907],[832,981],[827,1016],[932,1069],[936,1081],[980,1101],[1016,1103],[1032,1070],[977,1054],[1011,976],[865,907]],
  "derasar": [[794,1038],[776,1095],[706,1070],[736,977],[753,965],[765,955],[782,966],[783,971],[805,981],[811,995],[795,1036]],
  "parking": [[777,1095],[805,1038],[975,1106],[948,1165],[961,1176],[896,1176],[762,1120],[778,1096]],
  "pool-upper": [[705,269],[700,304],[731,317],[754,289],[757,279],[747,266],[724,249],[729,232],[747,227],[758,213],[779,211],[784,201],[787,191],[787,177],[792,167],[789,154],[774,149],[771,128],[751,120],[734,137],[715,143],[710,152],[715,164],[706,171],[700,175],[698,185],[705,191],[708,196],[700,208],[691,206],[684,209],[680,214],[676,224],[677,231],[681,236],[687,242],[694,248],[700,256],[704,263],[706,274]],
  "pool-lower": [[660,569],[677,562],[688,552],[694,538],[692,528],[681,515],[667,507],[656,505],[641,513],[630,522],[625,538],[628,551],[636,562],[648,567],[659,571]],
  "boat-house": [[1097,351],[1129,340],[1137,330],[1136,313],[1132,295],[1117,265],[1090,256],[1067,267],[1065,284],[1080,313],[1091,336],[1097,349]],
  "fountain-central": [[700,740],[761,735],[760,789],[704,796]],
  "fountain-c15": [[213,508],[268,507],[277,555],[221,556]],
  "c1": [[594,708],[625,711],[624,757],[591,750]],
  "c2": [[548,695],[585,694],[585,752],[551,748]],
  "c3": [[503,690],[538,693],[538,744],[500,744]],
  "c4": [[459,685],[497,685],[494,739],[456,737]],
  "c5-c6": [[352,665],[400,669],[396,735],[348,731]],
  "c7-c8": [[287,635],[338,640],[334,700],[279,695]],
  "c9": [[222,597],[275,596],[272,653],[217,645]],
  "c10": [[151,579],[199,578],[197,645],[144,644]],
  "c11a-c11b": [[24,512],[72,513],[74,572],[26,571]],
  "c12": [[86,512],[134,508],[127,571],[84,572]],
  "c14": [[144,515],[189,514],[187,565],[136,563]],
  "c15-c16": [[129,464],[191,465],[201,512],[125,508]],
  "c17": [[146,401],[197,400],[195,461],[140,455]],
  "c18": [[210,403],[262,400],[262,463],[208,465]],
  "c19-c22": [[215,344],[285,353],[276,411],[206,393]],
  "c25-c26": [[586,152],[636,143],[636,197],[589,203]],
  "c27-c28": [[633,253],[690,241],[700,297],[648,307]],
  "c29-c34": [[893,151],[934,136],[884,42],[857,46],[782,35],[780,37],[780,73],[853,84],[893,149]],
  "e1-e8": [[1089,407],[1089,392],[1110,385],[1130,379],[1154,438],[1153,459],[1118,471],[1107,453],[1090,415],[1089,407]],
  "e9-e17": [[1147,465],[1211,449],[1235,520],[1169,530]],
  "e17-e25": [[1284,569],[1337,572],[1337,648],[1279,624]],
  "e26-e28": [[1275,828],[1333,828],[1333,886],[1275,886]],
  "treetop": [[397,215],[434,203],[455,262],[415,278]],
};

LOCATIONS.forEach((loc) => {
  if (POLYGON_OVERRIDES[loc.id]) loc.polygon = POLYGON_OVERRIDES[loc.id];
});

/* ============================================================
   ROAD NETWORK — for real point-to-point navigation.
   ROAD_NODES: waypoints along the actual paths/roads.
   ROAD_EDGES: which nodes connect directly to which (undirected).

   This is a FIRST-PASS skeleton, placed by eye against the map
   layout — not traced precisely. Use "Edit Roads" in the app to:
     - click empty space to drop a new node
     - click one node then another to connect/disconnect them
     - drag a node to reposition it
   then Export All and send the result back to refine this.
============================================================ */
const ROAD_NODES = [
  { id: "r6", x: 760, y: 480 },
  { id: "r7", x: 681, y: 1108 },
  { id: "r8", x: 733, y: 972 },
  { id: "r10", x: 789, y: 886 },
  { id: "r11", x: 835, y: 880 },
  { id: "r12", x: 904, y: 900 },
  { id: "r13", x: 929, y: 898 },
  { id: "r14", x: 952, y: 848 },
  { id: "r15", x: 977, y: 798 },
  { id: "r16", x: 1024, y: 728 },
  { id: "r17", x: 1022, y: 686 },
  { id: "r18", x: 997, y: 643 },
  { id: "r19", x: 999, y: 580 },
  { id: "r20", x: 999, y: 546 },
  { id: "r21", x: 1042, y: 539 },
  { id: "r22", x: 1078, y: 523 },
  { id: "r23", x: 1092, y: 494 },
  { id: "r24", x: 1088, y: 448 },
  { id: "r25", x: 1079, y: 399 },
  { id: "r26", x: 1084, y: 357 },
  { id: "r27", x: 1061, y: 281 },
  { id: "r28", x: 992, y: 260 },
  { id: "r29", x: 932, y: 224 },
  { id: "r30", x: 889, y: 163 },
  { id: "r31", x: 850, y: 126 },
  { id: "r32", x: 832, y: 104 },
  { id: "r33", x: 773, y: 94 },
  { id: "r34", x: 740, y: 91 },
  { id: "r35", x: 696, y: 121 },
  { id: "r36", x: 670, y: 167 },
  { id: "r37", x: 648, y: 213 },
  { id: "r38", x: 616, y: 243 },
  { id: "r39", x: 588, y: 247 },
  { id: "r40", x: 552, y: 244 },
  { id: "r41", x: 526, y: 251 },
  { id: "r42", x: 499, y: 285 },
  { id: "r43", x: 481, y: 308 },
  { id: "r44", x: 452, y: 318 },
  { id: "r45", x: 400, y: 322 },
  { id: "r46", x: 362, y: 324 },
  { id: "r47", x: 328, y: 353 },
  { id: "r48", x: 313, y: 388 },
  { id: "r49", x: 301, y: 433 },
  { id: "r50", x: 296, y: 482 },
  { id: "r51", x: 306, y: 537 },
  { id: "r52", x: 313, y: 568 },
  { id: "r53", x: 341, y: 604 },
  { id: "r54", x: 379, y: 621 },
  { id: "r55", x: 445, y: 632 },
  { id: "r56", x: 499, y: 644 },
  { id: "r57", x: 545, y: 637 },
  { id: "r58", x: 564, y: 624 },
  { id: "r59", x: 578, y: 582 },
  { id: "r60", x: 583, y: 540 },
  { id: "r61", x: 600, y: 489 },
  { id: "r62", x: 616, y: 446 },
  { id: "r64", x: 682, y: 401 },
  { id: "r65", x: 726, y: 386 },
  { id: "r66", x: 760, y: 372 },
  { id: "r67", x: 801, y: 358 },
  { id: "r68", x: 825, y: 374 },
  { id: "r69", x: 848, y: 414 },
  { id: "r70", x: 883, y: 454 },
  { id: "r71", x: 896, y: 485 },
  { id: "r72", x: 888, y: 564 },
  { id: "r73", x: 912, y: 599 },
  { id: "r74", x: 907, y: 630 },
  { id: "r75", x: 903, y: 667 },
  { id: "r76", x: 885, y: 707 },
  { id: "r77", x: 855, y: 725 },
  { id: "r78", x: 827, y: 725 },
  { id: "r79", x: 814, y: 739 },
  { id: "r80", x: 811, y: 789 },
  { id: "r81", x: 809, y: 821 },
  { id: "r82", x: 846, y: 860 },
  { id: "r83", x: 748, y: 919 },
  { id: "r84", x: 754, y: 904 },
  { id: "r85", x: 721, y: 881 },
  { id: "r86", x: 677, y: 867 },
  { id: "r87", x: 640, y: 840 },
  { id: "r88", x: 605, y: 869 },
  { id: "r89", x: 547, y: 850 },
  { id: "r90", x: 466, y: 817 },
  { id: "r91", x: 369, y: 769 },
  { id: "r92", x: 306, y: 734 },
  { id: "r93", x: 222, y: 699 },
  { id: "r94", x: 149, y: 658 },
  { id: "r95", x: 93, y: 637 },
  { id: "r96", x: 83, y: 608 },
  { id: "r97", x: 103, y: 587 },
  { id: "r98", x: 119, y: 583 },
  { id: "r99", x: 167, y: 576 },
  { id: "r100", x: 196, y: 583 },
  { id: "r101", x: 240, y: 580 },
  { id: "r102", x: 271, y: 576 },
  { id: "r104", x: 637, y: 381 },
  { id: "r105", x: 626, y: 345 },
  { id: "r106", x: 607, y: 308 },
  { id: "r107", x: 594, y: 254 },
  { id: "r108", x: 646, y: 414 },
  { id: "r109", x: 962, y: 485 },
  { id: "r110", x: 996, y: 512 },
  { id: "r111", x: 925, y: 630 },
  { id: "r112", x: 946, y: 598 },
  { id: "r113", x: 973, y: 574 },
  { id: "r114", x: 929, y: 906 },
  { id: "r115", x: 979, y: 939 },
  { id: "r116", x: 1008, y: 961 },
  { id: "r117", x: 1039, y: 1001 },
  { id: "r118", x: 1078, y: 974 },
  { id: "r119", x: 1122, y: 943 },
  { id: "r120", x: 1153, y: 932 },
  { id: "r121", x: 1201, y: 906 },
  { id: "r122", x: 1219, y: 856 },
  { id: "r123", x: 1223, y: 823 },
  { id: "r124", x: 1241, y: 820 },
  { id: "r125", x: 1241, y: 792 },
  { id: "r126", x: 1246, y: 759 },
  { id: "r127", x: 1260, y: 723 },
  { id: "r128", x: 1270, y: 692 },
  { id: "r129", x: 1285, y: 663 },
  { id: "r130", x: 1286, y: 634 },
  { id: "r131", x: 1275, y: 605 },
  { id: "r132", x: 1256, y: 579 },
  { id: "r133", x: 1230, y: 564 },
  { id: "r134", x: 1184, y: 540 },
  { id: "r135", x: 1158, y: 525 },
  { id: "r136", x: 1123, y: 505 },
  { id: "r137", x: 785, y: 703 },
  { id: "r138", x: 729, y: 684 },
  { id: "r139", x: 691, y: 702 },
  { id: "r141", x: 641, y: 760 },
  { id: "r142", x: 628, y: 805 },
  { id: "r144", x: 599, y: 681 },
  { id: "r145", x: 657, y: 736 },
];

const ROAD_EDGES = [
  ["r7", "r8"], ["r11", "r12"], ["r12", "r13"], ["r13", "r14"], ["r14", "r15"], ["r15", "r16"], ["r16", "r17"], ["r17", "r18"], ["r18", "r19"], ["r19", "r20"], ["r20", "r21"], ["r21", "r22"], ["r22", "r23"], ["r23", "r24"], ["r24", "r25"], ["r25", "r26"], ["r26", "r27"], ["r27", "r28"], ["r28", "r29"], ["r29", "r30"], ["r30", "r31"], ["r31", "r32"], ["r32", "r33"], ["r33", "r34"], ["r34", "r35"], ["r35", "r36"], ["r36", "r37"], ["r37", "r38"], ["r38", "r39"], ["r39", "r40"], ["r40", "r41"], ["r41", "r42"], ["r42", "r43"], ["r43", "r44"], ["r44", "r45"], ["r45", "r46"], ["r46", "r47"], ["r47", "r48"], ["r48", "r49"], ["r49", "r50"], ["r50", "r51"], ["r51", "r52"], ["r52", "r53"], ["r53", "r54"], ["r54", "r55"], ["r55", "r56"], ["r56", "r57"], ["r57", "r58"], ["r58", "r59"], ["r59", "r60"], ["r60", "r61"], ["r61", "r62"], ["r64", "r65"], ["r65", "r66"], ["r66", "r67"], ["r67", "r68"], ["r68", "r69"], ["r69", "r70"], ["r70", "r71"], ["r71", "r72"], ["r73", "r74"], ["r74", "r75"], ["r75", "r76"], ["r76", "r77"], ["r77", "r78"], ["r78", "r79"], ["r79", "r80"], ["r80", "r81"], ["r81", "r82"], ["r82", "r11"], ["r10", "r81"], ["r8", "r83"], ["r83", "r10"], ["r83", "r84"], ["r84", "r85"], ["r85", "r86"], ["r86", "r87"], ["r87", "r88"], ["r88", "r89"], ["r89", "r90"], ["r90", "r91"], ["r91", "r92"], ["r92", "r93"], ["r93", "r94"], ["r94", "r95"], ["r95", "r96"], ["r96", "r97"], ["r97", "r98"], ["r98", "r99"], ["r99", "r100"], ["r100", "r101"], ["r101", "r102"], ["r102", "r52"], ["r104", "r105"], ["r105", "r106"], ["r106", "r107"], ["r62", "r108"], ["r108", "r104"], ["r108", "r64"], ["r64", "r67"], ["r71", "r109"], ["r109", "r110"], ["r110", "r20"], ["r75", "r111"], ["r111", "r112"], ["r112", "r113"], ["r113", "r20"], ["r114", "r115"], ["r115", "r116"], ["r116", "r117"], ["r117", "r118"], ["r118", "r119"], ["r119", "r120"], ["r120", "r121"], ["r121", "r122"], ["r122", "r123"], ["r123", "r124"], ["r124", "r125"], ["r125", "r126"], ["r126", "r127"], ["r127", "r128"], ["r128", "r129"], ["r129", "r130"], ["r130", "r131"], ["r131", "r132"], ["r132", "r133"], ["r133", "r134"], ["r134", "r135"], ["r135", "r136"], ["r136", "r23"], ["r6", "r65"], ["r78", "r137"], ["r137", "r138"], ["r138", "r139"], ["r142", "r87"], ["r144", "r58"], ["r144", "r145"], ["r142", "r141"], ["r145", "r141"], ["r141", "r139"],
];

/* ============================================================
   ROOM ZONES — freeform AREAS, editable via "Edit Zones" mode.
   These are independent shapes (not derived from room polygons)
   covering a region of the map, purely for rooming/continent
   theming. `polygon` below is a rough starting placeholder —
   use Edit Zones in the app to drag it into the exact area you
   want, same way you refined the location shapes.

   `locationIds` is just a reference note of which cottage
   clusters currently carry this continent's tag — it does not
   drive the zone's shape.
============================================================ */
const ROOM_ZONES = [
  {
    id: "zone-asia",
    continent: "Asia",
    color: "#c1272d",
    labelPos: null, // [x, y] override — set by dragging the label in Edit Zones; null = auto-centered
    locationIds: ["c25-c26", "c27-c28", "c29-c34", "treetop"],
    polygon: [[819,316],[964,160],[877,20],[768,20],[665,65],[558,111],[509,174],[494,216],[590,240],[621,298],[650,396],[716,376],[809,352]],
  },
  {
    id: "zone-africa",
    continent: "Africa",
    color: "#d97a3f",
    labelPos: null, // [x, y] override — set by dragging the label in Edit Zones; null = auto-centered
    locationIds: ["c11a-c11b", "c12", "c14", "c15-c16", "c17", "c18", "c19-c22"],
    polygon: [[494,209],[545,276],[567,291],[609,323],[624,374],[614,413],[582,484],[565,535],[553,601],[536,615],[507,622],[367,594],[324,572],[304,557],[262,562],[187,566],[129,569],[92,576],[85,603],[80,625],[67,628],[0,530],[0,511],[116,398],[297,294],[453,228],[492,204]],
  },
  {
    id: "zone-americas",
    continent: "Americas",
    color: "#3a6392",
    labelPos: null, // [x, y] override — set by dragging the label in Edit Zones; null = auto-centered
    locationIds: ["c1", "c2", "c3", "c4", "c5-c6", "c7-c8", "c9", "c10"],
    polygon: [[83,625],[94,581],[307,584],[372,632],[426,640],[468,647],[506,649],[550,645],[562,654],[643,739],[629,772],[629,810],[635,832],[597,857],[579,852],[275,701],[82,623]],
  },
  {
    id: "zone-australia",
    continent: "Australia",
    color: "#2f9e5c",
    labelPos: [1115, 320], // moved up into the boat-house/pool area, clear of the Europe boundary below
    locationIds: ["e1-e8", "e9-e17", "e17-e25", "e26-e28", "boat-house"],
    polygon: [[1325,937],[1332,871],[1330,832],[1333,516],[1281,498],[1240,450],[1198,430],[1162,413],[1137,371],[1176,288],[1182,276],[1033,211],[984,176],[838,349],[865,415],[894,467],[958,474],[986,494],[1006,522],[1028,525],[1082,508],[1092,489],[1113,488],[1150,498],[1153,510],[1192,532],[1218,547],[1255,567],[1272,594],[1279,623],[1282,679],[1270,723],[1245,778],[1248,813],[1250,828],[1223,834],[1223,871],[1215,895],[1199,912],[1215,952],[1267,913]],
  },
  {
    id: "zone-europe",
    continent: "Europe",
    color: "#3f8fa6",
    labelPos: null, // [x, y] override — set by dragging the label in Edit Zones; null = auto-centered
    locationIds: ["new-building", "manwar"],
    needsRoomSplit: true, // New Building's 218 rooms still need a naming sub-split
    polygon: [[753,952],[794,973],[813,988],[826,1008],[862,1027],[935,1071],[1013,1105],[1033,1064],[1057,1022],[1070,988],[1062,1025],[1069,1035],[1148,966],[1209,952],[1192,912],[1215,883],[1220,856],[1220,834],[1243,825],[1242,776],[1269,711],[1277,666],[1277,620],[1264,576],[1226,554],[1179,523],[1148,506],[1126,491],[1082,486],[1082,522],[1048,516],[1025,538],[999,552],[969,579],[943,608],[923,640],[897,688],[879,715],[862,722],[835,730],[814,735],[796,728],[779,713],[767,708],[723,686],[696,703],[677,733],[648,778],[650,803],[658,828],[685,850],[714,866],[735,878],[750,891],[752,949]],
  },
  {
    id: "zone-south-america",
    continent: "South America",
    color: "#a8466b",
    labelPos: null, // [x, y] override — set by dragging the label in Edit Zones; null = auto-centered
    locationIds: ["dhaba", "sb1"],
    polygon: [[653,718],[692,689],[735,678],[791,694],[816,711],[855,713],[903,664],[913,623],[933,601],[989,557],[997,533],[981,506],[957,488],[913,483],[879,472],[858,437],[825,388],[799,357],[650,411],[626,440],[614,474],[599,511],[584,566],[572,615],[577,644],[611,678],[652,717]],
  },
];

/* ============================================================
   ENTRY POINT OVERRIDES — where a route actually connects to a
   location, instead of always using its polygon centroid (which
   can land at the back of a building, e.g. Palace de Shaan).

   Set via the "📍 Entry Points" tool in the app: pick a
   destination, then click its road-facing point on the map —
   click directly on a road dot to snap exactly onto that road,
   or click/drag anywhere else to place it freely. Export All to
   get this object's contents, then paste back here.
============================================================ */
const ENTRY_POINT_OVERRIDES = {
  // "palace-de-shaan": [1050, 700],
};

LOCATIONS.forEach((loc) => {
  loc.entryPoint = ENTRY_POINT_OVERRIDES[loc.id] || null;
});
