// Infinite horizontal ticker. Content is rendered twice and shifted by 50%.
const Marquee = ({ items, className = "", itemClassName = "", separator = "✦", speed = 28, reverse = false }) => (
  <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
    <div
      className="inline-flex animate-marquee"
      style={{ animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}
    >
      {[0, 1].map((copy) => (
        <div key={copy} className="inline-flex shrink-0">
          {items.map((t, i) => (
            <span key={`${copy}-${i}`} className={`inline-flex items-center ${itemClassName}`}>
              {t}
              <span className="mx-6 opacity-60">{separator}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Marquee;
