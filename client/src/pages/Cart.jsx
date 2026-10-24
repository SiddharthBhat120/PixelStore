import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Poster from "../components/common/Poster";
import { QtyStepper, ShippingMeter } from "../components/layout/CartDrawer";
import { rupees, shippingFor } from "../utils/format";

export const Summary = ({ subtotal, children }) => {
  const shipping = shippingFor(subtotal);
  return (
    <div className="bg-bone text-ink border-2 border-ink shadow-sticker-acid p-6 space-y-3">
      <h2 className="display text-4xl">Summary</h2>
      <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">{rupees(subtotal)}</span></div>
      <div className="flex justify-between"><span>Shipping</span><span className="font-bold">{shipping ? rupees(shipping) : "Free"}</span></div>
      <div className="border-t-2 border-ink pt-3 flex justify-between items-end">
        <span className="font-bold">Total</span>
        <motion.span key={subtotal} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="display text-5xl">{rupees(subtotal + shipping)}</motion.span>
      </div>
      {children}
    </div>
  );
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0)
    return (
      <div className="page flex flex-col items-center justify-center text-center">
        <p className="display text-[clamp(5rem,18vw,12rem)] text-line leading-none">Empty</p>
        <p className="text-smoke mt-4 mb-8 max-w-sm">Your cart has nothing in it. Find a game worth a hundred hours.</p>
        <Link to="/products" className="btn-acid text-base">Browse the store</Link>
      </div>
    );

  return (
    <div className="page">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <h1 className="display text-[clamp(3.5rem,10vw,8rem)]">Cart <span className="text-acid">{cartCount}</span></h1>
          <button onClick={clearCart} className="btn-danger">Empty cart</button>
        </div>
        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div>
            <div className="mb-6"><ShippingMeter subtotal={cartTotal} /></div>
            <ul className="border-t-2 border-line">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.li key={item._id} layout exit={{ opacity: 0, x: -80, height: 0 }} transition={{ duration: 0.3 }} className="flex gap-5 py-5 border-b-2 border-line overflow-hidden">
                    <Link to={`/products/${item._id}`} className="w-24 sm:w-28 shrink-0 aspect-[2/3] border-2 border-ink overflow-hidden -rotate-1 hover:rotate-0 transition-transform">
                      <Poster product={item} />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between gap-3">
                        <div>
                          <Link to={`/products/${item._id}`} className="font-semibold text-lg leading-snug hover:text-acid">{item.name}</Link>
                          <p className="text-smoke text-sm mt-1">{item.category} · {item.brand}</p>
                          <p className="text-smoke text-sm">{rupees(item.price)} each</p>
                        </div>
                        <button onClick={() => removeFromCart(item._id)} className="text-smoke hover:text-signal h-8 shrink-0 text-sm font-semibold">Remove</button>
                      </div>
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <QtyStepper value={item.quantity} max={item.stock} onChange={(q) => updateQuantity(item._id, q)} />
                        <span className="display text-3xl">{rupees(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <Link to="/products" className="inline-block mt-6 link-u">Keep shopping</Link>
          </div>
          <div className="lg:sticky lg:top-24 h-fit">
            <Summary subtotal={cartTotal}>
              <button onClick={() => navigate(user ? "/checkout" : "/login", user ? undefined : { state: { from: { pathname: "/checkout" } } })} className="btn w-full bg-ink text-bone border-ink text-base py-4 hover:bg-acid hover:text-ink mt-2">
                {user ? "Go to checkout" : "Log in to check out"}
              </button>
            </Summary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
