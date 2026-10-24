import { Link } from "react-router-dom";
import { LogoMark } from "./Logo";

const COLS = [
  {
    title: "Shop",
    links: [
      ["All products", "/products"],
      ["PC games", "/products?category=Games"],
      ["Consoles", "/products?category=Consoles"],
      ["GPUs", "/products?category=GPUs"],
    ],
  },
  {
    title: "Gear",
    links: [
      ["Headsets", "/products?category=Headsets"],
      ["Keyboards", "/products?category=Keyboards"],
      ["Mice", "/products?category=Mice"],
      ["Controllers", "/products?category=Controllers"],
    ],
  },
  {
    title: "Account",
    links: [
      ["My orders", "/orders"],
      ["Wishlist", "/profile#wishlist"],
      ["Cart", "/cart"],
      ["Log in", "/login"],
    ],
  },
];

const Footer = () => (
  <footer className="relative border-t-2 border-line mt-10 overflow-hidden">
    <div className="shell px-4 sm:px-6 lg:px-10 pt-16 pb-8">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-3"><LogoMark className="w-10 h-10" /><span className="display text-3xl">Pixelstore</span></div>
          <p className="text-smoke mt-4 max-w-xs text-[15px] leading-relaxed">
            PC games, consoles and the gear to play them. Shipped anywhere in India, free on orders over ₹999.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="font-bold text-bone mb-3">{c.title}</h4>
            <ul className="space-y-2">
              {c.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="text-smoke hover:text-acid text-[15px] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="select-none pointer-events-none px-2" aria-hidden="true">
      <p className="display text-outline text-[21vw] leading-[0.78] text-center whitespace-nowrap opacity-60 translate-y-[12%]">Pixelstore</p>
    </div>

    <div className="relative border-t border-line bg-ink">
      <div className="shell px-4 sm:px-6 lg:px-10 py-5 flex flex-col sm:flex-row gap-2 justify-between text-[13px] text-smoke">
        <p>© {new Date().getFullYear()} PixelStore. Game artwork belongs to its publishers.</p>
        <p>
          Designed and built by{" "}
          <a href="https://github.com/SiddharthBhat120" target="_blank" rel="noreferrer" className="link-u text-bone">Siddharth Bhat</a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
