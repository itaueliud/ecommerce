const palette = ["#f97316", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6", "#6366f1"];
const publicImageFolder = `${import.meta.env.BASE_URL}images/products/`;
const localProductImageFiles = [
  "A4 Copy Paper Ream.jfif",
  "AA Batteries 4 Pack.jpg",
  "Antiseptic Liquid 500ml.jfif",
  "baby products.jpg",
  "Biro Pens Box.jpg",
  "biscuits.webp",
  "black tea leaves.jpg",
  "Body Lotion 500ml.webp",
  "Body Wash 1L.jpg",
  "bread.jpg",
  "bulk deals.jfif",
  "canned tuna 170g.avif",
  "Charcoal 5kg Bag.jpg",
  "cleaning supplies.jfif",
  "coffee.jpg",
  "cooking essentials.jpg",
  "cooking oil 2l.avif",
  "corn flakes 500g.avif",
  "Deodorant Spray.jfif",
  "detergent.jpg",
  "diapers.jfif",
  "drinking water 1l.webp",
  "dry beans 1kg.webp",
  "Envelopes 100 Pack.jpg",
  "Exercise Books 10 Pack.webp",
  "Face Wash 150ml.webp",
  "flour.jpg",
  "ghee 500g.avif",
  "Hair Conditioner 400ml.webp",
  "Hand Cream 100ml.webp",
  "Hand Sanitizer 500ml.jfif",
  "honey 500g.jfif",
  "juice.webp",
  "magarine 500g.jfif",
  "milk.webp",
  "Milo 500g.webp",
  "Multivitamins 60 Tablets.jfif",
  "noodles.jfif",
  "oats 1kg.jpg",
  "Office Stapler.webp",
  "ORS Sachets.jfif",
  "Packing Tape 6 Roll Pack.jfif",
  "Pain Relief Gel.jfif",
  "paracetamol.jfif",
  "Paraffin Candles Pack.jfif",
  "peanut butter 400g.jfif",
  "pishori rice 5kg.jpg",
  "Safety Matches Bundle.jfif",
  "shampoo.jpg",
  "Shaving Cream 200ml.png",
  "soap.jpg",
  "strawberry jam.jfif",
  "Strawberry Yoghurt 500g.jfif",
  "Syrup 100ml.jfif",
  "table salt ikg.jfif",
  "tea.jfif",
  "toilet paper 12 rolls.jpg",
  "toothpaste.jfif",
  "Vicks VapoRub 50g.jfif",
  "white sugar 1kg.avif"
];
const productImageAliases = [
  ["rice", "cooking essentials.jpg"],
  ["cooking oil", "cooking essentials.jpg"],
  ["wheat flour", "flour.jpg"],
  ["maize flour", "flour.jpg"],
  ["flour", "flour.jpg"],
  ["salt", "cooking essentials.jpg"],
  ["sugar", "cooking essentials.jpg"],
  ["beans", "bulk deals.jfif"],
  ["pasta", "noodles.jfif"],
  ["margarine", "cooking essentials.jpg"],
  ["ghee", "cooking essentials.jpg"],
  ["tea", "tea.jfif"],
  ["coffee", "coffee.jpg"],
  ["milk", "milk.webp"],
  ["juice", "juice.webp"],
  ["water", "juice.webp"],
  ["bread", "bread.jpg"],
  ["biscuits", "biscuits.webp"],
  ["noodles", "noodles.jfif"],
  ["detergent", "detergent.jpg"],
  ["soap", "soap.jpg"],
  ["toothpaste", "toothpaste.jfif"],
  ["shampoo", "shampoo.jpg"],
  ["diapers", "diapers.jfif"],
  ["baby", "baby products.jpg"],
  ["paracetamol", "paracetamol.jfif"],
  ["plasters", "paracetamol.jfif"],
  ["thermometer", "paracetamol.jfif"],
  ["face masks", "paracetamol.jfif"],
  ["cooking essentials", "cooking essentials.jpg"],
  ["cleaning", "cleaning supplies.jfif"],
  ["bulk deals", "bulk deals.jfif"],
  ["baby products", "baby products.jpg"],
  ["packaged foods", "bulk deals.jfif"],
  ["household", "cleaning supplies.jfif"]
];

const fuzzyImageStopWords = new Set([
  "pack",
  "packs",
  "box",
  "bottle",
  "bottles",
  "jar",
  "can",
  "bag",
  "bags",
  "roll",
  "rolls",
  "piece",
  "pieces",
  "tin",
  "set",
  "sachet",
  "sachets",
  "loaf",
  "bar",
  "bars",
  "pad",
  "pads",
  "tube",
  "bibs",
  "ml",
  "kg",
  "g",
  "l"
]);

function normalizeLookupText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/magarine/g, "margarine")
    .replace(/ikg/g, "1kg")
    .replace(/vapo\s*rub/g, "vaporub")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenizeLookupText(value = "") {
  return normalizeLookupText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function assetUrl(fileName) {
  return encodeURI(`${publicImageFolder}${fileName}`);
}

function findLocalProductImage(product = {}) {
  const productTokens = new Set(
    [
      ...tokenizeLookupText(product.name),
      ...tokenizeLookupText(product.category),
      ...tokenizeLookupText(product.brand)
    ].filter(Boolean)
  );
  const productStem = normalizeLookupText(product.name);

  let bestMatch = "";
  let bestScore = 0;

  for (const fileName of localProductImageFiles) {
    const fileStem = normalizeLookupText(fileName.replace(/\.[^.]+$/, ""));
    const fileTokens = tokenizeLookupText(fileStem);
    let score = 0;

    for (const token of fileTokens) {
      if (productTokens.has(token)) {
        score += fuzzyImageStopWords.has(token) ? 0.25 : 2;
      }
    }

    if (productStem && fileStem === productStem) {
      score += 10;
    } else if (productStem && (fileStem.includes(productStem) || productStem.includes(fileStem))) {
      score += 4;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = fileName;
    }
  }

  return bestScore >= 2 ? bestMatch : "";
}

function hashText(value = "") {
  let hash = 0;
  const text = String(value).toLowerCase();

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLabel(label = "") {
  const words = String(label).split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [label];

  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 16 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export function buildProductThumbnail(product = {}) {
  const name = String(product.name || "Product");
  const category = String(product.category || "General goods");
  const brand = String(product.brand || "").trim();
  const seed = `${name}-${category}-${brand}`;
  const base = palette[hashText(seed) % palette.length];
  const accent = palette[(hashText(seed) + 3) % palette.length];
  const labelLines = wrapLabel(name);
  const shortCategory = category.length > 24 ? `${category.slice(0, 23)}...` : category;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 500" role="img" aria-label="${escapeXml(name)}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#111827" flood-opacity="0.25" />
        </filter>
      </defs>
      <rect width="700" height="500" rx="28" fill="url(#bg)" />
      <circle cx="600" cy="90" r="86" fill="rgba(255,255,255,0.12)" />
      <circle cx="100" cy="420" r="120" fill="rgba(255,255,255,0.08)" />
      <rect x="48" y="42" width="604" height="416" rx="24" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.2)" filter="url(#shadow)" />
      <rect x="70" y="70" width="170" height="40" rx="20" fill="rgba(17,24,39,0.16)" />
      <text x="154" y="97" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="#ffffff">${escapeXml(shortCategory)}</text>
      <g transform="translate(70,170)">
        ${labelLines
          .map(
            (line, index) =>
              `<text x="0" y="${index * 62}" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="800" fill="#ffffff" letter-spacing="-1">${escapeXml(line)}</text>`
          )
          .join("")}
      </g>
      ${brand ? `<text x="70" y="360" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="rgba(255,255,255,0.92)">${escapeXml(brand)}</text>` : ""}
      <text x="70" y="406" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,0.9)">Exact item thumbnail</text>
      <rect x="70" y="422" width="208" height="12" rx="6" fill="rgba(255,255,255,0.38)" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

export function getProductImage(product = {}) {
  const localImage = findLocalProductImage(product);
  if (localImage) {
    return assetUrl(localImage);
  }

  const normalizedName = String(product.name || "").toLowerCase();
  const normalizedCategory = String(product.category || "").toLowerCase();
  const alias = productImageAliases.find(([needle]) => normalizedName.includes(needle) || normalizedCategory.includes(needle));
  if (alias) {
    return assetUrl(alias[1]);
  }

  const rawImage = product.images?.[0] || product.image;
  if (rawImage) {
    if (rawImage.startsWith("/")) return encodeURI(rawImage);
    if (rawImage.startsWith("http")) return rawImage;
    return assetUrl(rawImage);
  }

  return buildProductThumbnail(product);
}

export function applyProductImageFallback(event, product = {}) {
  const fallback = buildProductThumbnail(product);
  if (event?.currentTarget && event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback;
  }
}

export function buildBannerGraphic({ title = "Danaba Mart", subtitle = "Wholesale shopping" } = {}) {
  const seed = `${title}-${subtitle}`;
  const base = palette[hashText(seed) % palette.length];
  const accent = palette[(hashText(seed) + 4) % palette.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" role="img" aria-label="${escapeXml(title)}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="900" height="500" rx="30" fill="url(#bg)" />
      <circle cx="760" cy="100" r="110" fill="rgba(255,255,255,0.12)" />
      <circle cx="130" cy="390" r="140" fill="rgba(255,255,255,0.08)" />
      <rect x="56" y="56" width="788" height="388" rx="26" fill="rgba(17,24,39,0.14)" stroke="rgba(255,255,255,0.16)" />
      <text x="88" y="170" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.9)">${escapeXml(subtitle)}</text>
      <text x="88" y="260" font-family="Arial, Helvetica, sans-serif" font-size="74" font-weight="800" fill="#ffffff">${escapeXml(title)}</text>
      <text x="88" y="320" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600" fill="rgba(255,255,255,0.92)">Reliable product imagery built in-app</text>
      <rect x="88" y="350" width="238" height="12" rx="6" fill="rgba(255,255,255,0.4)" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}
