import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Poster from "../common/Poster";
import { rupees } from "../../utils/format";

// Ranked row with huge outlined numbers behind each poster. Drag or use arrows.
const TopTen = ({ products }) => {
  const rowRef = useRef(null);
  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * rowRef.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="py-20">
      <div className="shell px-4 sm:px-6 lg:px-10 flex items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="display text-[clamp(3rem,8vw,6.5rem)]">Most played</h2>
          <p className="text-smoke mt-2 max-w-md">The ten games people are buying most right now, ranked by copies sold.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scroll(-1)} className="w-12 h-12 border-2 border-line hover:border-acid hover:text-acid text-xl" aria-label="Scroll left">←</button>
          <button onClick={() => scroll(1)} className="w-12 h-12 border-2 border-line hover:border-acid hover:text-acid text-xl" aria-label="Scroll right">→</button>
        </div>
      </div>

      <div ref={rowRef} className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-6 lg:px-10 pb-4">
        {products.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.06 }}
            className="snap-start shrink-0 flex items-end"
          >
            <span className={`display text-outline select-none leading-[0.72] ${i === 9 ? "text-[11rem] sm:text-[15rem] -mr-6" : "text-[11rem] sm:text-[15rem] -mr-10"}`} aria-hidden="true">
              {i + 1}
            </span>
            <Link to={`/products/${p._id}`} className="group relative z-10 w-40 sm:w-48 block" aria-label={`Number ${i + 1}: ${p.name}`}>
              <div className="aspect-[2/3] border-2 border-ink overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-[-2deg] shadow-[0_20px_30px_-12px_rgba(0,0,0,0.9)]">
                <Poster product={p} imgClassName="group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="mt-3 text-[14px] font-semibold line-clamp-1 group-hover:text-acid">{p.name}</p>
              <p className="text-[13px] text-smoke">{rupees(p.price)} · {p.sold.toLocaleString("en-IN")} sold</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TopTen;
