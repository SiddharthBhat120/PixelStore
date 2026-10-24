import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API, { errorMessage } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PosterWall from "../components/home/PosterWall";
import TopTen from "../components/home/TopTen";
import CategoryIndex from "../components/home/CategoryIndex";
import DealOfDay from "../components/home/DealOfDay";
import ProductCard, { ProductCardSkeleton } from "../components/common/ProductCard";
import Marquee from "../components/common/Marquee";
import { discountOf } from "../utils/format";

const GENRES = ["Soulslike", "Open World", "Co-op", "Survival Horror", "Roguelike", "Fighting", "JRPG", "Racing", "Story Rich", "Indie", "Sci-Fi", "Metroidvania"];
const ORDER = ["Games", "Consoles", "GPUs", "Monitors", "Headsets", "Keyboards", "Mice", "Controllers", "Accessories", "Gift Cards"];

const HeadlineLine = ({ children, delay }) => (
  <span className="block overflow-hidden">
    <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.span>
  </span>
);

const Home = () => {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [top, setTop] = useState([]);
  const [cats, setCats] = useState([]);
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      API.get("/products", { params: { featured: true, limit: 12 } }),
      API.get("/products", { params: { category: "Games", sort: "popular", limit: 10 } }),
      API.get("/products/categories"),
    ])
      .then(([f, t, c]) => {
        setFeatured(f.data.data);
        setTop(t.data.data);
        setCats(c.data.data.sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name)));
        // Deal: the featured game with the biggest discount, rotating by day
        const deals = f.data.data.filter((p) => p.category === "Games" && discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a));
        setDeal(deals.length ? deals[new Date().getDate() % deals.length] : f.data.data[0] || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const seed = async () => {
    setSeeding(true);
    try {
      const { data } = await API.post("/products/seed");
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSeeding(false);
    }
  };

  const empty = !loading && featured.length === 0;

  return (
    <div>
      {/* Hero: the poster wall */}
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden">
        <PosterWall />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />
        <div className="relative h-full shell px-4 sm:px-6 lg:px-10 flex flex-col justify-end pb-16 sm:pb-20">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="inline-flex self-start items-center gap-2 bg-acid text-ink font-bold text-[13px] px-3 py-1.5 -rotate-2 mb-6">
            <span className="w-2 h-2 bg-ink animate-blink" /> New drops every week
          </motion.p>
          <h1 className="display text-[clamp(3.6rem,13vw,11.5rem)] leading-[0.84]">
            <HeadlineLine delay={0.25}>Your next</HeadlineLine>
            <HeadlineLine delay={0.37}><span className="text-outline-acid">100 hours</span></HeadlineLine>
            <HeadlineLine delay={0.49}>start here</HeadlineLine>
          </h1>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6">
            <p className="text-bone/80 text-[17px] max-w-md leading-relaxed">
              PC games, consoles and the gear to play them. Delivered across India, with free shipping over ₹999.
            </p>
            <div className="flex gap-3">
              <Link to="/products" className="btn-acid text-base px-7 py-4">Browse the store</Link>
              <Link to="/products?category=Games&sort=popular" className="btn-line text-base py-4 bg-ink/60">Top sellers</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ticker */}
      <div className="relative z-10 -mt-6 -rotate-[1.5deg] bg-acid text-ink border-y-2 border-ink py-3 -mx-4">
        <Marquee
          items={["Free shipping over ₹999", "Cash on delivery available", "New drops every week", "Up to 60% off classics", "Genuine keys and gear", "Track every order"]}
          itemClassName="display text-3xl"
        />
      </div>

      {empty ? (
        <section className="py-28 text-center px-4">
          <p className="display text-7xl text-line">The wall is bare</p>
          {user?.role === "admin" ? (
            <>
              <p className="text-smoke mt-4 mb-8">Load the sample catalogue: 49 games with posters plus 18 pieces of gear.</p>
              <button onClick={seed} disabled={seeding} className="btn-acid text-base">{seeding ? "Loading catalogue…" : "Load sample catalogue"}</button>
            </>
          ) : (
            <p className="text-smoke mt-4">No products yet. An admin can load the sample catalogue from the admin panel.</p>
          )}
        </section>
      ) : (
        <>
          {top.length > 0 && <TopTen products={top} />}
          {cats.length > 0 && <CategoryIndex categories={cats} />}
          <DealOfDay product={deal} />

          <section className="py-16">
            <div className="shell px-4 sm:px-6 lg:px-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                  <h2 className="display text-[clamp(3rem,8vw,6.5rem)]">Fresh on the wall</h2>
                  <p className="text-smoke mt-2">Handpicked games and gear we'd buy ourselves.</p>
                </div>
                <Link to="/products" className="btn-line self-start md:self-auto">See all products</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-10">
                {loading
                  ? Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)
                  : featured.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="shell px-4 sm:px-6 lg:px-10">
              <h2 className="display text-[clamp(2.4rem,6vw,4.5rem)] mb-8">Find your genre</h2>
              <div className="flex flex-wrap gap-3">
                {GENRES.map((g, i) => (
                  <motion.span key={g} initial={{ opacity: 0, scale: 0.6, rotate: 0 }} whileInView={{ opacity: 1, scale: 1, rotate: (i % 2 ? 1 : -1) * (2 + (i % 3)) }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: i * 0.03 }}>
                    <Link
                      to={`/products?tag=${encodeURIComponent(g)}`}
                      className={`inline-block display text-2xl sm:text-3xl px-4 pt-2 pb-1.5 border-2 border-ink shadow-sticker-bone hover:rotate-0 hover:-translate-y-1 transition-transform ${["bg-acid text-ink", "bg-bone text-ink", "bg-signal text-ink"][i % 3]}`}
                    >
                      {g}
                    </Link>
                  </motion.span>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
