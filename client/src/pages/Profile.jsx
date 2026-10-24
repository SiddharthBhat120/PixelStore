import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API, { errorMessage } from "../utils/api";
import ProductCard from "../components/common/ProductCard";
import { Loader } from "../components/common/Loader";

const ADDR = [["street", "Street address", "sm:col-span-2"], ["city", "City"], ["state", "State"], ["pincode", "PIN code"], ["phone", "Phone"]];

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", address: Object.fromEntries(ADDR.map(([k]) => [k, user?.address?.[k] || ""])) });
  const [saving, setSaving] = useState(false);
  const [wish, setWish] = useState(null);

  useEffect(() => {
    API.get("/wishlist").then(({ data }) => setWish(data.data)).catch(() => setWish([]));
  }, [user?.wishlist?.length]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Your name can't be empty.");
    setSaving(true);
    try {
      await API.put("/auth/profile", form);
      await refreshUser();
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="shell">
        <div className="flex flex-wrap items-center gap-6 mb-12">
          <span className="w-24 h-24 grid place-items-center bg-acid text-ink display text-6xl border-2 border-ink shadow-sticker-bone -rotate-3">{user?.name?.[0]?.toUpperCase()}</span>
          <div>
            <h1 className="display text-[clamp(3rem,8vw,6rem)]">{user?.name}</h1>
            <p className="text-smoke">{user?.email}{user?.role === "admin" && <span className="tag bg-signal ml-3">Admin</span>}</p>
          </div>
          <div className="ml-auto flex gap-3">
            <Link to="/orders" className="btn-line">My orders</Link>
            {user?.role === "admin" && <Link to="/admin" className="btn-acid">Admin panel</Link>}
          </div>
        </div>

        <form onSubmit={save} className="panel p-6 sm:p-8 max-w-3xl">
          <h2 className="display text-4xl mb-6">Details</h2>
          <label className="block mb-4">
            <span className="field-label">Full name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" />
          </label>
          <p className="field-label mt-6">Default delivery address</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {ADDR.map(([k, label, span]) => (
              <label key={k} className={span || ""}>
                <span className="field-label">{label}</span>
                <input value={form.address[k]} onChange={(e) => setForm({ ...form, address: { ...form.address, [k]: e.target.value } })} className="field" />
              </label>
            ))}
          </div>
          <button type="submit" disabled={saving} className="btn-acid mt-6">{saving ? "Saving…" : "Save changes"}</button>
        </form>

        <section id="wishlist" className="mt-20 scroll-mt-24">
          <h2 className="display text-[clamp(3rem,8vw,6rem)] mb-8">Wishlist</h2>
          {wish === null ? <Loader label="Loading wishlist" /> : wish.length === 0 ? (
            <div className="panel p-10 text-center">
              <p className="display text-5xl text-line">Nothing saved</p>
              <p className="text-smoke mt-2 mb-6">Tap the heart on any poster to keep it here.</p>
              <Link to="/products" className="btn-acid">Browse the store</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-10">
              {wish.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
