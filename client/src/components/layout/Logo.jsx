import { Link } from "react-router-dom";

export const LogoMark = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" fill="#d4ff2a" />
    <rect x="7" y="7" width="6" height="18" fill="#0e0d0c" />
    <rect x="13" y="7" width="10" height="6" fill="#0e0d0c" />
    <rect x="19" y="13" width="6" height="6" fill="#0e0d0c" />
    <rect x="13" y="17" width="6" height="2" fill="#0e0d0c" />
  </svg>
);

const Logo = ({ onClick }) => (
  <Link to="/" onClick={onClick} className="group flex items-center gap-2.5 shrink-0" aria-label="PixelStore home">
    <span className="transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110">
      <LogoMark />
    </span>
    <span className="display text-[26px] leading-none text-bone pt-0.5">Pixelstore</span>
  </Link>
);

export default Logo;
