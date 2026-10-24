import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const [n, setN] = useState(9);
  useEffect(() => {
    if (n === 0) return undefined;
    const t = setTimeout(() => setN(n - 1), 1000);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <motion.p initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="display text-[clamp(5rem,20vw,14rem)] text-signal leading-none">
        Game over
      </motion.p>
      <p className="text-smoke mt-4">This page doesn't exist. Error 404.</p>
      <p className="display text-5xl mt-10">Continue? <span className="text-acid tabular-nums">{n}</span></p>
      <Link to="/" className="btn-acid text-base mt-6">Back to home</Link>
    </div>
  );
};

export default NotFound;
