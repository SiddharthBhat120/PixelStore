import { useMemo, useState } from "react";
import ArtPoster from "./ArtPoster";
import { posterSources, bannerSources } from "../../utils/posters";

// Shows the best available image for a product, stepping through fallbacks on
// error and ending on generated artwork, so a broken link never shows.
const Poster = ({ product, wide = false, hd = false, className = "", imgClassName = "", eager = false, sources }) => {
  const list = useMemo(
    () => sources || (wide ? bannerSources(product) : posterSources(product, hd)),
    [sources, wide, hd, product]
  );
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const key = list.join("|");
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    // product changed: start over from the best source (render-phase reset)
    setPrevKey(key);
    setIdx(0);
    setLoaded(false);
  }

  const src = list[idx];

  if (!src) return <ArtPoster product={product} wide={wide} className={className} />;

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slab ${className}`}>
      {!loaded && <div className="absolute inset-0 skeleton" />}
      <img
        key={src}
        ref={(el) => {
          // cached images can finish before React attaches onLoad
          if (el && el.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
        }}
        src={src}
        alt={product?.name || ""}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setIdx((i) => i + 1);
        }}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
      />
    </div>
  );
};

export default Poster;
