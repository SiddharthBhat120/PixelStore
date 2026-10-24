import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const pick = (p) => ({
  _id: p._id,
  name: p.name,
  price: p.price,
  originalPrice: p.originalPrice,
  images: p.images || [],
  steamAppId: p.steamAppId,
  stock: p.stock,
  category: p.category,
  brand: p.brand,
  platform: p.platform,
});

const load = () => {
  try {
    const data = JSON.parse(localStorage.getItem("ps_cart"));
    return Array.isArray(data) ? data.filter((i) => i && i._id && i.quantity > 0) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(load);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bump, setBump] = useState(0); // increments on every add, drives the cart icon animation

  useEffect(() => {
    try { localStorage.setItem("ps_cart", JSON.stringify(cart)); } catch { /* storage unavailable */ }
  }, [cart]);

  // Validation happens before setCart so toasts fire exactly once (StrictMode
  // runs state updaters twice in development).
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || product.stock <= 0) {
      toast.error(`${product?.name || "This item"} is out of stock.`);
      return false;
    }
    const existing = cart.find((i) => i._id === product._id);
    const nextQty = (existing?.quantity || 0) + quantity;
    if (nextQty > product.stock) {
      toast.error(`Only ${product.stock} of ${product.name} in stock.`);
      return false;
    }
    setCart((prev) =>
      prev.some((i) => i._id === product._id)
        ? prev.map((i) => (i._id === product._id ? { ...i, ...pick(product), quantity: nextQty } : i))
        : [...prev, { ...pick(product), quantity }]
    );
    setBump((b) => b + 1);
    toast.success(`${product.name} added to cart`, { id: `add-${product._id}` });
    return true;
  }, [cart]);

  const removeFromCart = useCallback((id) => setCart((prev) => prev.filter((i) => i._id !== id)), []);

  const updateQuantity = useCallback((id, quantity) => {
    setCart((prev) =>
      quantity < 1
        ? prev.filter((i) => i._id !== id)
        : prev.map((i) => (i._id === id ? { ...i, quantity: Math.min(quantity, i.stock || quantity) } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo(() => {
    const cartTotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
    return { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, drawerOpen, setDrawerOpen, bump };
  }, [cart, addToCart, removeFromCart, updateQuantity, clearCart, drawerOpen, bump]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
