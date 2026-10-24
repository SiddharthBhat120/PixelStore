import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API, { errorMessage } from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import Poster from "../components/common/Poster";
import Stars from "../components/common/Stars";
import { Loader } from "../components/common/Loader";
import ProductCard, { HeartIcon } from "../components/common/ProductCard";
import { QtyStepper } from "../components/layout/CartDrawer";
import { rupees, discountOf, formatDate } from "../utils/format";
import { assetUrl } from "../utils/posters";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, setDrawerOpen } = useCart();
  const { user } = useAuth();
  const wishlist = useWishlist();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [review, setReview] = useState({ rating: 0, comment: "" });
  const [hoverStar, setHoverStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setQty(1);
    setImg(0);
    API.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.data);
        return API.get("/products", { params: { category: data.data.category, sort: "popular", limit: 7 } });
      })
      .then((r) => r && setRelated(r.data.data.filter((p) => p._id !== id).slice(0, 6)))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review.rating) return toast.error("Pick a star rating first.");
    setSubmitting(true);
    try {
      await API.post(`/products/${id}/review`, review);
      toast.success("Review posted.");
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.data);
      setReview({ rating: 0, comment: "" });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page"><Loader label="Loading" /></div>;
  if (!product)
    return (
      <div className="page text-center pt-40">
        <p className="display text-7xl text-line">Not found</p>
        <p className="text-smoke mt-3 mb-6">This product was removed or the link is wrong.</p>
        <Link to="/products" className="btn-acid">Back to the store</Link>
      </div>
    );

  const off = discountOf(product);
  const saved = wishlist.has(product._id);
  const uploads = (product.images || []).filter((u) => u.startsWith("/uploads/"));
  const alreadyReviewed = user && product.reviews?.some((r) => (r.user?._id || r.user) === user._id);

  return (
    <div className="relative">
      {/* Backdrop */}
      <div className="absolute inset-x-0 top-0 h-[80vh] overflow-hidden -z-0" aria-hidden="true">
        <motion.div initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 0.45 }} transition={{ duration: 1.4 }} className="absolute inset-0">
          <Poster product={product} wide />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/80 to-ink" />
      </div>

      <div className="page relative">
        <div className="shell">
          <nav className="text-[13px] text-smoke mb-8 flex gap-2 flex-wrap" aria-label="Breadcrumb">
            <Link to="/products" className="hover:text-bone">Store</Link><span>/</span>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-bone">{product.category}</Link><span>/</span>
            <span className="text-bone truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-10 lg:gap-16">
            <div>
              <motion.div initial={{ rotate: -6, y: 40, opacity: 0 }} animate={{ rotate: -1.5, y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }} className="relative tape max-w-[420px] mx-auto">
                <div className="aspect-[2/3] border-2 border-ink overflow-hidden shadow-[0_40px_60px_-20px_rgba(0,0,0,0.9)]">
                  {uploads.length > 0 && img > 0 ? (
                    <img src={assetUrl(uploads[img - 1])} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Poster product={product} hd eager />
                  )}
                </div>
                {off > 0 && <span className="absolute -left-3 top-6 display text-4xl bg-signal text-ink px-3 pt-1.5 pb-0.5 -rotate-12 shadow-sticker">-{off}%</span>}
              </motion.div>
              {uploads.length > 0 && (
                <div className="flex gap-2 mt-6 justify-center">
                  {[null, ...uploads].map((u, i) => (
                    <button key={i} onClick={() => setImg(i)} className={`w-14 h-20 border-2 overflow-hidden ${img === i ? "border-acid" : "border-line"}`} aria-label={`Image ${i + 1}`}>
                      {u ? <img src={assetUrl(u)} alt="" className="w-full h-full object-cover" /> : <Poster product={product} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="tag">{product.category}</span>
                {product.platform && <span className="tag bg-acid">{product.platform}</span>}
                {product.featured && <span className="tag bg-signal">Staff pick</span>}
              </div>
              <h1 className="display text-[clamp(2.8rem,6.5vw,6rem)]">{product.name}</h1>
              <p className="text-smoke mt-3">by <span className="text-bone font-semibold">{product.brand}</span></p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 text-[14px]">
                <Stars rating={product.rating} size={18} showValue />
                <span className="text-smoke">{product.numReviews} reviews</span>
                <span className="text-smoke">{product.sold.toLocaleString("en-IN")} sold</span>
              </div>

              <div className="flex items-end gap-4 mt-8">
                <span className="display text-7xl text-acid leading-none">{rupees(product.price)}</span>
                {off > 0 && <span className="text-smoke line-through text-xl mb-1">{rupees(product.originalPrice)}</span>}
              </div>
              {off > 0 && <p className="text-signal font-semibold mt-2">You save {rupees(product.originalPrice - product.price)}</p>}

              <p className="text-bone/80 text-[17px] leading-relaxed mt-6 max-w-[62ch]">{product.description}</p>

              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {product.tags.map((t) => (
                    <Link key={t} to={`/products?tag=${encodeURIComponent(t)}`} className="chip">{t}</Link>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-8 border-t-2 border-line">
                <p className={`flex items-center gap-2 font-semibold mb-5 ${product.stock > 5 ? "text-mint" : product.stock > 0 ? "text-amber" : "text-signal"}`}>
                  <span className={`w-2.5 h-2.5 ${product.stock > 5 ? "bg-mint" : product.stock > 0 ? "bg-amber" : "bg-signal"} ${product.stock > 0 ? "animate-pulse" : ""}`} />
                  {product.stock > 5 ? "In stock, ships in 24 hours" : product.stock > 0 ? `Only ${product.stock} left` : "Sold out"}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {product.stock > 0 && <QtyStepper value={qty} max={product.stock} onChange={(q) => setQty(Math.max(1, Math.min(product.stock, q)))} />}
                  <button
                    onClick={() => addToCart(product, qty) && setDrawerOpen(true)}
                    disabled={product.stock === 0}
                    className="btn-acid text-base px-8 h-12 flex-1 sm:flex-none"
                  >
                    Add to cart · {rupees(product.price * qty)}
                  </button>
                  <button
                    onClick={() => wishlist.toggle(product)}
                    className={`h-12 w-12 grid place-items-center border-2 ${saved ? "bg-signal border-signal text-ink" : "border-line hover:border-bone"}`}
                    aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                    aria-pressed={saved}
                  >
                    <HeartIcon filled={saved} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews */}
          <section className="mt-24 grid lg:grid-cols-[1fr_1.4fr] gap-12">
            <div>
              <h2 className="display text-6xl">Reviews</h2>
              <div className="flex items-center gap-4 mt-4">
                <span className="display text-7xl text-acid">{(product.rating || 0).toFixed(1)}</span>
                <div><Stars rating={product.rating} size={20} /><p className="text-smoke text-sm mt-1">{product.numReviews} ratings</p></div>
              </div>
              {user && !alreadyReviewed && (
                <form onSubmit={submitReview} className="panel p-5 mt-8">
                  <h3 className="font-bold mb-3">Rate this</h3>
                  <div className="flex gap-1 mb-4" onMouseLeave={() => setHoverStar(0)}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button type="button" key={s} onMouseEnter={() => setHoverStar(s)} onClick={() => setReview((r) => ({ ...r, rating: s }))} className="p-0.5 transition-transform hover:scale-125" aria-label={`${s} stars`}>
                        <svg viewBox="0 0 20 20" className="w-8 h-8"><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7z" fill={s <= (hoverStar || review.rating) ? "#d4ff2a" : "#2e2c28"} /></svg>
                      </button>
                    ))}
                  </div>
                  <textarea value={review.comment} onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))} className="field resize-none" rows={3} placeholder="What did you think?" required />
                  <button type="submit" disabled={submitting} className="btn-acid mt-4">{submitting ? "Posting…" : "Post review"}</button>
                </form>
              )}
              {!user && <p className="text-smoke mt-6"><Link to="/login" className="link-u text-bone">Log in</Link> to write a review.</p>}
            </div>
            <div>
              {product.reviews?.length ? (
                <ul className="space-y-4">
                  <AnimatePresence>
                    {product.reviews.slice().reverse().map((r, i) => (
                      <motion.li key={r._id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="panel p-5">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 grid place-items-center bg-bone text-ink display text-lg">{r.name?.[0]?.toUpperCase()}</span>
                            <span className="font-semibold">{r.name}</span>
                          </div>
                          <span className="text-smoke text-[13px]">{formatDate(r.createdAt)}</span>
                        </div>
                        <Stars rating={r.rating} size={14} />
                        <p className="text-bone/85 mt-2 leading-relaxed">{r.comment}</p>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <div className="panel p-10 text-center">
                  <p className="display text-4xl text-line">No written reviews yet</p>
                  <p className="text-smoke mt-2">Bought it? Tell everyone what it's like.</p>
                </div>
              )}
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-24">
              <h2 className="display text-6xl mb-10">More like this</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-5 gap-y-10">
                {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
