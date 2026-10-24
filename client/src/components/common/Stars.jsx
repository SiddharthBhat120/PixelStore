const Star = ({ fill, size }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
    <defs>
      <linearGradient id={`sg-${Math.round(fill * 100)}`}>
        <stop offset={`${fill * 100}%`} stopColor="#d4ff2a" />
        <stop offset={`${fill * 100}%`} stopColor="#2e2c28" />
      </linearGradient>
    </defs>
    <path
      fill={`url(#sg-${Math.round(fill * 100)})`}
      d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7z"
    />
  </svg>
);

const Stars = ({ rating = 0, size = 14, showValue = false, className = "" }) => {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`Rated ${r.toFixed(1)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} fill={Math.max(0, Math.min(1, r - i))} />
      ))}
      {showValue && <span className="ml-1.5 text-[13px] font-semibold text-bone">{r.toFixed(1)}</span>}
    </span>
  );
};

export default Stars;
