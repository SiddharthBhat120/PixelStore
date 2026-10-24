// Generated poster artwork for products without a picture (gear, or a game
// whose image failed to load). Colour and line-art icon depend on category.

const THEMES = {
  Games: { bg: "#d4ff2a", fg: "#0e0d0c" },
  Controllers: { bg: "#d4ff2a", fg: "#0e0d0c" },
  Headsets: { bg: "#ff4321", fg: "#0e0d0c" },
  Keyboards: { bg: "#f0ebe0", fg: "#0e0d0c" },
  Mice: { bg: "#1a1917", fg: "#d4ff2a" },
  Monitors: { bg: "#f0ebe0", fg: "#0e0d0c" },
  GPUs: { bg: "#ff4321", fg: "#0e0d0c" },
  Consoles: { bg: "#1a1917", fg: "#f0ebe0" },
  Accessories: { bg: "#d4ff2a", fg: "#0e0d0c" },
  "Gift Cards": { bg: "#f0ebe0", fg: "#0e0d0c" },
};

export const CategoryIcon = ({ category, className = "", stroke = "currentColor", strokeWidth = 4 }) => {
  const common = { fill: "none", stroke, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  let body;
  switch (category) {
    case "Mice":
      body = (
        <>
          <path {...common} d="M60 12c-20 0-32 14-32 36v30c0 18 14 30 32 30s32-12 32-30V48C92 26 80 12 60 12z" />
          <path {...common} d="M60 12v34M28 46h64" />
          <rect {...common} x="55" y="24" width="10" height="14" rx="5" />
        </>
      );
      break;
    case "Headsets":
      body = (
        <>
          <path {...common} d="M22 74V60a38 38 0 0 1 76 0v14" />
          <rect {...common} x="12" y="64" width="22" height="34" rx="7" />
          <rect {...common} x="86" y="64" width="22" height="34" rx="7" />
          <path {...common} d="M30 98c2 10 12 14 26 14" />
          <circle cx="58" cy="112" r="4" fill={stroke} />
        </>
      );
      break;
    case "Keyboards":
      body = (
        <>
          <rect {...common} x="8" y="34" width="104" height="54" rx="6" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3, 4, 5, 6].map((c) => (
              <rect key={`${r}-${c}`} x={17 + c * 13} y={43 + r * 11} width="8" height="6" rx="1.5" fill={stroke} />
            ))
          )}
          <rect x="34" y="76" width="52" height="6" rx="2" fill={stroke} />
        </>
      );
      break;
    case "Controllers":
      body = (
        <>
          <path {...common} d="M34 38h52c14 0 22 10 25 26l4 24c2 12-11 19-19 10L84 84H36L24 98c-8 9-21 2-19-10l4-24c3-16 11-26 25-26z" />
          <path {...common} d="M34 54v18M25 63h18" />
          <circle cx="84" cy="56" r="4" fill={stroke} />
          <circle cx="94" cy="66" r="4" fill={stroke} />
          <circle cx="74" cy="66" r="4" fill={stroke} />
          <circle cx="84" cy="76" r="4" fill={stroke} />
        </>
      );
      break;
    case "GPUs":
      body = (
        <>
          <rect {...common} x="8" y="32" width="104" height="50" rx="5" />
          <circle {...common} cx="38" cy="57" r="16" />
          <circle {...common} cx="82" cy="57" r="16" />
          <path {...common} d="M38 41v32M22 57h32M82 41v32M66 57h32" strokeWidth={strokeWidth * 0.6} />
          <path {...common} d="M20 82v10h40V82" />
        </>
      );
      break;
    case "Monitors":
      body = (
        <>
          <rect {...common} x="10" y="18" width="100" height="64" rx="4" />
          <path {...common} d="M52 82l-4 18h24l-4-18M36 102h48" />
          <path {...common} d="M24 66l18-20 14 12 20-24 20 20" strokeWidth={strokeWidth * 0.7} />
        </>
      );
      break;
    case "Consoles":
      body = (
        <>
          <path {...common} d="M44 10h32c4 0 6 2 6 6v88c0 4-2 6-6 6H44c-4 0-6-2-6-6V16c0-4 2-6 6-6z" />
          <path {...common} d="M50 26h20M60 88v8" />
          <path {...common} d="M30 22c-6 4-8 10-8 18v40c0 8 2 14 8 18M90 22c6 4 8 10 8 18v40c0 8-2 14-8 18" strokeWidth={strokeWidth * 0.7} />
        </>
      );
      break;
    case "Accessories":
      body = (
        <>
          <rect {...common} x="12" y="26" width="96" height="68" rx="8" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3, 4].map((c) => (
              <rect key={`${r}-${c}`} {...common} strokeWidth={strokeWidth * 0.6} x={22 + c * 16} y={36 + r * 16} width="11" height="11" rx="2" />
            ))
          )}
        </>
      );
      break;
    case "Gift Cards":
      body = (
        <>
          <rect {...common} x="10" y="28" width="100" height="64" rx="6" />
          <path {...common} d="M10 50h100M44 28v64" />
          <path {...common} d="M44 50c-12-4-16-16-8-18 6-2 8 8 8 18zm0 0c12-4 16-16 8-18-6-2-8 8-8 18z" />
        </>
      );
      break;
    default:
      body = (
        <>
          <rect {...common} x="22" y="14" width="76" height="92" rx="6" />
          <path {...common} d="M22 34h76M40 14v20M80 14v20" />
          <path {...common} d="M46 70v-16h10v16h14v10H56v16H46V80H32V70z" strokeWidth={strokeWidth * 0.7} />
        </>
      );
  }
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      {body}
    </svg>
  );
};

const ArtPoster = ({ product, wide = false, className = "" }) => {
  const category = product?.category || "Games";
  const theme = THEMES[category] || THEMES.Games;
  const isGame = category === "Games";
  const word = category === "Gift Cards" ? "Gift" : category;

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{ background: theme.bg, color: theme.fg, containerType: "inline-size" }}
      role="img"
      aria-label={product?.name || category}
    >
      <div className="absolute -right-10 -top-10 w-3/4 aspect-square rounded-full halftone opacity-30" />
      <div className={`absolute inset-x-0 ${wide ? "top-1/2 -translate-y-1/2 right-6 left-auto w-1/3" : "top-[14%]"} flex justify-center`}>
        <CategoryIcon category={category} className={wide ? "w-full max-w-[220px]" : "w-[58%]"} stroke={theme.fg} />
      </div>
      <div className="absolute left-3 top-3 right-3 flex justify-between text-[11px] font-bold opacity-80 narrow">
        <span className="truncate">{product?.brand}</span>
        {product?.platform && <span>{product.platform}</span>}
      </div>
      <div className="absolute left-3 right-3 bottom-3">
        {isGame ? (
          <p className="display leading-[0.92] line-clamp-4" style={{ fontSize: wide ? "6cqw" : "13cqw" }}>{product?.name}</p>
        ) : (
          <>
            <p className="text-[12px] font-semibold leading-tight mb-1 line-clamp-2 opacity-90">{product?.name}</p>
            <p className="display leading-[0.85] whitespace-nowrap" style={{ fontSize: wide ? "8cqw" : `${Math.min(30, 150 / Math.max(word.length, 5))}cqw` }}>{word}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ArtPoster;
