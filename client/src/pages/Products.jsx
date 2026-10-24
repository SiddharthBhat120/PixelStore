import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import API from "../utils/api";
import ProductCard, { ProductCardSkeleton } from "../components/common/ProductCard";
import { CATEGORIES, PLATFORMS } from "../utils/format";

const SORTS = [
  ["newest", "Newest"],
  ["popular", "Best selling"],
  ["rating", "Top rated"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
];
const PAGE = 24;

const Products = () => {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";
  const platform = params.get("platform") || "";
  const tag = params.get("tag") || "";
  const search = params.get("search") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";

  const [text, setText] = useState(search);
  const [price, setPrice] = useState({ min: minPrice, max: maxPrice });
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  useEffect(() => setText(search), [search]);
  useEffect(() => {
    const t = setTimeout(() => text.trim() !== search && set("search", text.trim()), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const query = { category, sort, platform, tag, search, minPrice, maxPrice };
  const qKey = JSON.stringify(query);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    API.get("/products", { params: { ...Object.fromEntries(Object.entries(query).filter(([, v]) => v)), page: 1, limit: PAGE }, signal: ctrl.signal })
      .then(({ data }) => {
        setProducts(data.data);
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qKey]);

  const loadMore = async () => {
    setMore(true);
    try {
      const { data } = await API.get("/products", { params: { ...Object.fromEntries(Object.entries(query).filter(([, v]) => v)), page: page + 1, limit: PAGE } });
      setProducts((prev) => [...prev, ...data.data.filter((p) => !prev.some((x) => x._id === p._id))]);
      setPage(page + 1);
    } catch { /* keep current list */ } finally {
      setMore(false);
    }
  };

  const clearAll = () => {
    setText("");
    setPrice({ min: "", max: "" });
    setParams({}, { replace: true });
  };
  const applyPrice = (e) => {
    e?.preventDefault();
    const next = new URLSearchParams(params);
    ["min", "max"].forEach((k) => (price[k] ? next.set(`${k}Price`, price[k]) : next.delete(`${k}Price`)));
    setParams(next, { replace: true });
    setFiltersOpen(false);
  };

  const active = [category, platform, tag, search, minPrice || maxPrice].filter(Boolean).length;
  const title = tag || category || (search ? `“${search}”` : "The store");

  const Filters = (
    <div className="space-y-7">
      <div>
        <h3 className="font-bold mb-3">Platform</h3>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button key={p} onClick={() => set("platform", platform === p ? "" : p)} className={`chip ${platform === p ? "chip-on" : ""}`}>{p}</button>
          ))}
        </div>
      </div>
      <form onSubmit={applyPrice}>
        <h3 className="font-bold mb-3">Price (₹)</h3>
        <div className="flex gap-2">
          <input type="number" min="0" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} placeholder="Min" className="field py-2" aria-label="Minimum price" />
          <input type="number" min="0" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} placeholder="Max" className="field py-2" aria-label="Maximum price" />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[["Under ₹1,000", "", "999"], ["₹1k–3k", "1000", "3000"], ["₹10k+", "10000", ""]].map(([l, mi, ma]) => (
            <button type="button" key={l} onClick={() => setPrice({ min: mi, max: ma })} className="chip">{l}</button>
          ))}
        </div>
        <button type="submit" className="btn-bone w-full mt-4">Apply price</button>
      </form>
      {active > 0 && <button onClick={clearAll} className="btn-danger w-full">Clear all filters</button>}
    </div>
  );

  return (
    <div className="page">
      <div className="shell">
        <header className="mb-8">
          <motion.h1 key={title} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="display text-[clamp(3.5rem,11vw,9rem)] break-words">{title}</motion.h1>
          <p className="text-smoke mt-2">{loading ? "Searching the shelves…" : `${total} ${total === 1 ? "item" : "items"} on the wall`}</p>
        </header>

        {/* Category rail */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button onClick={() => set("category", "")} className={`chip ${!category ? "chip-on" : ""}`}>Everything</button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => set("category", category === c ? "" : c)} className={`chip ${category === c ? "chip-on" : ""}`}>{c}</button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-10">
          <div className="relative flex-1">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by name, brand or genre" className="field pl-11" aria-label="Search products" />
            <svg viewBox="0 0 24 24" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-smoke" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-4.6-4.6" /></svg>
          </div>
          <select value={sort} onChange={(e) => set("sort", e.target.value === "newest" ? "" : e.target.value)} className="field sm:w-60 cursor-pointer" aria-label="Sort by">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={() => setFiltersOpen(true)} className="lg:hidden btn-line">Filters{active ? ` (${active})` : ""}</button>
        </div>

        {tag && (
          <div className="mb-8 flex items-center gap-3">
            <span className="text-smoke text-sm">Genre</span>
            <button onClick={() => set("tag", "")} className="chip chip-on">{tag} ✕</button>
          </div>
        )}

        <div className="flex gap-10">
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 panel p-5">{Filters}</div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
                {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 panel">
                <p className="display text-6xl text-line">No match</p>
                <p className="text-smoke mt-3 mb-6">Nothing fits these filters. Loosen one, or start over.</p>
                <button onClick={clearAll} className="btn-acid">Clear filters</button>
              </div>
            ) : (
              <>
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
                  {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} priority={i < 4} />)}
                </motion.div>
                {page < pages && (
                  <div className="text-center mt-14">
                    <button onClick={loadMore} disabled={more} className="btn-bone text-base px-8">{more ? "Loading…" : `Show more (${total - products.length} left)`}</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div className="fixed inset-0 z-[55] bg-ink/70 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)} />
            <motion.div className="fixed inset-x-0 bottom-0 z-[56] bg-slab border-t-2 border-bone p-6 max-h-[85vh] overflow-y-auto lg:hidden" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="display text-4xl">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="w-10 h-10 border-2 border-line" aria-label="Close filters">✕</button>
              </div>
              {Filters}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
