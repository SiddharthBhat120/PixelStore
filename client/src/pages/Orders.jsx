import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import Poster from "../components/common/Poster";
import { Loader } from "../components/common/Loader";
import { rupees, formatDate, ORDER_STEPS } from "../utils/format";

const STATUS_STYLE = {
  Processing: "bg-amber text-ink",
  Confirmed: "bg-bone text-ink",
  Shipped: "bg-acid text-ink",
  Delivered: "bg-mint text-ink",
  Cancelled: "bg-signal text-ink",
};

export const StatusStamp = ({ status, className = "" }) => (
  <span className={`inline-block display text-lg px-2.5 pt-1 pb-0.5 -rotate-3 ${STATUS_STYLE[status] || "bg-line"} ${className}`}>{status}</span>
);

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    API.get("/orders/my").then(({ data }) => setOrders(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="shell max-w-5xl">
        <h1 className="display text-[clamp(3.5rem,10vw,8rem)] mb-10">Orders</h1>
        {loading ? <Loader label="Fetching your orders" /> : orders.length === 0 ? (
          <div className="panel p-12 text-center">
            <p className="display text-6xl text-line">No orders yet</p>
            <p className="text-smoke mt-3 mb-6">When you buy something, you can track it here.</p>
            <Link to="/products" className="btn-acid">Start shopping</Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o, i) => (
              <motion.li key={o._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/orders/${o._id}`} className="group panel p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:border-bone transition-colors">
                  <div className="flex -space-x-6 shrink-0">
                    {o.orderItems.slice(0, 3).map((it, k) => (
                      <span key={k} className="w-14 h-20 border-2 border-ink overflow-hidden group-hover:rotate-0 transition-transform" style={{ transform: `rotate(${(k - 1) * 6}deg)` }}>
                        <Poster product={{ name: it.name, images: it.image ? [it.image] : [], steamAppId: it.product?.steamAppId, category: it.product?.category || "Games" }} />
                      </span>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="display text-3xl">#{o.orderId}</span>
                      <StatusStamp status={o.orderStatus} />
                    </div>
                    <p className="text-smoke text-sm mt-1">{formatDate(o.createdAt)} · {o.orderItems.reduce((a, it) => a + it.quantity, 0)} items · {o.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}</p>
                  </div>
                  <span className="display text-4xl">{rupees(o.totalPrice)}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const OrderDetails = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const placed = params.get("placed") === "1";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${id}`).then(({ data }) => setOrder(data.data)).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><Loader label="Loading order" /></div>;
  if (!order)
    return (
      <div className="page text-center pt-40">
        <p className="display text-6xl text-line">Order not found</p>
        <Link to="/orders" className="btn-acid mt-6">Back to orders</Link>
      </div>
    );

  const step = ORDER_STEPS.indexOf(order.orderStatus);
  const cancelled = order.orderStatus === "Cancelled";
  const a = order.shippingAddress;

  return (
    <div className="page">
      <div className="shell max-w-5xl">
        {placed && (
          <motion.div initial={{ scale: 2.4, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: -3, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="bg-acid text-ink border-2 border-ink shadow-sticker-bone p-6 mb-10">
            <p className="display text-5xl sm:text-6xl">Order placed</p>
            <p className="font-semibold mt-1">Thanks! We've got it. You can follow every step right here.</p>
          </motion.div>
        )}

        <Link to="/orders" className="text-smoke hover:text-bone text-sm">← All orders</Link>
        <div className="flex flex-wrap items-end justify-between gap-4 mt-3 mb-10">
          <div>
            <h1 className="display text-[clamp(3rem,8vw,6rem)]">#{order.orderId}</h1>
            <p className="text-smoke">{formatDate(order.createdAt, true)}</p>
          </div>
          <StatusStamp status={order.orderStatus} className="text-3xl" />
        </div>

        {!cancelled ? (
          <section className="panel p-6 sm:p-8 mb-6">
            <h2 className="font-bold mb-8">Tracking</h2>
            <div className="relative">
              <div className="absolute left-0 right-0 top-5 h-1 bg-line" />
              <motion.div className="absolute left-0 top-5 h-1 bg-acid" initial={{ width: 0 }} animate={{ width: `${(Math.max(step, 0) / (ORDER_STEPS.length - 1)) * 100}%` }} transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
              <ol className="relative grid grid-cols-4">
                {ORDER_STEPS.map((s, i) => (
                  <li key={s} className={`flex flex-col ${i === 0 ? "items-start" : i === 3 ? "items-end" : "items-center"}`}>
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.25, type: "spring" }}
                      className={`w-11 h-11 grid place-items-center border-2 display text-xl ${i <= step ? "bg-acid border-ink text-ink" : "bg-ink border-line text-smoke"} ${i === step ? "ring-4 ring-acid/30" : ""}`}>
                      {i < step ? "✓" : i + 1}
                    </motion.span>
                    <span className={`mt-3 text-[13px] sm:text-sm font-semibold ${i <= step ? "text-bone" : "text-smoke"}`}>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : (
          <section className="border-2 border-signal p-6 mb-6 text-signal font-semibold">This order was cancelled. Any online payment will be refunded to the original method.</section>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <section className="panel p-6">
            <h2 className="font-bold mb-3">Shipping to</h2>
            <p>{a.street}</p>
            <p className="text-smoke">{a.city}, {a.state} {a.pincode}</p>
            <p className="text-smoke">{a.phone}</p>
          </section>
          <section className="panel p-6 space-y-2">
            <h2 className="font-bold mb-3">Payment</h2>
            <div className="flex justify-between"><span className="text-smoke">Method</span><span>{order.paymentMethod === "COD" ? "Cash on delivery" : "Online"}</span></div>
            <div className="flex justify-between"><span className="text-smoke">Status</span><span className={order.paymentStatus === "Paid" ? "text-mint" : "text-amber"}>{order.paymentStatus}</span></div>
            <div className="flex justify-between"><span className="text-smoke">Shipping</span><span>{order.shippingPrice ? rupees(order.shippingPrice) : "Free"}</span></div>
            <div className="flex justify-between items-end border-t-2 border-line pt-3"><span className="font-bold">Total</span><span className="display text-4xl text-acid">{rupees(order.totalPrice)}</span></div>
          </section>
        </div>

        <section className="panel p-6">
          <h2 className="font-bold mb-4">Items</h2>
          <ul className="divide-y-2 divide-line">
            {order.orderItems.map((it, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                <span className="w-12 h-16 border border-ink overflow-hidden shrink-0">
                  <Poster product={{ name: it.name, images: it.image ? [it.image] : [], category: "Games" }} />
                </span>
                <div className="flex-1 min-w-0">
                  {it.product?._id ? <Link to={`/products/${it.product._id}`} className="font-semibold hover:text-acid">{it.name}</Link> : <span className="font-semibold">{it.name}</span>}
                  <p className="text-smoke text-sm">{it.quantity} × {rupees(it.price)}</p>
                </div>
                <span className="display text-2xl">{rupees(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
