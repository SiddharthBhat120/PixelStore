import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Poster from "../common/Poster";
import { useCart } from "../../context/CartContext";
import { rupees, discountOf } from "../../utils/format";

const untilMidnight = () => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end - now) / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
};

const DealOfDay = ({ product }) => {
  const { addToCart } = useCart();
  const [t, setT] = useState(untilMidnight);
  useEffect(() => {
    const id = setInterval(() => setT(untilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!product) return null;
  const off = discountOf(product);

  return (
    <section className="py-20">
      <div className="shell px-4 sm:px-6 lg:px-10">
        <div className="relative border-2 border-bone overflow-hidden min-h-[440px] flex">
          <div className="absolute inset-0"><Poster product={product} wide /></div>
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
          <div className="relative p-6 sm:p-12 flex flex-col justify-center max-w-2xl">
            <p className="text-acid font-bold mb-3">Today's deal — price resets at midnight</p>
            <h2 className="display text-[clamp(2.8rem,7vw,6rem)]">{product.name}</h2>
            <div className="flex items-end gap-4 mt-5">
              <span className="display text-6xl text-acid">{rupees(product.price)}</span>
              {off > 0 && <span className="text-smoke line-through text-lg mb-2">{rupees(product.originalPrice)}</span>}
              {off > 0 && <span className="display text-2xl bg-signal text-ink px-2 pt-1 -rotate-6 mb-2">-{off}%</span>}
            </div>
            <div className="flex gap-2 mt-6" aria-label="Time left">
              {t.map((v, i) => (
                <div key={i} className="bg-bone text-ink w-20 py-2 text-center">
                  <motion.span key={v} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="display text-4xl block tabular-nums">
                    {String(v).padStart(2, "0")}
                  </motion.span>
                  <span className="text-[11px] font-bold">{["hours", "minutes", "seconds"][i]}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={() => addToCart(product)} disabled={product.stock === 0} className="btn-acid text-base px-7">Add to cart</button>
              <Link to={`/products/${product._id}`} className="btn-line text-base">See details</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealOfDay;
