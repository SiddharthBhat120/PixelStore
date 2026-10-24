export const rupees = (n = 0) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

export const discountOf = (p) =>
  p?.originalPrice > p?.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

export const FREE_SHIPPING_MIN = 999;
export const SHIPPING_FEE = 99;
export const shippingFor = (subtotal) => (subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE);

export const formatDate = (d, withTime = false) =>
  new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

// Stable pseudo-random number in [-1, 1] from a string, used for poster tilt.
export const seeded = (str = "") => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 2000) / 1000) - 1;
};

export const CATEGORIES = ["Games", "Controllers", "Headsets", "Keyboards", "Mice", "Monitors", "GPUs", "Consoles", "Accessories", "Gift Cards"];
export const PLATFORMS = ["PC", "PS5", "Xbox"];
export const ORDER_STEPS = ["Processing", "Confirmed", "Shipped", "Delivered"];
