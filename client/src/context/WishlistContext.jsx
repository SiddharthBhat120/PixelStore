import { createContext, useContext, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API, { errorMessage } from "../utils/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, setWishlist } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);

  const ids = useMemo(() => new Set((user?.wishlist || []).map(String)), [user]);

  const toggle = useCallback(async (product) => {
    if (!user) {
      toast("Log in to save games to your wishlist.", { icon: "♥" });
      navigate("/login");
      return;
    }
    setPending(product._id);
    try {
      const { data } = await API.post(`/wishlist/toggle/${product._id}`);
      setWishlist(data.wishlist.map(String));
      toast.success(data.added ? `Saved ${product.name}` : `Removed ${product.name}`, { id: `wish-${product._id}` });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(null);
    }
  }, [user, setWishlist, navigate]);

  const value = useMemo(() => ({ has: (id) => ids.has(String(id)), toggle, pending, count: ids.size }), [ids, toggle, pending]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);
