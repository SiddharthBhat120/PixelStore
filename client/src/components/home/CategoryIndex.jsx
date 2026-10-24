import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CategoryIcon } from "../common/ArtPoster";

const BLURBS = {
  Games: "Open worlds, soulslikes, co-op chaos",
  Controllers: "Pads with haptics, paddles and grip",
  Headsets: "Hear footsteps before they hear you",
  Keyboards: "Mechanical, optical, rapid trigger",
  Mice: "Featherweight and wireless",
  Monitors: "High refresh, OLED, IPS",
  GPUs: "Frames for days",
  Consoles: "PlayStation, Xbox, Steam Deck",
  Accessories: "Stream decks and desk upgrades",
  "Gift Cards": "Wallet codes, delivered digitally",
};

// A big typographic index of categories. Hovering a row floods it with acid
// and slides in the category's line drawing.
const CategoryIndex = ({ categories }) => {
  const [hover, setHover] = useState(null);

  return (
    <section className="py-20 border-y-2 border-line">
      <div className="shell px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <h2 className="display text-[clamp(3rem,8vw,6.5rem)]">Pick a lane</h2>
          <p className="text-smoke max-w-sm">Every shelf in the store. The number is how many items are on it right now.</p>
        </div>
        <ul onMouseLeave={() => setHover(null)}>
          {categories.map((c) => (
            <li key={c.name} className="relative border-t-2 border-line last:border-b-2" onMouseEnter={() => setHover(c.name)}>
              <Link to={`/products?category=${encodeURIComponent(c.name)}`} className="relative flex items-center gap-4 py-3 sm:py-4 overflow-hidden">
                <AnimatePresence>
                  {hover === c.name && (
                    <motion.span
                      className="absolute inset-0 bg-acid"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0 }}
                      style={{ originY: 1 }}
                      transition={{ duration: 0.22, ease: [0.7, 0, 0.3, 1] }}
                    />
                  )}
                </AnimatePresence>
                <span className={`relative display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] transition-[color,transform] duration-300 ${hover === c.name ? "text-ink translate-x-3" : "text-bone"}`}>
                  {c.name}
                </span>
                <span className={`relative hidden md:block text-[15px] transition-colors ${hover === c.name ? "text-ink" : "text-smoke"}`}>{BLURBS[c.name]}</span>
                <span className="relative ml-auto flex items-center gap-4">
                  <AnimatePresence>
                    {hover === c.name && (
                      <motion.span initial={{ x: 40, opacity: 0, rotate: 20 }} animate={{ x: 0, opacity: 1, rotate: 0 }} exit={{ x: 20, opacity: 0 }} className="hidden sm:block text-ink">
                        <CategoryIcon category={c.name} className="w-16 h-16" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className={`display text-3xl tabular-nums transition-colors ${hover === c.name ? "text-ink" : "text-smoke"}`}>{String(c.count).padStart(2, "0")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CategoryIndex;
