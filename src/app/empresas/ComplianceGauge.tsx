"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

export function ComplianceGauge({ score }: { score: number }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const r     = 58;
  const color = score >= 70 ? "#0F7B6C" : score >= 45 ? "#f59e0b" : "#ef4444";
  const nivel = score >= 70 ? "Preparado" : score >= 45 ? "En riesgo" : "Exposición alta";

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <svg width="144" height="84" viewBox="0 0 144 84" className="overflow-visible">
        <path
          d={`M 14 72 A ${r} ${r} 0 0 1 130 72`}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={12} strokeLinecap="round"
        />
        <motion.path
          d={`M 14 72 A ${r} ${r} 0 0 1 130 72`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: score / 100 } : { pathLength: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        />
        <text x="72" y="64" textAnchor="middle" fontSize={28} fontWeight={700} fill="white">{score}</text>
        <text x="72" y="78" textAnchor="middle" fontSize={10} fontWeight={600} fill="rgba(255,255,255,0.4)">/ 100</text>
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{nivel}</span>
    </div>
  );
}
