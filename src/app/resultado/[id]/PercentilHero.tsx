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
          className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/30 text-on-secondary-container rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-secondary-container/40"
        >
          <Sparkles size={12} />
          Benchmark verificado
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E, delay: 0.07 }}
          className="text-3xl sm:text-5xl font-bold text-primary mb-4 leading-tight"
        >
          Tu salario está en el{" "}
          <motion.span
            className="text-secondary"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: E, delay: 0.22 }}
          >
            percentil {percentil}
          </motion.span>{" "}
          del mercado.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: E, delay: 0.16 }}
          className="text-lg text-on-surface-variant"
        >
          {cargo} · {industria} · {region}
        </motion.p>
      </div>
    </section>
  );
}
