import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/layout/CartDrawer";
import { ProtectedRoute, AdminRoute } from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import { Login, Register } from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { Orders, OrderDetails } from "./pages/Orders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Admin";
import NotFound from "./pages/NotFound";

const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 350);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);
  return null;
};

const Page = ({ children }) => (
  <motion.main
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
  >
    {children}
  </motion.main>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isAuth = ["/login", "/register"].includes(location.pathname);
  // Admin sub-routes animate inside the admin layout, so key by section.
  const key = isAdmin ? "/admin" : location.pathname;

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={key}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/login" element={<Page><Login /></Page>} />
          <Route path="/register" element={<Page><Register /></Page>} />
          <Route path="/products" element={<Page><Products /></Page>} />
          <Route path="/products/:id" element={<Page><ProductDetails /></Page>} />
          <Route path="/cart" element={<Page><Cart /></Page>} />
          <Route path="/checkout" element={<ProtectedRoute><Page><Checkout /></Page></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Page><Orders /></Page></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><Page><OrderDetails /></Page></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Page><Profile /></Page></ProtectedRoute>} />
          <Route path="/admin/*" element={<AdminRoute><Page><AdminDashboard /></Page></AdminRoute>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </AnimatePresence>
      {!isAdmin && !isAuth && <Footer />}
    </>
  );
};

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollManager />
              <Navbar />
              <AnimatedRoutes />
              <CartDrawer />
              <div className="grain" aria-hidden="true" />
              <Toaster
                position="bottom-center"
                gutter={10}
                toastOptions={{
                  duration: 2600,
                  style: {
                    background: "#f0ebe0",
                    color: "#0e0d0c",
                    border: "2px solid #0e0d0c",
                    boxShadow: "4px 4px 0 0 #d4ff2a",
                    borderRadius: "0",
                    fontFamily: "'Archivo Variable', Archivo, sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    padding: "10px 14px",
                  },
                  success: { iconTheme: { primary: "#0e0d0c", secondary: "#d4ff2a" } },
                  error: { style: { boxShadow: "4px 4px 0 0 #ff4321" }, iconTheme: { primary: "#ff4321", secondary: "#f0ebe0" } },
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
