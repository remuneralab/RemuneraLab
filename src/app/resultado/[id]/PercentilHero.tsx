"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

interface Props {
  percentil: number;
  cargo: string;
  industria: string;
  region: string;
}


export default function PercentilHero({ percentil, cargo, industria, region }: Props) {

  return (
    <section className="mb-12">
      <div className="max-w-3xl">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: E }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4"
          style={{ border: "1px solid rgba(133,104,243,0.30)", background: "rgba(133,104,243,0.10)", color: "#8568f3", fontFamily: "var(--font-space-mono)" }}
        >
          <Sparkles size={12} />
          Benchmark verificado
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E, delay: 0.07 }}
          className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Ganas más que el{" "}
          <motion.span
            style={{ color: "#e7e4fd" }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: E, delay: 0.22 }}
          >
            {percentil}%
          </motion.span>
          {" "}de las personas con tu cargo.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: E, delay: 0.16 }}
          className="text-white/45"
          style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1.05rem" }}
        >
          {cargo} · {industria} · {region}
        </motion.p>
      </div>
    </section>
  );
}
