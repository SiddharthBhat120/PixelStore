import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API, { errorMessage } from "../utils/api";
import Poster from "../components/common/Poster";
import { Spinner } from "../components/common/Loader";
import { steamPortrait } from "../utils/posters";

const SIDE = [1245620, 2358720, 1091500, 1086940, 2215430, 292030];

const Shell = ({ title, sub, children }) => (
  <div className="min-h-screen grid lg:grid-cols-2">
    <div className="relative hidden lg:block overflow-hidden border-r-2 border-line">
      <div className="absolute inset-[-10%] grid grid-cols-3 gap-4 rotate-[-8deg]">
        {SIDE.map((id, i) => (
          <motion.div key={id} initial={{ y: i % 2 ? -80 : 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: i * 0.08 }} className="aspect-[2/3] border-2 border-ink">
            <Poster product={{ name: "", category: "Games" }} sources={steamPortrait(id)} eager />
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
      <p className="absolute left-10 bottom-10 display text-8xl leading-[0.85]">Press<br /><span className="text-acid">start</span></p>
    </div>
    <div className="flex items-center justify-center px-4 py-28">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <h1 className="display text-7xl">{title}</h1>
        <p className="text-smoke mt-2 mb-8">{sub}</p>
        {children}
      </motion.div>
    </div>
  </div>
);

const PasswordField = ({ value, onChange, placeholder, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} value={value} onChange={onChange} className="field pr-16" placeholder={placeholder} autoComplete={autoComplete} required />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-smoke hover:text-bone">{show ? "Hide" : "Show"}</button>
    </div>
  );
};

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const from = location.state?.from?.pathname || "/";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}.`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  const seedAdmin = async () => {
    setSeeding(true);
    try {
      const { data } = await API.post("/auth/seed-admin");
      setForm({ email: data.credentials.email, password: data.credentials.password });
      toast.success("Demo admin ready. Credentials filled in.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Shell title="Log in" sub={params.get("expired") ? "Your session expired. Log in again to continue." : "Pick up where you left off."}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className="field-label">Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" placeholder="you@example.com" autoComplete="email" required />
        </label>
        <label className="block"><span className="field-label">Password</span>
          <PasswordField value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" autoComplete="current-password" />
        </label>
        <button type="submit" disabled={loading} className="btn-acid w-full text-base py-4">{loading ? <><Spinner /> Logging in…</> : "Log in"}</button>
      </form>
      <p className="mt-6 text-smoke">New here? <Link to="/register" state={location.state} className="link-u text-bone">Create an account</Link></p>
      <div className="mt-10 pt-6 border-t-2 border-line">
        <p className="text-smoke text-sm mb-3">Trying the demo? Create the admin account and fill in its login.</p>
        <button onClick={seedAdmin} disabled={seeding} className="btn-line w-full">{seeding ? "Creating…" : "Use demo admin"}</button>
      </div>
    </Shell>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const strength = Math.min(4, [/.{6,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(form.password)).length);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password needs at least 6 characters.");
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success("Account created. Welcome to PixelStore.");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't create the account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell title="Join" sub="One account for orders, wishlist and reviews.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className="field-label">Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="Your name" autoComplete="name" required />
        </label>
        <label className="block"><span className="field-label">Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" placeholder="you@example.com" autoComplete="email" required />
        </label>
        <label className="block"><span className="field-label">Password</span>
          <PasswordField value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" autoComplete="new-password" />
        </label>
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <motion.span key={i} className="h-1.5 flex-1" animate={{ backgroundColor: i < strength ? ["#ff4321", "#ffb020", "#d4ff2a", "#4cf0a6"][strength - 1] : "#2e2c28" }} />
          ))}
        </div>
        <button type="submit" disabled={loading} className="btn-acid w-full text-base py-4">{loading ? <><Spinner /> Creating account…</> : "Create account"}</button>
      </form>
      <p className="mt-6 text-smoke">Already have one? <Link to="/login" state={location.state} className="link-u text-bone">Log in</Link></p>
    </Shell>
  );
};
