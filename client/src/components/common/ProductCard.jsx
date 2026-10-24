import { memo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import Poster from "./Poster";
import Stars from "./Stars";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { rupees, discountOf, seeded } from "../../utils/format";

export const HeartIcon = ({ filled, className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.7 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.5 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const CartIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 4h2.5l2.2 11.2a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.2L21 8H6.2" />
    <circle cx="9.5" cy="20" r="1.3" fill="currentColor" />
    <circle cx="17.5" cy="20" r="1.3" fill="currentColor" />
  </svg>
);

const ProductCard = ({ product, index = 0, priority = false }) => {
  const { addToCart } = useCart();
  const wishlist = useWishlist();
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const tilt = seeded(product._id) * 2.2; // each poster is pasted slightly crooked
  const discount = discountOf(product);
  const soldOut = product.stock === 0;
  const saved = wishlist.has(product._id);

  // Cursor-follow 3D tilt
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [9, -9]), { stiffness: 220, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-11, 11]), { stiffness: 220, damping: 18 });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(my, [0, 1], ["0%", "100%"]);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.28), transparent 55%)`);

  const onMove = (e) => {
    if (reduce || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.article
      className="group relative"
      initial={reduce ? false : { opacity: 0, y: 24, rotate: tilt * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index % 8, 7) * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={reduce ? undefined : { rotate: 0, y: -6 }}
    >
      <div style={{ perspective: 900 }}>
        <motion.div
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          className="relative tape"
        >
          <Link
            to={`/products/${product._id}`}
            className="block relative aspect-[2/3] overflow-hidden border-2 border-ink shadow-[0_18px_30px_-12px_rgba(0,0,0,0.8)]"
            aria-label={product.name}
          >
            <Poster product={product} eager={priority} imgClassName="group-hover:scale-[1.04] transition-transform duration-700" />
            {!reduce && <motion.div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: glare }} />}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent pointer-events-none" />

            {discount > 0 && !soldOut && (
              <span className="absolute left-2 top-3 display text-[22px] px-2 pt-1 pb-0.5 bg-signal text-ink -rotate-6 shadow-sticker">
                -{discount}%
              </span>
            )}
            {soldOut && (
              <span className="absolute left-[-20%] right-[-20%] top-1/2 -translate-y-1/2 -rotate-12 bg-bone text-ink display text-2xl text-center py-1 tracking-wide">
                Sold out
              </span>
            )}
            {product.platform && (
              <span className="absolute left-2 bottom-2 text-[11px] font-bold bg-ink/80 text-bone px-1.5 py-0.5 narrow">{product.platform}</span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => wishlist.toggle(product)}
            disabled={wishlist.pending === product._id}
            className={`absolute right-2 top-2 z-10 grid place-items-center w-9 h-9 border-2 border-ink transition-all
              ${saved ? "bg-signal text-ink" : "bg-ink/70 text-bone hover:bg-bone hover:text-ink"}`}
            aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={saved}
          >
            <motion.span key={saved ? "on" : "off"} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
              <HeartIcon filled={saved} className="w-[18px] h-[18px]" />
            </motion.span>
          </button>
        </motion.div>
      </div>

      <div className="pt-4 px-0.5">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="font-semibold text-[15px] leading-snug text-bone line-clamp-2 min-h-[2.6em] group-hover:text-acid transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1.5 text-[12px] text-smoke">
          <span className="truncate">{product.brand}</span>
          {product.rating > 0 && <Stars rating={product.rating} size={11} />}
        </div>
        <div className="flex items-end justify-between gap-2 mt-2.5">
          <div className="leading-none">
            <span className="display text-[26px] text-bone">{rupees(product.price)}</span>
            {discount > 0 && <span className="block text-[12px] text-smoke line-through mt-1">{rupees(product.originalPrice)}</span>}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.85, rotate: -8 }}
            onClick={() => addToCart(product)}
            disabled={soldOut}
            className="grid place-items-center w-11 h-11 bg-acid text-ink border-2 border-ink shadow-sticker-bone hover:-translate-y-0.5 transition-transform disabled:opacity-30 disabled:shadow-none"
            aria-label={`Add ${product.name} to cart`}
          >
            <CartIcon className="w-5 h-5" />
          </motion.button>
        </div>
        {product.stock > 0 && product.stock <= 5 && <p className="text-[12px] font-semibold text-amber mt-2">Only {product.stock} left</p>}
      </div>
    </motion.article>
  );
};

export const ProductCardSkeleton = () => (
  <div>
    <div className="aspect-[2/3] skeleton" />
    <div className="h-4 mt-4 w-4/5 skeleton" />
    <div className="h-3 mt-2 w-1/2 skeleton" />
    <div className="h-7 mt-3 w-1/3 skeleton" />
  </div>
);

export default memo(ProductCard);
