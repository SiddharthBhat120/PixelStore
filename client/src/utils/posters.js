// Steam hosts official library art for every game. We try the sharpest
// portrait first and step down; components fall back to generated art last.
const STEAM = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps";
const STEAM_OLD = "https://cdn.cloudflare.steamstatic.com/steam/apps";

export const steamPortrait = (id, hd = false) => [
  ...(hd ? [`${STEAM}/${id}/library_600x900_2x.jpg`] : []),
  `${STEAM}/${id}/library_600x900.jpg`,
  `${STEAM}/${id}/library_600x900_2x.jpg`,
  `${STEAM_OLD}/${id}/library_600x900.jpg`,
  `${STEAM}/${id}/header.jpg`,
];

export const steamWide = (id) => [
  `${STEAM}/${id}/library_hero.jpg`,
  `${STEAM_OLD}/${id}/library_hero.jpg`,
  `${STEAM}/${id}/header.jpg`,
];

const unique = (arr) => [...new Set(arr.filter(Boolean))];

// Uploaded images are served by the API. When the API lives on another domain
// (VITE_API_URL=https://api.example.com/api) prefix its origin.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
export const assetUrl = (src = "") => (src.startsWith("/uploads/") ? `${API_ORIGIN}${src}` : src);

// Own uploads win; then Steam art (light version first unless hd); then any other stored URL.
export const posterSources = (product, hd = false) => {
  const images = (product?.images || []).map(assetUrl);
  const isSteam = (u) => u.includes("steamstatic.com");
  return unique([
    ...images.filter((u) => !isSteam(u)),
    ...(product?.steamAppId ? steamPortrait(product.steamAppId, hd) : []),
    ...images.filter(isSteam),
  ]);
};

export const bannerSources = (product) =>
  unique([...(product?.steamAppId ? steamWide(product.steamAppId) : []), ...(product?.images || []).map(assetUrl)]);

// The hero wall works even before the database has been seeded.
export const WALL_GAMES = [
  1245620, 1091500, 2358720, 1086940, 1174180, 292030, 1593500, 2215430, 1817070, 990080,
  814380, 2050650, 1145360, 367520, 2246340, 1627720, 1888160, 2001120, 1426210, 268910,
  1687950, 2515020, 553850, 1332010, 1771300, 2124490, 2183900, 1774580, 1364780, 1778820,
  1971870, 2420110, 1888930, 1659420, 782330, 1551360, 413150, 504230, 1196590, 870780,
  1222140, 892970, 264710, 1462040, 2054970, 1693980, 2677660, 374320, 271590,
];
