import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, animate } from "framer-motion";
import toast from "react-hot-toast";
import API, { errorMessage } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Poster from "../components/common/Poster";
import { Loader } from "../components/common/Loader";
import { StatusStamp } from "./Orders";
import { rupees, formatDate, CATEGORIES } from "../utils/format";

const STATUSES = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const CountUp = ({ value, format = (v) => Math.round(v).toLocaleString("en-IN") }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, Number(value) || 0, { duration: 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [value]);
  return <>{format(v)}</>;
};

// ── Dashboard ────────────────────────────────────────────────
const AdminHome = () => {
  const [p, setP] = useState(null);
  const [o, setO] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const load = () =>
    Promise.all([API.get("/products/stats"), API.get("/orders/admin/stats")])
      .then(([a, b]) => { setP(a.data.stats); setO(b.data.stats); })
      .catch((err) => toast.error(errorMessage(err)));
  useEffect(() => { load(); }, []);

  const seed = async () => {
    setSeeding(true);
    try {
      const { data } = await API.post("/products/seed");
      toast.success(data.message);
      load();
    } catch (err) { toast.error(errorMessage(err)); } finally { setSeeding(false); }
  };

  if (!p || !o) return <Loader label="Loading dashboard" />;
  const max = Math.max(1, ...o.daily.map((d) => d.revenue));
  const tiles = [
    ["Revenue", o.revenue, (v) => rupees(v), "bg-acid text-ink"],
    ["Orders", o.total, undefined, "bg-bone text-ink"],
    ["Products", p.total, undefined, "panel"],
    ["Low or out of stock", p.lowStock + p.outOfStock, undefined, p.outOfStock ? "bg-signal text-ink" : "panel"],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-7xl">Dashboard</h1>
        <button onClick={seed} disabled={seeding} className="btn-line">{seeding ? "Loading…" : "Load / refresh sample catalogue"}</button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {tiles.map(([label, val, fmt, cls], i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`p-5 border-2 border-ink ${cls}`}>
            <p className="text-[13px] font-bold opacity-80">{label}</p>
            <p className="display text-[clamp(2rem,4vw,3.5rem)] mt-2 leading-none"><CountUp value={val} format={fmt} /></p>
          </motion.div>
        ))}
      </div>

      <section className="panel p-6">
        <div className="flex justify-between items-baseline mb-6">
          <h2 className="font-bold">Revenue, last 7 days</h2>
          <span className="text-smoke text-sm">{rupees(o.daily.reduce((a, d) => a + d.revenue, 0))} total</span>
        </div>
        <div className="flex items-end gap-2 sm:gap-4 h-52" role="img" aria-label="Bar chart of revenue per day for the last 7 days">
          {o.daily.map((d, i) => (
            <div key={d.date} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group">
              <span className="text-[12px] font-semibold text-smoke group-hover:text-bone">{d.revenue ? rupees(d.revenue) : ""}</span>
              <motion.div className={`w-full ${i === 6 ? "bg-acid" : "bg-bone/80 group-hover:bg-bone"}`} initial={{ height: 0 }} animate={{ height: `${Math.max(2, (d.revenue / max) * 100)}%` }} transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }} title={`${d.orders} orders`} />
              <span className="text-[12px] text-smoke">{new Date(`${d.date}T00:00`).toLocaleDateString("en-IN", { weekday: "short" })}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid xl:grid-cols-2 gap-6">
        <section className="panel p-6">
          <h2 className="font-bold mb-4">Top sellers</h2>
          <ul className="space-y-3">
            {p.topSelling.map((t, i) => (
              <li key={t._id} className="flex items-center gap-3">
                <span className="display text-3xl w-8 text-smoke">{i + 1}</span>
                <span className="w-9 h-12 border border-ink overflow-hidden shrink-0"><Poster product={t} /></span>
                <span className="flex-1 min-w-0 truncate font-semibold">{t.name}</span>
                <span className="text-smoke text-sm">{t.sold} sold</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel p-6">
          <h2 className="font-bold mb-4">Recent orders</h2>
          {o.recent.length === 0 ? <p className="text-smoke">No orders yet.</p> : (
            <ul className="divide-y divide-line">
              {o.recent.map((r) => (
                <li key={r._id}>
                  <Link to={`/orders/${r._id}`} className="flex items-center justify-between py-3 hover:text-acid">
                    <span><span className="font-bold">#{r.orderId}</span><span className="text-smoke text-sm ml-2">{r.user?.name}</span></span>
                    <span className="flex items-center gap-3"><span className="font-bold">{rupees(r.totalPrice)}</span><StatusStamp status={r.orderStatus} className="text-sm" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

// ── Products ────────────────────────────────────────────────
const AdminProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    API.get("/products", { params: { limit: 100, sort: "newest" } }).then(({ data }) => setItems(data.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (prod) => {
    try {
      await API.delete(`/products/${prod._id}`);
      toast.success(`Deleted ${prod.name}`);
      setItems((list) => list.filter((x) => x._id !== prod._id));
    } catch (err) { toast.error(errorMessage(err)); } finally { setConfirm(null); }
  };

  const shown = items.filter((x) => `${x.name} ${x.brand} ${x.category}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-7xl">Products <span className="text-smoke">{items.length}</span></h1>
        <Link to="/admin/add-product" className="btn-acid">Add product</Link>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} className="field max-w-md" placeholder="Filter by name, brand or category" aria-label="Filter products" />
      {loading ? <Loader /> : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b-2 border-line text-[13px] text-smoke">
              <tr>{["Product", "Category", "Price", "Stock", "Sold", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {shown.map((x) => (
                <tr key={x._id} className="border-b border-line hover:bg-ink/50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-12 border border-ink overflow-hidden shrink-0"><Poster product={x} /></span>
                      <span className="min-w-0"><Link to={`/products/${x._id}`} className="block font-semibold truncate max-w-[280px] hover:text-acid">{x.name}</Link><span className="text-smoke text-[13px]">{x.brand}</span></span>
                    </div>
                  </td>
                  <td className="px-4 text-smoke">{x.category}</td>
                  <td className="px-4 font-semibold">{rupees(x.price)}</td>
                  <td className="px-4"><span className={`tag ${x.stock === 0 ? "bg-signal" : x.stock <= 5 ? "bg-amber" : "bg-mint"}`}>{x.stock === 0 ? "Out" : x.stock}</span></td>
                  <td className="px-4 text-smoke">{x.sold}</td>
                  <td className="px-4 text-right whitespace-nowrap">
                    <button onClick={() => navigate(`/admin/edit-product/${x._id}`)} className="px-3 py-1.5 text-sm font-semibold hover:text-acid">Edit</button>
                    <button onClick={() => setConfirm(x)} className="px-3 py-1.5 text-sm font-semibold text-signal hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="text-smoke p-6">No products match “{q}”.</p>}
        </div>
      )}

      <AnimatePresence>
        {confirm && (
          <motion.div className="fixed inset-0 z-[80] bg-ink/80 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(null)}>
            <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-bone text-ink border-2 border-ink shadow-sticker-acid p-6 max-w-sm w-full" role="alertdialog" aria-modal="true">
              <p className="display text-4xl">Delete product?</p>
              <p className="mt-2">“{confirm.name}” will be removed from the store. Past orders keep their record.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setConfirm(null)} className="btn border-ink flex-1">Keep it</button>
                <button onClick={() => remove(confirm)} className="btn bg-signal border-ink flex-1">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Orders ────────────────────────────────────────────────
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get("/orders/admin/all", { params: { status: filter || undefined, limit: 100 } })
      .then(({ data }) => setOrders(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  const update = async (id, status) => {
    try {
      const { data } = await API.put(`/orders/${id}/status`, { orderStatus: status });
      toast.success(data.message);
      setOrders((list) => (filter && status !== filter ? list.filter((x) => x._id !== id) : list.map((x) => (x._id === id ? { ...x, ...data.data, user: x.user } : x))));
    } catch (err) { toast.error(errorMessage(err)); }
  };

  return (
    <div className="space-y-6">
      <h1 className="display text-7xl">Orders</h1>
      <div className="flex flex-wrap gap-2">
        {["", ...STATUSES].map((s) => <button key={s || "all"} onClick={() => setFilter(s)} className={`chip ${filter === s ? "chip-on" : ""}`}>{s || "All"}</button>)}
      </div>
      {loading ? <Loader /> : orders.length === 0 ? <p className="text-smoke panel p-6">No orders here.</p> : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b-2 border-line text-[13px] text-smoke">
              <tr>{["Order", "Customer", "Date", "Total", "Payment", "Status"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {orders.map((x) => (
                <tr key={x._id} className="border-b border-line">
                  <td className="px-4 py-3"><Link to={`/orders/${x._id}`} className="font-bold hover:text-acid">#{x.orderId}</Link></td>
                  <td className="px-4"><p className="font-semibold">{x.user?.name || "Deleted user"}</p><p className="text-smoke text-[13px]">{x.user?.email}</p></td>
                  <td className="px-4 text-smoke text-sm">{formatDate(x.createdAt)}</td>
                  <td className="px-4 font-semibold">{rupees(x.totalPrice)}</td>
                  <td className="px-4 text-sm">{x.paymentMethod} <span className={x.paymentStatus === "Paid" ? "text-mint" : "text-amber"}>· {x.paymentStatus}</span></td>
                  <td className="px-4">
                    <select value={x.orderStatus} onChange={(e) => update(x._id, e.target.value)} className="field py-1.5 px-2 text-sm w-36" aria-label={`Status of order ${x.orderId}`}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Add / edit form ────────────────────────────────────────────
const EMPTY = { name: "", description: "", price: "", originalPrice: "", category: "Games", brand: "", stock: "", platform: "", tags: "", featured: false, steamAppId: "" };

export const ProductForm = ({ editId }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    API.get(`/products/${editId}`).then(({ data }) => {
      const x = data.data;
      setForm({ name: x.name, description: x.description, price: x.price, originalPrice: x.originalPrice || "", category: x.category, brand: x.brand, stock: x.stock, platform: x.platform || "", tags: x.tags?.join(", ") || "", featured: !!x.featured, steamAppId: x.steamAppId || "" });
    }).catch(() => toast.error("Couldn't load that product.")).finally(() => setFetching(false));
  }, [editId]);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("images", f));
      if (editId) await API.put(`/products/${editId}`, fd);
      else await API.post("/products", fd);
      toast.success(editId ? "Product saved." : "Product created.");
      navigate("/admin/products");
    } catch (err) { toast.error(errorMessage(err)); } finally { setSaving(false); }
  };

  if (fetching) return <Loader />;
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="grid xl:grid-cols-[1fr_280px] gap-8 max-w-5xl">
      <form onSubmit={submit} className="space-y-6">
        <h1 className="display text-7xl">{editId ? "Edit product" : "Add product"}</h1>
        <div className="panel p-6 grid sm:grid-cols-2 gap-4">
          <label className="sm:col-span-2"><span className="field-label">Name *</span><input {...f("name")} className="field" required /></label>
          <label className="sm:col-span-2"><span className="field-label">Description *</span><textarea {...f("description")} rows={4} className="field resize-none" required /></label>
          <label><span className="field-label">Price (₹) *</span><input type="number" min="0" {...f("price")} className="field" required /></label>
          <label><span className="field-label">Original price (₹)</span><input type="number" min="0" {...f("originalPrice")} className="field" placeholder="Shown struck through" /></label>
          <label><span className="field-label">Category *</span><select {...f("category")} className="field">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label><span className="field-label">Brand *</span><input {...f("brand")} className="field" required /></label>
          <label><span className="field-label">Stock *</span><input type="number" min="0" {...f("stock")} className="field" required /></label>
          <label><span className="field-label">Platform</span><input {...f("platform")} className="field" placeholder="PC, PS5, Xbox" /></label>
          <label className="sm:col-span-2"><span className="field-label">Tags (comma separated)</span><input {...f("tags")} className="field" placeholder="RPG, Open World" /></label>
          <label className="sm:col-span-2"><span className="field-label">Steam app ID (optional — loads the official poster)</span><input type="number" {...f("steamAppId")} className="field" placeholder="e.g. 1245620 from store.steampowered.com/app/1245620" /></label>
          <label className="sm:col-span-2 flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-5 h-5 accent-[#d4ff2a]" />
            <span>Feature on the home page</span>
          </label>
          <label className="sm:col-span-2"><span className="field-label">Upload images (JPG, PNG or WebP, up to 3 MB each)</span>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))} className="field py-2 file:mr-3 file:border-0 file:bg-acid file:text-ink file:font-bold file:px-3 file:py-1" />
          </label>
          {previews.length > 0 && <div className="sm:col-span-2 flex gap-2">{previews.map((src) => <img key={src} src={src} alt="" className="w-16 h-24 object-cover border-2 border-ink" />)}</div>}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate("/admin/products")} className="btn-line">Cancel</button>
          <button type="submit" disabled={saving} className="btn-acid flex-1 sm:flex-none px-10">{saving ? "Saving…" : editId ? "Save changes" : "Create product"}</button>
        </div>
      </form>
      <div className="hidden xl:block pt-24">
        <p className="field-label">Preview</p>
        <div className="aspect-[2/3] border-2 border-ink overflow-hidden -rotate-2">
          {previews[0] ? <img src={previews[0]} alt="" className="w-full h-full object-cover" /> : <Poster product={{ ...form, steamAppId: form.steamAppId ? Number(form.steamAppId) : undefined, images: [] }} />}
        </div>
      </div>
    </div>
  );
};

const EditProduct = () => {
  const { id } = useParams();
  return <ProductForm key={id} editId={id} />;
};

// ── Layout ────────────────────────────────────────────────
const LINKS = [["/admin", "Dashboard"], ["/admin/products", "Products"], ["/admin/orders", "Orders"], ["/admin/add-product", "Add product"]];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen pt-16 lg:flex">
      <aside className="lg:fixed lg:top-16 lg:bottom-0 lg:w-60 bg-slab border-b-2 lg:border-b-0 lg:border-r-2 border-line p-4 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
        <p className="hidden lg:block display text-2xl text-signal px-3 mb-4">Admin</p>
        {LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/admin"} className={({ isActive }) => `px-3 py-2.5 font-semibold whitespace-nowrap transition-colors ${isActive ? "bg-acid text-ink" : "text-smoke hover:text-bone"}`}>
            {label}
          </NavLink>
        ))}
        <button onClick={() => { logout(); navigate("/"); }} className="lg:mt-auto px-3 py-2.5 text-left font-semibold text-signal whitespace-nowrap">Log out</button>
      </aside>
      <div className="flex-1 lg:ml-60 p-4 sm:p-8 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Routes location={location}>
              <Route index element={<AdminHome />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="add-product" element={<ProductForm />} />
              <Route path="edit-product/:id" element={<EditProduct />} />
              <Route path="*" element={<p className="text-smoke">Unknown admin page. <Link to="/admin" className="link-u">Go to dashboard</Link></p>} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
