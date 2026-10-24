import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API, { errorMessage } from "../utils/api";
import Poster from "../components/common/Poster";
import { Spinner } from "../components/common/Loader";
import { Summary } from "./Cart";
import { rupees } from "../utils/format";

const FIELDS = [
  ["street", "Street address", "Flat 12, MG Road", "sm:col-span-2"],
  ["city", "City", "Mangaluru"],
  ["state", "State", "Karnataka"],
  ["pincode", "PIN code", "575001"],
  ["phone", "Phone", "98765 43210"],
];

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [method, setMethod] = useState("COD");
  const [addr, setAddr] = useState(() => Object.fromEntries(FIELDS.map(([k]) => [k, user?.address?.[k] || ""])));

  if (cart.length === 0 && !placing) return <Navigate to="/cart" replace />;

  const valid = {
    pincode: /^\d{6}$/.test(addr.pincode.trim()),
    phone: /^[+\d][\d\s-]{9,14}$/.test(addr.phone.trim()),
  };

  const place = async (e) => {
    e.preventDefault();
    if (FIELDS.some(([k]) => !addr[k].trim())) return toast.error("Fill in every address field.");
    if (!valid.pincode) return toast.error("PIN code must be 6 digits.");
    if (!valid.phone) return toast.error("Enter a valid phone number.");
    setPlacing(true);
    try {
      const { data } = await API.post("/orders", {
        orderItems: cart.map((i) => ({ product: i._id, name: i.name, quantity: i.quantity })),
        shippingAddress: addr,
        paymentMethod: method,
      });
      clearCart();
      navigate(`/orders/${data.data._id}?placed=1`, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't place the order. Try again."));
      setPlacing(false);
    }
  };

  return (
    <div className="page">
      <div className="shell">
        <h1 className="display text-[clamp(3.5rem,10vw,8rem)] mb-10">Checkout</h1>
        <form onSubmit={place} className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="space-y-8">
            <section className="panel p-6 sm:p-8">
              <h2 className="display text-4xl mb-6">Where to?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {FIELDS.map(([k, label, ph, span]) => (
                  <label key={k} className={span || ""}>
                    <span className="field-label">{label}</span>
                    <input
                      value={addr[k]}
                      onChange={(e) => setAddr({ ...addr, [k]: e.target.value })}
                      className={`field ${addr[k] && valid[k] === false ? "border-signal" : ""}`}
                      placeholder={ph}
                      inputMode={k === "pincode" || k === "phone" ? "numeric" : undefined}
                      required
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="panel p-6 sm:p-8">
              <h2 className="display text-4xl mb-6">How do you pay?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ["COD", "Cash on delivery", "Pay the courier when it arrives."],
                  ["Online", "Pay online", "UPI, cards or net banking. Demo mode: marked paid instantly."],
                ].map(([v, title, desc]) => (
                  <button type="button" key={v} onClick={() => setMethod(v)} aria-pressed={method === v}
                    className={`relative text-left p-5 border-2 transition-all ${method === v ? "border-acid bg-acid/10 -translate-y-1 shadow-sticker-acid" : "border-line hover:border-bone"}`}>
                    <span className={`absolute right-4 top-4 w-5 h-5 border-2 ${method === v ? "border-acid bg-acid" : "border-line"}`} />
                    <p className="font-bold text-lg">{title}</p>
                    <p className="text-smoke text-sm mt-1 pr-6">{desc}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <ul className="panel p-4 space-y-3 max-h-72 overflow-y-auto">
              {cart.map((i) => (
                <li key={i._id} className="flex items-center gap-3">
                  <span className="w-10 h-14 shrink-0 border border-ink overflow-hidden"><Poster product={i} /></span>
                  <span className="flex-1 min-w-0 text-sm"><span className="block truncate font-semibold">{i.name}</span><span className="text-smoke">× {i.quantity}</span></span>
                  <span className="font-bold text-sm">{rupees(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <Summary subtotal={cartTotal}>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={placing} className="btn w-full bg-ink text-bone border-ink text-base py-4 hover:bg-acid hover:text-ink mt-2">
                {placing ? <><Spinner /> Placing order…</> : "Place order"}
              </motion.button>
            </Summary>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
