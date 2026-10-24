// Three pixel blocks that hop in turn.
export const Loader = ({ label = "Loading" }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-24" role="status" aria-live="polite">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-3.5 h-3.5 bg-acid"
          style={{ animation: `pixel-hop 0.9s ${i * 0.15}s ease-in-out infinite` }}
        />
      ))}
    </div>
    <span className="text-smoke text-sm">{label}…</span>
    <style>{`@keyframes pixel-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-12px)}}`}</style>
  </div>
);

export const FullLoader = (props) => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader {...props} />
  </div>
);

export const Spinner = ({ className = "w-4 h-4" }) => (
  <span className={`inline-block border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} aria-hidden="true" />
);

export default Loader;
