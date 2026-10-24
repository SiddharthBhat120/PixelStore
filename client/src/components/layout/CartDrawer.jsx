import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Poster from "../common/Poster";
import { rupees, FREE_SHIPPING_MIN } from "../../utils/format";

export const QtyStepper = ({ value, onChange, max, small = false }) => (
  <div className={`inline-flex items-center border-2 border-line ${small ? "h-8" : "h-11"}`}>
    <button type="button" onClick={() => onChange(value - 1)} className={`${small ? "w-8" : "w-11"} h-full text-lg hover:bg-bone hover:text-ink transition-colors`} aria-label="Decrease quantity">−</button>
    <span className={`${small ? "w-8 text-sm" : "w-12"} text-center font-bold tabular-nums`} aria-live="polite">{value}</span>
    <button type="button" onClick={() => onChange(value + 1)} disabled={max !== undefined && value >= max} className={`${small ? "w-8" : "w-11"} h-full text-lg hover:bg-bone hover:text-ink transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-bone`} aria-label="Increase quantity">+</button>
  </div>
);

export const ShippingMeter = ({ subtotal }) => {
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100);
  const left = FREE_SHIPPING_MIN - subtotal;
  return (
    <div>
      <p className="text-[13px] mb-2">
        {left > 0 ? <>Add <b className="text-acid">{rupees(left)}</b> more for free shipping</> : <span className="text-mint font-semibold">Free shipping unlocked</span>}
      </p>
      <div className="h-2 bg-line overflow-hidden">
        <motion.div className="h-full bg-acid" initial={false} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>
    </div>
  );
};

const CartDrawer = () => {
  const { cart, drawerOpen, setDrawerOpen, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const close = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  const checkout = () => {
    close();
    navigate(user ? "/checkout" : "/login", user ? undefined : { state: { from: { pathname: "/checkout" } } });
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div className="fixed inset-0 z-[65] bg-ink/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-[66] w-full max-w-md bg-slab border-l-2 border-bone flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h2 className="display text-4xl">Cart <span className="text-acid">{cartCount}</span></h2>
              <button onClick={close} className="w-10 h-10 grid place-items-center border-2 border-line hover:border-bone" aria-label="Close cart">✕</button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <p className="display text-6xl text-line">Empty</p>
                <p className="text-smoke mt-3 mb-6">Nothing here yet. Go pick a world to get lost in.</p>
                <Link to="/products" onClick={close} className="btn-acid">Browse the store</Link>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-line"><ShippingMeter subtotal={cartTotal} /></div>
                <ul className="flex-1 overflow-y-auto px-5 py-2">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.li
                        key={item._id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60, height: 0, paddingTop: 0, paddingBottom: 0 }}
                        className="flex gap-4 py-4 border-b border-line overflow-hidden"
                      >
                        <Link to={`/products/${item._id}`} onClick={close} className="w-16 h-24 shrink-0 border border-ink overflow-hidden">
                          <Poster product={item} />
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex justify-between gap-2">
                            <Link to={`/products/${item._id}`} onClick={close} className="font-semibold text-[14px] leading-snug line-clamp-2 hover:text-acid">{item.name}</Link>
                            <button onClick={() => removeFromCart(item._id)} className="text-smoke hover:text-signal text-sm shrink-0" aria-label={`Remove ${item.name}`}>✕</button>
                          </div>
                          <p className="text-[12px] text-smoke mt-0.5">{item.category}</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <QtyStepper small value={item.quantity} max={item.stock} onChange={(q) => updateQuantity(item._id, q)} />
                            <span className="display text-xl">{rupees(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="px-5 py-5 border-t-2 border-bone space-y-3 bg-ink">
                  <div className="flex items-end justify-between">
                    <span className="text-smoke">Subtotal</span>
                    <span className="display text-4xl">{rupees(cartTotal)}</span>
                  </div>
                  <button onClick={checkout} className="btn-acid w-full text-base py-4">{user ? "Go to checkout" : "Log in to check out"}</button>
                  <Link to="/cart" onClick={close} className="block text-center text-sm text-smoke hover:text-bone">View full cart</Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
