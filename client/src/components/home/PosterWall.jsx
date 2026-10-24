import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import Poster from "../common/Poster";
import { WALL_GAMES, steamPortrait } from "../../utils/posters";

const useColumns = () => {
  const get = () => (typeof window === "undefined" ? 6 : window.innerWidth < 640 ? 3 : window.innerWidth < 1024 ? 4 : 6);
  const [cols, setCols] = useState(get);
  useEffect(() => {
    const onResize = () => setCols(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return cols;
};

// Columns of game posters drifting up and down, tilted like a pasted-up wall.
const PosterWall = () => {
  const cols = useColumns();
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18 });
  const sy = useSpring(py, { stiffness: 40, damping: 18 });

  useEffect(() => {
    if (reduce) return undefined;
    const onMove = (e) => {
      px.set((e.clientX / window.innerWidth - 0.5) * -40);
      py.set((e.clientY / window.innerHeight - 0.5) * -30);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  const columns = useMemo(() => {
    const perCol = 7;
    return Array.from({ length: cols }, (_, c) =>
      Array.from({ length: perCol }, (_, i) => WALL_GAMES[(c * perCol + i * 3 + c) % WALL_GAMES.length])
    );
  }, [cols]);

  return (
    <motion.div className="absolute inset-[-12%] flex gap-3 sm:gap-4" style={{ x: sx, y: sy, rotate: -8 }} aria-hidden="true">
      {columns.map((ids, c) => (
        <motion.div
          key={c}
          className="flex-1 min-w-0 overflow-hidden"
          initial={reduce ? false : { y: c % 2 ? "-30%" : "30%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.08 * c, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className={`flex flex-col gap-3 sm:gap-4 ${c % 2 ? "animate-wall-down" : "animate-wall-up"}`}
            style={{ animationDuration: `${70 + (c % 3) * 18}s` }}
          >
            {[...ids, ...ids].map((id, i) => (
              <div key={`${id}-${i}`} className="aspect-[2/3] w-full border-2 border-ink">
                <Poster product={{ name: "", category: "Games" }} sources={steamPortrait(id)} eager={i < 3} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PosterWall;
