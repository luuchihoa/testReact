import React from "react";
import { motion } from "framer-motion";
import { Star, Circle } from "lucide-react";

const PARTICLES = [
  { id: 1, type: "star", color: "text-pink-300 dark:text-pink-600/50", size: 24, left: "10%", delay: 0, duration: 15 },
  { id: 2, type: "circle", color: "text-rose-200 dark:text-rose-700/40", size: 16, left: "25%", delay: 2, duration: 18 },
  { id: 3, type: "star", color: "text-yellow-200 dark:text-yellow-600/40", size: 20, left: "50%", delay: 5, duration: 20 },
  { id: 4, type: "circle", color: "text-pink-200 dark:text-pink-800/30", size: 12, left: "70%", delay: 1, duration: 16 },
  { id: 5, type: "star", color: "text-orange-200 dark:text-orange-700/40", size: 18, left: "85%", delay: 4, duration: 17 },
  { id: 6, type: "circle", color: "text-amber-200 dark:text-amber-700/30", size: 28, left: "40%", delay: 7, duration: 22 },
];

export default function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {PARTICLES.map((p) => {
        const Icon = p.type === "star" ? Star : Circle;
        const fillClass = p.type === "star" ? "fill-current" : "fill-current opacity-70";
        
        return (
          <motion.div
            key={p.id}
            className={`absolute bottom-[-50px] ${p.color}`}
            style={{ left: p.left }}
            initial={{ y: 0, opacity: 0, rotate: 0 }}
            animate={{ 
              y: -800, 
              opacity: [0, 0.8, 0.8, 0],
              rotate: p.type === "star" ? [0, 180, 360] : 0
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Icon width={p.size} height={p.size} className={fillClass} strokeWidth={1} />
          </motion.div>
        );
      })}
    </div>
  );
}
