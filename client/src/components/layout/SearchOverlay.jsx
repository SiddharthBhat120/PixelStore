import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import API from "../../utils/api";
import Poster from "../common/Poster";
import { rupees } from "../../utils/format";

const SUGGESTIONS = ["Soulslike", "Co-op", "Open World", "Survival Horror", "Fighting", "Roguelike", "Wireless"];

const SearchOverlay = ({ open, onClose }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      API.get("/products", { params: { search: term, limit: 6, sort: "popular" }, signal: ctrl.signal })
        .then(({ data }) => {
          setResults(data.data);
          setActive(0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const go = (path) => {
    onClose();
    setQ("");
    navigate(path);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(`/products/${results[active]._id}`);
      else if (q.trim()) go(`/products?search=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-ink/95 backdrop-blur-sm overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Search the store"
        >
          <motion.div
            className="max-w-3xl mx-auto px-4 pt-20 pb-16"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-smoke text-sm">Search games, gear and brands</p>
              <button onClick={onClose} className="text-smoke hover:text-bone text-sm font-semibold">Close (Esc)</button>
            </div>
            <div className="relative">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Elden Ring, headset, Capcom…"
                className="w-full bg-transparent border-b-4 border-bone focus:border-acid outline-none display text-[clamp(2.2rem,7vw,4.5rem)] py-2 text-bone placeholder:text-line transition-colors"
                aria-label="Search"
              />
              {loading && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-acid animate-blink" />}
            </div>

            {!q.trim() && (
              <div className="mt-8">
                <p className="text-smoke text-sm mb-3">Try a genre</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => go(`/products?tag=${encodeURIComponent(s)}`)} className="chip">{s}</button>
                  ))}
                </div>
              </div>
            )}

            <ul className="mt-6 divide-y divide-line">
              {results.map((p, i) => (
                <motion.li key={p._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link
                    to={`/products/${p._id}`}
                    onClick={() => { onClose(); setQ(""); }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-4 py-3 px-2 transition-colors ${i === active ? "bg-bone text-ink" : "text-bone"}`}
                  >
                    <span className="w-12 h-16 shrink-0 border border-ink overflow-hidden"><Poster product={p} /></span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold truncate">{p.name}</span>
                      <span className={`block text-[13px] ${i === active ? "text-ink/70" : "text-smoke"}`}>{p.category} · {p.brand}</span>
                    </span>
                    <span className="display text-xl">{rupees(p.price)}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            {q.trim() && !loading && results.length === 0 && (
              <p className="mt-8 text-smoke">Nothing matches “{q.trim()}”. Try a shorter word or a brand name.</p>
            )}
            {results.length > 0 && (
              <button onClick={() => go(`/products?search=${encodeURIComponent(q.trim())}`)} className="btn-line mt-6">
                See all results for “{q.trim()}”
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
