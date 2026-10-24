import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { HeartIcon, CartIcon } from "../common/ProductCard";
import Logo from "./Logo";
import SearchOverlay from "./SearchOverlay";

const LINKS = [
  { to: "/products", label: "Store", end: true },
  { to: "/products?category=Games", label: "Games" },
  { to: "/products?sort=popular", label: "Top sellers" },
  { to: "/products?category=Consoles", label: "Consoles" },
];

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M20 20l-4.6-4.6" />
  </svg>
);

const IconButton = ({ children, label, onClick, to, badge, pulseKey }) => {
  const inner = (
    <>
      {children}
      <AnimatePresence>
        {badge > 0 && (
          <motion.span
            key={pulseKey}
            initial={{ scale: 1.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 grid place-items-center bg-acid text-ink text-[11px] font-extrabold border-2 border-ink"
          >
            {badge > 99 ? "99+" : badge}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
  const cls = "relative grid place-items-center w-10 h-10 border-2 border-transparent hover:border-bone transition-colors text-bone";
  return to ? (
    <Link to={to} className={cls} aria-label={label}>{inner}</Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} aria-label={label}>{inner}</button>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, setDrawerOpen, bump } = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation and on outside click
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!dropOpen) return undefined;
    const onDown = (e) => dropRef.current && !dropRef.current.contains(e.target) && setDropOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [dropOpen]);

  // "/" opens search from anywhere
  useEffect(() => {
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out. See you next session.");
    navigate("/");
  };

  const isActive = (to) => {
    const [path, qs] = to.split("?");
    if (location.pathname !== path) return false;
    return (qs || "") === location.search.replace(/^\?/, "");
  };

  const solid = scrolled || location.pathname !== "/";

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color] duration-300 border-b-2
          ${solid ? "bg-ink/90 backdrop-blur-md border-line" : "bg-transparent border-transparent"}`}
      >
        <nav className="max-w-[1400px] mx-auto h-16 px-4 sm:px-6 lg:px-10 flex items-center gap-6">
          <Logo />

          <ul className="hidden lg:flex items-center gap-1 ml-4">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className={`relative px-3 py-2 text-[14px] font-semibold transition-colors ${isActive(l.to) ? "text-acid" : "text-bone/80 hover:text-bone"}`}
                >
                  {l.label}
                  {isActive(l.to) && <motion.span layoutId="nav-underline" className="absolute left-3 right-3 -bottom-0.5 h-[3px] bg-acid" />}
                </Link>
              </li>
            ))}
            {user?.role === "admin" && (
              <li>
                <NavLink to="/admin" className={({ isActive: a }) => `px-3 py-2 text-[14px] font-semibold ${a ? "text-signal" : "text-signal/80 hover:text-signal"}`}>
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-3 h-10 pl-3 pr-2 border-2 border-line hover:border-bone text-smoke hover:text-bone transition-colors w-56"
              aria-label="Search"
            >
              <SearchIcon className="w-4 h-4" />
              <span className="text-[13px] flex-1 text-left">Search the store</span>
              <kbd className="text-[11px] font-bold px-1.5 border border-line">/</kbd>
            </button>
            <span className="md:hidden">
              <IconButton label="Search" onClick={() => setSearchOpen(true)}><SearchIcon /></IconButton>
            </span>

            {user && (
              <span className="hidden sm:block">
                <IconButton label="Wishlist" to="/profile#wishlist" badge={wishlist.count}><HeartIcon className="w-5 h-5" /></IconButton>
              </span>
            )}

            <motion.span key={bump} animate={bump ? { rotate: [0, -14, 12, -6, 0], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5 }}>
              <IconButton label={`Cart, ${cartCount} items`} onClick={() => setDrawerOpen(true)} badge={cartCount} pulseKey={bump}>
                <CartIcon />
              </IconButton>
            </motion.span>

            {user ? (
              <div className="relative hidden sm:block" ref={dropRef}>
                <button
                  type="button"
                  onClick={() => setDropOpen((o) => !o)}
                  className="flex items-center gap-2 h-10 pl-1 pr-3 border-2 border-line hover:border-bone transition-colors"
                  aria-expanded={dropOpen}
                  aria-haspopup="menu"
                >
                  <span className="w-7 h-7 grid place-items-center bg-bone text-ink display text-base">{user.name?.[0]?.toUpperCase() || "?"}</span>
                  <span className="text-[13px] font-semibold max-w-[90px] truncate">{user.name?.split(" ")[0]}</span>
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, rotate: -2 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-bone text-ink border-2 border-ink shadow-sticker-acid py-1 origin-top-right"
                      role="menu"
                    >
                      {[
                        ["/profile", "Profile and wishlist"],
                        ["/orders", "My orders"],
                        ...(user.role === "admin" ? [["/admin", "Admin panel"]] : []),
                      ].map(([to, label]) => (
                        <Link key={to} to={to} role="menuitem" className="block px-4 py-2.5 text-[14px] font-semibold hover:bg-acid">{label}</Link>
                      ))}
                      <button onClick={handleLogout} role="menuitem" className="w-full text-left px-4 py-2.5 text-[14px] font-semibold text-signal hover:bg-signal hover:text-ink border-t-2 border-ink/10">
                        Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-3 py-2 text-[14px] font-semibold text-bone/80 hover:text-bone">Log in</Link>
                <Link to="/register" className="btn-acid py-2 px-4">Join</Link>
              </div>
            )}

            <button
              type="button"
              className="lg:hidden grid place-items-center w-10 h-10 border-2 border-line"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className="relative block w-5 h-3">
                <span className={`absolute left-0 right-0 h-0.5 bg-bone transition-all ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 right-0 h-0.5 bg-bone transition-all ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-acid text-ink pt-24 px-6 pb-10 overflow-y-auto lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
          >
            <ul className="space-y-1">
              {[{ to: "/", label: "Home" }, ...LINKS, ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : [])].map((l, i) => (
                <motion.li key={l.label} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <Link to={l.to} className="display text-6xl block py-1 hover:translate-x-2 transition-transform">{l.label}</Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-10 pt-6 border-t-2 border-ink flex flex-wrap gap-3">
              {user ? (
                <>
                  <Link to="/profile" className="btn-bone">Profile</Link>
                  <Link to="/orders" className="btn-bone">Orders</Link>
                  <button onClick={handleLogout} className="btn border-ink text-ink">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-bone">Log in</Link>
                  <Link to="/register" className="btn border-ink text-ink">Create account</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
